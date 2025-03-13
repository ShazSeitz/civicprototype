
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: unknown;
  onRetry: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  return (
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
          onClick={onRetry} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};
