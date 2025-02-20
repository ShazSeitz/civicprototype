
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
    return `Based on your priorities, here's a personalized analysis. Due to technical limitations, we're providing a simplified analysis at this time.`;
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
            content: `You are analyzing voter priorities. For each priority the voter shares, you must respond using EXACTLY this format, with no deviations or additional formatting:

            Based on your concern about [their exact topic], you may want to support [specific actionable suggestion] related candidates, ballot measures, and petitions.

            Example responses:
            "Based on your concern about education funding, you may want to support school budget reform related candidates, ballot measures, and petitions."

            "Based on your concern about environmental protection, you may want to support environmental conservation related candidates, ballot measures, and petitions."

            Rules:
            1. Use EXACTLY the format shown above - no extra words or explanations
            2. One single sentence per priority
            3. No bullet points, no formatting, no asterisks
            4. Always start with "Based on your concern about"
            5. Always include the phrase "you may want to support"
            6. Always end with "related candidates, ballot measures, and petitions"
            7. Use their exact wording for the topic, don't rephrase it
            8. Keep suggestions specific but brief`
          },
          {
            role: 'user',
            content: `Analyze these voter priorities using the exact format specified: ${priorities.join('; ')}`
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
    return data.choices[0].message.content;
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
