
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus } from '@/components/ApiStatusChecker';

export interface PriorityMapping {
  userConcern: string;
  mappedTerms: string[];
}

export interface RecommendationsData {
  mode: string;
  analysis: string;
  mappedPriorities: string[];
  conflictingPriorities?: string[];
  priorityMappings?: PriorityMapping[];
  nuancedMappings?: Record<string, Record<string, any>>;
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
        
        // Add a retry mechanism for the API call
        let attempts = 0;
        const maxAttempts = 2;
        let data, error;
        
        while (attempts < maxAttempts) {
          const response = await supabase.functions.invoke('analyze-priorities', {
            body: { 
              mode: formData.mode, 
              zipCode: formData.zipCode,
              priorities: allPriorities,
              improveMatching: true
            }
          });
          
          data = response.data;
          error = response.error;
          
          if (!error) break;
          attempts++;
          
          // Wait before retrying
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

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

          // Show appropriate error messages based on API status
          if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Issue",
              description: "Google Civic API key is not configured. Some features may be limited.",
              variant: "default", // Changed to default to be less alarming
            });
          } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
            toast({
              title: "API Connection Issue",
              description: "Could not connect to Google Civic API. Using cached data where possible.",
              variant: "default", // Changed to default
            });
          } else if (data.apiStatuses.googleCivic === 'CONNECTED') {
            toast({
              title: "API Connected",
              description: "Successfully connected to Google Civic API.",
              variant: "default",
            });
          }
          
          // Handle FEC API status messages similarly
          if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Note",
              description: "FEC API key is not configured. Some candidate data may be limited.",
              variant: "default", // Changed to default
            });
          } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
            toast({
              title: "API Connection Note",
              description: "Limited connection to FEC API. Using alternative data sources.",
              variant: "default", // Changed to default
            });
          } else if (data.apiStatuses.fec === 'FEC_API_UNAUTHORIZED') {
            toast({
              title: "API Authorization Issue",
              description: "FEC API key needs to be renewed. Some features may be limited.",
              variant: "default", // Changed to default
            });
          }
        }

        // Process unmapped terms
        if (data.unmappedTerms && data.unmappedTerms.length > 0) {
          console.log('Unmapped terms detected:', data.unmappedTerms);
          saveUnmappedTerms(data.unmappedTerms);
        }

        // Format analysis text for better readability
        let formattedAnalysis = data.analysis;
        if (formattedAnalysis && !formattedAnalysis.includes('\n\n')) {
          const sentences = formattedAnalysis.split(/(?<=[.!?])\s+/);
          if (sentences.length >= 4) {
            const paraLength = Math.ceil(sentences.length / 3);
            let newAnalysis = '';
            for (let i = 0; i < sentences.length; i += paraLength) {
              const paragraph = sentences.slice(i, i + paraLength).join(' ');
              newAnalysis += paragraph + '\n\n';
            }
            formattedAnalysis = newAnalysis.trim();
          }
        }

        const mappedPriorities = data.mappedPriorities || [];
        
        let conflictingPriorities = data.conflictingPriorities || [];
        
        // Enhance conflicting priorities with references to the original text
        if (conflictingPriorities.length > 0 && formData.priorities.length > 0) {
          conflictingPriorities = conflictingPriorities.map(conflict => {
            let enhancedConflict = conflict;
            
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

        // Ensure all candidates have alignment information
        const enhancedCandidates = data.candidates?.map(candidate => {
          if (!candidate.alignment) {
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

        // Create priority mappings for display
        const priorityMappings: PriorityMapping[] = [];
        
        // Process the main priorities
        if (formData.priorities.length > 0) {
          formData.priorities.forEach((priority, index) => {
            if (!priority.trim()) return; // Skip empty priorities
            
            const mappedTerms = data.priorityToTermsMap?.[index] || [];
            
            const terms = mappedTerms.length > 0 ? mappedTerms : 
                         data.mappedPriorities?.slice(0, 2) || [];
            
            priorityMappings.push({
              userConcern: priority,
              mappedTerms: terms.map((term: string) => {
                return term.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim();
              })
            });
          });
        }

        // Process feedback priorities
        if (feedbackPriorities.length > 0) {
          feedbackPriorities.forEach((priority, index) => {
            if (!priority.trim()) return; // Skip empty feedback
            
            const mappedTerms = data.feedbackToTermsMap?.[index] || [];
            
            const terms = mappedTerms.length > 0 ? mappedTerms :
                        data.mappedPriorities?.slice(0, 2) || [];
            
            priorityMappings.push({
              userConcern: priority,
              mappedTerms: terms.map((term: string) => {
                return term.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim();
              })
            });
          });
        }

        // Reset showRecommendations state when a new analysis is submitted
        if (submitCount > 0) {
          setShowRecommendations(false);
        }

        return {
          mode: data.mode,
          analysis: formattedAnalysis,
          mappedPriorities,
          conflictingPriorities,
          priorityMappings,
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
    retry: 2, // Increased from 1 to 2
    refetchOnWindowFocus: false
  });

  const handleSubmit = (values: VoterFormValues) => {
    console.log('Form submitted with values:', values);
    setFormData(values);
    setFeedbackPriorities([]); // Reset feedback when new form is submitted
    setSubmitCount(prev => prev + 1);
  };

  const handleFeedback = (feedback: string) => {
    if (!feedback.trim()) return; // Skip empty feedback
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
    feedbackPriorities,
    handleSubmit,
    handleFeedback,
    handleContinue,
    updateApiStatus
  };
}
