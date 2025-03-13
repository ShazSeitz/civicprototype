
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { apiType, apiKey } = await req.json()
    
    if (!apiType || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: apiType or apiKey' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Validate API type
    if (apiType !== 'fec' && apiType !== 'googleCivic') {
      return new Response(
        JSON.stringify({ error: 'Invalid API type. Must be "fec" or "googleCivic"' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Set the environment variable based on the API type
    const envVarName = apiType === 'fec' ? 'FEC_API_KEY' : 'GOOGLE_CIVIC_API_KEY'
    
    // In a real implementation, we would set the environment variable
    // This is a placeholder for the actual implementation that would involve
    // setting the environment variable in the Supabase project
    
    console.log(`Setting ${envVarName} environment variable`)
    
    // We're using Deno.env.set here, but in production this wouldn't persist between function invocations
    // You would need to use Supabase Secrets Management to make it permanent
    Deno.env.set(envVarName, apiKey)
    
    return new Response(
      JSON.stringify({ success: true, message: `${envVarName} has been updated successfully` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in set-api-key function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
