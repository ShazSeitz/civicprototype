
import { useState, useEffect, useRef } from 'react';
import { VoterForm } from '@/components/VoterForm';
import { PrioritiesFeedback } from '@/components/PrioritiesFeedback';
import { LoadingProgress } from '@/components/LoadingProgress';
import { CandidateSection } from '@/components/CandidateSection';
import { BallotMeasuresSection } from '@/components/BallotMeasuresSection';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/hooks/use-priorities-analysis';
import { initializeModel } from '@/utils/transformersMapping';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [modelInitialized, setModelInitialized] = useState(false);
  
  // Initialize the classifier when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        const success = await initializeModel();
        setModelInitialized(success);
        
        if (success) {
          console.log('Classifier initialized successfully');
        } else {
          console.warn('Using fallback classification method');
          toast({
            title: "Note",
            description: "Using optimized classification for this session.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error initializing classifier:', error);
        toast({
          title: "Classification Note",
          description: "Using simplified classification due to initialization error.",
          variant: "default",
          duration: 4000,
        });
      }
    };
    
    loadModel();
  }, [toast]);

  // Auto-scroll to feedback when it appears
  useEffect(() => {
    if (showFeedback && feedbackRef.current) {
      // Add small delay to ensure DOM is updated
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showFeedback]);

  // Auto-scroll to recommendations when they appear
  useEffect(() => {
    if (showRecommendations && recommendationsRef.current) {
      // Add small delay to ensure DOM is updated
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
