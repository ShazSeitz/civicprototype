import { PoliticalIssue, PoliticalCategory, ConflictDefinition } from '@/types/priority-mapping';

export const POLITICAL_ISSUES: PoliticalIssue[] = [
  // Civil Rights and Justice
  {
    id: 'voting_rights',
    name: 'Voting Rights',
    category: 'CIVIL_RIGHTS',
    synonyms: ['election access', 'voter protection', 'voting access'],
    relatedTerms: ['voter id', 'registration', 'polling places', 'mail voting'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Universal Access',
        description: 'Expanding voting access through multiple methods',
        conflictingApproaches: ['strict_verification']
      },
      {
        name: 'Strict Verification',
        description: 'Emphasizing security and verification in voting',
        conflictingApproaches: ['universal_access']
      }
    ]
  },
  {
    id: 'criminal_justice_reform',
    name: 'Criminal Justice Reform',
    category: 'CRIMINAL_JUSTICE',
    synonyms: ['justice reform', 'police reform', 'law enforcement reform'],
    relatedTerms: ['sentencing', 'police accountability', 'prison reform'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Community-Based',
        description: 'Focus on prevention and community programs',
        conflictingApproaches: ['enforcement_focused']
      },
      {
        name: 'Enforcement-Focused',
        description: 'Emphasis on law enforcement and penalties',
        conflictingApproaches: ['community_based']
      }
    ]
  },

  // Technology and Privacy
  {
    id: 'digital_privacy',
    name: 'Digital Privacy',
    category: 'TECHNOLOGY',
    synonyms: ['data protection', 'online privacy', 'digital rights'],
    relatedTerms: ['surveillance', 'data collection', 'encryption'],
    weight: 0.9,
    policyApproaches: [
      {
        name: 'Strong Privacy',
        description: 'Maximizing individual privacy protections',
        conflictingApproaches: ['security_first']
      }
    ]
  },

  // Environmental Issues
  {
    id: 'climate_action',
    name: 'Climate Change Action',
    category: 'ENVIRONMENT',
    synonyms: ['climate policy', 'global warming action', 'emissions reduction'],
    relatedTerms: ['carbon emissions', 'renewable energy', 'climate crisis'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Rapid Transition',
        description: 'Quick shift to renewable energy',
        conflictingApproaches: ['gradual_adaptation']
      }
    ],
    opposingIssues: ['fossil_fuel_development']
  },

  // Labor and Economy
  {
    id: 'worker_rights',
    name: 'Worker Rights',
    category: 'LABOR',
    synonyms: ['labor rights', 'employee protection', 'workplace rights'],
    relatedTerms: ['unions', 'worker safety', 'fair wages', 'benefits'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Strong Protections',
        description: 'Comprehensive worker protections and benefits',
        conflictingApproaches: ['market_flexibility']
      }
    ]
  },

  // Healthcare
  {
    id: 'healthcare_access',
    name: 'Healthcare Access',
    category: 'HEALTHCARE',
    synonyms: ['medical access', 'health coverage', 'healthcare availability'],
    relatedTerms: ['insurance', 'medical care', 'healthcare costs'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Universal Coverage',
        description: 'Government-guaranteed healthcare for all',
        conflictingApproaches: ['market_based']
      },
      {
        name: 'Market-Based',
        description: 'Private insurance-focused system',
        conflictingApproaches: ['universal_coverage']
      }
    ]
  },

  // Housing
  {
    id: 'affordable_housing',
    name: 'Affordable Housing',
    category: 'HOUSING',
    synonyms: ['housing affordability', 'accessible housing', 'housing costs'],
    relatedTerms: ['rent control', 'housing development', 'zoning'],
    weight: 1.0,
    policyApproaches: [
      {
        name: 'Public Investment',
        description: 'Government-funded affordable housing',
        conflictingApproaches: ['market_solutions']
      }
    ]
  }
];

export const ISSUE_CONFLICTS: ConflictDefinition[] = [
  {
    issues: ['voting_rights', 'election_security'],
    reason: 'Balance between access and security measures',
    severity: 'high',
    type: 'policy',
    possibleCompromises: [
      'Implement secure but accessible voting methods',
      'Provide multiple verification options'
    ]
  },
  {
    issues: ['climate_action', 'economic_growth'],
    reason: 'Short-term economic impacts of environmental regulations',
    severity: 'high',
    type: 'resource',
    possibleCompromises: [
      'Green jobs programs',
      'Gradual transition with worker support'
    ]
  },
  {
    issues: ['worker_rights', 'business_flexibility'],
    reason: 'Balance between worker protections and business operations',
    severity: 'medium',
    type: 'ideology',
    possibleCompromises: [
      'Flexible scheduling with guaranteed hours',
      'Graduated requirements based on business size'
    ]
  },
  {
    issues: ['affordable_housing', 'property_rights'],
    reason: 'Tension between housing access and property ownership',
    severity: 'high',
    type: 'implementation',
    possibleCompromises: [
      'Mixed-income development incentives',
      'Public-private partnerships'
    ]
  },
  {
    issues: ['digital_privacy', 'public_safety'],
    reason: 'Balance between privacy rights and security measures',
    severity: 'medium',
    type: 'policy',
    possibleCompromises: [
      'Warrant requirements with emergency exceptions',
      'Transparent oversight processes'
    ]
  }
];
