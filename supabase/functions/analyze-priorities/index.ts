
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
            content: `You are an expert who helps voters understand how their personal priorities connect to broader policy areas. Your role is to provide a clear, concise summary of their policy interests.

Rules for writing responses:
- Start with exactly "Based on your inputs, I think you are concerned with: "
- Follow with a natural, flowing list of policy areas
- Use commas to separate policy areas
- Keep the entire response to 1-2 clear sentences
- Use plain language that connects to policy areas
- Don't repeat the user's exact words
- Don't add any extra formatting or line breaks

Example:
"Based on your inputs, I think you are concerned with: environmental protection, educational reform, healthcare access, and economic inequality."

DO NOT:
- Add any headers or extra text
- Use bullet points or numbers
- Include partisan commentary
- Add explanations or elaborations
- Mention specific legislation or politicians`
          },
          {
            role: 'user',
            content: `Here are the voter priorities to analyze and connect to broader policy areas:\n${priorities.join('\n')}`
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const cleanedContent = data.choices[0].message.content.trim();
    console.log('Final cleaned analysis:', cleanedContent);
    
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
