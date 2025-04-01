
import { useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ApiStatusChecker } from '@/components/ApiStatusChecker';
import { VoterFormContainer } from '@/components/VoterFormContainer';
import { RecommendationsList } from '@/components/RecommendationsList';
import { ErrorAlert } from '@/components/ErrorAlert';
import { usePrioritiesAnalysis } from '@/hooks/use-priorities-analysis';
import { ShareRecommendations } from '@/components/ShareRecommendations';

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
  
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recommendations && showRecommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations, showRecommendations]);

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
          
          <div ref={recommendationsRef}>
            {recommendations && showRecommendations && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-left">Your Recommendations</h2>
                  <ShareRecommendations 
                    recommendationsData={recommendations} 
                    zipCode={formData?.zipCode}
                    userPriorities={formData?.priorities}
                    userClarifications={feedbackPriorities}
                  />
                </div>
                
                <RecommendationsList 
                  recommendations={recommendations} 
                  onFeedbackSubmit={handleFeedback}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
