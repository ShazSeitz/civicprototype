
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define response and request types
interface AnalyzePrioritiesRequest {
  mode: "current" | "demo";
  priorities: string[];
}

interface AnalyzePrioritiesResponse {
  mode: "current" | "demo";
  analysis: string;
  unmappedTerms?: string[];
  candidates?: any[];
  ballotMeasures?: any[];
  draftEmails?: any[];
  interestGroups?: any[];
  petitions?: any[];
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Demo terminology mapping for direct use in the function (simplified version)
const issueTerminology = {
  "taxCutsForMiddleClass": {
    "plainLanguage": [
      "middle class tax cuts", "tax cuts for working families", "tired of paying income tax",
      "work hard for my money", "pass on to my children", "income tax", "paying so much tax"
    ],
    "standardTerm": "Middle Class Tax Relief",
    "plainEnglish": "I want tax cuts that help working families and the middle class keep more of their money."
  },
  "opposeRaceGenderHiring": {
    "plainLanguage": [
      "disgraceful race hiring", "disgraceful gender hiring", "race decide whether to hire",
      "gender decide whether to hire", "race are used to decide", "gender are used to decide"
    ],
    "standardTerm": "Opposition to Race and Gender-Based Hiring Policies",
    "plainEnglish": "I believe that hiring should be based solely on merit, and it's disgraceful to use race or gender as deciding factors."
  },
  "climate": {
    "plainLanguage": [
      "climate change", "global warming", "climate skepticism", "climate denial",
      "climate change is probably a hoax", "national parks", "wildlife sanctuaries"
    ],
    "standardTerm": "Climate Change and Environmental Policy",
    "plainEnglish": "I want our government to take action on climate change and protect our environment."
  },
  "housing": {
    "plainLanguage": [
      "affordable housing", "homelessness", "rent costs", "housing crisis",
      "cost of housing", "bay area housing", "housing in the bay area"
    ],
    "standardTerm": "Housing Affordability and Homelessness Prevention",
    "plainEnglish": "I want safe, affordable housing for everyone and solutions to prevent homelessness."
  },
  "education": {
    "plainLanguage": [
      "school quality", "education costs", "student debt", "headstart",
      "after school programs", "funding for headstart", "school programs"
    ],
    "standardTerm": "Education and Student Opportunity",
    "plainEnglish": "I want quality and affordable education for every student so we can build a better future."
  },
  "publicSafety": {
    "plainLanguage": [
      "crime", "police reform", "homelessness and fentanyl", "fentanyl problem",
      "jan 6th rioters", "violent criminals", "rioters"
    ],
    "standardTerm": "Public Safety and Criminal Justice",
    "plainEnglish": "I want safer communities and a fair justice system that truly protects us all."
  },
  "technology": {
    "plainLanguage": [
      "AI", "AI regulation", "AI could lead to scary", "Sci-fy like stuff",
      "too hard for me to understand"
    ],
    "standardTerm": "Technology Policy and AI Regulation",
    "plainEnglish": "I want strong protections and thoughtful regulation of new technologies like AI."
  },
  "civilLiberties": {
    "plainLanguage": [
      "civil rights", "support everyone's right to live", "bill of rights",
      "rights and protections", "pronouns"
    ],
    "standardTerm": "Civil Liberties and Individual Rights",
    "plainEnglish": "I want to protect our basic freedoms and individual rights so everyone is treated fairly and freely."
  },
  "governmentWaste": {
    "plainLanguage": [
      "waste in government", "departments need to be made more effective",
      "efficient and accountable", "government efficiency", "government waste"
    ],
    "standardTerm": "Government Efficiency and Accountability",
    "plainEnglish": "I want to reduce waste in government and make departments more effective, efficient, and accountable."
  },
  "publicTransportation": {
    "plainLanguage": [
      "local transportation", "affordable transportation", "public transit",
      "needs more transportation options", "transportation needs"
    ],
    "standardTerm": "Public Transportation and Infrastructure",
    "plainEnglish": "I want more affordable local transportation options to help people get around."
  }
};

function findBestMatchForPriority(priority: string): { term: string, matched: boolean } {
  // Normalize input
  const input = priority.toLowerCase();
  console.log(`Processing priority: "${input}"`);
  
  // Special case for race/gender hiring phrase
  if (
    input.includes("disgraceful") && 
    (input.includes("race") || input.includes("gender")) && 
    (input.includes("hire") || input.includes("hiring") || input.includes("decide"))
  ) {
    console.log("*** Special match found for opposeRaceGenderHiring ***");
    return { term: "opposeRaceGenderHiring", matched: true };
  }
  
  // Track best match
  let bestMatch = { term: "", score: 0 };
  
  // Process each term in the terminology
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    // Check if this term has plainLanguage array
    if (termData.plainLanguage && Array.isArray(termData.plainLanguage)) {
      // Go through each phrase pattern
      for (const phrase of termData.plainLanguage) {
        const lowerPhrase = phrase.toLowerCase();
        
        // Direct inclusion check
        if (input.includes(lowerPhrase)) {
          // Calculate match score based on length of the matching phrase
          const score = lowerPhrase.length;
          
          // Update best match if this is better
          if (score > bestMatch.score) {
            bestMatch = { term: termKey, score };
            console.log(`New best match: ${termKey} with score ${score}`);
          }
        }
      }
    }
  }
  
