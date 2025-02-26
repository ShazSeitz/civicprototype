import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const issueTerminology = {
  economy: {
    plainLanguage: [
      "tax burden", 
      "high taxes", 
      "taxes too high", 
      "tax rates", 
      "property tax",
      "inflation",
      "job security",
      "cost of living",
      "income tax",
      "money",
      "work hard for my money"
    ],
    standardTerm: "Economic Conditions and Fiscal Policy"
  },
  civilLiberties: {
    plainLanguage: [
      "civil rights",
      "individual rights",
      "constitutional rights",
      "personal freedom",
      "civil liberties",
      "race",
      "gender",
      "hire",
      "discrimination"
    ],
    standardTerm: "Civil Liberties and Individual Rights"
  },
  climate: {
    plainLanguage: [
      "climate change",
      "global warming",
      "climate skepticism",
      "climate denial",
      "climate hoax",
      "extreme weather",
      "pollution"
    ],
    standardTerm: "Climate Change and Environmental Policy"
  },
  transportation: {
    plainLanguage: [
      "transportation",
      "local transportation",
      "public transit",
      "affordable transportation",
      "transit options"
    ],
    standardTerm: "Transportation and Infrastructure"
  },
  politicalDivision: {
    plainLanguage: [
      "political division",
      "fake news",
      "misinformation",
      "partisan politics",
      "political polarization",
      "jan 6th",
      "january 6",
      "rioters",
      "violent criminals"
    ],
    standardTerm: "Political Polarization and Democratic Governance"
  },
  technology: {
    plainLanguage: [
      "AI",
      "artificial intelligence",
      "machine learning",
      "automation",
      "data privacy",
      "cybersecurity",
      "robots",
      "sci-fi",
      "scary"
    ],
    standardTerm: "Technology, Data Privacy, and Cybersecurity"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priorities, mode } = await req.json()
    console.log('Analyzing priorities:', priorities)
    
    const mappedPriorities = priorities.map((priority: string) => {
      const priorityLower = priority.toLowerCase();
      for (const [category, data] of Object.entries(issueTerminology)) {
        const plainLanguageTerms = data.plainLanguage as string[]
        if (plainLanguageTerms.some(term => 
          priorityLower.includes(term.toLowerCase())
        )) {
          return {
            category,
            standardTerm: data.standardTerm,
            originalText: priority
          }
        }
      }
      return null
    });

    let analysis = "Here's how I understand your priorities:\n\n";
    
    // Filter out null values but keep track of unmapped priorities
    const unmappedPriorities = priorities.filter((priority, index) => !mappedPriorities[index]);
    const validMappings = mappedPriorities.filter(Boolean);

    // Group similar concerns together
    const uniqueTerms = new Map();
    validMappings.forEach((mapped) => {
      if (mapped) {
        if (!uniqueTerms.has(mapped.standardTerm)) {
          uniqueTerms.set(mapped.standardTerm, [mapped.originalText]);
        } else {
          uniqueTerms.get(mapped.standardTerm).push(mapped.originalText);
        }
      }
    });

    // Create the analysis text
    uniqueTerms.forEach((originalTexts, standardTerm) => {
      analysis += `${standardTerm}:\n`;
      originalTexts.forEach(text => {
        analysis += `- "${text}"\n`;
      });
      analysis += '\n';
    });

    if (unmappedPriorities.length > 0) {
      analysis += "\nI didn't recognize some of your priorities:\n";
      unmappedPriorities.forEach(priority => {
        analysis += `- "${priority}"\n`;
      });
      analysis += "\nTry rephrasing these using different terms to get better recommendations.";
    }

    console.log('Generated analysis:', analysis);

    return new Response(
      JSON.stringify({
        mode,
        analysis,
        mappedPriorities: validMappings
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )

  } catch (error) {
    console.error('Error in analyze-priorities:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
