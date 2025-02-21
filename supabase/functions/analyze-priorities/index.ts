
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
            content: `You are a voter priority analyzer. For each priority, respond with exactly one sentence that strictly follows this format:

"Based on your concern about [insert exact user topic], you may want to support [insert specific actionable suggestion] related candidates, ballot measures, and petitions."

Critical rules:
1. Use the EXACT format shown - no deviations
2. NO asterisks, bullet points, or special formatting
3. NO explanations or additional text
4. Keep each response as a SINGLE sentence
5. Each response must START with "Based on your concern about"
6. Each response must CONTAIN "you may want to support"
7. Each response must END with "related candidates, ballot measures, and petitions"
8. Use the user's EXACT wording when referencing their topic
9. Separate responses with a single newline
10. Keep suggestions specific and actionable`
          },
          {
            role: 'user',
            content: `Generate one response per priority using the exact format:\n${priorities.join('\n')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
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

    // Clean up the response and ensure proper formatting
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
    const { mode, priorities } = await req.json();
    console.log('Received request with:', { mode, priorities });

    const analysis = await analyzePriorities(priorities);
    console.log('Analysis completed:', analysis);

    // Only return mode and analysis
    return new Response(JSON.stringify({
      mode,
      analysis
    }), {
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
