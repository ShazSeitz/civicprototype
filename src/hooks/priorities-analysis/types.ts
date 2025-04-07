import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus, RecommendationsData } from '@/types/api';

export type { RecommendationsData };

export interface PriorityMapping {
  userPriority: string;
  mappedTerms: string[];
}

export interface PrioritiesAnalysisState {
  formData: VoterFormValues | null;
  feedbackPriorities: string[];
  submitCount: number;
  showRecommendations: boolean;
  apiStatus: {
    googleCivic: ApiStatus;
    fec: ApiStatus;
  };
}
