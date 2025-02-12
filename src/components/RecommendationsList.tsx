
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Recommendations {
  region: string;
  analysis: string;
  candidates?: Array<{
    name: string;
    office: string;
    highlights: string[];
  }>;
}

interface RecommendationsListProps {
  recommendations: Recommendations;
}

export const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  return (
    <Card className="animate-fade-up mt-8">
      <CardHeader>
        <CardTitle>Your Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <p>{recommendations.region}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Analysis</h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{recommendations.analysis}</div>
          </div>
        </div>

        {recommendations.candidates && recommendations.candidates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Relevant Candidates</h3>
            <div className="space-y-4">
              {recommendations.candidates.map((candidate, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{candidate.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{candidate.office}</p>
                  <ul className="list-disc list-inside">
                    {candidate.highlights.map((highlight, hIndex) => (
                      <li key={hIndex} className="text-sm text-gray-700">{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
