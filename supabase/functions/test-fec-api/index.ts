
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const fecApiKey = Deno.env.get('FEC_API_KEY')
    
    if (!fecApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'FEC API key is not configured in environment variables' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse the request to check if we're in demo mode
    let mode = "current";
    try {
      const body = await req.json();
      mode = body.mode || "current";
      console.log(`Testing FEC API connectivity with mode: ${mode}`);
    } catch (err) {
      console.log("No mode specified in request, using current date");
    }
    
    // Use the elections endpoint with required parameters
    let electionDate;
    if (mode === "demo") {
      // For demo mode, use November 1, 2024
      electionDate = new Date(2024, 10, 1); // Note: month is 0-indexed, so 10 = November
      console.log('Using demo date: November 1, 2024');
    } else {
      // For current mode, use current date
      electionDate = new Date();
      console.log(`Using current date: ${electionDate.toISOString().split('T')[0]}`);
    }
    
    const year = electionDate.getFullYear();
    const cycle = year % 2 === 0 ? year : year - 1;
    
    console.log(`Testing FEC API connectivity with configured API key for cycle: ${cycle}`);
    const url = `https://api.open.fec.gov/v1/elections/?api_key=${fecApiKey}&cycle=${cycle}&office=president&page=1&per_page=1`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VoterInformationTool/1.0'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('FEC API test failed with status:', response.status)
      console.error('FEC API error details:', errorText)
      
      let errorType = 'FEC_API_ERROR'
      if (response.status === 401 || response.status === 403) {
        errorType = 'FEC_API_UNAUTHORIZED'
      } else if (response.status === 404) {
        errorType = 'FEC_API_ENDPOINT_NOT_FOUND'
      } else if (response.status === 429) {
        errorType = 'FEC_API_RATE_LIMIT'
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: response.status,
          errorType,
          message: `FEC API connection failed: ${errorText}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const data = await response.json()
    console.log('FEC API response successful:', data ? 'Data received' : 'No data')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'FEC API connection successful',
        data: {
          resultsCount: data.results ? data.results.length : 0,
          pagination: data.pagination || {},
          cycle
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error testing FEC API connection:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
