import { VoterFormValues } from '@/schemas/voterFormSchema';

export interface TestPersona {
  id: string;
  description: string;
  values: VoterFormValues;
  expectedCategories: string[];
  notes?: string;
}

export const TEST_PERSONAS: TestPersona[] = [
  {
    id: 'education_equity',
    description: 'Education equity focused voter',
    values: {
      zipCode: '94110',
      priorities: [
        'Fair access to quality education',
        'Reducing achievement gaps',
        'School funding equity',
        'Teacher diversity hiring',
        'Special education support',
        'Bilingual education programs'
      ]
    },
    expectedCategories: ['EDUCATION', 'SOCIAL_SERVICES'],
    notes: 'Tests nuanced education equity positions'
  },
  {
    id: 'economic_justice',
    description: 'Economic justice advocate',
    values: {
      zipCode: '94110',
      priorities: [
        'Fair hiring practices',
        'Living wage requirements',
        'Small business support',
        'Worker protections',
        'Equal pay enforcement',
        'Job training programs'
      ]
    },
    expectedCategories: ['ECONOMY', 'SOCIAL_SERVICES'],
    notes: 'Tests intersection of economic and social justice'
  },
  {
    id: 'environmental_health',
    description: 'Environmental health concerned voter',
    values: {
      zipCode: '94110',
      priorities: [
        'Clean air standards',
        'Water quality protection',
        'Environmental justice',
        'Public health measures',
        'Industrial pollution control',
        'Green space access'
      ]
    },
    expectedCategories: ['ENVIRONMENT', 'HEALTHCARE', 'SOCIAL_SERVICES'],
    notes: 'Tests environmental and health intersections'
  }
];
