
import { useRef } from 'react';
import Navbar from '../components/Navbar';
import { ApiStatusChecker } from '@/components/ApiStatusChecker';
import { VoterFormContainer } from '@/components/VoterFormContainer';
import { RecommendationsList } from '@/components/RecommendationsList';
import { ErrorAlert } from '@/components/ErrorAlert';
import { usePrioritiesAnalysis } from '@/hooks/use-priorities-analysis';
import { AnalysisCard } from '@/components/priorities/AnalysisCard';
import { RecommendationsHeader } from '@/components/priorities/RecommendationsHeader';

const Index = () => {
  const {
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
    feedbackPriorities
  } = usePrioritiesAnalysis();
  
  const priorityMappingsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <ApiStatusChecker 
            initialGoogleCivicStatus={apiStatus.googleCivic}
            initialFecStatus={apiStatus.fec}
            onStatusChange={updateApiStatus}
          />
          
          <VoterFormContainer 
            isLoading={isLoading}
            recommendations={recommendations}
            showRecommendations={showRecommendations}
            formValues={formData}
            onSubmit={handleSubmit}
            onFeedbackSubmit={handleFeedback}
            onContinue={handleContinue}
          />
          
          {isError && (
            <ErrorAlert error={error} onRetry={refetch} />
          )}
          
          {recommendations && showRecommendations && (
            <div ref={priorityMappingsRef} className="space-y-6 mt-8">
              <RecommendationsHeader
                recommendationsData={recommendations}
                zipCode={formData?.zipCode}
                userPriorities={formData?.priorities}
                userClarifications={feedbackPriorities}
              />
              
              {/* Priority mapping analysis card */}
              <AnalysisCard
                analysis={recommendations.analysis}
                priorityMappings={recommendations.priorityMappings}
              />
              
              <RecommendationsList 
                recommendations={recommendations} 
                onFeedbackSubmit={handleFeedback}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
