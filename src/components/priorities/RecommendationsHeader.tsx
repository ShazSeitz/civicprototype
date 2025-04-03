
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
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-left">Your Recommendations</h2>
      <ShareRecommendations
        recommendationsData={recommendationsData}
        zipCode={zipCode}
        userPriorities={userPriorities}
        userClarifications={userClarifications}
      />
    </div>
  );
};
