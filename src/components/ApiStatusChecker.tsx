import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ApiStatus } from '@/types/api';

interface ApiStatusCheckerProps {
  initialGoogleCivicStatus: ApiStatus['googleCivic'];
  initialFecStatus: ApiStatus['fec'];
  onStatusChange: (status: ApiStatus) => void;
}

export function ApiStatusChecker({
  initialGoogleCivicStatus,
  initialFecStatus,
  onStatusChange,
}: ApiStatusCheckerProps) {
  useEffect(() => {
    const checkApis = async () => {
      const status: ApiStatus = {
        googleCivic: 'loading',
        fec: 'loading'
      };

      try {
        // Check Google Civic API
        const civicResponse = await fetch('/api/check-civic');
        status.googleCivic = civicResponse.ok ? 'success' : 'error';
      } catch {
        status.googleCivic = 'error';
      }

      try {
        // Check FEC API
        const fecResponse = await fetch('/api/check-fec');
        status.fec = fecResponse.ok ? 'success' : 'error';
      } catch {
        status.fec = 'error';
      }

      onStatusChange(status);
    };

    checkApis();
  }, [onStatusChange]);

  const getStatusIcon = (status: ApiStatus['googleCivic'] | ApiStatus['fec']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  return (
    <div className="space-y-2">
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          {getStatusIcon(initialGoogleCivicStatus)} Google Civic API
        </AlertTitle>
        <AlertDescription>
          {initialGoogleCivicStatus === 'success'
            ? 'Connected successfully'
            : initialGoogleCivicStatus === 'error'
            ? 'Connection failed'
            : 'Checking connection...'}
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTitle className="flex items-center gap-2">
          {getStatusIcon(initialFecStatus)} FEC API
        </AlertTitle>
        <AlertDescription>
          {initialFecStatus === 'success'
            ? 'Connected successfully'
            : initialFecStatus === 'error'
            ? 'Connection failed'
            : 'Checking connection...'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
