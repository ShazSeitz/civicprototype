
import { useState } from 'react';
import { VoterForm } from '@/components/VoterForm';
import { LoadingProgress } from '@/components/LoadingProgress';
import { ModelInitializer } from '@/components/priorities/ModelInitializer';
import { FeedbackSection } from '@/components/priorities/FeedbackSection';
import { RecommendationsViewer } from '@/components/priorities/RecommendationsViewer';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/hooks/priorities-analysis/types';

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
  const [modelInitialized, setModelInitialized] = useState(false);
  
  const handleModelInitialized = (success: boolean) => {
    setModelInitialized(success);
  };

  return (
    <>
      <ModelInitializer onInitialized={handleModelInitialized} />
      
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

      {recommendations && (
        <>
          <FeedbackSection 
            recommendations={recommendations}
            show={!!showFeedback}
            onFeedbackSubmit={onFeedbackSubmit}
            onContinue={onContinue}
          />
          
          <RecommendationsViewer 
            recommendations={recommendations}
            show={showRecommendations}
          />
        </>
      )}
    </>
  );
};
