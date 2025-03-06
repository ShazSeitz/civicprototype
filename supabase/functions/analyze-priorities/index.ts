
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
            content: 'You are a political analyst expert in converting casual language about political priorities into formal policy positions. Your response should include: 1) mappedPriorities: formal policy positions, 2) analysis: comprehensive but concise analysis of the overall political perspective, 3) unmappedTerms: terms that couldn\'t be confidently mapped to formal positions. Return your response as a simple JSON object with these three keys.'
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
    
    const contentString = data.choices[0].message.content;
    console.log('Raw content from OpenAI:', contentString);
    
    try {
      return JSON.parse(contentString);
    } catch (parseError) {
      console.log('Failed to parse content directly, attempting to extract JSON:', parseError);
      
      const jsonMatch = contentString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        console.log('Extracted JSON from markdown:', jsonMatch[1]);
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (nestedError) {
          console.error('Failed to parse extracted JSON:', nestedError);
          throw new Error('Unable to parse OpenAI response');
        }
      }
      
      const cleanedContent = contentString
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('Cleaned content:', cleanedContent);
      try {
        return JSON.parse(cleanedContent);
      } catch (fallbackError) {
        console.error('All parsing attempts failed:', fallbackError);
        throw new Error('Failed to parse response from OpenAI');
      }
    }
  } catch (error) {
    console.error('Error in analyzePriorities:', error);
    throw error;
  }
}

async function fetchRepresentatives(zipCode: string) {
  if (!googleCivicApiKey) {
    console.warn('GOOGLE_CIVIC_API_KEY is not set');
    throw new Error('GOOGLE_CIVIC_API_NOT_CONFIGURED');
  }

  try {
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${googleCivicApiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Civic API error:', await response.text());
      throw new Error('GOOGLE_CIVIC_API_ERROR');
    }
    
    const data = await response.json();
    
    const representatives = [];
    
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
    throw error;
  }
}

