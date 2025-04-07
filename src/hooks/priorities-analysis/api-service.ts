import { supabase } from '@/integrations/supabase/client';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData, ApiResponse } from '@/types/api';

export function createApiService(toast: any) {
  const analyzePriorities = async (
    formData: VoterFormValues,
    feedbackPriorities: string[]
  ): Promise<ApiResponse<RecommendationsData>> => {
    try {
      const allPriorities = [...formData.priorities, ...feedbackPriorities];
      console.log('Submitting form data:', { ...formData, priorities: allPriorities });

      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: {
          zipCode: formData.zipCode,
          priorities: allPriorities
        }
      });

      if (error) {
        console.error('Error from analyze-priorities:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to analyze content',
          variant: "destructive",
        });
        return {
          ok: false,
          error: error.message || 'Failed to analyze content',
        };
      }

      if (!data) {
        throw new Error('No data received from analyze-priorities');
      }

      console.log('Raw response from analyze-priorities:', data);

      const mappedPriorities = allPriorities.map(priority => ({
        userPriority: priority,
        mappedTerms: data.mappings?.[priority] || []
      }));

      const priorityMappings = allPriorities.map(priority => ({
        userPriority: priority,
        mappedTerms: data.mappings?.[priority] || []
      }));

      const enhancedCandidates = (data.candidates || []).map(candidate => ({
        ...candidate,
        priorityMatches: mappedPriorities.filter(priority => 
          candidate.stances.some(stance => 
            stance.topics.some(topic => 
              priority.mappedTerms.includes(topic)
            )
          )
        )
      }));

      const conflictingPriorities = (data.conflictingPriorities || []).map(conflict => ({
        priority1: conflict.priority1,
        priority2: conflict.priority2,
        reason: conflict.reason || 'These priorities may have opposing goals'
      }));

      return {
        ok: true,
        data: {
          analysis: data.analysis || '',
          priorityMappings,
          recommendations: data.recommendations || [],
          mode: data.mode,
          mappedPriorities,
          conflictingPriorities,
          candidates: enhancedCandidates,
          ballotMeasures: data.ballotMeasures || [],
          draftEmails: data.draftEmails || [],
          interestGroups: data.interestGroups || [],
          petitions: data.petitions || []
        }
      };
    } catch (err: any) {
      console.error('Error in analyze-priorities:', err);
      toast({
        title: 'Error',
        description: err.message || 'An error occurred while analyzing priorities',
        variant: "destructive",
      });
      return {
        ok: false,
        error: err.message || 'An error occurred while analyzing priorities',
      };
    }
  };

  return {
    analyzePriorities,
  };
}
