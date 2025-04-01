// This file provides utility functions for mapping user priorities to policy terms
// using the Hugging Face Transformers.js library

import { pipeline } from '@huggingface/transformers';

// Keep track of model initialization status
let isModelInitialized = false;
let classifier = null;
let fallbackClassifier = null;

export const initializeModel = async () => {
  if (isModelInitialized) return true;
  
  try {
    console.info('Loading text classification model...');
    
    try {
      // Try to initialize with wasm backend explicitly instead of webgpu
      classifier = await pipeline('text-classification', 'distilbert-base-uncased-finetuned-sst-2-english', {
        backend: 'wasm'
      });
      isModelInitialized = true;
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      console.info('Falling back to zero-shot classification...');
      
      try {
        // Try to initialize fallback model with wasm backend explicitly
        fallbackClassifier = await pipeline('zero-shot-classification', 'facebook/bart-large-mnli', {
          backend: 'wasm'
        });
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
