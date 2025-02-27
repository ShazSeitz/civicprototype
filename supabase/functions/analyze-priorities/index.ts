
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

// Improved terminology mapping with more detailed keys
const issueTerminology: Record<string, any> = {
  "taxCutsForMiddleClass": {
    "plainLanguage": [
      "middle class tax cuts", "tax cuts for working families", "tax relief for average citizens",
      "tax breaks for middle class", "help working families", "tax burden on workers",
      "tired of paying tax", "lower taxes for workers", "reduce taxes middle class",
      "work hard for my money", "pass on to my children", "income tax", "paying so much tax"
    ],
    "standardTerm": "Middle Class Tax Relief",
    "plainEnglish": "I want tax cuts that help working families and the middle class keep more of their money."
  },
  "opposeRaceGenderHiring": {
    "plainLanguage": [
      "disgraceful to use race in hiring", "disgraceful to use gender in hiring",
      "hire based on race", "hire based on gender", "disgraceful that race", 
      "gender are used to decide", "race or gender are used", "decide whether to hire"
    ],
    "standardTerm": "Merit-Based Hiring Practices",
    "plainEnglish": "I believe hiring should be based solely on merit, without considering race or gender as factors."
  },
  "climateSkepticism": {
    "plainLanguage": [
      "climate change is probably a hoax", "climate hoax", "climate skepticism",
      "climate change isn't real", "global warming hoax", "not sure about climate change"
    ],
    "standardTerm": "Climate Change Skepticism",
    "plainEnglish": "I'm skeptical about climate change claims and policies based on them."
  },
  "publicTransportation": {
    "plainLanguage": [
      "local transportation", "affordable transportation", "public transit",
      "needs more transportation options", "transportation needs", "needs transportation"
    ],
    "standardTerm": "Public Transportation Access",
    "plainEnglish": "I want more affordable and accessible local transportation options in my community."
  },
  "publicSafety": {
    "plainLanguage": [
      "crime", "police reform", "criminal justice", "law enforcement", "public safety",
      "homelessness and fentanyl", "fentanyl problem", "violent criminals", "rioters",
      "jan 6th rioters"
    ],
    "standardTerm": "Public Safety and Criminal Justice",
    "plainEnglish": "I want a fair justice system and accountability for all who break the law."
  },
  "technologyConcerns": {
    "plainLanguage": [
      "AI", "AI regulation", "artificial intelligence", "machine learning", "automation",
      "data privacy", "scary technology", "sci-fy like stuff", "too hard for me to understand",
      "AI could lead to scary"
    ],
    "standardTerm": "Technology Regulation and Safety",
    "plainEnglish": "I'm concerned about emerging technologies like AI and want proper oversight and regulation."
  }
};

// Enhanced matching function with better phrase matching
function findBestMatchForPriority(priority: string): { term: string, matched: boolean, confidence: number } {
  const input = priority.toLowerCase();
  console.log(`Processing priority: "${input}"`);
  
  // Special case handling with explicit phrase matching
  if (input.includes("tired of paying") && (input.includes("tax") || input.includes("income tax"))) {
    return { term: "taxCutsForMiddleClass", matched: true, confidence: 0.9 };
  }
  
  if (input.includes("disgraceful") && 
      (input.includes("race") || input.includes("gender")) && 
      (input.includes("hire") || input.includes("hiring") || input.includes("decide"))) {
    return { term: "opposeRaceGenderHiring", matched: true, confidence: 0.9 };
  }
  
  if ((input.includes("climate") || input.includes("global warming")) && 
      (input.includes("hoax") || input.includes("probably") || input.includes("skeptic"))) {
    return { term: "climateSkepticism", matched: true, confidence: 0.85 };
  }
  
  if (input.includes("transportation") && 
      (input.includes("need") || input.includes("affordable") || input.includes("options"))) {
    return { term: "publicTransportation", matched: true, confidence: 0.9 };
  }
  
  if ((input.includes("jan 6") || input.includes("january 6")) && 
      (input.includes("riot") || input.includes("criminal"))) {
    return { term: "publicSafety", matched: true, confidence: 0.9 };
  }
  
  if (input.includes("ai") && 
      (input.includes("scary") || input.includes("sci-fy") || input.includes("hard") || 
       input.includes("understand") || input.includes("afraid"))) {
    return { term: "technologyConcerns", matched: true, confidence: 0.85 };
  }
  
  // Generic keyword matching for other cases
  let bestMatch = { term: "", score: 0, confidence: 0 };
  
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    if (termData.plainLanguage && Array.isArray(termData.plainLanguage)) {
      for (const phrase of termData.plainLanguage) {
        const lowerPhrase = phrase.toLowerCase();
        
        if (input.includes(lowerPhrase)) {
          // Calculate score based on phrase length relative to input length
          const score = lowerPhrase.length;
          const confidence = Math.min(0.5 + (score / input.length) * 0.5, 0.9);
          
          if (score > bestMatch.score) {
            bestMatch = { term: termKey, score, confidence };
            console.log(`New best match: ${termKey} with score ${score} and confidence ${confidence}`);
          }
        }
      }
    }
  }
  
  if (bestMatch.score > 0) {
    return { term: bestMatch.term, matched: true, confidence: bestMatch.confidence };
  }
  
  // Use simple NLP for unmapped terms (extract key phrases)
  const keyPhrases = extractKeyPhrases(input);
  console.log(`No direct match. Key phrases extracted: ${keyPhrases.join(', ')}`);
  
  return { term: "", matched: false, confidence: 0 };
}

