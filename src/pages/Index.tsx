
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().min(1, "Priority cannot be empty")).length(6, "Please enter all 6 priorities"),
});

const Index = () => {
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const [noElectionsMessage, setNoElectionsMessage] = useState<string | null>(null);

  const { data: recommendations, isLoading, isError, error } = useQuery({
    queryKey: ['recommendations', formData, submitCount],
    queryFn: async () => {
      if (!formData) return null;
      
      try {
        console.log('Submitting form data:', formData);
        const { data, error } = await supabase.functions.invoke('analyze-priorities', {
          body: { mode: formData.mode, priorities: formData.priorities }
        });

        if (error) {
          console.error('Supabase function error:', error);
          toast({
            title: "Error",
            description: error.message || 'Failed to analyze content',
            variant: "destructive",
          });
          throw new Error(error.message || 'Failed to analyze content');
        }

        if (!data) {
          throw new Error('No data returned from analysis');
        }

        // Return the data with empty arrays for optional properties
        return {
          mode: data.mode,
          analysis: data.analysis,
          candidates: [],
          ballotMeasures: [],
          draftEmails: [],
          interestGroups: [],
          petitions: []
        };
      } catch (err: any) {
        console.error('Error in analyze-priorities:', err);
        toast({
          title: "Error",
          description: err.message || 'An error occurred while analyzing priorities',
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: Boolean(formData),
    retry: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (recommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setNoElectionsMessage(null);
    setFormData(values);
    setSubmitCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <VoterForm 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
          />
          
          {noElectionsMessage && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              {noElectionsMessage}
            </div>
          )}
          
          <div ref={recommendationsRef}>
            {recommendations && <RecommendationsList recommendations={recommendations} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
