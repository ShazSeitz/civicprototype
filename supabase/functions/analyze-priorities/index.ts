
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Contest {
  type: string;
  office?: string;
  district?: {
    name: string;
    scope: string;
  };
  candidates?: Array<{
    name: string;
    party: string;
    channels?: Array<{
      type: string;
      id: string;
    }>;
  }>;
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumText?: string;
}

interface CivicApiResponse {
  contests?: Contest[];
  state?: Array<{
    electionAdministrationBody: {
      name: string;
      electionInfoUrl: string;
    };
  }>;
}

interface FECCandidate {
  candidate_id: string;
  name: string;
  party_full: string;
  incumbent_challenge_full: string;
  total_receipts: number;
  total_disbursements: number;
  cash_on_hand_end_period: number;
  office_full: string;
}

async function getFECCandidateInfo(name: string, office: string): Promise<FECCandidate | null> {
  const fecApiKey = Deno.env.get('FEC_API_KEY');
  if (!fecApiKey) {
    console.log('FEC API key not configured, skipping FEC data enrichment');
    return null;
  }

  try {
    const searchName = name.split(' ')
                          .filter(part => !part.includes('.'))
                          .slice(0, 2)
                          .join(' ');

    const searchUrl = `https://api.open.fec.gov/v1/candidates/search/?api_key=${fecApiKey}&q=${encodeURIComponent(searchName)}&sort=name&per_page=1`;
    console.log('Fetching FEC data for:', searchName);
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error('FEC API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      console.log('No FEC data found for:', searchName);
      return null;
    }

    const candidateId = data.results[0].candidate_id;
    const detailsUrl = `https://api.open.fec.gov/v1/candidate/${candidateId}/totals/?api_key=${fecApiKey}&sort=-cycle&per_page=1`;
    
    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      console.error('FEC API details error:', detailsResponse.status);
      return null;
    }

    const details = await detailsResponse.json();
    if (!details.results || details.results.length === 0) {
      return null;
    }

    return {
      ...data.results[0],
      ...details.results[0]
    };
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return null;
  }
}

