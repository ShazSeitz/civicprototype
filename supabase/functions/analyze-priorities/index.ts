
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CIVIC_API_KEY = Deno.env.get('CIVIC_API_KEY');
const FEC_API_KEY = Deno.env.get('FEC_API_KEY');

async function fetchCivicData(zipCode: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${CIVIC_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Civic API error:', await response.text());
      throw new Error('Failed to fetch civic data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching civic data:', error);
    throw error;
  }
}

async function fetchFECData(state: string) {
  try {
    const response = await fetch(
      `https://api.open.fec.gov/v1/candidates/search/?api_key=${FEC_API_KEY}&state=${state}&election_year=2024&per_page=20`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('FEC API error:', await response.text());
      throw new Error('Failed to fetch FEC data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    throw error;
  }
}

// Mock data for DEMO mode
const demoData = {
  region: "San Francisco Bay Area, CA",
  candidates: [
    {
      name: "Kamala Harris",
      office: "President",
      highlights: [
        "Current Vice President",
        "Focus on healthcare reform",
        "Supports environmental protection initiatives"
      ]
    },
    {
      name: "Donald Trump",
      office: "President",
      highlights: [
        "Former President",
        "Focus on immigration reform",
        "Supports deregulation policies"
      ]
    },
    {
      name: "Jill Stein",
      office: "President",
      highlights: [
        "Green Party candidate",
        "Focus on environmental issues",
        "Supports universal healthcare"
      ]
    },
    {
      name: "Chase Oliver",
      office: "President",
      highlights: [
        "Independent candidate",
        "Focus on civil liberties",
        "Supports fiscal responsibility"
      ]
    }
  ],
  ballotMeasures: [
    {
      title: "Measure A: Infrastructure Bond",
      recommendation: "This measure aligns with your priority on improving local transportation."
    },
    {
      title: "Measure B: Education Funding",
      recommendation: "Based on your interest in education and community programs."
    }
  ],
  draftEmails: [
    {
      to: "senator@example.gov",
      subject: "Constituent Concerns about Local Transportation",
      body: "Dear Senator,\n\nI am writing as your constituent to express my concerns about local transportation in our area...\n\nBest regards,\n[Your name]"
    }
  ],
  interestGroups: [
    {
      name: "Transportation for America",
      url: "https://t4america.org",
      relevance: "Advocates for improved public transportation systems"
    },
    {
      name: "Environmental Defense Fund",
      url: "https://www.edf.org",
      relevance: "Works on environmental protection and climate change initiatives"
    }
  ],
  petitions: [
    {
      title: "Improve Public Transit in Bay Area",
      url: "https://change.org/example1",
      relevance: "Matches your interest in local transportation improvements"
    },
    {
      name: "Support After-School Programs",
      url: "https://change.org/example2",
      relevance: "Aligns with your priority on education and community programs"
    }
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request:', { mode, zipCode, priorities });

    // For demo purposes, return mock data
    if (mode === 'demo') {
      const response = {
        ...demoData,
        mode: 'demo',
        priorities,
        analysis: "Based on your priorities, we recommend focusing on candidates and measures that align with your interests in transportation, education, and environmental protection. The mock recommendations above reflect these priorities."
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch real data for current mode
    try {
      // First get civic data to get the state
      const civicData = await fetchCivicData(zipCode);
      console.log('Civic data received:', civicData);

      // Extract state from normalized input address
      const state = civicData.normalizedInput?.state || '';
      
      // Get FEC data if we have a valid state
      const fecData = state ? await fetchFECData(state) : null;
      console.log('FEC data received:', fecData);

      // Check if there are any upcoming elections
      const hasActiveElections = civicData.contests && civicData.contests.length > 0;

      // Structure the response
      const response = {
        region: `${civicData.normalizedInput?.city || ''}, ${civicData.normalizedInput?.state || ''}`,
        mode: 'current',
        priorities,
        noActiveElections: !hasActiveElections,
        analysis: `Based on your location in ${civicData.normalizedInput?.city || ''}, ${civicData.normalizedInput?.state || ''}, we have analyzed your priorities against available civic data.`,
        candidates: civicData.officials?.map((official: any) => ({
          name: official.name,
          office: official.office || "Current Official",
          highlights: [
            official.party || "No party affiliation listed",
            ...(official.phones || []),
            ...(official.emails || [])
          ]
        })) || [],
        draftEmails: civicData.officials?.filter((official: any) => official.emails?.length > 0)
          .map((official: any) => ({
            to: official.emails[0],
            subject: "Constituent Feedback",
            body: `Dear ${official.name},\n\nI am writing as your constituent to discuss several priorities that are important to me and our community.\n\n${priorities.join('\n\n')}\n\nI would appreciate your thoughts on these matters.\n\nBest regards,\n[Your name]`
          })) || [],
        interestGroups: [
          {
            name: "Local Civic Association",
            url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
            relevance: "Connect with local civic organizations"
          }
        ],
        petitions: [
          {
            title: "Local Community Initiatives",
            url: "https://www.change.org/search",
            relevance: "Find petitions related to your local community"
          }
        ]
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('API integration error:', apiError);
      
      // Return a graceful fallback response
      return new Response(JSON.stringify({
        region: `Region for ZIP ${zipCode}`,
        mode: 'current',
        priorities,
        analysis: "We're experiencing some technical difficulties retrieving detailed civic data. Here's some general information that might be helpful.",
        noActiveElections: true,
        draftEmails: [],
        interestGroups: [
          {
            name: "USA.gov",
            url: "https://www.usa.gov/elected-officials",
            relevance: "Find and contact your elected officials"
          }
        ],
        petitions: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in analyze-priorities:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
