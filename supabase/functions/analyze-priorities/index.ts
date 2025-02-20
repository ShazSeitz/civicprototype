
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
            content: `You are analyzing voter priorities. Your task is to respond to each priority with EXACTLY one sentence in this precise format:

            "Based on your concern about [exact topic], you may want to support [specific actionable suggestion] related candidates, ballot measures, and petitions."

            Rules:
            1. One sentence per priority, no extra text
            2. No formatting, bullets, or markup
            3. Must start with "Based on your concern about"
            4. Must include "you may want to support"
            5. Must end with "related candidates, ballot measures, and petitions"
            6. Use their exact topic wording
            7. Make suggestions specific but brief

            Example output:
            "Based on your concern about education funding, you may want to support school budget reform related candidates, ballot measures, and petitions."
            `
          },
          {
            role: 'user',
            content: `Generate one response per priority using the exact format: ${priorities.join('; ')}`
          }
        ],
        temperature: 0.3,
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

    return data.choices[0].message.content;
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
