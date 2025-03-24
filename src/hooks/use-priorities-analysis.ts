
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus } from '@/components/ApiStatusChecker';

export interface RecommendationsData {
  mode: string;
  analysis: string;
  mappedPriorities: string[];
  conflictingPriorities?: string[];
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
  const [showRecommendations, setShowRecommendations] = useState(false);
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
      if (terms && terms.length > 0) {
        console.log('Unmapped terms that need mapping:', terms);
        toast({
          title: "Unmapped Terms Detected",
          description: `${terms.length} priorities couldn't be mapped to existing terms and have been logged for future updates.`,
          variant: "default",
        });
      }
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
        
        // Include a roleFilter parameter to ensure appropriate matching of officials to issues
        const { data, error } = await supabase.functions.invoke('analyze-priorities', {
          body: { 
            mode: formData.mode, 
            zipCode: formData.zipCode,
            priorities: allPriorities,
            improveMatching: true // Signal to the function to use improved matching logic
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

        // Handle API status checks
        if (data.apiStatuses) {
          setApiStatus({
            googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown',
            fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
                 data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
                 data.apiStatuses.fec === 'FEC_API_ERROR' ? 'error' : 'unknown'
          });

          // Handle API configuration issues
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
          
          // Handle FEC API status
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
          } else if (data.apiStatuses.fec === 'FEC_API_UNAUTHORIZED') {
            toast({
              title: "API Authorization Error",
              description: "FEC API key is invalid or unauthorized. Please enter a new API key.",
              variant: "destructive",
            });
            throw new Error('FEC API key is invalid or unauthorized. Please enter a new API key.');
          }
        }

        // Process unmapped terms
        if (data.unmappedTerms && data.unmappedTerms.length > 0) {
          console.log('Unmapped terms detected:', data.unmappedTerms);
          saveUnmappedTerms(data.unmappedTerms);
        }

        // Format analysis into paragraphs if it's not already
        let formattedAnalysis = data.analysis;
        if (formattedAnalysis && !formattedAnalysis.includes('\n\n')) {
          // Ensure analysis is formatted into readable paragraphs
          const sentences = formattedAnalysis.split(/(?<=[.!?])\s+/);
          if (sentences.length >= 4) {
            // Create 2-3 paragraphs from the sentences
            const paraLength = Math.ceil(sentences.length / 3);
            let newAnalysis = '';
            for (let i = 0; i < sentences.length; i += paraLength) {
              const paragraph = sentences.slice(i, i + paraLength).join(' ');
              newAnalysis += paragraph + '\n\n';
            }
            formattedAnalysis = newAnalysis.trim();
          }
        }

        // Extract mapped priorities
        const mappedPriorities = data.mappedPriorities || [];
        
        // Extract and enhance conflicting priorities if available
        let conflictingPriorities = data.conflictingPriorities || [];
        
        // Format conflicting priorities to use actual priority text instead of numbers
        if (conflictingPriorities.length > 0 && formData.priorities.length > 0) {
          conflictingPriorities = conflictingPriorities.map(conflict => {
            // Replace references like "priorities #1 and #4" with actual priority text
            let enhancedConflict = conflict;
            
            // Look for patterns like "priorities #1 and #4" or "priority #2"
            const priorityRefPattern = /(priority|priorities)\s+#(\d+)(?:\s+and\s+#(\d+))?/gi;
            
            enhancedConflict = enhancedConflict.replace(priorityRefPattern, (match, term, firstNum, secondNum) => {
              const firstIndex = parseInt(firstNum) - 1;
              
              if (firstIndex >= 0 && firstIndex < formData.priorities.length) {
                const firstPriority = `"${formData.priorities[firstIndex].substring(0, 30)}${formData.priorities[firstIndex].length > 30 ? '...' : ''}"`;
                
                if (secondNum) {
                  const secondIndex = parseInt(secondNum) - 1;
                  if (secondIndex >= 0 && secondIndex < formData.priorities.length) {
                    const secondPriority = `"${formData.priorities[secondIndex].substring(0, 30)}${formData.priorities[secondIndex].length > 30 ? '...' : ''}"`;
                    return `${term} ${firstPriority} and ${secondPriority}`;
                  }
                }
                return `${term} ${firstPriority}`;
              }
              return match;
            });
            
            return enhancedConflict;
          });
        }

        // Process and enhance the candidates data to include alignment info if not present
        const enhancedCandidates = data.candidates?.map(candidate => {
          if (!candidate.alignment) {
            // If the server didn't provide alignment data, add placeholder
            return {
              ...candidate,
              alignment: {
                type: 'unknown',
                supportedPriorities: [],
                conflictingPriorities: []
              }
            };
          }
          return candidate;
        }) || [];

        // When new analysis comes in, don't automatically show recommendations
        // until the user clicks to continue
        if (submitCount > 0) {
          setShowRecommendations(false);
        }

        return {
          mode: data.mode,
          analysis: formattedAnalysis,
          mappedPriorities,
          conflictingPriorities,
          candidates: enhancedCandidates,
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

  const handleContinue = () => {
    setShowRecommendations(true);
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
    showRecommendations,
    feedbackPriorities, // Expose feedbackPriorities for use in the PDF
    handleSubmit,
    handleFeedback,
    handleContinue,
    updateApiStatus
  };
}
