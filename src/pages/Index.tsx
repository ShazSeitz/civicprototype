
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().max(250, "Priority must not exceed 250 characters")).length(6, "Please enter all 6 priorities"),
});

const Index = () => {
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const { toast } = useToast();
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { data: recommendations, refetch, isLoading } = useQuery({
    queryKey: ['recommendations', formData],
    queryFn: async () => {
      if (!formData) return null;
      
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: formData
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No election data available for this location at this time. Please try a different ZIP code.",
        });
        throw error;
      }

      return data;
    },
    enabled: false,
    retry: false
  });

  useEffect(() => {
    if (recommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setFormData(values);
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <VoterForm onSubmit={onSubmit} isLoading={isLoading} />
          
          <div ref={recommendationsRef}>
            {recommendations && <RecommendationsList recommendations={recommendations} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
