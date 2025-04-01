
import { useState, useEffect, useRef } from 'react';
import { VoterForm } from '@/components/VoterForm';
import { PrioritiesFeedback } from '@/components/PrioritiesFeedback';
import { LoadingProgress } from '@/components/LoadingProgress';
import { CandidateSection } from '@/components/CandidateSection';
import { BallotMeasuresSection } from '@/components/BallotMeasuresSection';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/hooks/use-priorities-analysis';
import { initializeModel } from '@/utils/transformersMapping';

interface VoterFormContainerProps {
  isLoading: boolean;
  recommendations: RecommendationsData | null;
  showRecommendations: boolean;
  formValues: VoterFormValues | null;
  onSubmit: (values: VoterFormValues) => void;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
}

export const VoterFormContainer = ({ 
  isLoading,
  recommendations,
  showRecommendations,
  formValues,
  onSubmit,
  onFeedbackSubmit,
  onContinue
}: VoterFormContainerProps) => {
  // Only show feedback if recommendations exist but are not showing yet
  const showFeedback = recommendations && !showRecommendations;
  const feedbackRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-scroll to feedback when it appears
  useEffect(() => {
    if (showFeedback && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showFeedback]);

  // Auto-scroll to recommendations when they appear
  useEffect(() => {
    if (showRecommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showRecommendations]);

  return (
    <>
      {isLoading && (
        <LoadingProgress 
          message="Analyzing your priorities and generating recommendations..." 
          isLoading={isLoading}
        />
      )}
      
      <VoterForm 
        onSubmit={onSubmit} 
        isLoading={isLoading}
        initialValues={formValues}
      />

      {showFeedback && (
        <div ref={feedbackRef}>
          <PrioritiesFeedback 
            analysis={recommendations.analysis}
            mappedPriorities={recommendations.mappedPriorities || []}
            conflictingPriorities={recommendations.conflictingPriorities || []}
            nuancedMappings={recommendations.nuancedMappings}
            onFeedbackSubmit={onFeedbackSubmit}
            onContinue={onContinue}
          />
        </div>
      )}

      {recommendations && showRecommendations && (
        <div ref={recommendationsRef}>
          {recommendations.candidates && recommendations.candidates.length > 0 && (
            <CandidateSection candidates={recommendations.candidates} />
          )}
          
          {recommendations.ballotMeasures && recommendations.ballotMeasures.length > 0 && (
            <BallotMeasuresSection ballotMeasures={recommendations.ballotMeasures} />
          )}
        </div>
      )}
    </>
  );
};
