
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
            content: `You are a friendly, conversational political analyst helping voters understand their priorities. Follow these guidelines:

            1. Use natural, conversational language as if speaking directly to the voter
            2. Start with phrases like "Based on your concerns about..." or "You've expressed interest in..."
            3. For each priority, suggest specific types of candidates, measures, or initiatives they might want to support
            4. Don't use any technical terms, bullet points, or formatting
            5. Write in flowing paragraphs that connect ideas naturally
            6. Make practical, actionable suggestions
            7. Keep everything in first person ("you might want to..." or "you could look for...")

            Example:
            "Based on your concerns about education funding, you might want to look for candidates who prioritize increasing school budgets and supporting after-school programs. Your interest in environmental protection suggests you'd benefit from supporting local conservation initiatives and candidates with strong climate action plans.

            You've expressed concerns about public transportation, so consider supporting measures that would expand bus routes or improve rail service in your area. Look for candidates who have concrete plans for improving local transit options."`
          },
          {
            role: 'user',
            content: `Analyze these voter priorities and provide a conversational, helpful summary with practical suggestions: ${priorities.join('; ')}`
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
    return data.choices[0].message.content + "\n\nIf this analysis doesn't quite capture your priorities, feel free to adjust them and I'll provide updated recommendations.";
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
