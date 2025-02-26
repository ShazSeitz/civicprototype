import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const issueTerminology = {
  taxCutsForMiddleClass: {
    plainLanguage: [
      "middle class tax cuts",
      "tax cuts for working families", 
      "tax relief for average citizens",
      "tax breaks for middle class",
      "help working families",
      "tax burden on workers",
      "tired of paying tax",
      "lower taxes for workers",
      "reduce taxes middle class",
      "paying too much tax",
      "working class taxes",
      "family tax relief",
      "tired of paying income tax",
      "work hard for my money",
      "pass on to my children",
      "tired of taxes",
      "hard earned money",
      "income tax",
      "paying so much tax"
    ],
    standardTerm: "Middle Class Tax Relief",
    plainEnglish: "I want tax cuts that help working families and the middle class keep more of their money."
  },
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
      "pollution",
      "skeptical",
      "not sure about climate",
      "climate waste",
      "climate spending"
    ],
    standardTerm: "Climate Change Skepticism and Policy Concerns"
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
    
    const mappedPriorities = priorities.map((priority: string, index: number) => {
      const priorityLower = priority.toLowerCase();
      
      // Track matched terms for better categorization
      const matches = new Map<string, {count: number, specificity: number}>();
      
      for (const [category, data] of Object.entries(issueTerminology)) {
        const plainLanguageTerms = data.plainLanguage as string[]
        let matchCount = 0;
        let maxSpecificity = 0;
        
        plainLanguageTerms.forEach(term => {
          if (priorityLower.includes(term.toLowerCase())) {
            matchCount++;
            // Calculate specificity based on term length
            const termSpecificity = term.length;
            maxSpecificity = Math.max(maxSpecificity, termSpecificity);
          }
        });
        
        if (matchCount > 0) {
          matches.set(category, {
            count: matchCount,
            specificity: maxSpecificity
          });
        }
      }
      
      // If we found matches, return the category with the best match
      // considering both count and specificity
      if (matches.size > 0) {
        const bestMatch = Array.from(matches.entries()).reduce((a, b) => {
          const aScore = a[1].count * a[1].specificity;
          const bScore = b[1].count * b[1].specificity;
          return bScore > aScore ? b : a;
        });
        
        return {
          originalIndex: index,
          category: bestMatch[0],
          standardTerm: issueTerminology[bestMatch[0]].standardTerm,
          matchStrength: bestMatch[1].count * bestMatch[1].specificity
        };
      }
      
      return null;
    });

    // Filter out null values but maintain original order
    const validMappings = mappedPriorities
      .filter(Boolean)
      .sort((a, b) => a.originalIndex - b.originalIndex);
    
    // Get terms in original priority order
    const orderedTerms = validMappings.map(m => m.standardTerm);
    
    const unmappedCount = priorities.length - validMappings.length;

    let analysis = "I have mapped your priorities to common terms used in relation to policy:\n\n";
    
    // Create a bullet list with terms in original order
    analysis += orderedTerms.map(term => `• ${term}`).join('\n');

    if (unmappedCount > 0) {
      analysis += `\n\nI couldn't map ${unmappedCount} of your priorities to common policy terms. Would you like to rephrase them or would you like me to expand my understanding of these topics?`;
    } else {
      analysis += "\n\nWould you like any clarification about these policy areas?";
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
