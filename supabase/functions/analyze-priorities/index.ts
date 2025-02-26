
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful tool that analyzes voter priorities. Your responses must:
1. First line: List the main policy areas identified from user inputs, starting with "Based on your inputs, I understand that you are concerned with: "
2. If there are conflicts: Add one simple sentence pointing out conflicts and state you will provide options for both
3. If clarification is needed: Add one simple question about unclear topics
4. Never use phrases like "I'm curious" or "I wonder"
5. Be direct but respectful
6. Use the user's own words when possible

Example good response:
"Based on your inputs, I understand that you are concerned with: public transportation and lower taxes.
Expanding public transit and reducing taxes may be at odds, but I will provide recommendations that address both.
Could you tell me more about what type of transportation options you're looking for?"

Example bad response (too indirect/patronizing):
"Based on your inputs, I understand your concerns about transportation and taxes.
I'm curious about how you envision balancing these priorities, as they might be in tension.
I wonder if you could share more about your transportation needs?"`
          },
          {
            role: 'user',
            content: `Here are the voter priorities to analyze:\n${priorities.join('\n')}`
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
