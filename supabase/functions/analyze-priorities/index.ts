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
  const data = await response.json();
  
  if (!response.ok) {
    if (data.error?.message?.includes('Election unknown')) {
      throw new Error('No active elections');
    }
    console.error('Civic API error:', response.status, data);
    throw new Error('Error fetching election data');
  }

  return data;
}

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
    if (!civicApiKey) {
      throw new Error('CIVIC_API_KEY is not configured');
    }

    const representativesUrl = `https://www.googleapis.com/civicinfo/v2/representatives?key=${civicApiKey}&address=${encodeURIComponent(zipCode)}`;
    console.log('Fetching representatives from:', representativesUrl);
    
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

    // Create a mapping of official indices to their offices
    const officialToOffice = {};
    repData.offices?.forEach((office: any) => {
      office.officialIndices.forEach((index: number) => {
        officialToOffice[index] = office.name;
      });
    });

    // Extract representatives with their correct offices
    const representatives = repData.officials?.map((official: any, index: number) => ({
      name: official.name,
      office: officialToOffice[index] || 'Unknown Office',
      email: official.emails?.[0],
      channels: official.channels
    })).filter((rep: any) => rep.email) || [];

    console.log('Extracted representatives:', representatives);

    const region = `${zipCode} (${repData.normalizedInput.city}, ${repData.normalizedInput.state})`;
    console.log('Extracted region:', region);

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

    if (!contentResponse.ok) {
      console.error('Content analysis error:', await contentResponse.text());
      throw new Error('Failed to analyze content');
    }

    const contentAnalysis = await contentResponse.json();
    console.log('Content analysis completed');

    // Base response object for all cases
    const baseResponse = {
      region: region,
      mode: mode,
      priorities: contentAnalysis.mappedPriorities,
      analysis: contentAnalysis.analysis,
      draftEmails: contentAnalysis.emailDrafts,
      interestGroups: contentAnalysis.interestGroups,
      petitions: contentAnalysis.petitions
    };

    if (mode === "current") {
      try {
        const electionData = await getElectionData(zipCode);
        return new Response(JSON.stringify({
          ...baseResponse,
          candidates: representatives.map((rep: any) => ({
            name: rep.name,
            office: rep.office,
            highlights: [
              `Contact: ${rep.email}`,
              rep.channels?.map((c: any) => `${c.type}: ${c.id}`).join(', ') || 'No social media available'
            ]
          }))
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        if (error.message === 'No active elections') {
          // Return current representatives and other data without election info
          return new Response(JSON.stringify({
            ...baseResponse,
            noActiveElections: true,
            candidates: representatives.map((rep: any) => ({
              name: rep.name,
              office: rep.office,
              highlights: [
                `Contact: ${rep.email}`,
                rep.channels?.map((c: any) => `${c.type}: ${c.id}`).join(', ') || 'No social media available'
              ]
            }))
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }
    }

    if (mode === "demo") {
      try {
        const electionData = await getElectionData(zipCode);
        const candidates = [];
        const ballotMeasures = [];

        if (electionData.contests) {
          for (const contest of electionData.contests) {
            if (contest.type === 'General' && contest.office) {
              candidates.push({
                name: contest.candidates?.[0]?.name || 'Unknown Candidate',
                office: contest.office,
                highlights: [
                  `Party: ${contest.candidates?.[0]?.party || 'Unknown Party'}`,
                  'Campaign finance data unavailable',
                  'Status unavailable'
                ]
              });
            } else if (contest.type === 'Referendum') {
              ballotMeasures.push({
                title: contest.referendumTitle || 'Untitled Measure',
                recommendation: `${contest.referendumSubtitle || ''}\n\n${contest.referendumText || ''}`
              });
            }
          }
        }

        return new Response(JSON.stringify({
          ...baseResponse,
          candidates,
          ballotMeasures
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        if (error.message === 'No active elections') {
          return new Response(JSON.stringify({
            ...baseResponse,
            noActiveElections: true,
            candidates: [],
            ballotMeasures: []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
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
