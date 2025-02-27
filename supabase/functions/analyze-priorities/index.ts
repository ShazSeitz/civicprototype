
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import issueTerminology from "../../src/config/issueTerminology.json" assert { type: "json" };

// Define response and request types
interface AnalyzePrioritiesRequest {
  mode: "current" | "demo";
  priorities: string[];
}

interface AnalyzePrioritiesResponse {
  mode: "current" | "demo";
  analysis: string;
  unmappedTerms?: string[];
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text matching function with improved logic
function findMatchingTerms(input: string): { matchedTerm: string, confidence: number }[] {
  const normalizedInput = input.toLowerCase().trim();
  console.log(`Analyzing input: "${normalizedInput}"`);
  
  const matches: { matchedTerm: string, confidence: number }[] = [];

  // Loop through each terminology category
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    // Skip non-terminology entries like "fallback" or "issues" array
    if (termKey === "fallback" || termKey === "issues") continue;
    
    // Only process if the term has plainLanguage patterns
    if (termData.plainLanguage && Array.isArray(termData.plainLanguage)) {
      // Check each plain language pattern
      for (const pattern of termData.plainLanguage) {
        const normalizedPattern = pattern.toLowerCase().trim();
        
        // Calculate similarity or check if pattern is in the input
        if (normalizedInput.includes(normalizedPattern)) {
          const confidence = normalizedPattern.length / normalizedInput.length;
          console.log(`Match found: "${normalizedPattern}" in term "${termKey}" with confidence ${confidence}`);
          matches.push({
            matchedTerm: termKey,
            confidence: confidence
          });
        }
      }
      
      // Special case for "opposeRaceGenderHiring" - check for combination of keywords
      if (termKey === "opposeRaceGenderHiring") {
        const keywordSets = [
          ["disgraceful", "race", "hiring"],
          ["disgraceful", "gender", "hiring"],
          ["race", "decide", "hire"],
          ["gender", "decide", "hire"],
          ["race", "gender", "hiring"]
        ];
        
        for (const keywords of keywordSets) {
          const allKeywordsFound = keywords.every(keyword => 
            normalizedInput.includes(keyword.toLowerCase())
          );
          
          if (allKeywordsFound) {
            console.log(`Special case match found for "${termKey}" with keywords: ${keywords.join(', ')}`);
            matches.push({
              matchedTerm: termKey,
              confidence: 0.9 // High confidence for this special case
            });
          }
        }
      }
    }
  }

  return matches;
}

// Main function to analyze priorities
async function analyzePriorities(priorities: string[]): Promise<{analysis: string, unmappedTerms: string[]}> {
  console.log(`Analyzing ${priorities.length} priorities`);
  
  // Map each priority to a matching term
  const mappedTerms: string[] = [];
  const unmappedTerms: string[] = [];
  
  for (const priority of priorities) {
    const matches = findMatchingTerms(priority);
    
    if (matches.length > 0) {
      // Sort matches by confidence and take the highest
      matches.sort((a, b) => b.confidence - a.confidence);
      const bestMatch = matches[0];
      
      // Get the standardized term
      const termData = issueTerminology[bestMatch.matchedTerm];
      if (termData && termData.standardTerm) {
        mappedTerms.push(termData.standardTerm);
        console.log(`Priority "${priority}" mapped to "${termData.standardTerm}"`);
      } else {
        unmappedTerms.push(priority);
        console.log(`Priority "${priority}" had a match but no standardTerm`);
      }
    } else {
      unmappedTerms.push(priority);
      console.log(`No matching term found for priority: "${priority}"`);
    }
  }
  
  // Generate analysis text based on mapped terms
  let analysis = "Based on your priorities, here's what I understand:\n\n";
  
  // Add each mapped term with its plain English description
  const uniqueMappedTerms = [...new Set(mappedTerms)];
  for (const term of uniqueMappedTerms) {
    // Find the term info
    for (const [key, data] of Object.entries(issueTerminology)) {
      if (data.standardTerm === term) {
        analysis += `• ${term}: ${data.plainEnglish}\n\n`;
        break;
      }
    }
  }
  
  // Add a note about unmapped priorities if any
  if (unmappedTerms.length > 0) {
    analysis += "\nI didn't fully understand some of your priorities. You can provide more detail, and I'll update my analysis.";
  }
  
  return {
    analysis,
    unmappedTerms
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
    
    console.log(`Received request with mode: ${mode}, priorities count: ${priorities.length}`);
    console.log(`Priorities: ${JSON.stringify(priorities)}`);

    // Analyze priorities
    const { analysis, unmappedTerms } = await analyzePriorities(priorities);
    
    // Return response
    const response: AnalyzePrioritiesResponse = {
      mode,
      analysis,
      unmappedTerms
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
