import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BallotMeasureCard } from "@/components/BallotMeasureCard";
import { Mode } from "@/contexts/ModeContext";

interface BallotMeasure {
  title: string;
  description: string;
  recommendation: {
    stance: 'support' | 'oppose' | 'neutral';
    reason: string;
  };
  priorityMatches: Array<{
    userPriority: string;
    mappedTerms: string[];
  }>;
  supportingGroups: Array<{
    name: string;
    description?: string;
  }>;
  opposingGroups: Array<{
    name: string;
    description?: string;
  }>;
}

interface BallotMeasuresSectionProps {
  ballotMeasures: BallotMeasure[];
  title?: string;
  mode: Mode;
}

export const BallotMeasuresSection = ({ 
  ballotMeasures,
  title = "Ballot Measures",
  mode
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
          These {mode === 'demo' ? 'sample ' : ''}ballot measures relate to your stated priorities. 
          We've included information on who supports and opposes each measure.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-3">
        {ballotMeasures.map((measure, index) => (
          <BallotMeasureCard
            key={index}
            title={measure.title}
            description={measure.description}
            recommendation={measure.recommendation}
            priorityMatches={measure.priorityMatches}
            supportingGroups={measure.supportingGroups}
            opposingGroups={measure.opposingGroups}
            mode={mode}
          />
        ))}
      </CardContent>
    </Card>
  );
};
