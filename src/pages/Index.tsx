
import { useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ApiStatusChecker } from '@/components/ApiStatusChecker';
import { VoterFormContainer } from '@/components/VoterFormContainer';
import { RecommendationsList } from '@/components/RecommendationsList';
import { ErrorAlert } from '@/components/ErrorAlert';
import { usePrioritiesAnalysis } from '@/hooks/use-priorities-analysis';
import { ShareRecommendations } from '@/components/ShareRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Enhanced scroll behavior - scroll when recommendations are available
  useEffect(() => {
    if (recommendations && showRecommendations && priorityMappingsRef.current) {
      // Use a small timeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        priorityMappingsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [recommendations, showRecommendations]);

  // Function to render paragraphed analysis
  const renderAnalysis = (analysis: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = analysis?.split('\n\n') || [];
    
    if (paragraphs.length > 1) {
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 text-left">{paragraph}</p>
      ));
    }
    
    // If no double newlines, render as a single paragraph
    return <p className="text-left">{analysis}</p>;
  };

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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-left">Your Recommendations</h2>
                <ShareRecommendations 
                  recommendationsData={recommendations} 
                  zipCode={formData?.zipCode}
                  userPriorities={formData?.priorities}
                  userClarifications={feedbackPriorities}
                />
              </div>
              
              {/* Priority mapping analysis card */}
              <Card className="animate-fade-up">
                <CardHeader>
                  <CardTitle className="text-left">Analysis of Your Priorities</CardTitle>
                  <CardDescription className="text-left">
                    We have mapped your priorities to policy terms to provide the best recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Display priorities mapping in a table format */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 font-bold">Your Priorities</TableHead>
                        <TableHead className="w-1/2 font-bold">Policy Terms</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.priorityMappings && recommendations.priorityMappings.map((mapping, index) => (
                        <TableRow key={index} className="border">
                          <TableCell className="text-left align-top font-medium">{mapping.userConcern}</TableCell>
                          <TableCell className="text-left">{mapping.mappedTerms.join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Display the prose analysis after the table */}
                  <div className="prose prose-sm text-left mt-6">
                    {renderAnalysis(recommendations.analysis)}
                  </div>
                </CardContent>
              </Card>
              
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
