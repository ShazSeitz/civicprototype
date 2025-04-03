
import { useRef, useEffect } from 'react';
import { PrioritiesFeedback } from '@/components/PrioritiesFeedback';
import { RecommendationsData } from '@/hooks/priorities-analysis/types';

interface FeedbackSectionProps {
  recommendations: RecommendationsData;
  show: boolean;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
}

export const FeedbackSection = ({ 
  recommendations, 
  show,
  onFeedbackSubmit,
  onContinue
}: FeedbackSectionProps) => {
  const feedbackRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to feedback when it appears
  useEffect(() => {
    if (show && feedbackRef.current) {
      // Add small delay to ensure DOM is updated
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
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
  );
};
