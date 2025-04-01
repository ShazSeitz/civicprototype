// This file provides utility functions for mapping user priorities to policy terms
// using the Hugging Face Transformers.js library

import { pipeline, env } from '@huggingface/transformers';

// Keep track of model initialization status
let isModelInitialized = false;
let classifier = null;
let fallbackClassifier = null;

// Configure the environment to use WASM
env.useBrowserCache = true;
env.allowLocalModels = false;

export const initializeModel = async () => {
  if (isModelInitialized) return true;
  
  try {
    console.info('Loading text classification model...');
    
    try {
      // Initialize with appropriate options (removed backend property)
      classifier = await pipeline('text-classification', 'distilbert-base-uncased-finetuned-sst-2-english');
      isModelInitialized = true;
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      console.info('Falling back to zero-shot classification...');
      
      try {
        // Initialize fallback model (removed backend property)
        fallbackClassifier = await pipeline('zero-shot-classification', 'facebook/bart-large-mnli');
        isModelInitialized = true;
        return true;
      } catch (fallbackError) {
        console.error('Error loading fallback model:', fallbackError);
        console.info('Using rule-based classifier due to model loading failures');
        // We'll use rule-based classification as last resort
        return false;
      }
    }
  } catch (e) {
    console.error('Failed to initialize any ML models:', e);
    return false;
  }
};

// Map user priorities to formal policy terms using ML if available
// or fallback to rule-based approach
export const mapUserPriority = async (userPriority) => {
  if (!userPriority || userPriority.trim() === '') {
    return [];
  }
  
  // Rule-based approach as fallback
  const normalizedInput = userPriority.toLowerCase();
  
  // Basic keyword mapping
  const keywordMap = {
    'veteran': ['Veterans Affairs', 'Veterans Benefits'],
    'military': ['Veterans Affairs', 'Defense Policy'],
    'tax': ['Tax Policy', 'Fiscal Responsibility', 'Government Accountability'],
    'spend': ['Government Spending', 'Fiscal Responsibility', 'Budget Policy'],
    'debt': ['National Debt', 'Fiscal Responsibility', 'Economic Policy'],
    'business': ['Small Business', 'Economic Policy', 'Deregulation'],
    'school': ['Education Policy', 'School Choice', 'Education Reform'],
    'college': ['Higher Education', 'Student Loans', 'Education Policy'],
    'healthcare': ['Healthcare Policy', 'Healthcare Reform', 'Medicare'],
    'drug': ['Prescription Drugs', 'Healthcare Policy', 'Medicare'],
    'medicine': ['Healthcare Policy', 'Medicare', 'Medicaid'],
    'abortion': ['Reproductive Rights', 'Women\'s Health', 'Healthcare Policy'],
    'climate': ['Climate Change', 'Environmental Policy', 'Clean Energy'],
    'environment': ['Environmental Protection', 'Climate Policy', 'Conservation'],
    'immigrant': ['Immigration Reform', 'Border Security', 'DACA'],
    'border': ['Border Security', 'Immigration Policy', 'National Security'],
    'gun': ['Second Amendment', 'Gun Rights', 'Gun Control'],
    'crime': ['Criminal Justice', 'Law Enforcement', 'Public Safety'],
    'police': ['Law Enforcement', 'Criminal Justice Reform', 'Public Safety'],
    'housing': ['Housing Policy', 'Affordable Housing', 'Urban Development'],
    'rent': ['Affordable Housing', 'Housing Policy', 'Rent Control'],
    'homeless': ['Homelessness', 'Housing Policy', 'Mental Health'],
    'privacy': ['Data Privacy', 'Consumer Protection', 'Technology Regulation'],
    'tech': ['Technology Policy', 'Data Privacy', 'Innovation'],
    'job': ['Job Creation', 'Employment', 'Economic Policy'],
    'wage': ['Minimum Wage', 'Labor Policy', 'Economic Policy'],
    'election': ['Election Integrity', 'Voting Rights', 'Electoral Reform'],
    'vote': ['Voting Rights', 'Election Security', 'Democratic Reform'],
    'corruption': ['Government Ethics', 'Anti-Corruption', 'Transparency'],
    'term limit': ['Term Limits', 'Political Reform', 'Government Accountability']
  };
  
  // Find matching keywords
  const matches = [];
  for (const [keyword, mappedTerms] of Object.entries(keywordMap)) {
    if (normalizedInput.includes(keyword)) {
      mappedTerms.forEach(term => {
        if (!matches.includes(term)) {
          matches.push(term);
        }
      });
    }
  }
  
  // If we found matches, return them
  if (matches.length > 0) {
    return matches.slice(0, 3); // Return up to 3 matches
  }
  
  // Default if no matches
  return ['Policy Reform', 'Government Accountability'];
};

// Add the missing classifyPoliticalStatement function
export const classifyPoliticalStatement = async (statement) => {
  if (!statement || statement.trim() === '') {
    return { terms: [], confidenceScores: {} };
  }
  
  await initializeModel();
  
  try {
    // If ML model is available, try to use it
    if (classifier) {
      const result = await classifier(statement);
      const sentimentScore = result[0].score;
      
      // Use sentiment to identify political leaning
      if (sentimentScore > 0.7) {
        return {
          terms: ['Positive Political Sentiment', 'Progressive Policy'],
          confidenceScores: {
            'Positive Political Sentiment': sentimentScore,
            'Progressive Policy': sentimentScore * 0.8
          }
        };
      } else if (sentimentScore < 0.3) {
        return {
          terms: ['Negative Political Sentiment', 'Conservative Policy'],
          confidenceScores: {
            'Negative Political Sentiment': 1 - sentimentScore,
            'Conservative Policy': (1 - sentimentScore) * 0.8
          }
        };
      }
    }
    
    // If zero-shot classifier is available
    if (fallbackClassifier) {
      const candidateLabels = [
        'Tax Policy', 'Healthcare Policy', 'Education Policy', 'Environmental Policy',
        'National Security', 'Immigration Policy', 'Economic Policy', 'Foreign Policy',
        'Social Policy', 'Civil Rights', 'Gun Rights', 'Veterans Affairs'
      ];
      
      const result = await fallbackClassifier(statement, candidateLabels);
      
      // Return the top 3 classifications
      const terms = result.labels.slice(0, 3);
      const confidenceScores = {};
      
      terms.forEach((term, index) => {
        confidenceScores[term] = result.scores[index];
      });
      
      return { terms, confidenceScores };
    }
  } catch (error) {
    console.error('Error classifying statement with ML:', error);
  }
  
  // Fall back to keyword-based approach
  const policyTerms = await mapUserPriority(statement);
  const confidenceScores = {};
  
  policyTerms.forEach(term => {
    confidenceScores[term] = 0.7; // Default confidence score
  });
  
  return {
    terms: policyTerms,
    confidenceScores
  };
};
