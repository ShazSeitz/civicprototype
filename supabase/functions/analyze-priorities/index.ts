
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // For current mode, we'll implement real API calls later
    // For now, return a simplified response
    const response = {
      region: `Region for ZIP ${zipCode}`,
      mode: 'current',
      priorities,
      analysis: "This is a current mode response. API integrations for FEC and Google Civic data will be implemented soon.",
      noActiveElections: true,
      draftEmails: [
        {
          to: "representative@example.gov",
          subject: "Constituent Feedback",
          body: "Dear Representative,\n\nI am writing to share my thoughts on important issues in our community...\n\nBest regards,\n[Your name]"
        }
      ],
      interestGroups: [
        {
          name: "Local Civic Association",
          url: "https://example.org",
          relevance: "Matches your interest in community engagement"
        }
      ],
      petitions: [
        {
          title: "Support Local Community Programs",
          url: "https://change.org/example",
          relevance: "Aligns with your community priorities"
        }
      ]
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
