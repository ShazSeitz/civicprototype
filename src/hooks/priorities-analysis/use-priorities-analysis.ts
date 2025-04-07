import { useState } from 'react';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/types/api';
import { createMockApiService } from './mock-api-service';
import { useToast } from '@/hooks/use-toast';

export function usePrioritiesAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [feedbackPriorities, setFeedbackPriorities] = useState<string[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const { toast } = useToast();

  const apiService = createMockApiService(toast);

  const analyzePriorities = async (formData: VoterFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiService.analyzePriorities(formData, feedbackPriorities);
      if (response.ok && response.data) {
        setRecommendations(response.data);
        setSubmitCount(prev => prev + 1);
      } else {
        throw new Error(response.error || 'Failed to analyze priorities');
      }
    } catch (error: any) {
      console.error('Error analyzing priorities:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while analyzing your priorities',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeedbackPriority = (priority: string) => {
    setFeedbackPriorities(prev => [...prev, priority]);
  };

  const removeFeedbackPriority = (priority: string) => {
    setFeedbackPriorities(prev => prev.filter(p => p !== priority));
  };

  return {
    isLoading,
    recommendations,
    feedbackPriorities,
    submitCount,
    analyzePriorities,
    addFeedbackPriority,
    removeFeedbackPriority
  };
}
