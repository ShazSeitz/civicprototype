import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';
import { VoterFormValues } from '@/schemas/voterFormSchema';

const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().min(5, "Please enter a valid ZIP code.").max(10),
  priorities: z.array(z.string().min(1, "Priority cannot be empty")).length(6, "Please enter all 6 priorities"),
});

const Index = () => {
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const [feedbackPriorities, setFeedbackPriorities] = useState<string[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { 
    data: recommendations, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['recommendations', formData, feedbackPriorities, submitCount],
    queryFn: async () => {
      if (!formData) return null;
      
      try {
        const allPriorities = [...formData.priorities, ...feedbackPriorities];
        console.log('Submitting form data:', { ...formData, priorities: allPriorities });
        
        const { data, error } = await supabase.functions.invoke('analyze-priorities', {
          body: { 
            mode: formData.mode, 
            zipCode: formData.zipCode,
            priorities: allPriorities 
          }
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

        if (data.apiStatuses) {
          if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
            throw new Error('Google Civic API is not configured. Please add your API key.');
          } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
            throw new Error('Failed to connect to Google Civic API. Please check your API key and try again.');
          }
          
          if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
            throw new Error('FEC API is not configured. Please add your API key.');
          } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
            throw new Error('Failed to connect to FEC API. Please check your API key and try again.');
          }
        }

        if (data.unmappedTerms && data.unmappedTerms.length > 0) {
          console.log('Unmapped terms detected:', data.unmappedTerms);
          saveUnmappedTerms(data.unmappedTerms);
        }

        return {
          mode: data.mode,
          analysis: data.analysis,
          candidates: data.candidates || [],
          ballotMeasures: data.ballotMeasures || [],
          draftEmails: data.draftEmails || [],
          interestGroups: data.interestGroups || [],
          petitions: data.petitions || []
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
    retry: 1,
    refetchOnWindowFocus: false
  });

  const saveUnmappedTerms = async (terms: string[]) => {
    try {
      console.log('Unmapped terms that need mapping:', terms);
      toast({
        title: "Unmapped Terms Detected",
        description: `${terms.length} priorities couldn't be mapped to existing terms and have been logged.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving unmapped terms:', error);
    }
  };

  useEffect(() => {
    if (recommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations]);

  const onSubmit = (values: VoterFormValues) => {
    console.log('Form submitted with values:', values);
    setFormData(values);
    setFeedbackPriorities([]); // Reset feedback when new form is submitted
    setSubmitCount(prev => prev + 1);
  };

  const handleFeedback = (feedback: string) => {
    setFeedbackPriorities(prev => [...prev, feedback]);
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
          
          {isError && (
            <Alert variant="destructive" className="mt-8 animate-fade-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <div className="mb-3">
                  {error instanceof Error ? error.message : 'An unknown error occurred'}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div ref={recommendationsRef}>
            {recommendations && (
              <RecommendationsList 
                recommendations={recommendations} 
                onFeedbackSubmit={handleFeedback}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
