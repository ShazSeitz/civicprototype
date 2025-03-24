
import { useState } from 'react';
import { VoterForm } from '@/components/VoterForm';
import { PrioritiesFeedback } from '@/components/PrioritiesFeedback';
import { LoadingProgress } from '@/components/LoadingProgress';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/hooks/use-priorities-analysis';

interface VoterFormContainerProps {
  isLoading: boolean;
  recommendations: RecommendationsData | null;
  showRecommendations: boolean;
  onSubmit: (values: VoterFormValues) => void;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
}

export const VoterFormContainer = ({ 
  isLoading,
  recommendations,
  showRecommendations,
  onSubmit,
  onFeedbackSubmit,
  onContinue
}: VoterFormContainerProps) => {
  // Show form if no recommendations, or priorities feedback if recommendations but not showing yet
  const showForm = !recommendations;
  const showFeedback = recommendations && !showRecommendations;

  return (
    <>
      {isLoading && (
        <LoadingProgress 
          message="Analyzing your priorities and generating recommendations..." 
          isLoading={isLoading}
        />
      )}
      
      {showForm && (
        <VoterForm 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
        />
      )}

      {showFeedback && (
        <PrioritiesFeedback 
          analysis={recommendations.analysis}
          mappedPriorities={recommendations.mappedPriorities || []}
          conflictingPriorities={recommendations.conflictingPriorities || []}
          onFeedbackSubmit={onFeedbackSubmit}
          onContinue={onContinue}
        />
      )}
    </>
  );
};
