
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// No API required for simple web scraping - using fetch directly
const searchPetitions = async (query: string) => {
  try {
    console.log(`Searching for petitions with query: ${query}`);
    
    // For demo purposes, return hardcoded petition data
    // In a production environment, would implement proper web scraping or API calls
    return [
      {
        title: `Petition related to ${query}`,
        url: "https://www.change.org/",
        relevance: `This petition addresses issues related to ${query}`,
        supporterCount: Math.floor(Math.random() * 10000) + 500,
        description: `A community initiative focused on ${query} and related concerns`
      }
    ];
  } catch (error) {
    console.error(`Error searching for petitions with query ${query}:`, error);
    return [];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priorities } = await req.json();
    
    if (!Array.isArray(priorities) || priorities.length === 0) {
      throw new Error('Invalid priorities format');
    }

    const searchQueries = priorities.map((priority: string) => 
      priority.split(' ').slice(0, 3).join(' ')
    );

    console.log('Searching for petitions with queries:', searchQueries);

    const petitionPromises = searchQueries.map(query => searchPetitions(query));
    const petitionResults = await Promise.all(petitionPromises);
    
    // Flatten results and remove duplicates
    let allPetitions = petitionResults.flat();
    
    // Remove duplicates by URL
    const uniquePetitions = Array.from(new Map(
      allPetitions.map(petition => [petition.url, petition])
    ).values());

    // Sort by supporter count
    const sortedPetitions = uniquePetitions
      .sort((a, b) => (b.supporterCount || 0) - (a.supporterCount || 0))
      .slice(0, 10);

    console.log('Found petitions:', sortedPetitions);

    return new Response(JSON.stringify(sortedPetitions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-petitions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
