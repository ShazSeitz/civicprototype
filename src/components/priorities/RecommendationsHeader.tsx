import { ShareRecommendations } from '@/components/ShareRecommendations';
import { RecommendationsData } from '@/types/api';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { useMode } from '@/contexts/ModeContext';

export interface RecommendationsHeaderProps {
  recommendationsData: RecommendationsData;
  zipCode: string;
  userPriorities: string[];
  userClarifications: string[];
}

export const RecommendationsHeader = ({
  recommendationsData,
  zipCode,
  userPriorities,
  userClarifications,
}: RecommendationsHeaderProps) => {
  const { mode } = useMode();
  const isDemo = mode === 'demo';

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
        {isDemo ? (
          <p className="text-muted-foreground text-base">
            Here are your personalized recommendations for the November 2024 election
            in ZIP code {zipCode}.
          </p>
        ) : (
          <p className="text-muted-foreground text-base">
            Based on your priorities, here are the elected officials, candidates, and civic actions that most closely match your concerns.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          For ZIP Code: <span className="font-medium">{zipCode}</span> • Generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
