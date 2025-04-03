
import { useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus } from '@/components/ApiStatusChecker';
import { RecommendationsData } from './priorities-analysis/types';
import { initialState, prioritiesReducer } from './priorities-analysis/priorities-reducer';
import { createApiService } from './priorities-analysis/api-service';

export type { RecommendationsData, PriorityMapping } from './priorities-analysis/types';

export function usePrioritiesAnalysis() {
  const [state, dispatch] = useReducer(prioritiesReducer, initialState);
  const toast = useToast();
  const apiService = createApiService(toast);
  
  const { 
    data: recommendations, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['recommendations', state.formData, state.feedbackPriorities, state.submitCount],
    queryFn: async () => {
      if (!state.formData) return null;
      return apiService.analyzePriorities(state.formData, state.feedbackPriorities);
    },
    enabled: Boolean(state.formData),
    retry: 2,
    refetchOnWindowFocus: false
  });

  const handleSubmit = (values: VoterFormValues) => {
    console.log('Form submitted with values:', values);
    dispatch({ type: 'SET_FORM_DATA', payload: values });
    dispatch({ type: 'INCREMENT_SUBMIT' });
  };

  const handleFeedback = (feedback: string) => {
    if (!feedback.trim()) return; // Skip empty feedback
    dispatch({ type: 'ADD_FEEDBACK', payload: feedback });
    dispatch({ type: 'INCREMENT_SUBMIT' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SHOW_RECOMMENDATIONS', payload: true });
  };

  const updateApiStatus = (newStatus: { googleCivic: ApiStatus; fec: ApiStatus }) => {
    dispatch({ type: 'UPDATE_API_STATUS', payload: newStatus });
  };

  return {
    formData: state.formData,
    recommendations,
    isLoading,
    isError,
    error,
    refetch,
    apiStatus: state.apiStatus,
    showRecommendations: state.showRecommendations,
    feedbackPriorities: state.feedbackPriorities,
    handleSubmit,
    handleFeedback,
    handleContinue,
    updateApiStatus
  };
}
