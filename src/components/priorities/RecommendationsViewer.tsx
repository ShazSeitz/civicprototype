
import { useRef, useEffect } from 'react';
import { CandidateSection } from '@/components/CandidateSection';
import { BallotMeasuresSection } from '@/components/BallotMeasuresSection';
import { RecommendationsData } from '@/hooks/priorities-analysis/types';

interface RecommendationsViewerProps {
  recommendations: RecommendationsData;
  show: boolean;
}

export const RecommendationsViewer = ({ recommendations, show }: RecommendationsViewerProps) => {
  const recommendationsRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to recommendations when they appear
  useEffect(() => {
    if (show && recommendationsRef.current) {
      // Add small delay to ensure DOM is updated
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div ref={recommendationsRef} className="space-y-8">
      {recommendations.candidates && recommendations.candidates.length > 0 && (
        <CandidateSection candidates={recommendations.candidates} />
      )}
      
      {recommendations.ballotMeasures && recommendations.ballotMeasures.length > 0 && (
        <BallotMeasuresSection ballotMeasures={recommendations.ballotMeasures} />
      )}
    </div>
  );
};
