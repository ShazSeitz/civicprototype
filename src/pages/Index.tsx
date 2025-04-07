import { useRef } from 'react';
import Navbar from '../components/Navbar';
import { VoterFormContainer } from '@/components/VoterFormContainer';
import { RecommendationsList } from '@/components/RecommendationsList';
import { usePrioritiesAnalysis } from '@/hooks/priorities-analysis/use-priorities-analysis';
import { AnalysisCard } from '@/components/priorities/AnalysisCard';
import { RecommendationsHeader } from '@/components/priorities/RecommendationsHeader';
import { useMode } from '@/contexts/ModeContext';

const Index = () => {
  const { mode } = useMode();
  const {
    isLoading,
    recommendations,
    feedbackPriorities,
    submitCount,
    analyzePriorities,
    addFeedbackPriority,
    removeFeedbackPriority
  } = usePrioritiesAnalysis();
  
  const priorityMappingsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: { zipCode: string; priorities: string[] }) => {
    await analyzePriorities(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <VoterFormContainer 
            isLoading={isLoading}
            recommendations={recommendations}
            showRecommendations={!!recommendations}
            formValues={{}}
            onSubmit={handleSubmit}
            onFeedbackSubmit={addFeedbackPriority}
            onContinue={() => {}}
          />

          {recommendations && (
            <div className="space-y-8 animate-fade-up">
              <RecommendationsHeader
                recommendationsData={recommendations}
                zipCode={recommendations.zipCode}
                userPriorities={recommendations.analysis.priorities}
                userClarifications={feedbackPriorities}
              />
              
              <AnalysisCard
                analysis={recommendations.analysis}
                priorityMappings={recommendations.mappedPriorities}
              />
              
              <RecommendationsList 
                recommendations={recommendations} 
                onFeedbackSubmit={addFeedbackPriority}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
