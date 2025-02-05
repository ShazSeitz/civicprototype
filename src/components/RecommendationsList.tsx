import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Candidate {
  name: string;
  office: string;
  highlights: string[];
}

interface Recommendations {
  region: string;
  candidates: Candidate[];
}

interface RecommendationsListProps {
  recommendations: Recommendations;
}

export const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>Your Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="font-medium">Region: {recommendations.region}</p>
          <div>
            <h3 className="font-semibold mb-2">Candidates:</h3>
            {recommendations.candidates.map((candidate, index) => (
              <div key={index} className="mb-4">
                <p className="font-medium">{candidate.name}</p>
                <p className="text-sm text-gray-600">{candidate.office}</p>
                <ul className="list-disc list-inside mt-2">
                  {candidate.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="text-sm">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};