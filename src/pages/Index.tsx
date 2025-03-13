
import { useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ApiStatusChecker } from '@/components/ApiStatusChecker';
import { VoterFormContainer } from '@/components/VoterFormContainer';
import { RecommendationsList } from '@/components/RecommendationsList';
import { ErrorAlert } from '@/components/ErrorAlert';
import { usePrioritiesAnalysis } from '@/hooks/use-priorities-analysis';

const Index = () => {
  const {
    recommendations,
    isLoading,
    isError,
    error,
    refetch,
    apiStatus,
    handleSubmit,
    handleFeedback,
    updateApiStatus
  } = usePrioritiesAnalysis();
  
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
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
            onSubmit={handleSubmit}
          />
          
          {isError && (
            <ErrorAlert error={error} onRetry={refetch} />
          )}
          
          <div ref={recommendationsRef}>
            {recommendations && (
              <RecommendationsList 
                recommendations={recommendations} 
                onFeedbackSubmit={handleFeedback}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
