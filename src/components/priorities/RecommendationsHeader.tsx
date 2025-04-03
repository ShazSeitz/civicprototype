
import { ShareRecommendations } from '@/components/ShareRecommendations';
import { RecommendationsData } from '@/hooks/priorities-analysis/types';
import { VoterFormValues } from '@/schemas/voterFormSchema';

interface RecommendationsHeaderProps {
  recommendationsData: RecommendationsData;
  zipCode?: string;
  userPriorities?: string[];
  userClarifications: string[];
}

export const RecommendationsHeader = ({
  recommendationsData,
  zipCode,
  userPriorities,
  userClarifications
}: RecommendationsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-left">Your Recommendations</h2>
        <ShareRecommendations
          recommendationsData={recommendationsData}
          zipCode={zipCode}
          userPriorities={userPriorities}
          userClarifications={userClarifications}
        />
      </div>
      
      <div className="text-left space-y-2">
        <p className="text-muted-foreground text-base">
          Based on your priorities, here are the elected officials, candidates, and civic actions that most closely match your concerns.
        </p>
        <p className="text-sm text-muted-foreground">
          For ZIP Code: <span className="font-medium">{zipCode}</span> • Generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
