
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import { VoterForm } from '@/components/VoterForm';
import { RecommendationsList } from '@/components/RecommendationsList';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { VoterFormValues } from '@/schemas/voterFormSchema';

const Index = () => {
  const [formData, setFormData] = useState<VoterFormValues | null>(null);
  const [feedbackPriorities, setFeedbackPriorities] = useState<string[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<{
    googleCivic: 'unknown' | 'connected' | 'error' | 'not_configured';
    fec: 'unknown' | 'connected' | 'error' | 'not_configured';
  }>({
    googleCivic: 'unknown',
    fec: 'unknown'
  });
  const { toast } = useToast();
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { 
    data: recommendations, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['recommendations', formData, feedbackPriorities, submitCount],
    queryFn: async () => {
      if (!formData) return null;
      
      try {
        const allPriorities = [...formData.priorities, ...feedbackPriorities];
        console.log('Submitting form data:', { ...formData, priorities: allPriorities });
        
        const { data, error } = await supabase.functions.invoke('analyze-priorities', {
          body: { 
            mode: formData.mode, 
            zipCode: formData.zipCode,
            priorities: allPriorities 
          }
        });

        if (error) {
          console.error('Supabase function error:', error);
          toast({
            title: "Error",
            description: error.message || 'Failed to analyze content',
            variant: "destructive",
          });
          throw new Error(error.message || 'Failed to analyze content');
        }

        if (!data) {
          throw new Error('No data returned from analysis');
        }

        if (data.apiStatuses) {
          setApiStatus({
            googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                         data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown',
            fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
                 data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
                 data.apiStatuses.fec === 'FEC_API_ERROR' ? 'error' : 'unknown'
          });

          if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Issue",
              description: "Google Civic API key is not configured. Please add your API key in Supabase.",
              variant: "destructive",
            });
            throw new Error('Google Civic API is not configured. Please add your API key.');
          } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
            toast({
              title: "API Connection Error",
              description: "Failed to connect to Google Civic API. Please check your API key and try again.",
              variant: "destructive",
            });
            throw new Error('Failed to connect to Google Civic API. Please check your API key and try again.');
          } else if (data.apiStatuses.googleCivic === 'CONNECTED') {
            toast({
              title: "API Connected",
              description: "Successfully connected to Google Civic API.",
              variant: "default",
            });
          }
          
          if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
            toast({
              title: "API Configuration Issue",
              description: "FEC API key is not configured. Please add your API key in Supabase.",
              variant: "destructive",
            });
            throw new Error('FEC API is not configured. Please add your API key.');
          } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
            toast({
              title: "API Connection Error",
              description: "Failed to connect to FEC API. Please check your API key and try again.",
              variant: "destructive",
            });
            throw new Error('Failed to connect to FEC API. Please check your API key and try again.');
          }
        }

        if (data.unmappedTerms && data.unmappedTerms.length > 0) {
          console.log('Unmapped terms detected:', data.unmappedTerms);
          saveUnmappedTerms(data.unmappedTerms);
        }

        return {
          mode: data.mode,
          analysis: data.analysis,
          candidates: data.candidates || [],
          ballotMeasures: data.ballotMeasures || [],
          draftEmails: data.draftEmails || [],
          interestGroups: data.interestGroups || [],
          petitions: data.petitions || []
        };
      } catch (err: any) {
        console.error('Error in analyze-priorities:', err);
        toast({
          title: "Error",
          description: err.message || 'An error occurred while analyzing priorities',
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: Boolean(formData),
    retry: 1,
    refetchOnWindowFocus: false
  });

  const saveUnmappedTerms = async (terms: string[]) => {
    try {
      console.log('Unmapped terms that need mapping:', terms);
      toast({
        title: "Unmapped Terms Detected",
        description: `${terms.length} priorities couldn't be mapped to existing terms and have been logged.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving unmapped terms:', error);
    }
  };

  useEffect(() => {
    if (recommendations && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [recommendations]);

  const onSubmit = (values: VoterFormValues) => {
    console.log('Form submitted with values:', values);
    setFormData(values);
    setFeedbackPriorities([]); // Reset feedback when new form is submitted
    setSubmitCount(prev => prev + 1);
  };

  const handleFeedback = (feedback: string) => {
    setFeedbackPriorities(prev => [...prev, feedback]);
    setSubmitCount(prev => prev + 1);
  };

  const checkApiConnectivity = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: { checkApiOnly: true }
      });

      if (error) {
        console.error('API check error:', error);
        toast({
          title: "Error",
          description: error.message || 'Failed to check API connectivity',
          variant: "destructive",
        });
        return;
      }

      if (data && data.apiStatuses) {
        setApiStatus({
          googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                       data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                       data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown',
          fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
               data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
               data.apiStatuses.fec === 'FEC_API_ERROR' ? 'error' : 'unknown'
        });

        // Toast notifications for Google Civic API
        if (data.apiStatuses.googleCivic === 'CONNECTED') {
          toast({
            title: "Google Civic API",
            description: "Successfully connected to the API.",
            variant: "default",
          });
        } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
          toast({
            title: "Google Civic API",
            description: "API key not configured. Please add your API key.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
          toast({
            title: "Google Civic API",
            description: "Connection error. Please check your API key.",
            variant: "destructive",
          });
        }
        
        // Toast notifications for FEC API
        if (data.apiStatuses.fec === 'CONNECTED') {
          toast({
            title: "FEC API",
            description: "Successfully connected to the API.",
            variant: "default",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
          toast({
            title: "FEC API",
            description: "API key not configured. Please add your API key.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
          toast({
            title: "FEC API",
            description: "Connection error. Please check your API key.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error('API check failed:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to check API connectivity',
        variant: "destructive",
      });
    }
  };

  const checkGoogleCivicApi = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: { checkGoogleCivicApiOnly: true }
      });

      if (error) {
        console.error('Google Civic API check error:', error);
        toast({
          title: "Error",
          description: error.message || 'Failed to check Google Civic API',
          variant: "destructive",
        });
        return;
      }

      if (data && data.apiStatuses) {
        setApiStatus(prevStatus => ({
          ...prevStatus,
          googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                       data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                       data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown'
        }));

        if (data.apiStatuses.googleCivic === 'CONNECTED') {
          toast({
            title: "Google Civic API",
            description: "Successfully connected to the API.",
            variant: "default",
          });
        } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED') {
          toast({
            title: "Google Civic API",
            description: "API key not configured. Please add your API key.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR') {
          toast({
            title: "Google Civic API",
            description: "Connection error. Please check your API key.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error('Google Civic API check failed:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to check Google Civic API',
        variant: "destructive",
      });
    }
  };

  const checkFecApi = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: { checkFecApiOnly: true }
      });

      if (error) {
        console.error('FEC API check error:', error);
        toast({
          title: "Error",
          description: error.message || 'Failed to check FEC API',
          variant: "destructive",
        });
        return;
      }

      if (data && data.apiStatuses) {
        setApiStatus(prevStatus => ({
          ...prevStatus,
          fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
               data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
               data.apiStatuses.fec === 'FEC_API_ERROR' ? 'error' : 'unknown'
        }));

        if (data.apiStatuses.fec === 'CONNECTED') {
          toast({
            title: "FEC API",
            description: "Successfully connected to the API.",
            variant: "default",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED') {
          toast({
            title: "FEC API",
            description: "API key not configured. Please add your API key.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
          toast({
            title: "FEC API",
            description: "Connection error. Please check your API key.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error('FEC API check failed:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to check FEC API',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 animate-fade-up">
            Voter Information Tool
          </h1>
          
          <div className="mb-6 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={checkGoogleCivicApi}
              className="flex items-center gap-2"
            >
              {apiStatus.googleCivic === 'connected' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : apiStatus.googleCivic === 'error' || apiStatus.googleCivic === 'not_configured' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Check Google Civic API Connection
            </Button>
            
            <Button 
              variant="outline" 
              onClick={checkFecApi}
              className="flex items-center gap-2"
            >
              {apiStatus.fec === 'connected' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : apiStatus.fec === 'error' || apiStatus.fec === 'not_configured' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Check FEC API Connection
            </Button>
          </div>
          
          <VoterForm 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
          />
          
          {isError && (
            <Alert variant="destructive" className="mt-8 animate-fade-up">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <div className="mb-3">
                  {error instanceof Error ? error.message : 'An unknown error occurred'}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </AlertDescription>
            </Alert>
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
