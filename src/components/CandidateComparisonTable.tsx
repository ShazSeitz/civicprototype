
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CandidateIssueStance {
  issue: string;
  stance: string;
  description: string;
}

interface CandidateData {
  name: string;
  party: string;
  office: string;
  photoUrl?: string;
  alignment?: {
    type: string;
    supportedPriorities: string[];
    conflictingPriorities: string[];
  };
  stances: CandidateIssueStance[];
}

interface CandidateComparisonTableProps {
  candidates: CandidateData[];
  title: string;
}

export const CandidateComparisonTable = ({ candidates, title }: CandidateComparisonTableProps) => {
  // Get all unique issues across candidates
  const allIssues = Array.from(
    new Set(candidates.flatMap(candidate => candidate.stances.map(stance => stance.issue)))
  );

  const getStanceForIssue = (candidate: CandidateData, issue: string) => {
    return candidate.stances.find(stance => stance.issue === issue);
  };

  return (
    <Card className="mt-6 animate-fade-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue</TableHead>
              {candidates.map(candidate => (
                <TableHead key={candidate.name}>
                  <div className="font-bold">{candidate.name}</div>
                  <div className="text-xs text-muted-foreground">{candidate.party}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allIssues.map(issue => (
              <TableRow key={issue}>
                <TableCell className="font-medium">{issue}</TableCell>
                {candidates.map(candidate => {
                  const stance = getStanceForIssue(candidate, issue);
                  return (
                    <TableCell key={`${candidate.name}-${issue}`}>
                      {stance ? (
                        <div>
                          <Badge 
                            variant={
                              stance.stance === 'support' ? 'default' : 
                              stance.stance === 'oppose' ? 'destructive' : 
                              'outline'
                            }
                            className="mb-1"
                          >
                            {stance.stance}
                          </Badge>
                          <div className="text-sm">{stance.description}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No stated position</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {/* Additional row for alignment with user priorities */}
            <TableRow>
              <TableCell className="font-medium">Alignment with Your Priorities</TableCell>
              {candidates.map(candidate => (
                <TableCell key={`${candidate.name}-alignment`}>
                  {candidate.alignment ? (
                    <div>
                      <Badge 
                        variant={
                          candidate.alignment.type === 'aligned' ? 'default' : 
                          candidate.alignment.type === 'opposing' ? 'destructive' : 
                          'outline'
                        }
                        className="mb-1"
                      >
                        {candidate.alignment.type === 'aligned' ? 'Strong Match' :
                         candidate.alignment.type === 'opposing' ? 'Weak Match' :
                         'Partial Match'}
                      </Badge>
                      {candidate.alignment.supportedPriorities.length > 0 && (
                        <div className="text-xs mt-1">
                          <span className="font-medium">Supports: </span> 
                          {candidate.alignment.supportedPriorities.join(', ')}
                        </div>
                      )}
                      {candidate.alignment.conflictingPriorities.length > 0 && (
                        <div className="text-xs mt-1 text-destructive">
                          <span className="font-medium">Conflicts: </span>
                          {candidate.alignment.conflictingPriorities.join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Alignment unknown</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
