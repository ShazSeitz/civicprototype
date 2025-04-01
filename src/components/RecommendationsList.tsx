
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

  return (
    <div className="space-y-6 mt-8 animate-fade-up">
      <Card>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="w-full">
            <div className="text-sm font-medium mb-2 text-left">Add another priority</div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add another priority..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSubmitFeedback} variant="outline">Clarify</Button>
              <Button onClick={handleSubmitFeedback}>Get Recommendations</Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {recommendations.draftEmails.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="emails">
            <AccordionTrigger className="text-lg font-semibold text-left">
              Email Templates ({recommendations.draftEmails.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {recommendations.draftEmails.map((email, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base text-left">
                        To: {email.to} ({email.office})
                      </CardTitle>
                      <CardDescription className="text-left">{email.subject}</CardDescription>
                      <div className="flex flex-wrap gap-2 mt-1">
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
                      <div className="text-sm whitespace-pre-line text-left">{email.body}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {recommendations.interestGroups.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="groups">
            <AccordionTrigger className="text-lg font-semibold text-left">
              Interest Groups ({recommendations.interestGroups.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-2">
                {recommendations.interestGroups.map((group, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-base text-left">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-left">{group.relevance}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                      <a
                        href={group.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        Visit HUD Resource
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {recommendations.petitions.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="petitions">
            <AccordionTrigger className="text-lg font-semibold text-left">
              Petitions ({recommendations.petitions.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-2">
                {recommendations.petitions.map((petition, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base text-left">{petition.title}</CardTitle>
                      <CardDescription className="text-left">{petition.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
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
