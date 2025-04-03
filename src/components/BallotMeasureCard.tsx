
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface SupportGroup {
  name: string;
  type: string;
}

interface BallotMeasureProps {
  title: string;
  description: string;
  recommendation: "support" | "oppose" | "neutral";
  matchedPriorities: string[];
  supportingGroups: SupportGroup[];
  opposingGroups: SupportGroup[];
}

export const BallotMeasureCard = ({
  title,
  description,
  recommendation,
  matchedPriorities,
  supportingGroups,
  opposingGroups
}: BallotMeasureProps) => {
  return (
    <Card className="mb-6 border-muted/60 overflow-hidden">
      {/* Recommendation indicator */}
      <div className={`h-2 w-full ${
        recommendation === "support" ? "bg-green-500" : 
        recommendation === "oppose" ? "bg-red-500" : 
        "bg-yellow-500"
      }`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge 
            variant={
              recommendation === "support" ? "default" : 
              recommendation === "oppose" ? "destructive" : 
              "outline"
            }
            className="ml-2 mt-1"
          >
            {recommendation === "support" ? "Recommended" : 
             recommendation === "oppose" ? "Not Recommended" : 
             "No Recommendation"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {matchedPriorities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Related to your priorities:</h4>
            <div className="flex flex-wrap gap-1.5">
              {matchedPriorities.map((priority, index) => (
                <Badge key={index} variant="outline" className="bg-muted/30">{priority}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/10 p-3 rounded-lg">
            <h4 className="text-sm font-medium flex items-center mb-2">
              <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
              <span>Supporting This Measure</span>
            </h4>
            {supportingGroups.length > 0 ? (
              <ul className="space-y-1.5">
                {supportingGroups.map((group, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{group.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">({group.type})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No major supporting groups found</p>
            )}
          </div>
          
          <div className="bg-muted/10 p-3 rounded-lg">
            <h4 className="text-sm font-medium flex items-center mb-2">
              <XCircle className="h-4 w-4 mr-1.5 text-red-500" />
              <span>Opposing This Measure</span>
            </h4>
            {opposingGroups.length > 0 ? (
              <ul className="space-y-1.5">
                {opposingGroups.map((group, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{group.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">({group.type})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No major opposing groups found</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
