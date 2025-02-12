
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import FirecrawlApp from 'npm:@mendable/firecrawl-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

interface Petition {
  title: string;
  url: string;
  relevance: string;
  supporterCount?: number;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priorities } = await req.json();
    const searchQueries = priorities.map((priority: string) => 
      priority.split(' ').slice(0, 3).join(' ')
    );

    console.log('Searching for petitions with queries:', searchQueries);

    const petitions: Petition[] = [];
    for (const query of searchQueries) {
      const searchUrl = `https://www.change.org/search?q=${encodeURIComponent(query)}`;
      
      console.log('Crawling URL:', searchUrl);
      const crawlResponse = await firecrawl.crawlUrl(searchUrl, {
        limit: 5,
        scrapeOptions: {
          formats: ['html'],
          selectors: {
            petitionTitle: '.mw-petition-title',
            petitionDescription: '.mw-petition-excerpt',
            supporterCount: '.mw-petition-signature-count'
          }
        }
      });

      if (crawlResponse.success) {
        const results = crawlResponse.data.map((result: any) => ({
          title: result.petitionTitle || 'Untitled Petition',
          url: result.url,
          relevance: `Related to: ${query}`,
          supporterCount: parseInt(result.supporterCount?.replace(/[^0-9]/g, '') || '0'),
          description: result.petitionDescription
        }));
        
        petitions.push(...results);
      }
    }

    // Sort by supporter count and remove duplicates
    const uniquePetitions = Array.from(new Map(
      petitions.map(petition => [petition.url, petition])
    ).values());

    const sortedPetitions = uniquePetitions
      .sort((a, b) => (b.supporterCount || 0) - (a.supporterCount || 0))
      .slice(0, 10);

    console.log('Found petitions:', sortedPetitions);

    return new Response(JSON.stringify(sortedPetitions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-petitions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
