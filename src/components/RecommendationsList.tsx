
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RecommendationsData } from "@/hooks/use-priorities-analysis";
import { useState } from "react";

interface RecommendationsListProps {
  recommendations: RecommendationsData;
  onFeedbackSubmit: (feedback: string) => void;
}

export function RecommendationsList({ recommendations, onFeedbackSubmit }: RecommendationsListProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      onFeedbackSubmit(feedback);
      setFeedback("");
    }
  };

  // Handle key press (Enter) in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && feedback.trim()) {
      handleSubmitFeedback();
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <Card className="bg-card border-muted">
        <CardContent className="pt-6 pb-4">
          <div className="w-full">
            <div className="text-sm font-medium mb-2 text-left">Add another priority</div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add another priority..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
              >
                Get Recommendations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {recommendations.draftEmails && recommendations.draftEmails.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="emails" className="border-b-0">
            <AccordionTrigger className="text-xl font-semibold text-left py-4 px-3 bg-muted/30 rounded-t-lg hover:bg-muted/50 hover:no-underline">
              Email Templates ({recommendations.draftEmails.length})
            </AccordionTrigger>
            <AccordionContent className="bg-card border border-t-0 border-muted rounded-b-lg">
              <div className="space-y-4 pt-4 px-4 pb-6">
                {recommendations.draftEmails.map((email, index) => (
                  <Card key={index} className="border-muted/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-left">
                        To: {email.to} ({email.office})
                      </CardTitle>
                      <CardDescription className="text-left">{email.subject}</CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {email.alignmentType === 'aligned' && (
                          <Badge className="bg-green-500">Aligned</Badge>
                        )}
                        {email.alignmentType === 'opposing' && (
                          <Badge className="bg-red-500">Opposing</Badge>
                        )}
                        {email.alignmentType === 'mixed' && (
                          <Badge className="bg-yellow-500">Mixed</Badge>
                        )}
                        {email.relevantIssues?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {email.relevantIssues.map((issue, i) => (
                              <Badge key={i} variant="outline">
                                {issue.issue}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm whitespace-pre-line text-left border-l-4 border-muted-foreground/20 pl-4 py-2">{email.body}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {recommendations.interestGroups && recommendations.interestGroups.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="groups" className="border-b-0">
            <AccordionTrigger className="text-xl font-semibold text-left py-4 px-3 bg-muted/30 rounded-t-lg hover:bg-muted/50 hover:no-underline">
              Interest Groups ({recommendations.interestGroups.length})
            </AccordionTrigger>
            <AccordionContent className="bg-card border border-t-0 border-muted rounded-b-lg">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-4 px-4 pb-6">
                {recommendations.interestGroups.map((group, index) => (
                  <Card key={index} className="flex flex-col border-muted/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-left">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-left">{group.relevance}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto pt-0">
                      <a
                        href={group.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        Visit Organization
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {recommendations.petitions && recommendations.petitions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="petitions" className="border-b-0">
            <AccordionTrigger className="text-xl font-semibold text-left py-4 px-3 bg-muted/30 rounded-t-lg hover:bg-muted/50 hover:no-underline">
              Petitions ({recommendations.petitions.length})
            </AccordionTrigger>
            <AccordionContent className="bg-card border border-t-0 border-muted rounded-b-lg">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-4 px-4 pb-6">
                {recommendations.petitions.map((petition, index) => (
                  <Card key={index} className="border-muted/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-left">{petition.title}</CardTitle>
                      <CardDescription className="text-left">{petition.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <a
                        href={petition.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        View Petition
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
