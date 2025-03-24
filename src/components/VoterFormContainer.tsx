
import { useState, useEffect } from 'react';
import { VoterForm } from '@/components/VoterForm';
import { PrioritiesFeedback } from '@/components/PrioritiesFeedback';
import { LoadingProgress } from '@/components/LoadingProgress';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/hooks/use-priorities-analysis';
import { initializeModel } from '@/utils/transformersMapping';

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
  
  // Initialize the ML model when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        await initializeModel();
        console.log('ML model initialized successfully');
      } catch (error) {
        console.error('Error initializing ML model:', error);
      }
    };
    
    loadModel();
  }, []);

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
          nuancedMappings={recommendations.nuancedMappings}
          onFeedbackSubmit={onFeedbackSubmit}
          onContinue={onContinue}
        />
      )}
    </>
  );
};
