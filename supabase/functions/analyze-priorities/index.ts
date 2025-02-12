
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

interface FECCandidate {
  candidate_id: string;
  name: string;
  party_full: string;
  incumbent_challenge_full: string;
  total_receipts: number;
  total_disbursements: number;
  cash_on_hand_end_period: number;
  office_full: string;
}

async function getFECCandidateInfo(name: string, office: string): Promise<FECCandidate | null> {
  const fecApiKey = Deno.env.get('FEC_API_KEY');
  if (!fecApiKey) {
    console.log('FEC API key not configured, skipping FEC data enrichment');
    return null;
  }

  try {
    // Clean up name for search (remove middle names, suffixes, etc.)
    const searchName = name.split(' ')
                          .filter(part => !part.includes('.'))
                          .slice(0, 2)
                          .join(' ');

    const searchUrl = `https://api.open.fec.gov/v1/candidates/search/?api_key=${fecApiKey}&q=${encodeURIComponent(searchName)}&sort=name&per_page=1`;
    console.log('Fetching FEC data for:', searchName);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error('FEC API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      console.log('No FEC data found for:', searchName);
      return null;
    }

    const candidateId = data.results[0].candidate_id;
    const detailsUrl = `https://api.open.fec.gov/v1/candidate/${candidateId}/totals/?api_key=${fecApiKey}&sort=-cycle&per_page=1`;
    
    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      console.error('FEC API details error:', detailsResponse.status);
      return null;
    }

    const details = await detailsResponse.json();
    if (!details.results || details.results.length === 0) {
      return null;
    }

    return {
      ...data.results[0],
      ...details.results[0]
    };
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return null;
  }
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

    console.log('Civic API URL:', civicApiUrl)

    try {
      const civicResponse = await fetch(civicApiUrl)
      const responseText = await civicResponse.text()
      console.log('Civic API response status:', civicResponse.status)
      console.log('Civic API response:', responseText)
      
      if (!civicResponse.ok) {
        throw new Error(`No election data available for this location (${zipCode}) at this time. Status: ${civicResponse.status}`)
      }

      const ballotData: CivicApiResponse = JSON.parse(responseText)
      console.log('Successfully parsed ballot data:', ballotData)

      if (!ballotData.contests || ballotData.contests.length === 0) {
        throw new Error('No ballot information available for this location at this time.')
      }

      // Format ballot information
      let ballotInfo = 'Here is the actual ballot information for this location:\n\n'
      
      // Local and State Candidates
      const candidateContests = ballotData.contests.filter(c => c.type === 'General' && c.candidates)
      if (candidateContests.length === 0) {
        throw new Error('No candidate information available for this location at this time.')
      }

      ballotInfo += 'Candidates:\n'
      
      // Enrich candidate data with FEC information
      for (const contest of candidateContests) {
        ballotInfo += `${contest.office}:\n`
        if (contest.candidates) {
          for (const candidate of contest.candidates) {
            const fecData = await getFECCandidateInfo(candidate.name, contest.office || '');
            if (fecData) {
              ballotInfo += `- ${candidate.name} (${candidate.party})\n`;
              ballotInfo += `  Campaign Finance: Raised $${(fecData.total_receipts/1000000).toFixed(2)}M, `;
              ballotInfo += `Spent $${(fecData.total_disbursements/1000000).toFixed(2)}M, `;
              ballotInfo += `Cash on Hand $${(fecData.cash_on_hand_end_period/1000000).toFixed(2)}M\n`;
              if (fecData.incumbent_challenge_full) {
                ballotInfo += `  Status: ${fecData.incumbent_challenge_full}\n`;
              }
            } else {
              ballotInfo += `- ${candidate.name} (${candidate.party})\n`;
            }
          }
        }
        ballotInfo += '\n'
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

      console.log('Preparing OpenAI request with ballot info:', ballotInfo)

      const systemPrompt = `You are an AI assistant helping voters understand how their priorities align with REAL candidates from their actual ballot data.

      IMPORTANT: 
      1. ONLY analyze and recommend candidates that appear in the provided ballot data
      2. NEVER make up or suggest candidates that aren't in the ballot data
      3. If you can't find relevant candidates for some priorities, acknowledge this gap
      4. Be explicit about which recommendations come from real ballot data
      5. When available, incorporate campaign finance information into your analysis

      First, provide a thoughtful analysis of the voter's priorities by:
      1. Identifying underlying themes and policy areas
      2. Connecting their personal concerns to broader policy issues
      3. Highlighting any potential tensions or tradeoffs in their priorities

      Then, recommend ONLY candidates from the provided ballot data that align with their priorities:
      1. Explain specifically how each candidate addresses their stated priorities
      2. Focus on concrete actions, voting records, or policy positions
      3. Acknowledge when a candidate partially aligns with some priorities but may conflict with others
      4. If certain priorities can't be addressed by any available candidates, explicitly state this
      5. When available, discuss how campaign finance information might relate to their priorities

      Address them directly using "you" and "your" throughout the response.`

      const userPrompt = `Based on these priorities for their local election:
      ${priorities.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
      
      ${ballotInfo}
      
      Analyze their priorities and recommend ONLY candidates from the actual ballot data that best align with these priorities.
      Be specific about why each recommendation matches or addresses their stated concerns.
      If some priorities cannot be addressed by the available candidates, explicitly acknowledge this.
      When available, incorporate campaign finance information into your analysis.`

      console.log('Sending request to OpenAI')

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text()
        console.error('OpenAI API error response:', errorText)
        throw new Error(`Failed to analyze ballot information: ${openAIResponse.status} ${openAIResponse.statusText}`)
      }

      const openAIData = await openAIResponse.json()
      console.log('Received OpenAI response:', openAIData)

      if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
        throw new Error('Invalid response format from OpenAI')
      }

      const analysis = openAIData.choices[0].message.content

      // Format candidates from verified ballot data with FEC information
      const candidates = await Promise.all(candidateContests.flatMap(async contest => 
        contest.candidates?.map(async candidate => {
          const fecData = await getFECCandidateInfo(candidate.name, contest.office || '');
          return {
            name: candidate.name,
            office: contest.office || 'Unknown Office',
            highlights: [
              `Party: ${candidate.party}`,
              contest.district?.name ? `District: ${contest.district.name}` : null,
              fecData ? `Campaign Finance: $${(fecData.total_receipts/1000000).toFixed(2)}M raised` : null,
              fecData?.incumbent_challenge_full ? `Status: ${fecData.incumbent_challenge_full}` : null,
              ...(candidate.channels?.map(ch => `${ch.type}: ${ch.id}`) || [])
            ].filter(Boolean)
          };
        }) || []
      ));

      const recommendations = {
        region: zipCode,
        analysis: analysis,
        candidates: candidates.flat()
      }

      console.log('Sending response to client')

      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (apiError) {
      console.error('API Error:', apiError)
      throw new Error(`${apiError.message}`)
    }
  } catch (error) {
    console.error('Error in analyze-priorities function:', error)
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
