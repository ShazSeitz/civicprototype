
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

function findBestMatchForPriority(priority: string): { term: string, matched: boolean } {
  // Normalize input
  const input = priority.toLowerCase();
  console.log(`Processing priority: "${input}"`);
  
  // Track best match
  let bestMatch = { term: "", score: 0 };
  
  // Special case for race/gender hiring phrase
  if (
    (input.includes("disgraceful") && input.includes("race") && input.includes("hiring")) ||
    (input.includes("disgraceful") && input.includes("gender") && input.includes("hiring")) ||
    (input.includes("disgraceful") && (input.includes("race") || input.includes("gender")) && input.includes("hire")) ||
    (input.includes("race") && input.includes("gender") && input.includes("hiring"))
  ) {
    console.log("*** Special match found for opposeRaceGenderHiring ***");
    return { term: "opposeRaceGenderHiring", matched: true };
  }
  
  // Process each term in the terminology
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    // Skip non-terminology entries
    if (termKey === "fallback" || termKey === "issues") continue;

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
async function analyzePriorities(priorities: string[]): Promise<{analysis: string, unmappedTerms: string[]}> {
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
    
    console.log(`Request received: mode=${mode}, priorities=${priorities.length}`);

    // Debug log the priorities
    priorities.forEach((p, i) => {
      console.log(`Priority ${i+1}: ${p}`);
    });

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
