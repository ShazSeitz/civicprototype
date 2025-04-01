
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  // Function to render paragraphed analysis
  const renderAnalysis = (analysis: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = analysis.split('\n\n');
    
    if (paragraphs.length > 1) {
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 text-left">{paragraph}</p>
      ));
    }
    
    // If no double newlines, render as a single paragraph
    return <p className="text-left">{analysis}</p>;
  };

  return (
    <div className="space-y-6 mt-8 animate-fade-up">
      <Card>
        <CardHeader>
          <CardTitle className="text-left">Analysis of Your Priorities</CardTitle>
          <CardDescription className="text-left">
            We have mapped your priorities to policy terms to provide the best recommendations. Please review and clarify if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display priorities mapping in a table format */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2 font-bold">User Concern</TableHead>
                <TableHead className="w-1/2 font-bold">Mapped Policy Term(s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.priorityMappings && recommendations.priorityMappings.map((mapping, index) => (
                <TableRow key={index} className="border">
                  <TableCell className="text-left align-top">{mapping.userConcern}</TableCell>
                  <TableCell className="text-left">{mapping.mappedTerms.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Display the prose analysis after the table */}
          <div className="prose prose-sm text-left mt-6">
            {renderAnalysis(recommendations.analysis)}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
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

      {recommendations.candidates.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="candidates">
            <AccordionTrigger className="text-lg font-semibold text-left">
              Candidates ({recommendations.candidates.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {recommendations.candidates.map((candidate, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base text-left">{candidate.name}</CardTitle>
                      <CardDescription className="text-left">
                        {candidate.office} • {candidate.party}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {candidate.alignment ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {candidate.alignment.type === 'strong' && (
                              <Badge className="bg-green-500">Strong Alignment</Badge>
                            )}
                            {candidate.alignment.type === 'moderate' && (
                              <Badge className="bg-blue-500">Moderate Alignment</Badge>
                            )}
                            {candidate.alignment.type === 'weak' && (
                              <Badge className="bg-yellow-500">Some Alignment</Badge>
                            )}
                            {candidate.alignment.type === 'conflicting' && (
                              <Badge className="bg-orange-500">Mixed Alignment</Badge>
                            )}
                            {candidate.alignment.type === 'opposing' && (
                              <Badge className="bg-red-500">Potential Conflicts</Badge>
                            )}
                          </div>
                          {candidate.alignment.supportedPriorities?.length > 0 && (
                            <div className="text-left">
                              <p className="text-sm font-medium text-green-700 dark:text-green-400">Aligned with your priorities:</p>
                              <ul className="list-disc list-inside text-sm pl-2">
                                {candidate.alignment.supportedPriorities.map((priority, i) => (
                                  <li key={i}>{priority}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {candidate.alignment.conflictingPriorities?.length > 0 && (
                            <div className="text-left">
                              <p className="text-sm font-medium text-red-700 dark:text-red-400">Potential conflicts:</p>
                              <ul className="list-disc list-inside text-sm pl-2">
                                {candidate.alignment.conflictingPriorities.map((priority, i) => (
                                  <li key={i}>{priority}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-left">Insufficient information available on this candidate's positions.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

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
