import { useState } from 'react';
import { useMode, Mode } from '@/contexts/ModeContext';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus, RecommendationsData, PriorityMapping, ApiResponse } from '@/types/api';
import { createApiService } from './priorities-analysis/api-service';

export interface FormData {
  mode: Mode;
  zipCode: string;
  priorities: string[];
}

export function usePrioritiesAnalysis() {
  const { mode } = useMode();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    googleCivic: 'loading',
    fec: 'loading',
  });
  const [feedbackPriorities, setFeedbackPriorities] = useState<string[]>([]);

  const toast = useToast();
  const apiService = createApiService(toast);

  const handleSubmit = async (values: VoterFormValues) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      let recommendationsData: RecommendationsData;
      
      if (mode === 'demo') {
        // Use mock data for November 2024
        recommendationsData = {
          analysis: "Based on your priorities, we've identified key matches...",
          priorityMappings: [
            {
              userPriority: "Healthcare",
              mappedTerms: ["Medicare for All", "Public Option"]
            },
            {
              userPriority: "Education",
              mappedTerms: ["Student Debt Relief", "Free College"]
            }
          ],
          recommendations: [
            {
              type: "Presidential Candidate",
              title: "Candidate A",
              description: "Strong alignment with healthcare and education priorities",
              match: "best",
              details: [
                "Supports Medicare for All",
                "Advocates for free public college"
              ]
            }
          ]
        };
      } else {
        // Use real API data for current elections
        const response: ApiResponse<RecommendationsData> = await apiService.analyzePriorities(values, feedbackPriorities);
        if (!response.ok) {
          throw new Error(response.error || 'Failed to fetch recommendations');
        }
        if (!response.data) {
          throw new Error('No data received from API');
        }
        recommendationsData = response.data;
      }
      
      setRecommendations(recommendationsData);
      setFormData({ mode, zipCode: values.zipCode, priorities: values.priorities });
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (feedback: string) => {
    setFeedbackPriorities([...feedbackPriorities, feedback]);
  };

  const handleContinue = () => {
    setShowRecommendations(true);
  };

  const updateApiStatus = (status: ApiStatus) => {
    setApiStatus(status);
  };

  const refetch = () => {
    if (formData) {
      handleSubmit({ zipCode: formData.zipCode, priorities: formData.priorities });
    }
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
    handleSubmit,
    handleFeedback,
    handleContinue,
    updateApiStatus,
    feedbackPriorities,
  };
}
