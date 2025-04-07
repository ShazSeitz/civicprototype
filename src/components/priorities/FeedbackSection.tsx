import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RecommendationsData } from '@/hooks/priorities-analysis/types';
import { Mode } from '@/contexts/ModeContext';

interface FeedbackSectionProps {
  recommendations: RecommendationsData | null;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
  mode: Mode;
}

export const FeedbackSection = ({
  recommendations,
  onFeedbackSubmit,
  onContinue,
  mode
}: FeedbackSectionProps) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFeedbackSubmit(feedback);
    setFeedback('');
  };

  if (!recommendations) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Feedback</h3>
      <p className="text-sm text-gray-600">
        How well do these recommendations match your priorities? Your feedback helps us improve our matching system.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Share your thoughts on the recommendations..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[100px]"
        />
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onContinue}>
            Skip
          </Button>
          <Button type="submit" disabled={!feedback.trim()}>
            Submit Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};
