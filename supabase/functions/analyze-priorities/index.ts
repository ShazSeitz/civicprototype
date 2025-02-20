
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
    return `Based on your priorities, here's a personalized analysis of what matters to you. Due to technical limitations, we're providing a simplified analysis at this time.`;
  }

  try {
    console.log('Analyzing priorities with OpenAI:', priorities);
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
            content: `You are having a direct conversation with a voter about their priorities. Your responses must:

            1. Always speak directly to the voter using "you" and "your"
            2. Never use any formatting, bullets, or technical terms like "Mapped Term"
            3. Use this exact format for each priority:
               "Based on your concern about [their topic], you may want to support [specific suggestion] related candidates, ballot measures, and petitions."
            4. Add specific details about what to look for in candidates and measures
            5. Write in a natural, flowing conversation
            6. Never use asterisks or any other markup

            Example:
            "Based on your concern about education funding, you may want to support school budget reform related candidates, ballot measures, and petitions. Look for candidates who prioritize increasing teacher salaries and funding for after-school programs.

            Based on your concern about public transportation, you may want to support transit improvement related candidates, ballot measures, and petitions. Consider supporting measures that would expand bus routes or improve rail service in your area."`
          },
          {
            role: 'user',
            content: `Have a direct conversation with the voter about these priorities and provide specific suggestions: ${priorities.join('; ')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to analyze priorities');
    }

    const data = await response.json();
    return data.choices[0].message.content + "\n\nIf this doesn't quite capture your priorities, feel free to adjust them and I'll provide updated suggestions.";
  } catch (error) {
    console.error('Error analyzing priorities:', error);
    return `Based on your priorities, here's a personal analysis for you. Note: We're experiencing some technical limitations in our analysis system.`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request:', { mode, zipCode, priorities });

    // Get priority analysis
    const priorityAnalysis = await analyzePriorities(priorities);
    console.log('Priority analysis completed');

    // Structure the response
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
    console.error('Error in analyze-priorities:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
