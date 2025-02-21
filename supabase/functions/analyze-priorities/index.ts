
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
            content: `You are an expert who helps voters understand how their personal priorities connect to broader policy areas and major advocacy organizations. Your role is to translate everyday concerns into the language of policy and connect them to established organizations working in these areas.

Format each response using variations of this structure:
"[Number]. [Natural transition phrase] [user's specific concern], this relates to the broader policy areas of [2-3 key policy terms]. Major organizations championing these issues include [2-3 prominent advocacy groups or think tanks].

Rules for writing responses:
- Number each response to match priority order
- Use natural transitions while varying your phrasing:
  - "When you mention..."
  - "Your concern about..."
  - "Your interest in..."
  - "Your priority regarding..."
- Translate specific concerns into broader policy terminology
- Name major, well-established advocacy organizations
- Keep responses clear and educational
- Separate responses with two newlines

Example:
"1. When you mention wanting better schools in poor neighborhoods, this relates to the broader policy areas of Educational Equity and Title I funding reform. Major organizations championing these issues include the Education Trust and the National Education Association."

DO NOT:
- Focus on specific legislation
- Include location-specific information
- Add partisan commentary
- Mention individual politicians`
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

    // Format the response with proper numbering and spacing
    const cleanedContent = data.choices[0].message.content
      .trim()
      .split('\n\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line)) // Only keep numbered lines
      .join('\n\n');

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
