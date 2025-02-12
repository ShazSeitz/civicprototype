
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function analyzePriorities(priorities: string[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a political analyst expert in converting casual language about political priorities into formal policy positions. 
          Format the response as JSON with two fields:
          1. "mappedPriorities": array of formal policy positions
          2. "analysis": comprehensive but concise analysis of the overall political perspective`
        },
        {
          role: 'user',
          content: `Analyze these political priorities and map them to formal policy positions: ${JSON.stringify(priorities)}`
        }
      ],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateEmailDraft(representative: any, priorities: string[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in constituent communication. Write a professional, convincing email that clearly communicates the constituent\'s priorities.'
        },
        {
          role: 'user',
          content: `Write an email to ${representative.name} (${representative.office}) expressing these priorities: ${JSON.stringify(priorities)}`
        }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function findRelevantGroups(priorities: string[]) {
  // This would be replaced with actual API calls to scrape/search HUD's interest groups
  // For now, returning mock data with specific URLs
  return [
    {
      name: "Citizens for Responsible Government",
      url: "https://www.hud.gov/program_offices/gov_relations/publicinterestgroups/fiscalresponsibility",
      relevance: "Focuses on government efficiency and fiscal responsibility"
    }
  ];
}

async function findRelevantPetitions(priorities: string[]) {
  // This would be replaced with actual API calls to search Change.org or similar
  // For now, returning mock data with specific petition URLs
  return [
    {
      title: "Reform Local Infrastructure Spending",
      url: "https://www.change.org/p/local-infrastructure-reform-2024",
      relevance: "Addresses fiscal responsibility in infrastructure projects"
    }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priorities, representatives } = await req.json();
    
    // Get analyzed priorities and overall analysis
    const priorityAnalysis = await analyzePriorities(priorities);
    
    // Generate email drafts for each representative
    const emailDrafts = await Promise.all(
      representatives.map(async (rep: any) => ({
        to: rep.email,
        subject: `Constituent Priorities for ${rep.name}`,
        body: await generateEmailDraft(rep, priorities)
      }))
    );

    // Find relevant interest groups and petitions
    const interestGroups = await findRelevantGroups(priorities);
    const petitions = await findRelevantPetitions(priorities);

    return new Response(JSON.stringify({
      mappedPriorities: priorityAnalysis.mappedPriorities,
      analysis: priorityAnalysis.analysis,
      emailDrafts,
      interestGroups,
      petitions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
