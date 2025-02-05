import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from "zod";
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';

// API functions
const fetchRecommendations = async ({ zipCode, mode, priorities }: any) => {
  // This is a mock API call - replace with your actual API endpoint
  const response = await fetch(`https://api.example.com/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ zipCode, mode, priorities }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
};

const Index = () => {
  const [recommendations, setRecommendations] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => fetchRecommendations(form.getValues()),
    enabled: false,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await refetch();
    if (data) {
      setRecommendations(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <VoterForm onSubmit={onSubmit} isLoading={isLoading} />
          
          {recommendations && <RecommendationsList recommendations={recommendations} />}
        </div>
      </div>
    </div>
  );
};

export default Index;