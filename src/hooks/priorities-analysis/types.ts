
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { ApiStatus } from '@/components/ApiStatusChecker';

export interface PriorityMapping {
  userConcern: string;
  mappedTerms: string[];
}

export interface RecommendationsData {
  mode: string;
  analysis: string;
  mappedPriorities: string[];
  conflictingPriorities?: string[];
  priorityMappings?: PriorityMapping[];
  nuancedMappings?: Record<string, Record<string, any>>;
  candidates: any[];
  ballotMeasures: any[];
  draftEmails: any[];
  interestGroups: any[];
  petitions: any[];
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
