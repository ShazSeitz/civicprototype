
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface TermCategory {
  plainLanguage: string[];
  standardTerm: string;
  plainEnglish: string;
  nuance?: Record<string, number>;
  inclusionWords?: string[];
  exclusionWords?: string[];
  nuancedMapping?: Record<string, any>;
}

interface TerminologyConfig {
  [key: string]: TermCategory;
  fallback: TermCategory;
}

// Simple mapping of nuance keys to trigger phrases
const nuanceTriggers: Record<string, string[]> = {
  // Economic issues
  "economic_issues": ["tax", "taxes", "income tax", "income taxes", "hard earned money"],
  "tax_burden_reduction": ["tax burden", "tax relief", "reduce taxes", "lower taxes"],
  "middle_class_support": ["middle class", "working families", "working class"],
  "tax_cut_opposition": ["no tax cuts", "against tax cuts", "oppose tax cuts"],
  
  // Personal liberty
  "freedom_from_regulation": ["government interference", "overreach", "regulation"],
  "privacy_and_autonomy": ["privacy", "autonomy", "personal choice", "personal freedom"],

  // Environmental
  "climate_action": ["climate action", "global warming", "climate crisis"],
  "climate_skepticism": ["climate hoax", "climate skeptic"],

  // Other common triggers
  "oppose_affirmative_action_race": ["race in hiring", "hiring based on race"],
  "oppose_affirmative_action_gender": ["gender in hiring", "hiring based on gender"],
  "merit_based_hiring_support": ["merit based", "qualified candidates"]
};

async function fetchTerminologyConfig(): Promise<TerminologyConfig> {
  try {
    // For this demo, we'll hard-code a minimal config that includes the categories 
    // we're testing with more detailed nuance analysis
    const config: TerminologyConfig = {
      "fallback": {
        "standardTerm": "Clarification Needed",
        "plainEnglish": "Can you please clarify your stance on this topic?",
        "plainLanguage": [],
        "nuance": {}
      },
      "taxCutsForMiddleClass": {
        "plainLanguage": [
          "middle class tax cuts",
          "tax cuts for working families",
          "tax breaks for middle class",
          "reduce taxes for middle class",
          "tax relief for middle class",
          "help working families"
        ],
        "inclusionWords": [
          "middle class",
          "working families"
        ],
        "standardTerm": "Middle Class Tax Relief",
        "plainEnglish": "I want tax cuts that help working families and the middle class keep more of their money.",
        "nuance": {
          "middle_class_support": 0.8,
          "tax_burden_reduction": 0.7
        },
        "nuancedMapping": {
          "supports_middle_class_relief": true,
          "opposes_tax_increases": true,
          "supports_working_families": true,
          "explicitly_mentions_middle_class": false,
          "reasoning": "The voter expresses support for tax cuts that benefit the middle class and working families."
        }
      },
      "personalLiberty": {
        "plainLanguage": [
          "individual freedom",
          "personal autonomy",
          "self-determination",
          "liberty from government control",
          "personal rights"
        ],
        "standardTerm": "Personal Autonomy and Freedom",
        "plainEnglish": "I value my personal autonomy and want the freedom to make private choices about my life—without excessive government or societal interference.",
        "nuance": {
          "freedom_from_regulation": 0.9,
          "privacy_and_autonomy": 0.8,
          "economic_issues": -0.9
        },
        "exclusionWords": [
          "tax",
          "income",
          "money"
        ],
        "nuancedMapping": {
          "supports_personal_freedom": true,
          "opposes_government_interference": true,
          "mentions_privacy": false,
          "economic_focus": false,
          "reasoning": "The voter values personal autonomy and freedom from government interference in private choices."
        }
      },
      "opposeRaceGenderHiring": {
        "plainLanguage": [
          "disgraceful to use race in hiring",
          "disgraceful to use gender in hiring",
          "hiring based on race",
          "hiring based on gender",
          "merit based hiring only",
          "no quotas in hiring",
          "race decide whether to hire",
          "gender decide whether to hire"
        ],
        "standardTerm": "Opposition to Race and Gender-Based Hiring Policies",
        "plainEnglish": "I believe that hiring should be based solely on merit, and it's disgraceful to use race or gender as deciding factors.",
        "nuance": {
          "oppose_affirmative_action_race": -0.8,
          "oppose_affirmative_action_gender": -0.8,
          "merit_based_hiring_support": 0.8
        },
        "nuancedMapping": {
          "anti_discrimination": true,
          "supports_affirmative_action": false,
          "explicitly_against_affirmative_action": true,
          "supports_merit_based_hiring": true,
          "reasoning": "The voter explicitly opposes racial and gender discrimination in hiring, favoring merit-based decisions over quotas or affirmative action policies."
        }
      }
    };
    
    return config;
  } catch (error) {
    console.error('Error fetching terminology config:', error);
    throw new Error('Failed to load terminology configuration');
  }
}

