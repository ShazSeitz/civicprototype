
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

// Simplified terminology mapping directly within the function
const issueTerminology: Record<string, any> = {
  "taxCutsForMiddleClass": {
    "plainLanguage": [
      "middle class tax cuts", "tax cuts for working families", "tax relief for average citizens",
      "tax breaks for middle class", "help working families", "tax burden on workers",
      "tired of paying tax", "lower taxes for workers", "reduce taxes middle class"
    ],
    "standardTerm": "Middle Class Tax Relief",
    "plainEnglish": "I want tax cuts that help working families and the middle class keep more of their money."
  },
  "opposeRaceGenderHiring": {
    "plainLanguage": [
      "disgraceful to use race in hiring", "disgraceful to use gender in hiring",
      "hire based on race", "hire based on gender", "disgraceful that race", "gender are used to decide"
    ],
    "standardTerm": "Opposition to Race and Gender-Based Hiring Policies",
    "plainEnglish": "I believe that hiring should be based solely on merit, and it's wrong to use race or gender as deciding factors."
  },
  "climate": {
    "plainLanguage": [
      "climate change", "global warming", "extreme weather", "pollution", 
      "national parks", "wildlife sanctuaries", "protection of national parks"
    ],
    "standardTerm": "Climate Change and Environmental Policy",
    "plainEnglish": "I want our government to take action on climate change and protect our environment from extreme weather and pollution."
  },
  "healthcare": {
    "plainLanguage": [
      "healthcare costs", "medical bills", "health insurance", "mental health", "long-term care"
    ],
    "standardTerm": "Healthcare Access and Affordability",
    "plainEnglish": "I want affordable healthcare that covers everything from doctor visits to mental health and long-term care."
  },
  "housing": {
    "plainLanguage": [
      "affordable housing", "homelessness", "rent costs", "housing crisis",
      "property values", "cost of housing", "bay area housing"
    ],
    "standardTerm": "Housing Affordability and Homelessness Prevention",
    "plainEnglish": "I want safe, affordable housing for everyone and solutions to prevent homelessness."
  },
  "education": {
    "plainLanguage": [
      "school quality", "education costs", "student debt", "college affordability", 
      "public schools", "headstart", "after school programs"
    ],
    "standardTerm": "Education and Student Opportunity",
    "plainEnglish": "I want quality and affordable education for every student so we can build a better future."
  },
  "publicSafety": {
    "plainLanguage": [
      "crime", "police reform", "criminal justice", "law enforcement", "public safety",
      "homelessness and fentanyl", "fentanyl problem", "violent criminals"
    ],
    "standardTerm": "Public Safety and Criminal Justice",
    "plainEnglish": "I want safer communities and a fair justice system that truly protects us all."
  },
  "civilLiberties": {
    "plainLanguage": [
      "civil rights", "individual rights", "constitutional rights", "personal freedom",
      "civil liberties", "support everyone's right to live", "bill of rights"
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
  }
};

// Function to find the best match for a priority
function findBestMatchForPriority(priority: string): { term: string, matched: boolean } {
  // Normalize input
  const input = priority.toLowerCase();
  console.log(`Processing priority: "${input}"`);
  
  // Special case for race/gender hiring phrases with "disgraceful" keyword
  if (
    (input.includes("disgraceful") && input.includes("race") && (input.includes("hire") || input.includes("hiring"))) ||
    (input.includes("disgraceful") && input.includes("gender") && (input.includes("hire") || input.includes("hiring"))) ||
    (input.includes("race") && input.includes("gender") && input.includes("hiring")) ||
    (input.includes("disgraceful") && (input.includes("race") || input.includes("gender")))
  ) {
    console.log("*** Special match found for opposeRaceGenderHiring ***");
    return { term: "opposeRaceGenderHiring", matched: true };
  }
  
  // Match based on plainLanguage keywords
  let bestMatch = { term: "", score: 0 };
  
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    if (termData.plainLanguage && Array.isArray(termData.plainLanguage)) {
      for (const phrase of termData.plainLanguage) {
        const lowerPhrase = phrase.toLowerCase();
        
        if (input.includes(lowerPhrase)) {
          const score = lowerPhrase.length;
          if (score > bestMatch.score) {
            bestMatch = { term: termKey, score };
            console.log(`New best match: ${termKey} with score ${score}`);
          }
        }
      }
    }
  }
  
  if (bestMatch.score > 0) {
    return { term: bestMatch.term, matched: true };
  }
  
  return { term: "", matched: false };
}

