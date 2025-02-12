
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    console.log('Processing request for ZIP:', zipCode)
    console.log('Priorities:', priorities)

    // Construct the prompt for GPT
    const systemPrompt = `You are an expert political analyst helping voters make informed decisions. 
    Analyze the voter's priorities and provide recommendations for local elections.
    Focus on how these priorities align with current candidates and issues.
    Be objective and factual in your analysis.
    Provide your response in clear paragraphs with line breaks between sections.`

    const userPrompt = `Based on these voter details:
    Mode: ${mode}
    Location: ZIP code ${zipCode}
    Top 6 Priorities (in order of importance):
    ${priorities.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
    
    Please provide:
    1. A brief analysis of how these priorities relate to current political issues in their area
    2. Specific recommendations for local elections
    3. Key points the voter should consider when making their decision`

    console.log('Sending request to OpenAI')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received OpenAI response')

    const analysis = data.choices[0].message.content

    // Format the response for the frontend
    const recommendations = {
      region: zipCode,
      analysis: analysis,
      candidates: [] // Empty array for now
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