function computeScoreForCategory(userInput: string, category: TermCategory, categoryKey: string): {
  score: number;
  details: string[];
  nuancedMapping?: Record<string, any>;
} {
  let score = 0;
  const details: string[] = [];
  const inputLower = userInput.toLowerCase();

  // Check for exclusion words first - if present, reduce score significantly
  if (category.exclusionWords) {
    for (const exclusionWord of category.exclusionWords) {
      if (inputLower.includes(exclusionWord.toLowerCase())) {
        score -= 5;
        details.push(`Found exclusion word '${exclusionWord}' (-5)`);
      }
    }
  }
  
  // Check for inclusion words - if ANY are missing, reduce score to almost zero
  if (category.inclusionWords) {
    let foundInclusionWords = false;
    for (const inclusionWord of category.inclusionWords) {
      if (inputLower.includes(inclusionWord.toLowerCase())) {
        foundInclusionWords = true;
        details.push(`Found required inclusion word '${inclusionWord}' (required)`);
        break;
      }
    }
    
    if (!foundInclusionWords) {
      score -= 10;
      details.push(`Missing all required inclusion words: [${category.inclusionWords.join(', ')}] (-10)`);
    }
  }
  
  // Base score: for each plainLanguage keyword present, add a base score
  for (const phrase of category.plainLanguage) {
    if (inputLower.includes(phrase.toLowerCase())) {
      score += 1.0; // Base score for matched plainLanguage term
      details.push(`Matched plainLanguage phrase '${phrase}' (+1)`);
    }
  }
  
  // Incorporate nuance triggers
  if (category.nuance) {
    for (const [nuanceKey, weight] of Object.entries(category.nuance)) {
      const triggers = nuanceTriggers[nuanceKey] || [];
      for (const trigger of triggers) {
        if (inputLower.includes(trigger.toLowerCase())) {
          score += weight;
          details.push(`Matched nuance trigger '${trigger}' for '${nuanceKey}' (${weight > 0 ? '+' : ''}${weight})`);
        }
      }
    }
  }
  
  // Word-by-word matching (simple implementation)
  const inputWords = inputLower.split(/\s+/);
  const categoryPlainLanguage = category.plainLanguage.join(' ').toLowerCase();
  const categoryWords = new Set(categoryPlainLanguage.split(/\s+/));
  
  for (const word of inputWords) {
    if (word.length > 3 && categoryWords.has(word)) {
      score += 0.2;
      details.push(`Word match: '${word}' (bonus +0.2)`);
    }
  }
  
  // Update the nuanced mapping based on the input if category has nuancedMapping
  let updatedNuancedMapping = category.nuancedMapping;
  if (updatedNuancedMapping) {
    // Make a deep copy to avoid modifying the original
    updatedNuancedMapping = JSON.parse(JSON.stringify(updatedNuancedMapping));
    
    // Update some of the boolean values based on input content
    // This is a simplified example - in a real implementation, you'd use more sophisticated logic
    if (categoryKey === "opposeRaceGenderHiring") {
      updatedNuancedMapping.anti_discrimination = inputLower.includes("discriminat");
      updatedNuancedMapping.explicitly_against_affirmative_action = 
        inputLower.includes("affirmative action") || 
        inputLower.includes("quota") || 
        (inputLower.includes("race") && inputLower.includes("hire"));
      updatedNuancedMapping.supports_merit_based_hiring = 
        inputLower.includes("merit") || 
        inputLower.includes("qualified");
      
      // Update reasoning based on the specific input
      if (inputLower.includes("race") && inputLower.includes("discriminat")) {
        updatedNuancedMapping.reasoning = "The voter explicitly opposes racial discrimination but also appears to oppose race-based hiring practices, distinguishing general anti-discrimination principles from race-conscious policies.";
      }
    }
    
    // Add more category-specific logic for other categories
  }
  
  return { score, details, nuancedMapping: updatedNuancedMapping };
}

function mapUserInput(userInput: string, config: TerminologyConfig) {
  const results = [];
  
  for (const [key, category] of Object.entries(config)) {
    if (key === 'fallback') continue; // Skip fallback category in results
    
    const { score, details, nuancedMapping } = computeScoreForCategory(userInput, category, key);
    
    if (score !== 0 || details.length > 0) {
      results.push({
        category: key,
        standardTerm: category.standardTerm,
        plainEnglish: category.plainEnglish,
        score,
        details,
        nuancedMapping
      });
    }
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { input } = await req.json();
    
    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Input must be a non-empty string' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const terminologyConfig = await fetchTerminologyConfig();
    const results = mapUserInput(input, terminologyConfig);
    
    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in debug-terminology function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