// Simple NLP function to extract key phrases from unmapped priorities
function extractKeyPhrases(text: string): string[] {
  // Remove common stop words
  const stopWords = ["i", "am", "the", "a", "an", "and", "is", "are", "to", "for", "of", "that", "this", "in", "on", "with", "by"];
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const filteredWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
  
  // Find potential key phrases (adjacent meaningful words)
  const phrases = [];
  let currentPhrase = [];
  
  for (let i = 0; i < words.length; i++) {
    if (!stopWords.includes(words[i]) && words[i].length > 2) {
      currentPhrase.push(words[i]);
    } else if (currentPhrase.length > 0) {
      if (currentPhrase.length > 1) {
        phrases.push(currentPhrase.join(' '));
      }
      currentPhrase = [];
    }
  }
  
  // Add any remaining phrase
  if (currentPhrase.length > 1) {
    phrases.push(currentPhrase.join(' '));
  }
  
  // Add individual important words if we have few phrases
  if (phrases.length < 2) {
    filteredWords.forEach(word => {
      if (!phrases.some(phrase => phrase.includes(word))) {
        phrases.push(word);
      }
    });
  }
  
  return phrases;
}

// Generate interpreted analysis for unmapped priorities
function interpretUnmappedPriority(priority: string): string {
  const input = priority.toLowerCase();
  
  // Tax-related interpretation
  if (input.includes("tax") || input.includes("income") || input.includes("money")) {
    return "You seem concerned about taxation and preserving your income.";
  }
  
  // Hiring practices interpretation
  if (input.includes("hire") || input.includes("job") || input.includes("employ")) {
    return "You have concerns about fair hiring practices.";
  }
  
  // Climate interpretation
  if (input.includes("climate") || input.includes("environment") || input.includes("global")) {
    return "You have questions about climate change policies.";
  }
  
  // Transportation interpretation
  if (input.includes("transport") || input.includes("transit") || input.includes("commute")) {
    return "You're interested in better transportation options.";
  }
  
  // Public safety interpretation
  if (input.includes("crime") || input.includes("riot") || input.includes("criminal") || input.includes("violence")) {
    return "You're concerned about public safety and justice.";
  }
  
  // Technology interpretation
  if (input.includes("ai") || input.includes("tech") || input.includes("artificial")) {
    return "You have concerns about technology regulation and impacts.";
  }
  
  // Generic interpretation based on key phrases
  const keyPhrases = extractKeyPhrases(input);
  if (keyPhrases.length > 0) {
    return `I see you're concerned about ${keyPhrases.join(' and ')}.`;
  }
  
  return "I'd like to better understand this priority.";
}

