import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import FirecrawlApp from 'npm:@mendable/firecrawl-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

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
  try {
    const hudUrl = 'https://www.hud.gov/program_offices/gov_relations/publicinterestgroups';
    console.log('Crawling HUD interest groups page:', hudUrl);

    const crawlResponse = await firecrawl.crawlUrl(hudUrl, {
      limit: 1,
      scrapeOptions: {
        formats: ['html'],
        selectors: {
          groups: '.content-detail a',  // Adjust selector based on HUD's actual HTML structure
          descriptions: '.content-detail p'
        }
      }
    });

    if (!crawlResponse.success) {
      throw new Error('Failed to crawl HUD page');
    }

    // Extract groups and match them with priorities
    const groups = crawlResponse.data[0].groups || [];
    const descriptions = crawlResponse.data[0].descriptions || [];
    
    const relevantGroups = [];
    
    for (const priority of priorities) {
      // Convert priority to keywords for matching
      const keywords = priority.toLowerCase().split(' ');
      
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const description = descriptions[i] || '';
        
        // Check if group or description matches priority keywords
        if (keywords.some(keyword => 
          group.toLowerCase().includes(keyword) || 
          description.toLowerCase().includes(keyword)
        )) {
          relevantGroups.push({
            name: group,
            url: group.href || hudUrl,
            relevance: `Matches priority: ${priority}`
          });
        }
      }
    }

    console.log('Found relevant groups:', relevantGroups);
    
    // Return top 5 most relevant groups or fallback to mock data if none found
    return relevantGroups.slice(0, 5).length > 0 ? relevantGroups.slice(0, 5) : [{
      name: "Citizens for Responsible Government",
      url: "https://www.hud.gov/program_offices/gov_relations/publicinterestgroups/fiscalresponsibility",
      relevance: "Focuses on government efficiency and fiscal responsibility"
    }];
  } catch (error) {
    console.error('Error finding relevant groups:', error);
    // Fallback to mock data if scraping fails
    return [{
      name: "Citizens for Responsible Government",
      url: "https://www.hud.gov/program_offices/gov_relations/publicinterestgroups/fiscalresponsibility",
      relevance: "Focuses on government efficiency and fiscal responsibility"
    }];
  }
}

async function findRelevantPetitions(priorities: string[]) {
  try {
    const response = await fetch('http://localhost:54321/functions/v1/search-petitions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priorities }),
    });

    if (!response.ok) {
      console.error('Error fetching petitions:', await response.text());
      throw new Error('Failed to fetch petitions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in findRelevantPetitions:', error);
    // Fallback to mock data if the petition search fails
    return [
      {
        title: "Reform Local Infrastructure Spending",
        url: "https://www.change.org/p/local-infrastructure-reform-2024",
        relevance: "Addresses fiscal responsibility in infrastructure projects"
      }
    ];
  }
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
