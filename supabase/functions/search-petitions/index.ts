import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to search for real petitions based on keywords
const searchPetitions = async (query: string) => {
  try {
    console.log(`Searching for petitions with query: ${query}`);
    
    // Since Change.org doesn't have a public API that we can directly use,
    // we'll implement a scraping approach using the public search page
    const searchUrl = `https://www.change.org/search?q=${encodeURIComponent(query)}`;
    
    try {
      // Fetch the search results page
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract petition links from the HTML
      // Note: This is a basic implementation and might break if Change.org changes their HTML structure
      const petitionRegex = /<a[^>]*href="(\/p\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
      const petitions = [];
      let match;
      
      while ((match = petitionRegex.exec(html)) !== null) {
        const petitionUrl = `https://www.change.org${match[1]}`;
        const title = match[2].trim();
        
        // Only include if we have both URL and title
        if (petitionUrl && title) {
          petitions.push({
            title,
            url: petitionUrl,
            relevance: `Related to your interest in ${query}`,
            // We can't reliably get supporter counts from the search page
            supporterCount: null,
            description: "Click to view this petition on Change.org"
          });
        }
        
        // Limit to 5 petitions per search term
        if (petitions.length >= 5) break;
      }
      
      // If we couldn't find any petitions using scraping, return an empty array
      if (petitions.length === 0) {
        console.log(`No petitions found for query: ${query}`);
        return [];
      }
      
      return petitions;
    } catch (error) {
      console.error(`Error scraping petitions for ${query}:`, error);
      // If scraping fails, return link to search directly
      return [{
        title: `Search Change.org for "${query}"`,
        url: searchUrl,
        relevance: `Search for petitions related to ${query}`,
        supporterCount: null,
        description: "View all petitions on Change.org related to this topic"
      }];
    }
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

    // Sort by supporter count if available
    const sortedPetitions = uniquePetitions
      .sort((a, b) => {
        // If supporter counts aren't available, don't change order
        if (!a.supporterCount && !b.supporterCount) return 0;
        // If only one has supporter count, prioritize it
        if (!a.supporterCount) return 1;
        if (!b.supporterCount) return -1;
        // Otherwise sort by supporter count
        return b.supporterCount - a.supporterCount;
      })
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
