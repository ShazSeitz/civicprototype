
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define the terminology mapping inline since we can't import from src in Edge Functions
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
      "cost of living"
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
      "extreme weather",
      "pollution"
    ],
    standardTerm: "Climate Change and Environmental Policy",
    plainEnglish: "I want our government to take action on climate change and protect our environment from extreme weather and pollution."
  }
  // ... we'll include the most common categories for brevity, but in production you'd want all categories
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priorities, mode } = await req.json()
    console.log('Analyzing priorities:', priorities)
    
    // Map user priorities to standardized terminology
    const mappedPriorities = priorities.map((priority: string) => {
      // Check each category's plain language terms for matches
      for (const [category, data] of Object.entries(issueTerminology)) {
        const plainLanguageTerms = data.plainLanguage as string[]
        if (plainLanguageTerms.some(term => 
          priority.toLowerCase().includes(term.toLowerCase())
        )) {
          return {
            category,
            standardTerm: data.standardTerm,
            plainEnglish: data.plainEnglish
          }
        }
      }
      return null
    }).filter(Boolean)

    // Generate analysis using only mapped terminology
    let analysis = "Based on your priorities, here's what I understand:\n\n"
    
    mappedPriorities.forEach((mapped, index) => {
      if (mapped) {
        analysis += `${index + 1}. ${mapped.plainEnglish}\n`
      }
    })

    // If some priorities couldn't be mapped, add a note
    const unmappedCount = priorities.length - mappedPriorities.length
    if (unmappedCount > 0) {
      analysis += `\nNote: ${unmappedCount} of your priorities used terms I'm not familiar with. For clearer recommendations, try using more common terms for these issues.`
    }

    console.log('Generated analysis:', analysis)

    return new Response(
      JSON.stringify({
        mode,
        analysis,
        mappedPriorities
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
