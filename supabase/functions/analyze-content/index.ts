
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function analyzePriorities(priorities: string[]) {
  console.log('Analyzing priorities:', priorities);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a political analyst expert in converting casual language about political priorities into formal policy positions. Format the response as JSON with two fields: 1. "mappedPriorities": array of formal policy positions, 2. "analysis": comprehensive but concise analysis of the overall political perspective'
          },
          {
            role: 'user',
            content: `Analyze these political priorities and map them to formal policy positions: ${JSON.stringify(priorities)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to analyze priorities');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error in analyzePriorities:', error);
    throw error;
  }
}

async function generateEmailDraft(representative: any, priorities: string[]) {
  console.log('Generating email draft for:', representative.name);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to generate email draft');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateEmailDraft:', error);
    throw error;
  }
}

async function findRelevantGroups(priorities: string[]) {
  console.log('Finding relevant groups for priorities');
  return [{
    name: "Citizens for Responsible Government",
    url: "https://www.hud.gov/program_offices/gov_relations/publicinterestgroups/fiscalresponsibility",
    relevance: "Focuses on government efficiency and fiscal responsibility"
  }];
}

async function findRelevantPetitions(priorities: string[]) {
  console.log('Finding relevant petitions for priorities');
  return [{
    title: "Reform Local Infrastructure Spending",
    url: "https://www.change.org/p/local-infrastructure-reform-2024",
    relevance: "Addresses fiscal responsibility in infrastructure projects"
  }];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request:', { mode, zipCode, priorities });

    if (!Array.isArray(priorities) || priorities.length !== 6) {
      throw new Error('Invalid priorities format');
    }

    // Mock representatives for demo mode
    const representatives = mode === 'demo' ? [
      { name: "Jane Smith", office: "State Senator", email: "jane.smith@state.gov" },
      { name: "John Doe", office: "House Representative", email: "john.doe@house.gov" }
    ] : [];

    console.log('Using representatives:', representatives);

    // Get analyzed priorities and overall analysis
    const priorityAnalysis = await analyzePriorities(priorities);
    console.log('Priority analysis completed');

    // Generate email drafts for each representative
    const emailDrafts = await Promise.all(
      representatives.map(async (rep) => ({
        to: rep.email,
        subject: `Constituent Priorities for ${rep.name}`,
        body: await generateEmailDraft(rep, priorities)
      }))
    );
    console.log('Email drafts generated');

    // Find relevant interest groups and petitions
    const [interestGroups, petitions] = await Promise.all([
      findRelevantGroups(priorities),
      findRelevantPetitions(priorities)
    ]);
    console.log('Found relevant groups and petitions');

    const response = {
      region: `${zipCode} (Demo Region)`,
      mode: mode,
      priorities: priorityAnalysis.mappedPriorities,
      analysis: priorityAnalysis.analysis,
      candidates: representatives.map(rep => ({
        name: rep.name,
        office: rep.office,
        highlights: [
          `Contact: ${rep.email}`,
          'Demo representative for testing'
        ]
      })),
      draftEmails: emailDrafts,
      interestGroups,
      petitions
    };

    console.log('Sending successful response');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
