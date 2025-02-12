
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Contest {
  type: string;
  office?: string;
  district?: {
    name: string;
    scope: string;
  };
  candidates?: Array<{
    name: string;
    party: string;
    channels?: Array<{
      type: string;
      id: string;
    }>;
  }>;
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumText?: string;
}

interface CivicApiResponse {
  contests?: Contest[];
  state?: Array<{
    electionAdministrationBody: {
      name: string;
      electionInfoUrl: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log('Received request data:', requestData)

    const { mode, zipCode, priorities } = requestData

    if (!mode || !zipCode || !priorities) {
      throw new Error('Missing required fields')
    }

    if (!Array.isArray(priorities) || priorities.length !== 6) {
      throw new Error('Invalid priorities format')
    }

    console.log('Processing request for ZIP:', zipCode)
    console.log('Priorities:', priorities)

    // Fetch ballot data from Google Civic API
    const googleCivicApiKey = Deno.env.get('GOOGLE_CIVIC_API_KEY')
    if (!googleCivicApiKey) {
      throw new Error('Google Civic API key not configured')
    }

    console.log('Fetching ballot data from Google Civic API')
    
    // Convert ZIP to address for Civic API (it requires a full address)
    const address = `${zipCode} USA`
    const civicApiUrl = `https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?key=${googleCivicApiKey}&address=${encodeURIComponent(address)}&electionId=2000`

    const civicResponse = await fetch(civicApiUrl)
    
    if (!civicResponse.ok) {
      const errorText = await civicResponse.text()
      console.error('Failed to fetch ballot data:', errorText)
      throw new Error('Unable to retrieve ballot information for this location. Please try again later.')
    }

    const ballotData: CivicApiResponse = await civicResponse.json()
    console.log('Successfully retrieved ballot data')

    if (!ballotData.contests || ballotData.contests.length === 0) {
      throw new Error('No ballot information available for this location at this time.')
    }

    // Prepare ballot information for the AI
    let ballotInfo = 'Here is the actual ballot information for this location:\n\n'
    
    // Local and State Candidates
    const candidateContests = ballotData.contests.filter(c => c.type === 'General' && c.candidates)
    if (candidateContests.length > 0) {
      ballotInfo += 'Candidates:\n'
      candidateContests.forEach(contest => {
        ballotInfo += `${contest.office}:\n`
        contest.candidates?.forEach(candidate => {
          ballotInfo += `- ${candidate.name} (${candidate.party})\n`
        })
        ballotInfo += '\n'
      })
    }

    // Ballot Measures
    const measures = ballotData.contests.filter(c => c.type === 'Referendum')
    if (measures.length > 0) {
      ballotInfo += 'Ballot Measures:\n'
      measures.forEach(measure => {
        ballotInfo += `- ${measure.referendumTitle}\n`
        if (measure.referendumText) {
          ballotInfo += `  Summary: ${measure.referendumText}\n`
        }
      })
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = `You are an AI assistant helping voters understand their priorities and match them with candidates from the November 2024 election ballot.

    First, provide a thoughtful analysis of the voter's priorities by:
    1. Identifying underlying themes and policy areas
    2. Connecting their personal concerns to broader policy issues
    3. Highlighting any potential tensions or tradeoffs in their priorities

    Then, recommend specific candidates from their November 2024 ballot in this order:
    1. Local candidates (city council, county positions, etc.)
    2. State candidates (state legislature, etc.)
    3. Local and state ballot measures
    4. Presidential candidates (ONLY include Kamala Harris, Donald Trump, Jill Stein, and Oliver)

    For each recommendation:
    - Explain specifically how the candidate or measure addresses their stated priorities
    - Focus on concrete actions, voting records, or policy positions
    - Acknowledge when a candidate partially aligns with some priorities but may conflict with others

    Address them directly using "you" and "your" throughout the response.

    Response structure:
    1. Summary of Your Priorities (detailed analysis connecting personal concerns to policy areas)
    2. Local Candidates
    3. State Candidates
    4. Ballot Measures
    5. Presidential Candidates`

    const userPrompt = `Based on these priorities for the November 2024 election in ZIP code ${zipCode}:
    ${priorities.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
    
    ${ballotInfo}
    
    First, provide a thoughtful analysis of how their personal priorities connect to broader policy issues.
    Then, recommend specific candidates from their actual November 2024 ballot that best align with these priorities.
    Be specific about why each recommendation matches or addresses their stated concerns.`

    console.log('Sending request to OpenAI')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`Failed to analyze ballot information. Please try again later.`)
    }

    const data = await response.json()
    console.log('Received OpenAI response')

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Failed to generate ballot analysis. Please try again later.')
    }

    const analysis = data.choices[0].message.content

    // Format candidates from ballot data
    const candidates = ballotData.contests
      .filter(c => c.type === 'General' && c.candidates)
      .flatMap(contest => contest.candidates?.map(candidate => ({
        name: candidate.name,
        office: contest.office || 'Unknown Office',
        highlights: [
          `Party: ${candidate.party}`,
          contest.district?.name ? `District: ${contest.district.name}` : null,
          candidate.channels?.map(ch => `${ch.type}: ${ch.id}`),
        ].filter(Boolean) as string[]
      })) || []);

    if (candidates.length === 0) {
      throw new Error('No candidate information available for this location at this time.')
    }

    const recommendations = {
      region: zipCode,
      analysis: analysis,
      candidates: candidates
    }

    console.log('Sending response to client')

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in analyze-priorities function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
