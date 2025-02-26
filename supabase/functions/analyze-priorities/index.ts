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
      "strong economy",
      "fair prices",
      "paycheck value",
      "income tax",
      "money",
      "work hard for my money"
    ],
    standardTerm: "Economic Conditions and Fiscal Policy",
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
      "climate hoax",
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
      "political polarization",
      "jan 6th",
      "january 6",
      "rioters",
      "violent criminals"
    ],
    standardTerm: "Political Polarization and Democratic Governance",
    plainEnglish: "I want to fix our broken politics, stop fake news, and keep our government honest and fair."
  },
  transportation: {
    plainLanguage: [
      "transportation",
      "local transportation",
      "public transit",
      "affordable transportation",
      "transit options"
    ],
    standardTerm: "Transportation and Infrastructure",
    plainEnglish: "I want reliable and affordable transportation options that serve our community's needs."
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
    standardTerm: "Technology, Data Privacy, and Cybersecurity",
    plainEnglish: "I want strong protections for my personal data and safe, reliable technology that works for everyone."
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
    standardTerm: "Civil Liberties and Individual Rights",
    plainEnglish: "I want to protect our basic freedoms and ensure equal treatment regardless of race, gender, or background."
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
            plainEnglish: data.plainEnglish,
            originalText: priority
          }
        }
      }
      return null
    });

    let analysis = "Based on your priorities, here's what I understand:\n\n";
    
    // Filter out null values but keep track of unmapped priorities
    const unmappedPriorities = priorities.filter((priority, index) => !mappedPriorities[index]);
    const validMappings = mappedPriorities.filter(Boolean);

    validMappings.forEach((mapped, index) => {
      if (mapped) {
        analysis += `${index + 1}. ${mapped.plainEnglish}\n   (Based on your comment: "${mapped.originalText}")\n\n`;
      }
    });

    if (unmappedPriorities.length > 0) {
      analysis += "\nI notice some priorities that I'm not yet trained to understand fully:\n";
      unmappedPriorities.forEach((priority, index) => {
        analysis += `• "${priority}"\n`;
      });
      analysis += "\nFor clearer recommendations, try rephrasing these using more common terms, or let me know if I should expand my understanding of these topics.";
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
