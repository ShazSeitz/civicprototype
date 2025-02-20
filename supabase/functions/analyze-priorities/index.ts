
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CIVIC_API_KEY = Deno.env.get('CIVIC_API_KEY');
const FEC_API_KEY = Deno.env.get('FEC_API_KEY');

async function getLocationFromZip(zipCode: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${CIVIC_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Civic API error:', await response.text());
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    return {
      city: data.normalizedInput?.city || '',
      state: data.normalizedInput?.state || '',
      region: `${data.normalizedInput?.city || ''}, ${data.normalizedInput?.state || ''}`
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return {
      city: '',
      state: '',
      region: `Region for ZIP ${zipCode}`
    };
  }
}

// Mock candidates data - constant regardless of location
const demoCandidates = [
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
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request:', { mode, zipCode, priorities });

    // Get location data for both modes
    const location = await getLocationFromZip(zipCode);
    console.log('Location data:', location);

    // For demo purposes
    if (mode === 'demo') {
      const response = {
        region: location.region,
        mode: 'demo',
        priorities,
        candidates: demoCandidates,
        analysis: `Based on your priorities and location in ${location.region}, we recommend focusing on candidates and measures that align with your interests. Note that this is demo mode using fixed presidential candidates for illustration.`,
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
            subject: "Constituent Concerns",
            body: `Dear Senator,\n\nAs a constituent from ${location.region}, I am writing to express my concerns about the following priorities:\n\n${priorities.join('\n\n')}\n\nI would appreciate your thoughts on these matters.\n\nBest regards,\n[Your name]`
          }
        ],
        interestGroups: [
          {
            name: "Local Civic Association",
            url: "https://www.usa.gov/local-governments",
            relevance: `Find civic organizations in ${location.region}`
          },
          {
            name: "Environmental Defense Fund",
            url: "https://www.edf.org",
            relevance: "National environmental advocacy group"
          }
        ],
        petitions: [
          {
            title: `Improve Public Transit in ${location.city || 'Your Area'}`,
            url: "https://change.org/example1",
            relevance: "Matches your interest in local transportation improvements"
          },
          {
            title: "Support Education Programs",
            url: "https://change.org/example2",
            relevance: "Aligns with your priority on education and community programs"
          }
        ]
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For current mode - real API integration
    try {
      // First get civic data
      const civicData = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${CIVIC_API_KEY}`
      );
      
      if (!civicData.ok) {
        throw new Error('Failed to fetch civic data');
      }
      
      const civicInfo = await civicData.json();
      console.log('Civic data received:', civicInfo);

      // Check if there are any upcoming elections
      const hasActiveElections = civicInfo.contests && civicInfo.contests.length > 0;

      // Structure the response
      const response = {
        region: location.region,
        mode: 'current',
        priorities,
        noActiveElections: !hasActiveElections,
        analysis: `Based on your location in ${location.region}, we have analyzed your priorities against available civic data.`,
        candidates: civicInfo.officials?.map((official: any) => ({
          name: official.name,
          office: official.office || "Current Official",
          highlights: [
            official.party || "No party affiliation listed",
            ...(official.phones || []),
            ...(official.emails || [])
          ]
        })) || [],
        draftEmails: civicInfo.officials?.filter((official: any) => official.emails?.length > 0)
          .map((official: any) => ({
            to: official.emails[0],
            subject: "Constituent Feedback",
            body: `Dear ${official.name},\n\nAs a constituent from ${location.region}, I am writing to discuss several priorities that are important to me and our community.\n\n${priorities.join('\n\n')}\n\nI would appreciate your thoughts on these matters.\n\nBest regards,\n[Your name]`
          })) || [],
        interestGroups: [
          {
            name: "Local Civic Association",
            url: "https://www.usa.gov/local-governments",
            relevance: `Find civic organizations in ${location.region}`
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
        region: location.region,
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
