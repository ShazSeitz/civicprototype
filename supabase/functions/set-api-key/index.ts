
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

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
    const secretName = apiType === 'fec' ? 'FEC_API_KEY' : 'GOOGLE_CIVIC_API_KEY'
    
    // Create a Supabase client with service role key to manage secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing Supabase URL or service role key' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    // Update the project secret
    const { error } = await supabase.functions.setSecret(secretName, apiKey)
    
    if (error) {
      console.error(`Error setting ${secretName}:`, error)
      return new Response(
        JSON.stringify({ 
          error: `Failed to set ${secretName}`,
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`Successfully set ${secretName}`)
    
    return new Response(
      JSON.stringify({ success: true, message: `${secretName} has been updated successfully` }),
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
