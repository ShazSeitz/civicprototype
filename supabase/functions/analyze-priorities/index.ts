
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
  try {
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
            content: `You are a nonpartisan political analyst. Your task is to analyze voter priorities and map them to standardized political terminology. For example:
            - "government waste" maps to "fiscal responsibility"
            - "helping the poor" maps to "social welfare policy"
            - "gun rights" maps to "Second Amendment rights"
            - "protecting nature" maps to "environmental conservation"
            Provide a neutral, factual analysis that identifies key themes and maps them to standard political terminology.`
          },
          {
            role: 'user',
            content: `Analyze these voter priorities and provide a clear, concise summary that maps them to standard political terms: ${priorities.join('; ')}`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze priorities');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing priorities:', error);
    throw error;
  }
}

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

// Mock candidates data
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, zipCode, priorities } = await req.json();
    console.log('Received request:', { mode, zipCode, priorities });

    // Get location data for both modes
    const location = await getLocationFromZip(zipCode);
    console.log('Location data:', location);

    // Analyze priorities using OpenAI
    const priorityAnalysis = await analyzePriorities(priorities);
    console.log('Priority analysis:', priorityAnalysis);

    // For demo purposes
    if (mode === 'demo') {
      const response = {
        region: location.region,
        mode: 'demo',
        priorities,
        candidates: demoCandidates,
        analysis: priorityAnalysis,
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

      // Structure the response with the priority analysis
      const response = {
        region: location.region,
        mode: 'current',
        priorities,
        noActiveElections: !hasActiveElections,
        analysis: priorityAnalysis,
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
        analysis: priorityAnalysis, // Include the priority analysis even in error state
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
