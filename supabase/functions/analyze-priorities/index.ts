
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = `You are an AI assistant helping match voters with candidates for the November 2024 election.
    Based on the voter's priorities, recommend specific candidates from:
    - Presidential candidates (limited to Biden, Trump, RFK Jr., and Jill Stein)
    - Local candidates for their area
    - Relevant ballot measures
    
    Provide personal, first-person recommendations addressing the voter directly ("Based on your priorities..." instead of "the voter").
    Focus on matching specific candidates and ballot measures to their stated priorities.
    Be concise and direct about why each recommendation matches their priorities.
    Structure the response in clear sections for Presidential, Local, and Ballot Measures.`

    const userPrompt = `Based on these priorities for the November 2024 election in ZIP code ${zipCode}:
    Your top 6 priorities in order of importance:
    ${priorities.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
    
    Please provide:
    1. Specific candidate recommendations that align with these priorities
    2. Your best matches for Presidential, local candidates, and ballot measures
    3. Clear explanations of why each recommendation matches your stated priorities`

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
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.statusText}. Details: ${errorText}`)
    }

    const data = await response.json()
    console.log('Received OpenAI response')

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI')
    }

    const analysis = data.choices[0].message.content

    // Format the response for the frontend
    const recommendations = {
      region: zipCode,
      analysis: analysis,
      candidates: [] // Empty array for now, as candidates are included in the analysis text
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
