
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

export type ApiStatus = 'unknown' | 'connected' | 'error' | 'not_configured';

interface ApiStatusCheckerProps {
  initialGoogleCivicStatus: ApiStatus;
  initialFecStatus: ApiStatus;
  onStatusChange: (statuses: { googleCivic: ApiStatus; fec: ApiStatus }) => void;
}

export const ApiStatusChecker = ({ 
  initialGoogleCivicStatus, 
  initialFecStatus,
  onStatusChange 
}: ApiStatusCheckerProps) => {
  const [apiStatus, setApiStatus] = useState<{
    googleCivic: ApiStatus;
    fec: ApiStatus;
  }>({
    googleCivic: initialGoogleCivicStatus,
    fec: initialFecStatus
  });
  const { toast } = useToast();

  const checkGoogleCivicApi = async () => {
    try {
      toast({
        title: "Checking",
        description: "Checking Google Civic API connection...",
        variant: "default",
      });
      
      console.log('Sending Google Civic API check request');
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: { checkGoogleCivicApiOnly: true }
      });

      console.log('Google Civic API check response:', data, error);

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
        const newStatus = {
          ...apiStatus,
          googleCivic: data.apiStatuses.googleCivic === 'CONNECTED' ? 'connected' : 
                      data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_NOT_CONFIGURED' ? 'not_configured' :
                      data.apiStatuses.googleCivic === 'GOOGLE_CIVIC_API_ERROR' ? 'error' : 'unknown'
        };
        
        setApiStatus(newStatus);
        onStatusChange(newStatus);

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
    } catch (err) {
      console.error('Google Civic API check failed:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to check Google Civic API',
        variant: "destructive",
      });
    }
  };

  const checkFecApi = async () => {
    try {
      toast({
        title: "Checking",
        description: "Checking FEC API connection...",
        variant: "default",
      });
      
      console.log('Sending FEC API check request');
      const { data, error } = await supabase.functions.invoke('analyze-priorities', {
        body: { checkFecApiOnly: true }
      });

      console.log('FEC API check response:', data, error);

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
        const newStatus = {
          ...apiStatus,
          fec: data.apiStatuses.fec === 'CONNECTED' ? 'connected' :
              data.apiStatuses.fec === 'FEC_API_NOT_CONFIGURED' ? 'not_configured' :
              data.apiStatuses.fec === 'FEC_API_ERROR' || 
              data.apiStatuses.fec === 'FEC_API_UNAUTHORIZED' || 
              data.apiStatuses.fec === 'FEC_API_ENDPOINT_NOT_FOUND' || 
              data.apiStatuses.fec === 'FEC_API_RATE_LIMIT' ? 'error' : 'unknown'
        };
        
        setApiStatus(newStatus);
        onStatusChange(newStatus);

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
        } else if (data.apiStatuses.fec === 'FEC_API_UNAUTHORIZED') {
          toast({
            title: "FEC API",
            description: "API key is invalid or unauthorized.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_ENDPOINT_NOT_FOUND') {
          toast({
            title: "FEC API",
            description: "API endpoint not found. Please check service status.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_RATE_LIMIT') {
          toast({
            title: "FEC API",
            description: "Rate limit exceeded. Please try again later.",
            variant: "destructive",
          });
        } else if (data.apiStatuses.fec === 'FEC_API_ERROR') {
          toast({
            title: "FEC API",
            description: "Connection error. Please check your API key and service status.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('FEC API check failed:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to check FEC API',
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
