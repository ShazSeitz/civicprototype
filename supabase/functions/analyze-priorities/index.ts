
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function analyzePriorities(priorities: string[]) {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('Starting priority analysis with priorities:', priorities);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are analyzing voter priorities. For each priority, respond with EXACTLY ONE sentence in this EXACT format:

"Based on your concern about [topic], you may want to support [specific suggestion] related candidates, ballot measures, and petitions."

Example responses:
"Based on your concern about government waste, you may want to support fiscal responsibility related candidates, ballot measures, and petitions."
"Based on your concern about helping the poor, you may want to support social welfare policy related candidates, ballot measures, and petitions."

Rules:
1. Each response must be ONE single sentence
2. Each response MUST start with "Based on your concern about"
3. Each response MUST contain "you may want to support"
4. Each response MUST end with "related candidates, ballot measures, and petitions"
5. Use the user's exact wording for the topic
6. Keep suggestions specific and actionable
7. NO additional text, formatting, or explanations
8. NO bullet points or numbers
9. NO extra whitespace or line breaks between responses

Just return one sentence per priority in the exact format shown.`
          },
          {
            role: 'user',
            content: `Analyze these priorities using the exact format: ${priorities.join('\n')}`
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    // Clean up the response to ensure proper formatting
    const cleanedContent = data.choices[0].message.content
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('Based on your concern about'))
      .join('\n');

    return cleanedContent;
  } catch (error) {
    console.error('Error in analyzePriorities:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request with:', { mode, zipCode, priorities });

    const priorityAnalysis = await analyzePriorities(priorities);
    console.log('Analysis completed successfully');

    const response = {
      region: `ZIP Code ${zipCode}`,
      mode,
      priorities,
      analysis: priorityAnalysis,
      candidates: [],
      interestGroups: [],
      petitions: []
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
