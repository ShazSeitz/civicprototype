import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisCardProps {
  analysis: {
    summary: string;
    priorities: string[];
    conflicts: string[];
  };
  priorityMappings: {
    userPriority: string;
    mappedTerms: string[];
  }[];
}

export function AnalysisCard({ analysis, priorityMappings }: AnalysisCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-medium mb-2">Priority Analysis</h3>
          <p className="text-sm text-gray-600">{analysis.summary}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Your Priorities</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.priorities.map((priority, index) => (
              <Badge key={index} variant="secondary">
                {priority}
              </Badge>
            ))}
          </div>
        </div>

        {priorityMappings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Mapped Terms</h4>
            <div className="space-y-2">
              {priorityMappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline">
                    {mapping.userPriority}
                  </Badge>
                  {mapping.mappedTerms.length > 0 && (
                    <>
                      <span className="text-gray-400">→</span>
                      <div className="flex flex-wrap gap-1">
                        {mapping.mappedTerms.map((term, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.conflicts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Potential Conflicts</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {analysis.conflicts.map((conflict, index) => (
                <li key={index}>{conflict}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