// Improved priority analysis function
async function analyzePriorities(priorities: string[], mode: "current" | "demo"): Promise<AnalyzePrioritiesResponse> {
  console.log(`Analyzing ${priorities.length} priorities in ${mode} mode`);
  
  // Process each priority
  const mappedPriorities: Array<{
    original: string;
    standardTerm?: string;
    plainEnglish?: string;
    matched: boolean;
    interpretation?: string;
  }> = [];
  
  const unmappedTerms: string[] = [];
  
  // First pass - try to map all priorities
  for (const priority of priorities) {
    const { term, matched, confidence } = findBestMatchForPriority(priority);
    
    if (matched && term && confidence >= 0.7) {
      const termData = issueTerminology[term];
      mappedPriorities.push({
        original: priority,
        standardTerm: termData.standardTerm,
        plainEnglish: termData.plainEnglish,
        matched: true
      });
      console.log(`Mapped to ${termData.standardTerm} with high confidence`);
    } else {
      // For unmatched or low confidence matches, provide an interpretation
      const interpretation = interpretUnmappedPriority(priority);
      mappedPriorities.push({
        original: priority,
        matched: false,
        interpretation
      });
      unmappedTerms.push(priority);
      console.log(`Could not map priority. Added interpretation: ${interpretation}`);
    }
  }
  
  // Generate the analysis text with better formatting
  let analysis = "Here's what I understand you care about:";
  
  // Add mapped priorities as bullet points (no extra newlines between bullets)
  mappedPriorities.forEach(priority => {
    if (priority.matched && priority.plainEnglish) {
      analysis += `\n• ${priority.standardTerm}: ${priority.plainEnglish}`;
    } else if (priority.interpretation) {
      analysis += `\n• ${priority.interpretation}`;
    }
  });
  
  // Add clarification requests for unmapped terms
  if (unmappedTerms.length > 0) {
    analysis += "\n\nCould you clarify more about:";
    unmappedTerms.forEach(term => {
      const shortTerm = term.length > 40 ? term.substring(0, 40) + "..." : term;
      analysis += `\n• "${shortTerm}"?`;
    });
  }
  
  // Generate recommendations based on mapped priorities
  const standardTerms = mappedPriorities
    .filter(p => p.matched && p.standardTerm)
    .map(p => p.standardTerm);
  
  // Mock data generation for recommendations
  let candidates = [];
  let ballotMeasures = [];
  let draftEmails = [];
  let interestGroups = [];
  let petitions = [];
  
  if (mode === "demo") {
    // Candidates for demo mode
    candidates = standardTerms.length > 0 ? [
      {
        name: "Jane Smith",
        office: "Presidential Candidate",
        highlights: standardTerms.slice(0, 2).map(term => `Supports ${term}`)
      },
      {
        name: "John Wilson",
        office: "Congressional Candidate",
        highlights: standardTerms.slice(0, 2).map(term => `Has advocated for ${term}`)
      }
    ] : [];
    
    // Ballot measures for demo mode
    ballotMeasures = standardTerms.length > 0 ? [
      {
        title: `Proposition 123: ${standardTerms[0] || "Local Initiative"}`,
        recommendation: `This measure addresses ${standardTerms[0] || "community concerns"}`
      }
    ] : [];
  } else {
    // Current mode
    draftEmails = standardTerms.length > 0 ? [
      {
        to: "representative@gov.example",
        subject: `Concerns about ${standardTerms[0] || "local issues"}`,
        body: `Dear Representative,\n\nI am writing about ${standardTerms[0] || "important issues"} in our community. As your constituent, I believe this deserves attention.\n\nSincerely,\n[Your Name]`
      }
    ] : [];
  }
  
  // Interest groups (for both modes)
  interestGroups = standardTerms.length > 0 ? [
    {
      name: `${standardTerms[0] || "Civic"} Action Group`,
      url: "https://example.org/advocacy",
      relevance: `This organization focuses on ${standardTerms[0] || "community issues"}`
    }
  ] : [];
  
  // Petitions (for both modes)
  petitions = standardTerms.length > 0 ? [
    {
      title: `Petition for ${standardTerms[0] || "Community Change"}`,
      url: "https://example.org/petition",
      relevance: `This petition addresses ${standardTerms[0] || "local concerns"}`
    }
  ] : [];
  
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
