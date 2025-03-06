
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    toEmail?: string | null;
    office?: string;
    subject: string;
    body: string;
    matchScore?: number;
    alignmentType?: 'aligned' | 'opposing' | 'mixed' | 'unknown' | 'keyDecisionMaker';
    relevantIssues?: Array<{issue: string, stance: string}>;
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

  // Select top officials by category according to advocacy rules
  const getTopThreeOfficials = () => {
    if (!recommendations.draftEmails || recommendations.draftEmails.length === 0) {
      return {
        supporterEmail: null,
        opposingEmail: null,
        keyDecisionMakerEmail: null
      };
    }

    // Sort within each category by match score
    const supporterEmails = recommendations.draftEmails
      .filter(email => email.alignmentType === 'aligned')
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    const opposingEmails = recommendations.draftEmails
      .filter(email => email.alignmentType === 'opposing')
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    const keyDecisionMakerEmails = recommendations.draftEmails
      .filter(email => email.alignmentType === 'mixed' || email.alignmentType === 'unknown' || email.alignmentType === 'keyDecisionMaker')
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Pick top from each category
    return {
      supporterEmail: supporterEmails.length > 0 ? supporterEmails[0] : null,
      opposingEmail: opposingEmails.length > 0 ? opposingEmails[0] : null,
      keyDecisionMakerEmail: keyDecisionMakerEmails.length > 0 ? keyDecisionMakerEmails[0] : null,
    };
  };

  const { supporterEmail, opposingEmail, keyDecisionMakerEmail } = getTopThreeOfficials();

  // Combine all emails that will be displayed
  const selectedEmails = [supporterEmail, opposingEmail, keyDecisionMakerEmail].filter(email => email !== null);

  return (
    <Card className="animate-fade-up mt-8">
      <CardHeader>
        <CardTitle>Your Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis - Following the structured response from requirements */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Priority Analysis {analysisVersion > 1 ? `(Updated)` : ''}</h3>
          <div className="prose prose-sm max-w-none text-left">
            <p className="text-base whitespace-pre-wrap text-left">{recommendations.analysis}</p>
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

            {/* Draft Emails - Limited to 3 strategic emails */}
            {selectedEmails.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Strategic Advocacy Emails (Top 3)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selected based on maximizing your advocacy impact across supportive, opposing, and key decision-making officials.
                </p>
                
                {/* Supportive Official Email */}
                {supporterEmail && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                      Champion: Thank and Encourage
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This official supports your priorities - thank them and encourage continued support.
                    </p>
                    <div className="p-4 bg-gray-50 border-l-4 border-green-500 rounded-lg mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{supporterEmail.to}</p>
                            <Badge variant="default" className="bg-green-600">
                              Supportive
                            </Badge>
                          </div>
                          {supporterEmail.office && <p className="text-xs text-gray-600">{supporterEmail.office}</p>}
                          {supporterEmail.toEmail ? (
                            <p className="text-sm text-gray-600">
                              Email: <a href={`mailto:${supporterEmail.toEmail}`} className="text-blue-600 hover:underline">
                                {supporterEmail.toEmail}
                              </a>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 italic">Email address not available</p>
                          )}
                          <p className="text-sm text-gray-600">Subject: {supporterEmail.subject}</p>
                          
                          {/* Display relevant issues this official champions */}
                          {supporterEmail.relevantIssues && supporterEmail.relevantIssues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Key Focus Areas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {supporterEmail.relevantIssues.map((issue, i) => (
                                  <Badge key={i} variant="outline" className={`${issue.stance === 'support' ? 'bg-green-50 border-green-200' : issue.stance === 'oppose' ? 'bg-red-50 border-red-200' : 'bg-blue-50'}`}>
                                    {issue.issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(supporterEmail.body)}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                        {supporterEmail.body}
                      </div>
                    </div>
                  </div>
                )}

                {/* Opposing Official Email */}
                {opposingEmail && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                      Opposition: Respectful Advocacy
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This official may have different views on issues you care about. This email respectfully presents your perspective.
                    </p>
                    <div className="p-4 bg-gray-50 border-l-4 border-red-500 rounded-lg mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{opposingEmail.to}</p>
                            <Badge variant="destructive">
                              May Oppose
                            </Badge>
                          </div>
                          {opposingEmail.office && <p className="text-xs text-gray-600">{opposingEmail.office}</p>}
                          {opposingEmail.toEmail ? (
                            <p className="text-sm text-gray-600">
                              Email: <a href={`mailto:${opposingEmail.toEmail}`} className="text-blue-600 hover:underline">
                                {opposingEmail.toEmail}
                              </a>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 italic">Email address not available</p>
                          )}
                          <p className="text-sm text-gray-600">Subject: {opposingEmail.subject}</p>
                          
                          {/* Display relevant issues this official works on */}
                          {opposingEmail.relevantIssues && opposingEmail.relevantIssues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Potential Points of Disagreement:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {opposingEmail.relevantIssues.map((issue, i) => (
                                  <Badge key={i} variant="outline" className={`${issue.stance === 'support' ? 'bg-green-50 border-green-200' : issue.stance === 'oppose' ? 'bg-red-50 border-red-200' : 'bg-blue-50'}`}>
                                    {issue.issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(opposingEmail.body)}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                        {opposingEmail.body}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Decision-Maker Email */}
                {keyDecisionMakerEmail && (
                  <div>
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <Scale className="h-4 w-4 mr-2 text-blue-600" />
                      Key Decision-Maker: Swing Vote
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This official is in a position to make a significant impact on your priorities. Your voice could help sway their decision.
                    </p>
                    <div className="p-4 bg-gray-50 border-l-4 border-blue-500 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{keyDecisionMakerEmail.to}</p>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              Key Decision-Maker
                            </Badge>
                          </div>
                          {keyDecisionMakerEmail.office && <p className="text-xs text-gray-600">{keyDecisionMakerEmail.office}</p>}
                          {keyDecisionMakerEmail.toEmail ? (
                            <p className="text-sm text-gray-600">
                              Email: <a href={`mailto:${keyDecisionMakerEmail.toEmail}`} className="text-blue-600 hover:underline">
                                {keyDecisionMakerEmail.toEmail}
                              </a>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600 italic">Email address not available</p>
                          )}
                          <p className="text-sm text-gray-600">Subject: {keyDecisionMakerEmail.subject}</p>
                          
                          {/* Display relevant issues this official works on */}
                          {keyDecisionMakerEmail.relevantIssues && keyDecisionMakerEmail.relevantIssues.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Key Policy Areas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {keyDecisionMakerEmail.relevantIssues.map((issue, i) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50 border-blue-200">
                                    {issue.issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(keyDecisionMakerEmail.body)}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                        {keyDecisionMakerEmail.body}
                      </div>
                    </div>
                  </div>
                )}
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
