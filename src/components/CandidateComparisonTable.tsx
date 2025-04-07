import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  name: string;
  party: string;
  office?: string;
  stances: Array<{
    topics: string[];
    position: string;
  }>;
  priorityMatches?: Array<{
    userPriority: string;
    mappedTerms: string[];
  }>;
}

interface CandidateComparisonTableProps {
  candidates: Candidate[];
  title?: string;
}

export const CandidateComparisonTable = ({ 
  candidates, 
  title = "Compare Candidates"
}: CandidateComparisonTableProps) => {
  // Get all unique topics across candidates
  const allTopics = Array.from(
    new Set(candidates.flatMap(candidate => 
      candidate.stances.flatMap(stance => stance.topics)
    ))
  );

  const getStanceForTopic = (candidate: Candidate, topic: string) => {
    return candidate.stances.find(stance => 
      stance.topics.includes(topic)
    );
  };

  return (
    <Card className="border-muted/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="w-[200px]">Topic</TableHead>
                {candidates.map(candidate => (
                  <TableHead key={candidate.name} className="min-w-[200px]">
                    <div className="font-bold">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span className={`w-3 h-3 inline-block rounded-full mr-1.5 ${
                        candidate.party?.toLowerCase().includes('republican') ? 'bg-red-500' : 
                        candidate.party?.toLowerCase().includes('democrat') ? 'bg-blue-500' : 
                        'bg-purple-500'
                      }`}></span>
                      {candidate.party}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTopics.map(topic => (
                <TableRow key={topic} className="hover:bg-muted/10">
                  <TableCell className="font-medium">{topic}</TableCell>
                  {candidates.map(candidate => {
                    const stance = getStanceForTopic(candidate, topic);
                    return (
                      <TableCell key={`${candidate.name}-${topic}`}>
                        {stance ? (
                          <div className="text-sm">{stance.position}</div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No stated position</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {/* Priority Matches Row */}
              <TableRow className="bg-muted/5 hover:bg-muted/15">
                <TableCell className="font-medium">Priority Matches</TableCell>
                {candidates.map(candidate => (
                  <TableCell key={`${candidate.name}-priorities`}>
                    {candidate.priorityMatches && candidate.priorityMatches.length > 0 ? (
                      <div className="space-y-2">
                        {candidate.priorityMatches.map((match, index) => (
                          <div key={index}>
                            <Badge variant="outline" className="text-xs mb-1">
                              {match.userPriority}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {match.mappedTerms.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No priority matches found</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
