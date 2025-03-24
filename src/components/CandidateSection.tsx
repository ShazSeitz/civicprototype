
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateComparisonTable } from "@/components/CandidateComparisonTable";

// Group candidates by office type
const groupCandidatesByOffice = (candidates: any[]) => {
  const groups: Record<string, any[]> = {};
  
  candidates.forEach(candidate => {
    const office = candidate.office || 'Other';
    if (!groups[office]) {
      groups[office] = [];
    }
    groups[office].push(candidate);
  });
  
  return Object.entries(groups).map(([office, candidates]) => ({
    office,
    candidates: candidates.slice(0, 2) // Limit to top 2 candidates per office
  }));
};

interface CandidateSectionProps {
  candidates: any[];
  title?: string;
}

export const CandidateSection = ({ candidates, title = "Candidates" }: CandidateSectionProps) => {
  // No candidates to display
  if (!candidates || candidates.length === 0) {
    return null;
  }
  
  const groupedCandidates = groupCandidatesByOffice(candidates);
  
  return (
    <Card className="animate-fade-up mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedCandidates.map(({ office, candidates }) => (
          <div key={office} className="space-y-2">
            <h3 className="text-lg font-semibold">{office}</h3>
            <CandidateComparisonTable 
              candidates={candidates}
              title={`Compare: ${office}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
