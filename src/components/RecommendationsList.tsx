
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recommendations {
  region: string;
  analysis: string;
  mode?: "current" | "demo";
  priorities?: string[];
  candidates?: Array<{
    name: string;
    office: string;
    highlights: string[];
  }>;
  ballotMeasures?: Array<{
    title: string;
    recommendation: string;
  }>;
  draftEmails?: Array<{
    to: string;
    subject: string;
    body: string;
  }>;
  interestGroups?: Array<{
    name: string;
    url: string;
    relevance: string;
  }>;
  petitions?: Array<{
    title: string;
    url: string;
    relevance: string;
  }>;
}

interface RecommendationsListProps {
  recommendations: Recommendations;
}

export const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste the text anywhere",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try copying manually",
      });
    }
  };

  return (
    <Card className="animate-fade-up mt-8">
      <CardHeader>
        <CardTitle>Your Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Analysis</h3>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{recommendations.analysis}</div>
          </div>
        </div>

        {/* Candidates */}
        {recommendations.candidates && recommendations.candidates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {recommendations.mode === "demo" ? "Local & State Candidates" : "Elected Officials"}
            </h3>
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

        {/* Ballot Measures */}
        {recommendations.ballotMeasures && recommendations.ballotMeasures.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Ballot Measures</h3>
            <div className="space-y-4">
              {recommendations.ballotMeasures.map((measure, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{measure.title}</p>
                  <p className="text-sm text-gray-700 mt-2">{measure.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Emails */}
        {recommendations.draftEmails && recommendations.draftEmails.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Draft Emails to Representatives</h3>
            <div className="space-y-4">
              {recommendations.draftEmails.map((email, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">To: {email.to}</p>
                      <p className="text-sm text-gray-600">Subject: {email.subject}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(email.body)}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                    {email.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interest Groups */}
        {recommendations.interestGroups && recommendations.interestGroups.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Relevant Interest Groups</h3>
            <div className="space-y-4">
              {recommendations.interestGroups.map((group, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    <a 
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {group.name}
                    </a>
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{group.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Petitions */}
        {recommendations.petitions && recommendations.petitions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Relevant Petitions</h3>
            <div className="space-y-4">
              {recommendations.petitions.map((petition, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    <a 
                      href={petition.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {petition.title}
                    </a>
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{petition.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
