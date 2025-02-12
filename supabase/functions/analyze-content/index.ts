
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

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
        model: 'gpt-4',
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
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }
    
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
        model: 'gpt-4',
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
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateEmailDraft:', error);
    throw error;
  }
}

async function findRelevantGroups(priorities: string[]) {
  console.log('Finding relevant groups for priorities:', priorities);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in civic engagement and advocacy groups. Generate relevant interest groups based on political priorities. Return response as a JSON array of objects with fields: name, url, relevance'
          },
          {
            role: 'user',
            content: `Suggest 3 relevant interest groups for these priorities: ${JSON.stringify(priorities)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get interest group suggestions');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error finding interest groups:', error);
    return [{
      name: "Default Civic Action Group",
      url: "https://www.usa.gov/advocacy-groups",
      relevance: "General civic engagement resources"
    }];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priorities, representatives } = await req.json();
    console.log('Received request:', { priorities, representativesCount: representatives?.length });

    if (!Array.isArray(priorities) || priorities.length !== 6) {
      throw new Error('Invalid priorities format');
    }

    // Get analyzed priorities and overall analysis
    const priorityAnalysis = await analyzePriorities(priorities);
    console.log('Priority analysis completed');

    // Generate email drafts for each representative
    const emailDrafts = await Promise.all(
      (representatives || []).map(async (rep) => ({
        to: rep.email,
        subject: `Constituent Priorities for ${rep.name}`,
        body: await generateEmailDraft(rep, priorities)
      }))
    );
    console.log('Email drafts generated');

    // Find relevant interest groups
    const interestGroups = await findRelevantGroups(priorities);
    console.log('Found relevant groups');

    // For demonstration purposes, generating example petitions
    const petitions = priorities.map((priority, index) => ({
      title: `Petition related to: ${priority.slice(0, 50)}...`,
      url: `https://www.change.org/search?q=${encodeURIComponent(priority.slice(0, 20))}`,
      relevance: `Based on priority #${index + 1}`
    })).slice(0, 3);

    const response = {
      mappedPriorities: priorityAnalysis.mappedPriorities,
      analysis: priorityAnalysis.analysis,
      emailDrafts,
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
