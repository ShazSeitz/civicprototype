
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
            content: `You are an expert policy analyst that maps voter priorities to specific policies, programs, and initiatives. For each priority, create one detailed response that connects their concern to concrete policy actions.

Format each response using variations of this structure:
"[Number]. Based on your interest in [specific topic], you may favor [2-3 specific policies/programs], including [detailed examples of relevant initiatives]"

Rules:
- Number each response to match the priority order
- Vary the connecting phrases naturally while maintaining clarity:
  - "Based on your interest in..."
  - "Given your concern about..."
  - "Regarding your priority of..."
  - "Considering your focus on..."
- Be highly specific with policy recommendations
- Include concrete programs, legislation, or initiatives
- Connect priorities to actionable policy outcomes
- Use natural, flowing language
- Separate responses with two newlines

Example:
"1. Given your concern about early childhood education, you may favor Title I funding expansion and Universal Pre-K legislation, including the Head Start Enhancement Act and Early Learning Challenge grants"

DO NOT:
- Use generic recommendations
- Repeat the exact same sentence structure
- Include location-specific information
- Add explanatory notes or context`
          },
          {
            role: 'user',
            content: `Here are the voter priorities to analyze with specific policy mappings:\n${priorities.join('\n')}`
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
