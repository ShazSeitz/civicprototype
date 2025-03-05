
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const googleCivicApiKey = Deno.env.get('GOOGLE_CIVIC_API_KEY');
const fecApiKey = Deno.env.get('FEC_API_KEY');

if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

async function analyzePriorities(priorities: string[], mode: "current" | "demo") {
  console.log('Analyzing priorities:', priorities);
  
  try {
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
            content: 'You are a political analyst expert in converting casual language about political priorities into formal policy positions. Format the response as JSON with two fields: 1. "mappedPriorities": array of formal policy positions, 2. "analysis": comprehensive but concise analysis of the overall political perspective, 3. "unmappedTerms": array of terms that couldn\'t be confidently mapped to formal positions'
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

async function fetchRepresentatives(zipCode: string) {
  if (!googleCivicApiKey) {
    console.warn('GOOGLE_CIVIC_API_KEY is not set, using demo data');
    return getDemoRepresentatives();
  }

  try {
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${googleCivicApiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Civic API error:', await response.text());
      return getDemoRepresentatives();
    }
    
    const data = await response.json();
    
    // Process and format the Google Civic API response
    const representatives = [];
    
    // Map offices to officials
    if (data.offices && data.officials) {
      for (const office of data.offices) {
        for (const officialIndex of office.officialIndices) {
          const official = data.officials[officialIndex];
          representatives.push({
            name: official.name,
            office: office.name,
            party: official.party,
            email: official.emails ? official.emails[0] : null,
            phone: official.phones ? official.phones[0] : null,
            photoUrl: official.photoUrl || null
          });
        }
      }
    }
    
    return representatives;
  } catch (error) {
    console.error('Error fetching representatives:', error);
    return getDemoRepresentatives();
  }
}

function getDemoRepresentatives() {
  return [
    {
      name: "Jane Smith",
      office: "State Representative",
      party: "Independent",
      email: "jsmith@state.gov",
      phone: "(555) 123-4567"
    },
    {
      name: "John Doe",
      office: "U.S. Senator",
      party: "Independent",
      email: "senator@senate.gov",
      phone: "(555) 765-4321"
    }
  ];
}

async function fetchCandidatesByState(state: string, mode: "current" | "demo") {
  if (mode === "demo") {
    return getDemoCandidates();
  }
  
  if (!fecApiKey) {
    console.warn('FEC_API_KEY is not set, using demo data');
    return getDemoCandidates();
  }
  
  try {
    const year = new Date().getFullYear();
    const url = `https://api.open.fec.gov/v1/candidates?api_key=${fecApiKey}&state=${state}&election_year=${year}&sort=name&per_page=20`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('FEC API error:', await response.text());
      return getDemoCandidates();
    }
    
    const data = await response.json();
    
    return data.results.map((candidate: any) => ({
      name: candidate.name,
      office: candidate.office_full || "Unknown Office",
      party: candidate.party_full || "Unknown Party"
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return getDemoCandidates();
  }
}

function getDemoCandidates() {
  return [
    {
      name: "Maria Rodriguez",
      office: "U.S. Representative",
      highlights: [
        "Supports middle-class tax relief",
        "Advocates for small business growth",
        "Focused on education reform"
      ]
    },
    {
      name: "James Wilson",
      office: "State Senate",
      highlights: [
        "Promotes infrastructure development",
        "Supports environmental conservation",
        "Advocates for healthcare accessibility"
      ]
    }
  ];
}

async function fetchBallotMeasures(state: string, mode: "current" | "demo") {
  if (mode === "demo") {
    return getDemoBallotMeasures();
  }
  
  // Note: This would be replaced with a real API call in production
  // Currently returning demo data since there's no single API that covers all states' ballot measures
  console.warn('Using demo ballot measures - in production would use state-specific APIs');
  return getDemoBallotMeasures();
}

function getDemoBallotMeasures() {
  return [
    {
      title: "Proposition 1: Infrastructure Bond",
      recommendation: "This measure would fund road improvements and public transportation. Consider your priorities on taxes and infrastructure."
    },
    {
      title: "Measure B: School Funding",
      recommendation: "This would increase education funding through property tax adjustments. Consider your views on education and taxation."
    }
  ];
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
  
  // A real implementation would use a database of verified organizations
  // For now, using a simple list of legitimate national organizations
  const verifiedGroups = [
    {
      name: "League of Women Voters",
      url: "https://www.lwv.org/",
      relevance: "Non-partisan organization focused on protecting democracy and voter rights"
    },
    {
      name: "Common Cause",
      url: "https://www.commoncause.org/",
      relevance: "Government accountability and democratic reform organization"
    },
    {
      name: "Sierra Club",
      url: "https://www.sierraclub.org/",
      relevance: "Environmental conservation and climate policy"
    },
    {
      name: "ACLU",
      url: "https://www.aclu.org/",
      relevance: "Civil liberties and constitutional rights"
    },
    {
      name: "Brookings Institution",
      url: "https://www.brookings.edu/",
      relevance: "Public policy research organization covering many domestic and international issues"
    }
  ];
  
  // In a real implementation, we would match priorities to organizations using a more sophisticated algorithm
  // For now, just returning a subset of verified organizations
  return verifiedGroups.slice(0, 3);
}

async function findRelevantPetitions(priorities: string[]) {
  // A real implementation would use an API to fetch verified, active petitions
  // For now, providing links to trusted petition sites where users can search
  
  const petitionSites = [
    {
      title: "Find petitions on Change.org",
      url: "https://www.change.org",
      relevance: "Platform for various citizen-created petitions"
    },
    {
      title: "White House Petitions",
      url: "https://petitions.whitehouse.gov/",
      relevance: "Official US government petition site"
    }
  ];
  
  return petitionSites;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { priorities, mode, zipCode } = requestData;
    console.log('Received request:', { priorities, mode, zipCode });

    if (!Array.isArray(priorities) || priorities.length !== 6) {
      throw new Error('Invalid priorities format');
    }

    if (!mode || (mode !== "current" && mode !== "demo")) {
      throw new Error('Invalid mode');
    }

    // Get analyzed priorities and overall analysis
    const priorityAnalysis = await analyzePriorities(priorities, mode);
    console.log('Priority analysis completed');

    // Fetch relevant data based on mode
    let representatives = [];
    let candidates = [];
    let ballotMeasures = [];

    // For current mode or demo mode, fetch appropriate data
    if (zipCode) {
      representatives = await fetchRepresentatives(zipCode);

      // Get state from zip code for state-specific data
      // This is simplified and would need a proper zip-to-state lookup in production
      const state = "PA"; // Placeholder - would be determined from zip code
      
      candidates = await fetchCandidatesByState(state, mode);
      ballotMeasures = await fetchBallotMeasures(state, mode);
    }

    // Generate email drafts for representatives
    const draftEmails = await Promise.all(
      representatives.slice(0, 2).map(async (rep) => ({
        to: rep.name,
        subject: `Constituent Priorities for Your Consideration`,
        body: await generateEmailDraft(rep, priorities)
      }))
    );
    console.log('Email drafts generated');

    // Find relevant interest groups based on verified organizations
    const interestGroups = await findRelevantGroups(priorities);
    console.log('Found relevant groups');

    // Find relevant petitions from legitimate sources
    const petitions = await findRelevantPetitions(priorities);
    console.log('Found relevant petitions');

    const response = {
      mode,
      analysis: priorityAnalysis.analysis,
      unmappedTerms: priorityAnalysis.unmappedTerms || [],
      candidates,
      ballotMeasures,
      draftEmails,
      interestGroups,
      petitions
    };

    console.log('Sending successful response');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-priorities function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
