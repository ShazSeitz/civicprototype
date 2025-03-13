
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingProgressProps {
  message?: string;
  isLoading: boolean;
  autoProgress?: boolean;
}

export const LoadingProgress = ({ 
  message = "Loading your results...", 
  isLoading,
  autoProgress = true
}: LoadingProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    if (autoProgress) {
      // Reset progress when loading starts
      setProgress(0);
      
      // Gradually increase progress to 95% to indicate ongoing work
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          
          // Move faster at the beginning, slower as we approach 95%
          const increment = Math.max(1, Math.floor((100 - prevProgress) / 10));
          return prevProgress + increment;
        });
      }, 300);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoading, autoProgress]);

  // Don't render if not loading and progress is complete
  if (!isLoading && progress === 100) {
    return null;
  }

  return (
    <Card className="w-full mb-6 animate-fade-in">
      <CardContent className="pt-6 pb-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-center">{message}</p>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingProgress;
