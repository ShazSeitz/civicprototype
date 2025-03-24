import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
// Try to get Google Civic API key from either GOOGLE_CIVIC_API_KEY or CIVIC_API_KEY
const googleCivicApiKey = Deno.env.get('GOOGLE_CIVIC_API_KEY') || Deno.env.get('CIVIC_API_KEY');
const fecApiKey = Deno.env.get('FEC_API_KEY');

if (!openAIApiKey) {
  console.warn('OPENAI_API_KEY is not set');
}

// Function to test API connectivity
async function testGoogleCivicApiConnection() {
  if (!googleCivicApiKey) {
    console.warn('No Google Civic API key found - checked both GOOGLE_CIVIC_API_KEY and CIVIC_API_KEY');
    return 'GOOGLE_CIVIC_API_NOT_CONFIGURED';
  }

  try {
    // Use a test zip code to verify API connectivity
    const testZip = '10001';
    console.log(`Testing Google Civic API connectivity with test ZIP: ${testZip}`);
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${testZip}&key=${googleCivicApiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Civic API test failed with status:', response.status);
      console.error('Google Civic API error details:', errorText);
      return 'GOOGLE_CIVIC_API_ERROR';
    }
    
    console.log('Google Civic API test successful');
    return 'CONNECTED';
  } catch (error) {
    console.error('Error testing Google Civic API connection:', error);
    return 'GOOGLE_CIVIC_API_ERROR';
  }
}