  // Return best match if one was found
  if (bestMatch.score > 0) {
    return { term: bestMatch.term, matched: true };
  }
  
  // No match found
  return { term: "", matched: false };
}

// Main function to analyze priorities
async function analyzePriorities(priorities: string[]): Promise<{
  analysis: string, 
  unmappedTerms: string[],
  candidates: any[],
  ballotMeasures: any[],
  draftEmails: any[],
  interestGroups: any[],
  petitions: any[]
}> {
  console.log(`Starting analysis of ${priorities.length} priorities`);
  
  // Map priorities to terms
  const mappedTerms: string[] = [];
  const unmappedTerms: string[] = [];
  
  for (const priority of priorities) {
    console.log(`Analyzing priority: "${priority}"`);
    const { term, matched } = findBestMatchForPriority(priority);
    
    if (matched && term) {
      // Get the standard term from the mapping
      const termData = issueTerminology[term];
      if (termData && termData.standardTerm) {
        mappedTerms.push(termData.standardTerm);
        console.log(`Successfully mapped to: ${termData.standardTerm}`);
      } else {
        console.log(`Term "${term}" found but has no standardTerm`);
        unmappedTerms.push(priority);
      }
    } else {
      console.log(`No match found for: "${priority}"`);
      unmappedTerms.push(priority);
    }
  }
  
  // Generate analysis
  let analysis = "Based on your priorities, here's what I understand:\n\n";
  
  // Add each mapped term with its description
  const uniqueTerms = [...new Set(mappedTerms)];
  for (const standardTerm of uniqueTerms) {
    // Find the term data
    for (const [key, data] of Object.entries(issueTerminology)) {
      if (data.standardTerm === standardTerm) {
        analysis += `• ${standardTerm}: ${data.plainEnglish}\n\n`;
        break;
      }
    }
  }
  
  // Add note about unmapped terms
  if (unmappedTerms.length > 0) {
    analysis += "\nI didn't fully understand some of your priorities. You can provide more detail, and I'll update my analysis.";
  }
  
  // For demo, generate mock data for recommendations
  const mockCandidates = uniqueTerms.length > 0 ? [
    { name: "Jane Smith", party: "Democratic", matchScore: 85, positions: uniqueTerms.slice(0, 2) },
    { name: "John Doe", party: "Republican", matchScore: 65, positions: uniqueTerms.slice(0, 1) }
  ] : [];
  
  const mockBallotMeasures = uniqueTerms.length > 0 ? [
    { name: "Proposition 123", description: "Funding for " + uniqueTerms[0], matchScore: 90 }
  ] : [];

  return {
    analysis,
    unmappedTerms,
    candidates: mockCandidates,
    ballotMeasures: mockBallotMeasures,
    draftEmails: [],
    interestGroups: [],
    petitions: []
  };
}

// HTTP handler for the function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const reqBody: AnalyzePrioritiesRequest = await req.json();
    const { mode, priorities } = reqBody;
    
    console.log(`Request received: mode=${mode}, priorities=${priorities.length}`);

    // Debug log the priorities
    priorities.forEach((p, i) => {
      console.log(`Priority ${i+1}: ${p}`);
    });

    // Analyze priorities
    const { analysis, unmappedTerms, candidates, ballotMeasures, draftEmails, interestGroups, petitions } = await analyzePriorities(priorities);
    
    // Return response
    const response: AnalyzePrioritiesResponse = {
      mode,
      analysis,
      unmappedTerms,
      candidates,
      ballotMeasures,
      draftEmails,
      interestGroups,
      petitions
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in analyze-priorities function:', error);
    
    return new Response(
      JSON.stringify({ error: `Failed to analyze priorities: ${error.message}` }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});
