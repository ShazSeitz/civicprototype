import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface Recommendations {
  mode?: "current" | "demo";
  analysis: string;
  candidates?: Array<{
    name: string;
    office: string;
    highlights: string[];
  }>;
  ballotMeasures?: Array<{
    title: string;
    recommendation: string;
  }>;
  draftEmails?: Array<{
    to: string;
    subject: string;
    body: string;
  }>;
  interestGroups?: Array<{
    name: string;
    url: string;
    relevance: string;
  }>;
  petitions?: Array<{
    title: string;
    url: string;
    relevance: string;
  }>;
}

interface RecommendationsListProps {
  recommendations: Recommendations;
  onFeedbackSubmit?: (feedback: string) => void;
}

export const RecommendationsList = ({ recommendations, onFeedbackSubmit }: RecommendationsListProps) => {
  const { toast } = useToast();
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [analysisVersion, setAnalysisVersion] = useState(1);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste the text anywhere",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try copying manually",
      });
    }
  };

  const handleFeedbackSubmit = () => {
    if (onFeedbackSubmit && feedback.trim()) {
      onFeedbackSubmit(feedback);
      setAnalysisVersion(prev => prev + 1);
      setFeedback("");
      setShowFeedbackInput(false);
      // Don't show recommendations yet, wait for new analysis
    }
  };

  const handleFeedbackChoice = (wantsFeedback: boolean) => {
    if (wantsFeedback) {
      setShowFeedbackInput(true);
    } else {
      setShowRecommendations(true);
    }
  };

  return (
    <Card className="animate-fade-up mt-8">
      <CardHeader>
        <CardTitle>Your Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Priority Analysis {analysisVersion > 1 ? `(Updated)` : ''}</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-base whitespace-pre-wrap">{recommendations.analysis}</p>
          </div>
        </div>

        {/* Only show feedback choice if recommendations aren't showing yet */}
        {!showFeedbackInput && !showRecommendations && (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Would you like to change, clarify or add anything before I provide recommendations?
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleFeedbackChoice(true)}
                variant="outline"
                className="flex-1"
              >
                Yes
              </Button>
              <Button 
                onClick={() => handleFeedbackChoice(false)}
                variant="outline"
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Input */}
        {showFeedbackInput && !showRecommendations && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={300}
                className="w-full"
                placeholder="Enter your feedback here..."
              />
              <div className="text-xs text-muted-foreground text-right">
                {feedback.length}/300 characters
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleFeedbackSubmit} className="flex-1">
                SUBMIT
              </Button>
              <Button 
                onClick={() => {
                  setShowFeedbackInput(false);
                  setShowRecommendations(true);
                }} 
                variant="outline" 
                className="flex-1"
              >
                SKIP TO RECOMMENDATIONS
              </Button>
            </div>
          </div>
        )}

        {/* Show the rest of the recommendations after feedback submission or clicking No */}
        {showRecommendations && (
          <>
            {/* Candidates */}
            {recommendations.candidates && recommendations.candidates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {recommendations.mode === "demo" ? "Local & State Candidates" : "Elected Officials"}
                </h3>
                <div className="space-y-4">
                  {recommendations.candidates.map((candidate, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{candidate.office}</p>
                      <ul className="list-disc list-inside">
                        {candidate.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="text-sm text-gray-700">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ballot Measures */}
            {recommendations.ballotMeasures && recommendations.ballotMeasures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Ballot Measures</h3>
                <div className="space-y-4">
                  {recommendations.ballotMeasures.map((measure, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{measure.title}</p>
                      <p className="text-sm text-gray-700 mt-2">{measure.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Emails */}
            {recommendations.draftEmails && recommendations.draftEmails.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Draft Emails to Representatives</h3>
                <div className="space-y-4">
                  {recommendations.draftEmails.map((email, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">To: {email.to}</p>
                          <p className="text-sm text-gray-600">Subject: {email.subject}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(email.body)}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                        {email.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interest Groups */}
            {recommendations.interestGroups && recommendations.interestGroups.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Relevant Interest Groups</h3>
                <div className="space-y-4">
                  {recommendations.interestGroups.map((group, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        <a 
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {group.name}
                        </a>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{group.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Petitions */}
            {recommendations.petitions && recommendations.petitions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Relevant Petitions</h3>
                <div className="space-y-4">
                  {recommendations.petitions.map((petition, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        <a 
                          href={petition.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {petition.title}
                        </a>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{petition.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
