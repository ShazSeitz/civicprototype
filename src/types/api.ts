import { Mode } from '@/contexts/ModeContext';

export type Stance = 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';

export interface Organization {
  name: string;
  description: string;
  stance: Stance;
  reason: string;
}

export interface PriorityMatch {
  userPriority: string;
  mappedTerms: string[];
}

export interface Candidate {
  name: string;
  party: string;
  office?: string;
  recommendation: {
    stance: string;
    reason: string;
  };
  keyPositions?: string[];
}

export interface BallotMeasure {
  title: string;
  description: string;
  recommendation: {
    stance: string;
    reason: string;
  };
  supportingGroups?: Array<{ name: string }>;
  opposingGroups?: Array<{ name: string }>;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  recipients: string[];
}

export interface CivicAction {
  title: string;
  description: string;
  link?: string;
}

export interface RecommendationsData {
  mode: Mode;
  zipCode: string;
  analysis: {
    summary: string;
    priorities: string[];
    conflicts: string[];
  };
  mappedPriorities: {
    userPriority: string;
    mappedTerms: string[];
  }[];
  candidates: Candidate[];
  ballotMeasures: BallotMeasure[];
  emailTemplates: EmailTemplate[];
  civicActions: CivicAction[];
  draftEmails?: EmailTemplate[];
  interestGroups?: {
    name: string;
    description: string;
    relevance: string;
    url: string;
    alignment: 'strong' | 'moderate' | 'weak';
  }[];
  petitions?: {
    title: string;
    description: string;
    url: string;
  }[];
  civicsEducation?: {
    topics: Array<{
      title: string;
      description: string;
      resources: Array<{
        title: string;
        url: string;
        type: 'article' | 'video' | 'course';
      }>;
    }>;
  };
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