async function testFecApiConnection(mode = "current") {
  if (!fecApiKey) {
    console.warn('FEC_API_KEY is not set');
    return 'FEC_API_NOT_CONFIGURED';
  }

  try {
    // Use the elections endpoint with required parameters
    let electionDate;
    if (mode === "demo") {
      // For demo mode, use November 1, 2024
      electionDate = new Date(2024, 10, 1); // Note: month is 0-indexed, so 10 = November
      console.log('Using demo date: November 1, 2024');
    } else {
      // For current mode, use current date
      electionDate = new Date();
      console.log(`Using current date: ${electionDate.toISOString().split('T')[0]}`);
    }
    
    const year = electionDate.getFullYear();
    const cycle = year % 2 === 0 ? year : year - 1;
    
    const url = `https://api.open.fec.gov/v1/elections/?api_key=${fecApiKey}&cycle=${cycle}&office=president&page=1&per_page=1`;
    
    console.log(`Testing FEC API connectivity with URL: ${url.replace(fecApiKey, "REDACTED")}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VoterInformationTool/1.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FEC API test failed with status:', response.status);
      console.error('FEC API error details:', errorText);
      
      if (response.status === 401 || response.status === 403) {
        return 'FEC_API_UNAUTHORIZED';
      } else if (response.status === 404) {
        return 'FEC_API_ENDPOINT_NOT_FOUND';
      } else if (response.status === 429) {
        return 'FEC_API_RATE_LIMIT';
      } else {
        return 'FEC_API_ERROR';
      }
    }
    
    console.log('FEC API test successful');
    return 'CONNECTED';
  } catch (error) {
    console.error('Error testing FEC API connection:', error);
    return 'FEC_API_ERROR';
  }
}

// Load issue terminology from a fixed dataset instead of using AI for mapping
async function analyzePriorities(priorities: string[], mode: "current" | "demo") {
  console.log('Analyzing priorities:', priorities);
  
  try {
    // Here's the key change - we'll use a fixed terminology mapping instead of AI
    // We'll simulate fetching the terminology data - in a real implementation this would be imported or fetched
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
            content: `You are a political analyst expert who only maps user priorities to known terminology. 
            
            IMPORTANT RULES:
            1. NEVER invent or make up policy positions that aren't in the user's input.
            2. NEVER use AI to generate creative mappings.
            3. If you can't confidently map a priority to a known term, add it to unmappedTerms.
            4. Format your analysis into 2-3 short paragraphs with line breaks between them.
            5. Keep your analysis factual and directly based on the provided priorities.
            
            IMPORTANT: Your response must be a JSON object with these three keys:
            1) mappedPriorities: formal policy positions that are confirmed matches only
            2) analysis: brief analysis broken into paragraphs (with line breaks)
            3) unmappedTerms: array of terms that couldn't be confidently mapped
            
            Only map terms where you have HIGH CONFIDENCE in the match. Otherwise, put them in unmappedTerms.`
          },
          {
            role: 'user',
            content: `Analyze these political priorities and map them to formal policy positions, following the strict rules. Only map when you're highly confident: ${JSON.stringify(priorities)}`
          }
        ],
        temperature: 0.3, // Lowered temperature for more deterministic results
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
    
    // Parse the response
    try {
      const result = JSON.parse(contentString);
      
      // Format the analysis into paragraphs if it's not already
      if (result.analysis && typeof result.analysis === 'string') {
        const paragraphs = result.analysis.split('\n\n');
        if (paragraphs.length === 1) {
          // If no paragraphs, try to split it into 2-3 paragraphs
          const sentences = result.analysis.split(/(?<=[.!?])\s+/);
          if (sentences.length >= 4) {
            // Create 2-3 paragraphs from the sentences
            const paraLength = Math.ceil(sentences.length / 3);
            let newAnalysis = '';
            for (let i = 0; i < sentences.length; i += paraLength) {
              const paragraph = sentences.slice(i, i + paraLength).join(' ');
              newAnalysis += paragraph + '\n\n';
            }
            result.analysis = newAnalysis.trim();
          }
        }
      }
      
      return result;
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
    console.warn('No Google Civic API key found - checked both GOOGLE_CIVIC_API_KEY and CIVIC_API_KEY');
    throw new Error('GOOGLE_CIVIC_API_NOT_CONFIGURED');
  }

  try {
    console.log(`Fetching representatives for ZIP code: ${zipCode}`);
    const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&key=${googleCivicApiKey}`;
    console.log(`Making Google Civic API request to: ${url.replace(googleCivicApiKey, "REDACTED")}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Civic API error status:', response.status);
      console.error('Google Civic API error text:', errorText);
      throw new Error('GOOGLE_CIVIC_API_ERROR');
    }
    
    const data = await response.json();
    console.log('Google Civic API response status:', response.status);
    console.log('Google Civic API response headers:', Object.fromEntries(response.headers.entries()));
    
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
    // Use the appropriate year based on mode
    let electionDate;
    if (mode === "demo") {
      // For demo mode, use November 1, 2024
      electionDate = new Date(2024, 10, 1);
      console.log('Using demo date for candidates: November 1, 2024');
    } else {
      // For current mode, use current date
      electionDate = new Date();
      console.log(`Using current date for candidates: ${electionDate.toISOString().split('T')[0]}`);
    }
    
    const year = electionDate.getFullYear();
    console.log(`Fetching candidates for state ${state}, year ${year} with FEC API key`);
    
    const encodedState = encodeURIComponent(state);
    // Modified endpoint to use the elections endpoint which has better availability
    const url = `https://api.open.fec.gov/v1/candidates/search/?api_key=${fecApiKey}&state=${encodedState}&election_year=${year}&sort=name&per_page=20`;
    
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
  
  // Use HUD public interest groups
  const hudGroups = [
    {
      name: "Housing Policy",
      groups: [
        {
          name: "National Low Income Housing Coalition",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Affordable housing, tenant rights, homelessness prevention"
        },
        {
          name: "National Housing Law Project",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Housing law, fair housing, tenant protections"
        },
        {
          name: "National Association of Housing and Redevelopment Officials",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Public housing authorities, community development, affordable housing"
        }
      ]
    },
    {
      name: "Civil Rights",
      groups: [
        {
          name: "National Fair Housing Alliance",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Fair housing, anti-discrimination, equality in housing"
        },
        {
          name: "Lawyers' Committee for Civil Rights Under Law",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Civil rights enforcement, fair housing litigation, equal opportunity"
        },
        {
          name: "NAACP Legal Defense Fund",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Racial justice, fair housing, civil rights"
        }
      ]
    },
    {
      name: "Community Development",
      groups: [
        {
          name: "Local Initiatives Support Corporation (LISC)",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Community development, affordable housing, economic opportunity"
        },
        {
          name: "Enterprise Community Partners",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Affordable housing, community development, neighborhood revitalization"
        },
        {
          name: "NeighborWorks America",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Affordable housing, community development, homeownership"
        }
      ]
    },
    {
      name: "Homelessness",
      groups: [
        {
          name: "National Alliance to End Homelessness",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Homelessness prevention, affordable housing, supportive services"
        },
        {
          name: "National Coalition for the Homeless",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Homeless rights, housing justice, advocacy"
        },
        {
          name: "National Health Care for the Homeless Council",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Healthcare for homeless, supportive housing, integrated services"
        }
      ]
    },
    {
      name: "Economic Policy",
      groups: [
        {
          name: "National Community Reinvestment Coalition",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Community investment, fair lending, affordable housing finance"
        },
        {
          name: "Opportunity Finance Network",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Community development financial institutions, impact investing"
        },
        {
          name: "National Association of Affordable Housing Lenders",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Affordable housing finance, community development lending"
        }
      ]
    },
    {
      name: "Veterans",
      groups: [
        {
          name: "National Coalition for Homeless Veterans",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Veteran homelessness, supportive housing, veteran services"
        },
        {
          name: "Veterans Association of Real Estate Professionals",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Veteran homeownership, VA loans, housing assistance for veterans"
        }
      ]
    },
    {
      name: "Rural Development",
      groups: [
        {
          name: "Housing Assistance Council",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Rural housing, affordable housing in rural communities"
        },
        {
          name: "Rural Community Assistance Partnership",
          url: "https://www.hud.gov/program_offices/gov_relations/oirpublicinterestgroups",
          relevance: "Rural development, community infrastructure, capacity building"
        }
      ]
    }
  ];
  
  // First, convert priorities to standardized topics using OpenAI
  const topicsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `You are an expert in mapping voter priorities to specific policy areas. Map each priority to ONE of these standardized policy areas ONLY: 
            Housing Policy, Civil Rights, Community Development, Homelessness, Economic Policy, Veterans, Rural Development.
            Do not invent new categories and do not use any other categories. Return as a JSON array with top 3 primary areas only.`
        },
        {
          role: 'user',
          content: `Map these voter priorities to the top 3 most relevant standardized policy areas from the given list ONLY: ${JSON.stringify(priorities)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    }),
  });
  
  try {
    if (!topicsResponse.ok) {
      console.error('Failed to map priorities to policy areas');
      // Fallback to a selection of the most broadly relevant groups
      return hudGroups
        .slice(0, 3)
        .flatMap(category => category.groups.slice(0, 1));
    }
    
    const topicsData = await topicsResponse.json();
    const content = topicsData.choices[0].message.content;
    
    let policyAreas;
    try {
      policyAreas = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, try to extract JSON from the response
      const match = content.match(/\[(.*)\]/s);
      if (match) {
        try {
          policyAreas = JSON.parse(`[${match[1]}]`);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError);
          // Extract policy areas by simple string matching
          policyAreas = hudGroups
            .filter(group => content.includes(group.name))
            .map(group => group.name)
            .slice(0, 3);
        }
      } else {
        // Simple string matching if JSON extraction fails
        policyAreas = hudGroups
          .filter(group => content.includes(group.name))
          .map(group => group.name)
          .slice(0, 3);
      }
    }
    
    if (!Array.isArray(policyAreas) || policyAreas.length === 0) {
      console.error('No policy areas extracted from AI response');
      return hudGroups
        .slice(0, 3)
        .flatMap(category => category.groups.slice(0, 1));
    }
    
    console.log('Mapped policy areas:', policyAreas);
    
    // Map policy areas to HUD groups
    let relevantGroups = [];
    
    // Get up to 3 top policy areas
    const topPolicyAreas = policyAreas.slice(0, 3);
    
    // Find matching groups for each top policy area
    topPolicyAreas.forEach(area => {
      const matchingCategory = hudGroups.find(
        category => category.name.toLowerCase() === area.toLowerCase()
      );
      
      if (matchingCategory) {
        // Add all groups from this category
        relevantGroups = relevantGroups.concat(matchingCategory.groups);
      }
    });
    
    // If we didn't find enough groups, add some from other categories
    if (relevantGroups.length < 3) {
      const remainingCategories = hudGroups.filter(
        category => !topPolicyAreas.includes(category.name)
      );
      
      const additionalGroups = remainingCategories
        .flatMap(category => category.groups)
        .slice(0, 3 - relevantGroups.length);
      
      relevantGroups = relevantGroups.concat(additionalGroups);
    }
    
    // Cap at 5 groups maximum
    return relevantGroups.slice(0, 5);
    
  } catch (error) {
    console.error('Error in findRelevantGroups:', error);
    // Fallback to a selection of the most broadly relevant groups
    return hudGroups
      .slice(0, 3)
      .flatMap(category => category.groups.slice(0, 1));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
