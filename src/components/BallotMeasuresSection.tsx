
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BallotMeasureCard } from "@/components/BallotMeasureCard";

interface BallotMeasuresSectionProps {
  ballotMeasures: any[];
  title?: string;
}

export const BallotMeasuresSection = ({ 
  ballotMeasures,
  title = "Ballot Measures" 
}: BallotMeasuresSectionProps) => {
  // No ballot measures to display
  if (!ballotMeasures || ballotMeasures.length === 0) {
    return null;
  }
  
  return (
    <Card className="animate-fade-up mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {ballotMeasures.map((measure, index) => (
          <BallotMeasureCard
            key={index}
            title={measure.title}
            description={measure.description}
            recommendation={measure.recommendation}
            matchedPriorities={measure.matchedPriorities || []}
            supportingGroups={measure.supportingGroups || []}
            opposingGroups={measure.opposingGroups || []}
          />
        ))}
      </CardContent>
    </Card>
  );
};
