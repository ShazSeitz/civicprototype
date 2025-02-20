
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CIVIC_API_KEY = Deno.env.get('CIVIC_API_KEY');
const FEC_API_KEY = Deno.env.get('FEC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function analyzePriorities(priorities: string[]) {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    return `Based on your priorities, we've identified several key themes in your concerns. Due to technical limitations, we're providing a simplified analysis at this time.`;
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
            content: `You are a nonpartisan political analyst helping voters understand their priorities. Follow these guidelines:

            1. Write in a conversational, first-person style addressing the voter directly ("you express" or "you seem concerned about")
            2. Don't use any markup, bullets, or technical terms
            3. For each priority, explain what it means and suggest relevant policy areas or types of measures to look for
            4. Keep the tone friendly and professional
            5. Write in clear paragraphs, not bullet points
            6. Include practical suggestions about what types of policies or initiatives might align with their priorities
            
            Example:
            "You express strong concerns about environmental protection, particularly regarding national parks. This suggests you might want to look for candidates and measures that prioritize conservation funding and park maintenance.
            
            You also mention concerns about educational funding. Consider looking into local school board initiatives and state-level education funding proposals that align with your priorities for improving school programs."`
          },
          {
            role: 'user',
            content: `Analyze these voter priorities and provide a conversational, helpful summary with suggestions: ${priorities.join('; ')}`
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
    return data.choices[0].message.content + "\n\nIf any of this analysis sounds incorrect, feel free to edit your priorities and I will revise my recommendations.";
  } catch (error) {
    console.error('Error analyzing priorities:', error);
    return `Based on your priorities, here's our analysis. Note: We're experiencing some technical limitations in our detailed analysis system.`;
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
