import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VoterForm } from '@/components/VoterForm';
import { FeedbackSection } from '@/components/priorities/FeedbackSection';
import { RecommendationsViewer } from '@/components/priorities/RecommendationsViewer';
import { RecommendationsData } from '@/types/api';
import { Mode, useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TestPersonaControls } from '@/components/TestPersonaControls';

interface VoterFormContainerProps {
  isLoading: boolean;
  recommendations: RecommendationsData | null;
  showRecommendations: boolean;
  formValues: {
    zipCode?: string;
    priorities?: string[];
  };
  onSubmit: (values: { zipCode: string; priorities: string[] }) => void;
  onFeedbackSubmit: (feedback: string) => void;
  onContinue: () => void;
}

export const VoterFormContainer = ({ 
  isLoading,
  recommendations,
  showRecommendations,
  formValues,
  onSubmit,
  onFeedbackSubmit,
  onContinue,
}: VoterFormContainerProps) => {
  const { mode, setMode } = useMode();
  const [selectedValues, setSelectedValues] = useState(formValues);
  const showFeedback = recommendations && !showRecommendations;

  const handlePersonaSelect = (persona: { zipCode: string; priorities: string[] }) => {
    setSelectedValues(persona);
  };

  const handleModeChange = (value: Mode) => {
    setMode(value);
  };

  const handleSubmit = (values: { zipCode: string; priorities: string[] }) => {
    onSubmit(values);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardContent className="pt-6">
          <RadioGroup
            value={mode}
            onValueChange={handleModeChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="current" />
              <Label htmlFor="current">Current Date</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="demo" id="demo" />
              <Label htmlFor="demo">DEMO: November 2024 Election</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Test Personas */}
      <TestPersonaControls onSelectPersona={handlePersonaSelect} />

      {/* Voter Form */}
      <Card>
        <CardContent className="pt-6">
          <VoterForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValues={selectedValues}
          />
        </CardContent>
      </Card>

      {/* Feedback Section */}
      {showFeedback && (
        <Card>
          <CardContent className="pt-6">
            <FeedbackSection
              recommendations={recommendations}
              onFeedbackSubmit={onFeedbackSubmit}
              onContinue={onContinue}
              mode={mode}
            />
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations && (
        <Card>
          <CardContent className="pt-6">
            <RecommendationsViewer recommendations={recommendations} mode={mode} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
