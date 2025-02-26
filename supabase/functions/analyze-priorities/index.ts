
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
  taxCutsForWealthy: {
    plainLanguage: [
      "tax cuts for job creators",
      "business tax relief",
      "corporate tax cuts",
      "wealth tax opposition",
      "capital gains tax",
      "estate tax relief",
      "tax cuts create jobs",
      "trickle down",
      "tax cuts stimulate economy"
    ],
    standardTerm: "Upper Income Tax Relief",
    plainEnglish: "I support tax cuts for high earners and businesses to stimulate economic growth."
  },
  taxWealthyMore: {
    plainLanguage: [
      "tax the rich",
      "wealth tax",
      "millionaire tax",
      "billionaire tax",
      "fair share taxes",
      "ultra wealthy taxes",
      "no tax cuts wealthy",
      "corporate tax loopholes",
      "tax the 1%",
      "progressive taxation",
      "make rich pay more"
    ],
    standardTerm: "Progressive Taxation and Wealth Tax",
    plainEnglish: "I want the ultra-wealthy and corporations to pay their fair share in taxes."
  },
  economy: {
    plainLanguage: [
      "inflation",
      "job security",
      "cost of living",
      "strong economy",
      "fair prices",
      "paycheck value"
    ],
    standardTerm: "Economic Conditions and Growth",
    plainEnglish: "I want a strong economy where prices are fair, jobs are secure, and my paycheck goes further."
  },
  healthcare: {
    plainLanguage: [
      "healthcare costs",
      "medical bills",
      "health insurance",
      "mental health",
      "long-term care"
    ],
    standardTerm: "Healthcare Access and Affordability",
    plainEnglish: "I want affordable healthcare that covers everything from doctor visits to mental health and long-term care."
  },
  climate: {
    plainLanguage: [
      "climate change",
      "global warming",
      "climate skepticism",
      "climate denial",
      "extreme weather",
      "pollution"
    ],
    standardTerm: "Climate Change and Environmental Policy",
    plainEnglish: "I want our government to take action on climate change and protect our environment from extreme weather and pollution."
  },
  immigration: {
    plainLanguage: [
      "border security",
      "immigration reform",
      "border crisis",
      "illegal immigration",
      "legal immigration"
    ],
    standardTerm: "Immigration and Border Security",
    plainEnglish: "I want fair immigration policies that secure our borders while giving hardworking immigrants a chance."
  },
  politicalDivision: {
    plainLanguage: [
      "political division",
      "fake news",
      "misinformation",
      "partisan politics",
      "political polarization"
    ],
    standardTerm: "Political Polarization and Democratic Governance",
    plainEnglish: "I want to fix our broken politics, stop fake news, and keep our government honest and fair."
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

    const validMappings = mappedPriorities
      .filter(Boolean)
      .sort((a, b) => a.originalIndex - b.originalIndex);
    
    const orderedTerms = validMappings.flatMap(mapping => 
      mapping.matches.map(match => match.standardTerm)
    );
    
    const uniqueOrderedTerms = Array.from(new Set(orderedTerms));
    
    const unmappedCount = priorities.length - validMappings.length;

    let analysis = "Based on all your input, including clarifications, here are the relevant policy areas:\n\n";
    
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
