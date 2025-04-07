import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Mode } from "@/contexts/ModeContext";
import { PriorityMapping } from "@/types/api";

interface PrioritiesFeedbackProps {
  analysis: string;
  mappedPriorities: PriorityMapping[];
  conflictingPriorities: Array<{
    priority1: string;
    priority2: string;
    reason: string;
  }>;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
  mode: Mode;
}

export const PrioritiesFeedback = ({
  analysis,
  mappedPriorities,
  conflictingPriorities,
  onFeedbackSubmit,
  onContinue,
  mode
}: PrioritiesFeedbackProps) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      setIsSubmitting(true);
      onFeedbackSubmit(feedback);
      setFeedback('');
      // Reset submitting state after a delay to show loading state
      setTimeout(() => setIsSubmitting(false), 500);
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
        <div className="flex items-center gap-2">
          <CardTitle>Priorities Analysis</CardTitle>
          <Badge variant="outline" className="ml-2">
            {mode === 'demo' ? 'DEMO' : 'LIVE'} Analysis
          </Badge>
        </div>
        <CardDescription>
          We've analyzed your priorities to provide personalized recommendations. Please review and clarify if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm leading-relaxed whitespace-pre-line text-left">
            {analysis}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-left flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Identified Priority Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {mappedPriorities.map((priority, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {formatPriorityTerm(priority.userPriority)}
                  {priority.mappedTerms.length > 0 && (
                    <span className="text-gray-500 ml-1">
                      → {priority.mappedTerms.join(', ')}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
          
          {conflictingPriorities.length > 0 && (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <h4 className="font-medium mb-1 text-left">Potentially Conflicting Priorities</h4>
                <ul className="list-disc pl-5 space-y-1 text-left">
                  {conflictingPriorities.map((conflict, index) => (
                    <li key={index} className="text-sm text-left">
                      {conflict.priority1} conflicts with {conflict.priority2}: {conflict.reason}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-left flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              Did we get this right?
            </h4>
            <Input
              placeholder="Share your feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between gap-4">
            <Button 
              type="submit" 
              variant="secondary"
              disabled={!feedback.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
            <Button onClick={onContinue}>
              Continue to Recommendations
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
