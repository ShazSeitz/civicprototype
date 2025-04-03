
import { ApiStatus } from '@/components/ApiStatusChecker';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { PrioritiesAnalysisState } from './types';

type PrioritiesAction =
  | { type: 'SET_FORM_DATA'; payload: VoterFormValues }
  | { type: 'ADD_FEEDBACK'; payload: string }
  | { type: 'INCREMENT_SUBMIT' }
  | { type: 'SET_SHOW_RECOMMENDATIONS'; payload: boolean }
  | { type: 'UPDATE_API_STATUS'; payload: { googleCivic: ApiStatus; fec: ApiStatus } };

export const initialState: PrioritiesAnalysisState = {
  formData: null,
  feedbackPriorities: [],
  submitCount: 0,
  showRecommendations: false,
  apiStatus: {
    googleCivic: 'unknown',
    fec: 'unknown'
  }
};

export function prioritiesReducer(state: PrioritiesAnalysisState, action: PrioritiesAction): PrioritiesAnalysisState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.payload,
        feedbackPriorities: [], // Reset feedback when new form is submitted
      };
    case 'ADD_FEEDBACK':
      return {
        ...state,
        feedbackPriorities: [...state.feedbackPriorities, action.payload]
      };
    case 'INCREMENT_SUBMIT':
      return {
        ...state,
        submitCount: state.submitCount + 1,
        showRecommendations: false // Reset showRecommendations when new analysis is submitted
      };
    case 'SET_SHOW_RECOMMENDATIONS':
      return {
        ...state,
        showRecommendations: action.payload
      };
    case 'UPDATE_API_STATUS':
      return {
        ...state,
        apiStatus: action.payload
      };
    default:
      return state;
  }
}
