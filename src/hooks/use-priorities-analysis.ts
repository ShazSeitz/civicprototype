
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus } from '@/components/ApiStatusChecker';

export interface RecommendationsData {
  mode: string;
  analysis: string;
  candidates: any[];
  ballotMeasures: any[];
  draftEmails: any[];
  interestGroups: any[];
  petitions: any[];
}

export function usePrioritiesAnalysis() {
  const [formData, setFormData] = useState<VoterFormValues | null>(null);
  const [feedbackPriorities, setFeedbackPriorities] = useState<string[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<{
    googleCivic: ApiStatus;
    fec: ApiStatus;
  }>({
    googleCivic: 'unknown',
    fec: 'unknown'
  });
  const { toast } = useToast();
  
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
          setApiStatus({
            googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown',
            fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
                 data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
                 data.apiStatuses.fec === 'FEC_API_ERROR' ? 'error' : 'unknown'
          });

          if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Issue",
              description: "Google Civic API key is not configured. Please add your API key in Supabase.",
              variant: "destructive",
            });
            throw new Error('Google Civic API is not configured. Please add your API key.');
          } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
            toast({
              title: "API Connection Error",
              description: "Failed to connect to Google Civic API. Please check your API key and try again.",
              variant: "destructive",
            });
            throw new Error('Failed to connect to Google Civic API. Please check your API key and try again.');
          } else if (data.apiStatuses.googleCivic === 'CONNECTED') {
            toast({
              title: "API Connected",
              description: "Successfully connected to Google Civic API.",
              variant: "default",
            });
          }
          
          if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Issue",
              description: "FEC API key is not configured. Please add your API key in Supabase.",
              variant: "destructive",
            });
            throw new Error('FEC API is not configured. Please add your API key.');
          } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
            toast({
              title: "API Connection Error",
              description: "Failed to connect to FEC API. Please check your API key and try again.",
              variant: "destructive",
            });
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

  const handleSubmit = (values: VoterFormValues) => {
    console.log('Form submitted with values:', values);
    setFormData(values);
    setFeedbackPriorities([]); // Reset feedback when new form is submitted
    setSubmitCount(prev => prev + 1);
  };

  const handleFeedback = (feedback: string) => {
    setFeedbackPriorities(prev => [...prev, feedback]);
    setSubmitCount(prev => prev + 1);
  };

  const updateApiStatus = (newStatus: { googleCivic: ApiStatus; fec: ApiStatus }) => {
    setApiStatus(newStatus);
  };

  return {
    formData,
    recommendations,
    isLoading,
    isError,
    error,
    refetch,
    apiStatus,
    handleSubmit,
    handleFeedback,
    updateApiStatus
  };
}
