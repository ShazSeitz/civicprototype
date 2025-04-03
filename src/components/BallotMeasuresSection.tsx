
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
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          These ballot measures relate to your stated priorities. We've included information on who supports and opposes each measure.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-3">
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