async function getElectionData(zipCode: string): Promise<any> {
  const civicApiKey = Deno.env.get('CIVIC_API_KEY');
  if (!civicApiKey) {
    console.error('Civic API key not configured');
    throw new Error('Election data service not configured');
  }

  const address = encodeURIComponent(zipCode);
  const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${civicApiKey}&address=${address}&electionId=2000`;
  
  console.log('Fetching election data for ZIP:', zipCode);
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Civic API error:', response.status);
    throw new Error('Error fetching election data');
  }

  return response.json();
}

const PRESET_PRESIDENTIAL_CANDIDATES = [
  {
    name: "Candidate A",
    party: "Party A",
    highlights: [
      "Economic policy focus",
      "Foreign policy experience",
      "Infrastructure plan"
    ]
  },
  {
    name: "Candidate B",
    party: "Party B",
    highlights: [
      "Healthcare reform",
      "Environmental initiatives",
      "Education policy"
    ]
  },
  {
    name: "Candidate C",
    party: "Party C",
    highlights: [
      "Technology innovation",
      "Job creation plan",
      "Immigration reform"
    ]
  },
  {
    name: "Candidate D",
    party: "Party D",
    highlights: [
      "Fiscal responsibility",
      "National security",
      "Social programs"
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const { mode, zipCode, priorities } = requestData;

    if (!mode || !zipCode || !priorities) {
      console.error('Missing required fields:', { mode, zipCode, prioritiesLength: priorities?.length });
      throw new Error('Missing required fields');
    }

    if (!Array.isArray(priorities) || priorities.length !== 6) {
      console.error('Invalid priorities:', priorities);
      throw new Error('Invalid priorities format');
    }

    console.log('Processing request for ZIP:', zipCode);
    console.log('Mode:', mode);
    console.log('Priorities:', priorities);

    // Get representatives data from Google Civic API
    const civicApiKey = Deno.env.get('CIVIC_API_KEY');
    const representativesUrl = `https://www.googleapis.com/civicinfo/v2/representatives?key=${civicApiKey}&address=${encodeURIComponent(zipCode)}`;
    const repResponse = await fetch(representativesUrl);
    
    if (!repResponse.ok) {
      console.error('Civic API error:', await repResponse.text());
      throw new Error('Failed to fetch representative data');
    }
    
    const repData = await repResponse.json();
    console.log('Civic API response:', repData);

    if (!repData.normalizedInput) {
      console.error('No normalized input in Civic API response');
      throw new Error('Invalid response from Civic API');
    }

    const region = `${zipCode} (${repData.normalizedInput.city}, ${repData.normalizedInput.state})`;
    console.log('Extracted region:', region);
    
    // Extract current representatives with their contact info
    const representatives = repData.offices?.map((office: any) => {
      const official = repData.officials[office.officialIndices[0]];
      return {
        name: official.name,
        office: office.name,
        email: official.emails?.[0],
        channels: official.channels
      };
    }).filter((rep: any) => rep.email) || [];

    // Get content analysis from our analyze-content function
    const contentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priorities,
        representatives
      })
    });

    const contentAnalysis = await contentResponse.json();

    if (mode === "current") {
      return new Response(JSON.stringify({
        region: region,
        mode: "current",
        priorities: contentAnalysis.mappedPriorities,
        analysis: contentAnalysis.analysis,
        candidates: representatives.map((rep: any) => ({
          name: rep.name,
          office: rep.office,
          highlights: [
            `Contact: ${rep.email}`,
            rep.channels?.map((c: any) => `${c.type}: ${c.id}`).join(', ') || 'No social media available'
          ]
        })),
        draftEmails: contentAnalysis.emailDrafts,
        interestGroups: contentAnalysis.interestGroups,
        petitions: contentAnalysis.petitions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === "demo") {
      try {
        const electionData = await getElectionData(zipCode);
        console.log('Retrieved election data:', electionData);

        // Process election data as before
        const candidates = [];
        const ballotMeasures = [];

        if (electionData.contests) {
          for (const contest of electionData.contests) {
            if (contest.office === 'President of the United States') {
              candidates.push(...PRESET_PRESIDENTIAL_CANDIDATES);
            } else if (contest.type === 'General' && contest.office) {
              const candidateInfo = await getFECCandidateInfo(contest.candidates[0].name, contest.office);
              candidates.push({
                name: contest.candidates[0].name,
                office: contest.office,
                highlights: [
                  `Party: ${contest.candidates[0].party}`,
                  candidateInfo ? `Campaign Finance: $${(candidateInfo.total_receipts / 1000000).toFixed(1)}M raised` : 'Campaign finance data unavailable',
                  candidateInfo?.incumbent_challenge_full ? `Status: ${candidateInfo.incumbent_challenge_full}` : 'Status unavailable'
                ]
              });
            } else if (contest.type === 'Referendum') {
              ballotMeasures.push({
                title: contest.referendumTitle,
                recommendation: `${contest.referendumSubtitle}\n\n${contest.referendumText}`
              });
            }
          }
        }

        return new Response(JSON.stringify({
          region: `${zipCode} (${electionData.state?.[0]?.name || 'Unknown Region'})`,
          mode: "demo",
          priorities: contentAnalysis.mappedPriorities,
          analysis: contentAnalysis.analysis,
          candidates,
          ballotMeasures,
          draftEmails: contentAnalysis.emailDrafts,
          interestGroups: contentAnalysis.interestGroups,
          petitions: contentAnalysis.petitions
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error fetching election data:', error);
        throw new Error('Unable to fetch election data for this location');
      }
    }

    throw new Error('Invalid mode specified');

  } catch (error) {
    console.error('Error in analyze-priorities function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
