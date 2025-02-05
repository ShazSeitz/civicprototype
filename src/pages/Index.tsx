import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from "zod";
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';

// Form validation schema (needed for TypeScript)
const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().max(200, "Priority must not exceed 200 characters")).length(6, "Please enter all 6 priorities"),
});

// API functions
const fetchRecommendations = async (values: z.infer<typeof formSchema>) => {
  // This is a mock API call - replace with your actual API endpoint
  const response = await fetch(`https://api.example.com/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
};

const Index = () => {
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  const { refetch, isLoading } = useQuery({
    queryKey: ['recommendations', formData],
    queryFn: () => formData ? fetchRecommendations(formData) : null,
    enabled: false,
    onSuccess: (data) => {
      setRecommendations(data);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormData(values);
    await refetch();
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