// Analyze priorities according to the project requirements
async function analyzePriorities(priorities: string[], mode: "current" | "demo"): Promise<AnalyzePrioritiesResponse> {
  console.log(`Analyzing ${priorities.length} priorities in ${mode} mode`);
  
  // Map priorities to standardized terms
  const mappedTerms: string[] = [];
  const unmappedTerms: string[] = [];
  
  for (const priority of priorities) {
    const { term, matched } = findBestMatchForPriority(priority);
    
    if (matched && term) {
      const termData = issueTerminology[term];
      if (termData && termData.standardTerm) {
        mappedTerms.push(termData.standardTerm);
        console.log(`Mapped to: ${termData.standardTerm}`);
      } else {
        unmappedTerms.push(priority);
      }
    } else {
      unmappedTerms.push(priority);
    }
  }
  
  // Generate analysis following the structure from PROJECT.md
  let analysis = "Here's what I understand you care about:\n\n";
  
  // Create a set of unique mapped terms to avoid repetition
  const uniqueTerms = [...new Set(mappedTerms)];
  
  if (uniqueTerms.length > 0) {
    for (const standardTerm of uniqueTerms) {
      for (const [key, data] of Object.entries(issueTerminology)) {
        if (data.standardTerm === standardTerm) {
          analysis += `• ${standardTerm}: ${data.plainEnglish}\n\n`;
          break;
        }
      }
    }
  } else {
    analysis += "I haven't been able to clearly identify your priorities yet.\n\n";
  }
  
  // Add note about unmapped terms as per the requirements
  if (unmappedTerms.length > 0) {
    analysis += "Can you please clarify more about what matters to you?";
  }
  
  // Generate appropriate recommendations based on mode
  let candidates = [];
  let ballotMeasures = [];
  let draftEmails = [];
  let interestGroups = [];
  let petitions = [];
  
  // For demo mode, include more detailed recommendations
  if (mode === "demo") {
    // Mock presidential candidates for demo mode
    candidates = [
      {
        name: "Jane Smith",
        office: "Presidential Candidate",
        highlights: [
          "Supports policies on " + (uniqueTerms[0] || "economic growth"),
          "Has advocated for " + (uniqueTerms[1] || "healthcare reform")
        ]
      },
      {
        name: "John Wilson",
        office: "Presidential Candidate",
        highlights: [
          "Known for position on " + (uniqueTerms[0] || "taxation"),
          "Has sponsored legislation for " + (uniqueTerms[1] || "education")
        ]
      }
    ];
    
    // Mock ballot measures
    ballotMeasures = [
      {
        title: "Proposition A: " + (uniqueTerms[0] || "Infrastructure Investment"),
        recommendation: "This measure aligns with your priorities on " + (uniqueTerms[0] || "local development")
      }
    ];
  } else {
    // For current mode
    // Mock representative for email drafts
    draftEmails = [
      {
        to: "representative@example.gov",
        subject: "Concerns about " + (uniqueTerms[0] || "local issues"),
        body: `Dear Representative,\n\nI am writing to express my concerns about ${uniqueTerms[0] || "issues in our community"}. As your constituent, I believe that ${uniqueTerms[1] || "certain changes"} would greatly benefit our district.\n\nI would appreciate the opportunity to discuss this further.\n\nSincerely,\n[Your Name]`
      }
    ];
  }
  
  // Common for both modes
  interestGroups = [
    {
      name: uniqueTerms[0] ? `${uniqueTerms[0]} Advocacy Group` : "Citizen Action Network",
      url: "https://example.org/advocacy",
      relevance: `This organization focuses on ${uniqueTerms[0] || "civic engagement"} and related issues.`
    }
  ];
  
  petitions = [
    {
      title: uniqueTerms[1] ? `Support for ${uniqueTerms[1]}` : "Community Initiative Petition",
      url: "https://example.org/petition",
      relevance: `This petition addresses ${uniqueTerms[1] || "important community concerns"}.`
    }
  ];
  
  return {
    mode,
    analysis,
    unmappedTerms,
    candidates,
    ballotMeasures,
    draftEmails,
    interestGroups,
    petitions
  };
}

// HTTP handler for the Edge Function
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
    priorities.forEach((p, i) => console.log(`Priority ${i+1}: ${p}`));

    // Process priorities
    const response = await analyzePriorities(priorities, mode);
    
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
      JSON.stringify({ 
        error: `Failed to analyze priorities: ${error.message}`,
        mode: "current",
        analysis: "I'm sorry, I encountered an error analyzing your priorities. Please try again."
      }),
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
