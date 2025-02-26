
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import issueTerminology from '../../../src/config/issueTerminology.json' assert { type: "json" }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Priority {
  text: string
}

serve(async (req) => {
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

    const response = {
      mode,
      analysis,
      mappedPriorities
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