async function fetchCandidatesByState(state: string, mode: "current" | "demo") {
  if (!fecApiKey) {
    console.warn('FEC_API_KEY is not set');
    throw new Error('FEC_API_NOT_CONFIGURED');
  }
  
  try {
    const year = 2024;
    console.log(`Fetching candidates for state ${state}, year ${year} with FEC API key`);
    
    const encodedState = encodeURIComponent(state);
    const url = `https://api.open.fec.gov/v1/candidates?api_key=${fecApiKey}&state=${encodedState}&election_year=${year}&sort=name&per_page=20`;
    
    console.log(`Making FEC API request to: ${url.replace(fecApiKey, "REDACTED")}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VoterInformationTool/1.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FEC API error status:', response.status);
      console.error('FEC API error text:', errorText);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('FEC_API_UNAUTHORIZED');
      } else if (response.status === 404) {
        throw new Error('FEC_API_ENDPOINT_NOT_FOUND');
      } else if (response.status === 429) {
        throw new Error('FEC_API_RATE_LIMIT');
      } else {
        throw new Error('FEC_API_ERROR');
      }
    }
    
    const data = await response.json();
    console.log('FEC API response status:', response.status);
    console.log('FEC API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (data) {
      console.log('FEC API response keys:', Object.keys(data));
      if (data.results) {
        console.log(`Found ${data.results.length} candidates in response`);
      } else {
        console.error('No results key in response data');
      }
    } else {
      console.error('Response data is null or undefined');
    }
    
    if (!data) {
      throw new Error('FEC_API_EMPTY_RESPONSE');
    }
    
    if (!data.results) {
      console.error('FEC API returned data without results:', JSON.stringify(data).substring(0, 500));
      return [];
    }
    
    if (!Array.isArray(data.results)) {
      console.error('FEC API results is not an array:', typeof data.results);
      return [];
    }
    
    return data.results.map((candidate: any) => ({
      name: candidate.name || "Unknown",
      office: candidate.office_full || "Unknown Office",
      party: candidate.party_full || "Unknown Party"
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
}

async function fetchBallotMeasures(state: string, mode: "current" | "demo") {
  console.warn('Ballot measures API not implemented - would need to use state-specific APIs');
  
  return [];
}

async function identifyOfficialIssueAreas(representative: any, formattedPriorities: any) {
  console.log('Identifying issue areas for:', representative.name);
  
  try {
    // Extract the formal policy positions from the analysis
    const policyAreas = Object.keys(formattedPriorities).filter(key => 
      key !== 'analysis' && key !== 'unmappedTerms'
    );
    
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
            content: `You are an expert on local, state, and federal elected officials in the US. 
            Your task is to identify which policy areas a given official is most likely to engage with based on their office and party.
            For each policy area, provide:
            1. A score from 0-1 indicating likelihood of engagement
            2. A stance indicator: "support" if they likely support this issue, "oppose" if they likely oppose it, or "neutral"
            Return a JSON object with policy areas as keys and objects containing score and stance as values.
            Only include areas where there's a reasonable expectation of influence or interest based on their office.`
          },
          {
            role: 'user',
            content: `Based on this official's position and party, identify which of these policy areas they are likely to engage with and whether they would support or oppose them:
            Official: ${representative.name}
            Office: ${representative.office}
            Party: ${representative.party || "Unknown"}
            
            Policy Areas to Consider: ${JSON.stringify(policyAreas)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return { matchScore: 0.5, alignmentType: 'unknown' }; // Default medium score if API fails
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response from OpenAI API for official issue areas');
      return { matchScore: 0.5, alignmentType: 'unknown' };
    }
    
    try {
      const contentString = data.choices[0].message.content;
      console.log('Issue areas raw content:', contentString);
      
      // Try parsing directly
      let issueAreas;
      try {
        issueAreas = JSON.parse(contentString);
      } catch (parseError) {
        // Extract JSON if wrapped in code blocks
        const jsonMatch = contentString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          issueAreas = JSON.parse(jsonMatch[1]);
        } else {
          const cleanedContent = contentString
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          issueAreas = JSON.parse(cleanedContent);
        }
      }
      
      // Calculate alignment scores
      let supportScore = 0;
      let opposeScore = 0;
      let totalScore = 0;
      
      Object.entries(issueAreas).forEach(([area, data]: [string, any]) => {
        const score = data.score || data;
        const stance = data.stance || 'neutral';
        
        totalScore += score;
        if (stance === 'support') {
          supportScore += score;
        } else if (stance === 'oppose') {
          opposeScore += score;
        }
      });
      
      const averageScore = totalScore > 0 ? totalScore / Object.keys(issueAreas).length : 0.5;
      
      // Determine alignment type
      let alignmentType = 'mixed';
      if (supportScore > opposeScore * 2) {
        alignmentType = 'aligned';
      } else if (opposeScore > supportScore * 2) {
        alignmentType = 'opposing';
      }
      
      return {
        issueAreas,
        matchScore: averageScore,
        alignmentType
      };
    } catch (error) {
      console.error('Error parsing issue areas:', error);
      return { matchScore: 0.5, alignmentType: 'unknown' };
    }
  } catch (error) {
    console.error('Error in identifyOfficialIssueAreas:', error);
    return { matchScore: 0.5, alignmentType: 'unknown' };
  }
}

async function generateEmailDraft(representative: any, priorities: string[], issueAreas: any) {
  console.log('Generating email draft for:', representative.name);
  
  try {
    // Identify which priorities to focus on based on the official's issue areas
    const focusedEmail = issueAreas && issueAreas.issueAreas ? true : false;
    const isOpposing = issueAreas && issueAreas.alignmentType === 'opposing';
    
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
            content: isOpposing 
              ? 'You are an expert in constituent communication. Write a targeted, respectful email to an official who may OPPOSE the constituent\'s priorities. The tone should be firm but constructive, presenting evidence and reasoning to potentially change their mind. Be factual, not accusatory. Include recipient\'s email address if provided.'
              : 'You are an expert in constituent communication. Write a targeted, concise email that focuses ONLY on the issues this official is most engaged with. Be brief, specific, and actionable. Include recipient\'s email address if provided.'
          },
          {
            role: 'user',
            content: focusedEmail
              ? `Write a ${isOpposing ? 'respectful but firm' : 'focused'} email to ${representative.name} (${representative.office}) ${isOpposing ? 
                'who may OPPOSE these priority areas: ' : 
                'specifically about these priority areas they are known to champion: '}${JSON.stringify(Object.entries(issueAreas.issueAreas)
                  .filter(([_, data]: [string, any]) => {
                    const score = typeof data === 'object' ? data.score || 0 : data || 0;
                    return score > 0.6;
                  })
                  .map(([issue, _]) => issue))}.
                These are from my full set of priorities: ${JSON.stringify(priorities)}.
                Make the email brief and specific. ${representative.email ? `Include the email address ${representative.email} in the draft.` : ''}`
              : `Write an email to ${representative.name} (${representative.office}) expressing these priorities: ${JSON.stringify(priorities)}. ${representative.email ? `Include the email address ${representative.email} in the draft.` : ''}`
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
  
  const verifiedHudGroups = [
    {
      name: "National Fair Housing Alliance",
      url: "https://nationalfairhousing.org/",
      relevance: "Housing discrimination and equal housing opportunity"
    },
    {
      name: "National Housing Law Project",
      url: "https://www.nhlp.org/",
      relevance: "Housing rights, subsidized housing preservation"
    },
    {
      name: "National Low Income Housing Coalition",
      url: "https://nlihc.org/",
      relevance: "Affordable housing policy and advocacy"
    },
    {
      name: "Consumer Financial Protection Bureau (CFPB)",
      url: "https://www.consumerfinance.gov/",
      relevance: "Consumer protection for financial matters including housing"
    },
    {
      name: "U.S. Interagency Council on Homelessness",
      url: "https://www.usich.gov/",
      relevance: "Coordination of federal response to homelessness"
    },
    {
      name: "Local Initiatives Support Corporation (LISC)",
      url: "https://www.lisc.org/",
      relevance: "Community development and affordable housing initiatives"
    },
    {
      name: "Enterprise Community Partners",
      url: "https://www.enterprisecommunity.org/",
      relevance: "Affordable housing and community development"
    },
    {
      name: "National Housing Trust",
      url: "https://www.nationalhousingtrust.org/",
      relevance: "Affordable housing preservation"
    }
  ];
  
  return verifiedHudGroups.slice(0, 3);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { priorities, mode, zipCode } = requestData;
    console.log('Received request:', { priorities, mode, zipCode });

    if (!Array.isArray(priorities) || priorities.length === 0) {
      throw new Error('Invalid priorities format');
    }

    if (!mode || (mode !== "current" && mode !== "demo")) {
      throw new Error('Invalid mode');
    }

    const priorityAnalysis = await analyzePriorities(priorities, mode);
    console.log('Priority analysis completed');

    let representatives = [];
    let candidates = [];
    let ballotMeasures = [];
    let apiStatuses = {
      googleCivic: 'success',
      fec: 'success'
    };

    if (zipCode) {
      try {
        representatives = await fetchRepresentatives(zipCode);
        console.log(`Retrieved ${representatives.length} representatives:`, 
          representatives.map(r => `${r.name} (${r.office}), email: ${r.email || 'none'}`));
      } catch (error: any) {
        console.error('Representatives fetch error:', error);
        apiStatuses.googleCivic = error.message || 'error';
      }

      const state = "PA";
      
      try {
        candidates = await fetchCandidatesByState(state, mode);
      } catch (error: any) {
        console.error('Candidates fetch error:', error);
        apiStatuses.fec = error.message || 'error';
      }
      
      ballotMeasures = await fetchBallotMeasures(state, mode);
    }

    let draftEmails = [];
    if (representatives.length > 0) {
      // Identify issue areas for each representative
      const representativesWithIssueAreas = await Promise.all(
        representatives.map(async (rep) => {
          const issueAreas = await identifyOfficialIssueAreas(rep, priorityAnalysis);
          return {
            ...rep,
            issueAreas,
          };
        })
      );
      
      // Create two arrays: one for aligned officials and one for opposing officials
      const alignedOfficials = representativesWithIssueAreas
        .filter(rep => rep.issueAreas.alignmentType === 'aligned')
        .sort((a, b) => (b.issueAreas?.matchScore || 0) - (a.issueAreas?.matchScore || 0));
      
      const opposingOfficials = representativesWithIssueAreas
        .filter(rep => rep.issueAreas.alignmentType === 'opposing')
        .sort((a, b) => (b.issueAreas?.matchScore || 0) - (a.issueAreas?.matchScore || 0));
      
      // Merge the arrays with aligned officials first, then opposing
      const sortedRepresentatives = [...alignedOfficials, ...opposingOfficials];
      
      // Fallback to other officials if no aligned or opposing found
      if (sortedRepresentatives.length === 0) {
        sortedRepresentatives.push(...representativesWithIssueAreas);
      }
      
      // Generate email drafts with issue area context
      const representativesWithEmail = sortedRepresentatives.filter(rep => rep.email);
      
      if (representativesWithEmail.length > 0) {
        console.log(`Generating email drafts for ${representativesWithEmail.length} representatives with emails`);
        draftEmails = await Promise.all(
          representativesWithEmail.map(async (rep) => {
            const issueAreasObj = rep.issueAreas;
            const emailBody = await generateEmailDraft(rep, priorities, issueAreasObj);
            
            // Extract relevant issues and their stances
            const relevantIssues = issueAreasObj && issueAreasObj.issueAreas
              ? Object.entries(issueAreasObj.issueAreas)
                  .filter(([_, data]: [string, any]) => {
                    const score = typeof data === 'object' ? data.score || 0 : data || 0;
                    return score > 0.6;
                  })
                  .map(([issue, data]: [string, any]) => {
                    const stance = typeof data === 'object' ? data.stance || 'neutral' : 'neutral';
                    return { issue, stance };
                  })
              : [];
            
            return {
              to: rep.name,
              toEmail: rep.email,
              office: rep.office,
              subject: `Constituent Priorities for Your Consideration`,
              body: emailBody,
              matchScore: issueAreasObj?.matchScore || 0.5,
              alignmentType: issueAreasObj?.alignmentType || 'unknown',
              relevantIssues: relevantIssues
            };
          })
        );
        console.log('Email drafts generated');
      } else {
        console.log('No representatives with email addresses found');
        const genericRep = representatives[0];
        const issueAreasObj = await identifyOfficialIssueAreas(genericRep, priorityAnalysis);
        draftEmails = [{
          to: genericRep.name,
          toEmail: null,
          office: genericRep.office,
          subject: `Constituent Priorities for Your Consideration`,
          body: await generateEmailDraft(genericRep, priorities, issueAreasObj) + "\n\nNote: No email address was found for this official. You may need to visit their official website to find contact information.",
          matchScore: issueAreasObj?.matchScore || 0.5,
          alignmentType: issueAreasObj?.alignmentType || 'unknown',
          relevantIssues: []
        }];
      }
    }

    const interestGroups = await findRelevantGroups(priorities);
    console.log('Found relevant groups');

    let petitions = [];
    try {
      const petitionsResponse = await fetch(
        "https://iozwrlajqoihohbapysh.functions.supabase.co/search-petitions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          },
          body: JSON.stringify({ priorities }),
        }
      );
      
      if (petitionsResponse.ok) {
        petitions = await petitionsResponse.json();
      } else {
        console.error('Error fetching petitions:', await petitionsResponse.text());
      }
    } catch (error) {
      console.error('Error calling search-petitions function:', error);
    }

    const response = {
      mode,
      analysis: priorityAnalysis.analysis,
      unmappedTerms: priorityAnalysis.unmappedTerms || [],
      candidates,
      ballotMeasures,
      draftEmails,
      interestGroups,
      petitions,
      apiStatuses
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
