import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const issueTerminology = {
  taxPolicy: {
    plainLanguage: [
      "income tax",
      "tax burden",
      "tired of paying tax",
      "paying too much tax",
      "tax relief",
      "tired of paying income tax",
      "work hard for my money",
      "pass on to my children",
      "tired of taxes",
      "hard earned money",
      "paying so much tax"
    ],
    standardTerm: "Tax Policy and Reform",
    plainEnglish: "Concerns about income tax rates and inheritance"
  },
  economicPolicy: {
    plainLanguage: [
      "economic growth",
      "fiscal policy",
      "government spending",
      "financial regulations",
      "economic conditions",
      "work hard for money",
      "pass on wealth",
      "inheritance",
      "estate planning"
    ],
    standardTerm: "Economic Policy",
    plainEnglish: "Issues related to economic conditions and wealth transfer"
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
    
    const MAX_MATCHES = 3;
    
    const mappedPriorities = priorities.map((priority: string, index: number) => {
      const priorityLower = priority.toLowerCase();
      const matches: Array<{category: string, standardTerm: string, matchCount: number}> = [];
      
      for (const [category, data] of Object.entries(issueTerminology)) {
        const plainLanguageTerms = data.plainLanguage as string[]
        let matchCount = 0;
        
        plainLanguageTerms.forEach(term => {
          if (priorityLower.includes(term.toLowerCase())) {
            matchCount++;
          }
        });
        
        if (matchCount > 0) {
          matches.push({
            category,
            standardTerm: issueTerminology[category].standardTerm,
            matchCount
          });
        }
      }
      
      // Return top matches for this priority, sorted by match strength
      if (matches.length > 0) {
        const topMatches = matches
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, MAX_MATCHES);
        
        return {
          originalIndex: index,
          matches: topMatches
        };
      }
      
      return null;
    });

    // Filter out null values but maintain original order
    const validMappings = mappedPriorities
      .filter(Boolean)
      .sort((a, b) => a.originalIndex - b.originalIndex);
    
    // Get all terms in original priority order, including multiple matches per priority
    const orderedTerms = validMappings.flatMap(mapping => 
      mapping.matches.map(match => match.standardTerm)
    );
    
    // Remove duplicate terms while preserving order
    const uniqueOrderedTerms = Array.from(new Set(orderedTerms));
    
    const unmappedCount = priorities.length - validMappings.length;

    let analysis = "Based on all your input, including clarifications, here are the relevant policy areas:\n\n";
    
    // Create a bullet list with unique terms in order of appearance
    analysis += uniqueOrderedTerms.map(term => `• ${term}`).join('\n');

    if (unmappedCount > 0) {
      analysis += `\n\n${unmappedCount} of your priorities could not be mapped to policy terms. Feel free to rephrase them if you'd like.`;
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
