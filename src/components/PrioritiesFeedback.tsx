
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PrioritiesFeedbackProps {
  analysis: string;
  mappedPriorities: string[];
  conflictingPriorities?: string[];
  nuancedMappings?: Record<string, Record<string, any>>;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
}

export const PrioritiesFeedback = ({
  analysis,
  mappedPriorities,
  conflictingPriorities = [],
  nuancedMappings = {},
  onFeedbackSubmit,
  onContinue
}: PrioritiesFeedbackProps) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onFeedbackSubmit(feedback);
      setFeedback('');
    }
  };

  // Format priority term for better display
  const formatPriorityTerm = (term: string) => {
    return term.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <Card className="mb-8 animate-fade-up">
      <CardHeader>
        <CardTitle>Priorities Analysis</CardTitle>
        <CardDescription>
          We've analyzed your priorities to provide the best recommendations. Please review and clarify if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {analysis}
          </div>
          
          <div className="mt-4">
            <ul className="list-disc pl-5 space-y-1">
              {mappedPriorities.map((priority, index) => (
                <li key={index} className="text-sm">{formatPriorityTerm(priority)}</li>
              ))}
            </ul>
          </div>
          
          {conflictingPriorities.length > 0 && (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <h4 className="font-medium mb-1 text-left">Potentially Conflicting Priorities</h4>
                <ul className="list-disc pl-5 space-y-1 text-left">
                  {conflictingPriorities.map((conflict, index) => (
                    <li key={index} className="text-sm text-left">{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Did we get this right?</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add clarification or correction..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">Clarify</Button>
            </div>
          </div>
          
          <Button 
            onClick={onContinue} 
            type="button" 
            className="w-full"
          >
            Yes, show me recommendations
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
