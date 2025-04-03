
import { supabase } from '@/integrations/supabase/client';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from './types';
import { useToast } from '@/hooks/use-toast';
import { formatAnalysisText, enhanceConflictingPriorities, createPriorityMappings } from './format-util';
import { createUnmappedTermsHandler } from './unmapped-terms-util';

export const createApiService = (toast: ReturnType<typeof useToast>) => {
  const saveUnmappedTerms = createUnmappedTermsHandler(toast);
  
  const analyzePriorities = async (
    formData: VoterFormValues,
    feedbackPriorities: string[]
  ): Promise<RecommendationsData> => {
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
        toast.toast({
          title: "Error",
          description: error.message || 'Failed to analyze content',
          variant: "destructive",
        });
        throw new Error(error.message || 'Failed to analyze content');
      }

      if (!data) {
        throw new Error('No data returned from analysis');
      }

      handleApiStatuses(data.apiStatuses, toast);

      // Process unmapped terms
      if (data.unmappedTerms && data.unmappedTerms.length > 0) {
        console.log('Unmapped terms detected:', data.unmappedTerms);
        saveUnmappedTerms(data.unmappedTerms);
      }

      // Format analysis text for better readability
      const formattedAnalysis = formatAnalysisText(data.analysis);

      const mappedPriorities = data.mappedPriorities || [];
      
      // Enhance conflicting priorities with references to the original text
      const conflictingPriorities = enhanceConflictingPriorities(
        data.conflictingPriorities || [],
        formData.priorities
      );

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
      const priorityMappings = createPriorityMappings(
        formData.priorities,
        feedbackPriorities,
        data.priorityToTermsMap,
        data.feedbackToTermsMap,
        data.mappedPriorities
      );

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
      toast.toast({
        title: "Error",
        description: err.message || 'An error occurred while analyzing priorities',
        variant: "destructive",
      });
      throw err;
    }
  };

  return { analyzePriorities };
};

// Handle API status notifications
function handleApiStatuses(apiStatuses: any, toast: ReturnType<typeof useToast>) {
  if (!apiStatuses) return;
  
  // Show appropriate error messages based on API status
  if (apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
    toast.toast({
      title: "API Configuration Issue",
      description: "Google Civic API key is not configured. Some features may be limited.",
      variant: "default",
    });
  } else if (apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
    toast.toast({
      title: "API Connection Issue",
      description: "Could not connect to Google Civic API. Using cached data where possible.",
      variant: "default",
    });
  } else if (apiStatuses.googleCivic === 'CONNECTED') {
    toast.toast({
      title: "API Connected",
      description: "Successfully connected to Google Civic API.",
      variant: "default",
    });
  }
  
  // Handle FEC API status messages similarly
  if (apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
    toast.toast({
      title: "API Configuration Note",
      description: "FEC API key is not configured. Some candidate data may be limited.",
      variant: "default",
    });
  } else if (apiStatuses.fec === 'FEC_API_ERROR') {
    toast.toast({
      title: "API Connection Note",
      description: "Limited connection to FEC API. Using alternative data sources.",
      variant: "default",
    });
  } else if (apiStatuses.fec === 'FEC_API_UNAUTHORIZED') {
    toast.toast({
      title: "API Authorization Issue",
      description: "FEC API key needs to be renewed. Some features may be limited.",
      variant: "default",
    });
  }
}
