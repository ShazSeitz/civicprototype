import { RecommendationsData } from '@/types/api';
import { useMode } from '@/contexts/ModeContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationsListProps {
  recommendations: RecommendationsData;
  onFeedbackSubmit: (priority: string) => void;
}

export function RecommendationsList({ recommendations, onFeedbackSubmit }: RecommendationsListProps) {
  const { mode } = useMode();
  const isDemo = mode === 'demo';

  return (
    <div className="space-y-8">
      {/* Candidates */}
      {recommendations.candidates.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Candidates</h3>
          <div className="space-y-4">
            {recommendations.candidates.map((candidate, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{candidate.name}</h4>
                <p className="text-sm text-gray-600">{candidate.party}</p>
                {candidate.office && (
                  <p className="text-sm text-gray-600">{candidate.office}</p>
                )}
                <div className="mt-2">
                  <div className="text-sm">
                    <span className="font-medium">Recommendation: </span>
                    {candidate.recommendation.stance}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {candidate.recommendation.reason}
                  </p>
                </div>
                {candidate.keyPositions && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Key Positions:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {candidate.keyPositions.map((position, i) => (
                        <li key={i}>{position}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ballot Measures */}
      {recommendations.ballotMeasures.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Ballot Measures</h3>
          <div className="space-y-4">
            {recommendations.ballotMeasures.map((measure, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{measure.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{measure.description}</p>
                <div className="mt-2">
                  <div className="text-sm">
                    <span className="font-medium">Recommendation: </span>
                    {measure.recommendation.stance}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {measure.recommendation.reason}
                  </p>
                </div>
                {measure.supportingGroups && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Supporting Groups:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {measure.supportingGroups.map((group, i) => (
                        <li key={i}>{group.name} - {group.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {measure.opposingGroups && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Opposing Groups:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {measure.opposingGroups.map((group, i) => (
                        <li key={i}>{group.name} - {group.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Draft Emails */}
      {recommendations.draftEmails.length > 0 && (
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
                        <Badge className={
                          email.alignmentType === 'aligned' ? 'bg-green-500' :
                          email.alignmentType === 'opposing' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }>
                          {email.alignmentType}
                        </Badge>
                        {email.relevantIssues?.map((issue, i) => (
                          <Badge key={i} variant="outline">
                            {issue.issue}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm whitespace-pre-line text-left border-l-4 border-muted-foreground/20 pl-4 py-2">
                        {email.body}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Interest Groups */}
      {recommendations.interestGroups.length > 0 && (
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
                      <CardDescription className="line-clamp-2 text-left">{group.description}</CardDescription>
                      <Badge variant="outline" className="mt-2">
                        {group.alignment} alignment
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{group.relevance}</p>
                    </CardContent>
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

      {/* Petitions */}
      {recommendations.petitions.length > 0 && (
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

      {/* Civics Education */}
      {recommendations.civicsEducation && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="civics" className="border-b-0">
            <AccordionTrigger className="text-xl font-semibold text-left py-4 px-3 bg-muted/30 rounded-t-lg hover:bg-muted/50 hover:no-underline">
              Civics Education Resources
            </AccordionTrigger>
            <AccordionContent className="bg-card border border-t-0 border-muted rounded-b-lg">
              <div className="space-y-6 pt-4 px-4 pb-6">
                {recommendations.civicsEducation.topics.map((topic, index) => (
                  <Card key={index} className="border-muted/60">
                    <CardHeader>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topic.resources.map((resource, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge variant="secondary">{resource.type}</Badge>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {resource.title}
                            </a>
                          </div>
                        ))}
                      </div>
                    </CardContent>
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
