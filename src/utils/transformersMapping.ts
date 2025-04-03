// This file provides utility functions for mapping user priorities to policy terms
// using a simplified rule-based approach

// We're removing the Transformers.js dependencies due to loading issues
// and implementing a more reliable rule-based approach

import issueTerminology from '@/config/issueTerminology.json';

// Keep track of model initialization status
let isModelInitialized = false;

export const initializeModel = async () => {
  if (isModelInitialized) return true;
  
  try {
    console.info('Initializing rule-based classifier...');
    isModelInitialized = true;
    return true;
  } catch (e) {
    console.error('Failed to initialize classifier:', e);
    return false;
  }
};

// Map user priorities to formal policy terms using rule-based approach
export const mapUserPriority = async (userPriority) => {
  if (!userPriority || userPriority.trim() === '') {
    return [];
  }
  
  // Normalize the user input
  const normalizedInput = userPriority.toLowerCase();
  
  // Check exact matches in issueTerminology
  const matches = [];
  
  // First, look for direct matches in plainLanguage arrays
  for (const [termKey, termData] of Object.entries(issueTerminology)) {
    // Skip 'fallback' and 'issues' entries
    if (termKey === 'fallback' || termKey === 'issues') continue;
    
    const termInfo = termData as any;
    
    // Check for direct matches in plainLanguage array
    if (termInfo.plainLanguage && Array.isArray(termInfo.plainLanguage)) {
      for (const phrase of termInfo.plainLanguage) {
        if (normalizedInput.includes(phrase.toLowerCase())) {
          matches.push(termInfo.standardTerm);
          break;
        }
      }
    }
    
    // Check for inclusion words if defined
    if (termInfo.inclusionWords && Array.isArray(termInfo.inclusionWords)) {
      let allWordsIncluded = true;
      for (const word of termInfo.inclusionWords) {
        if (!normalizedInput.includes(word.toLowerCase())) {
          allWordsIncluded = false;
          break;
        }
      }
      if (allWordsIncluded && !matches.includes(termInfo.standardTerm)) {
        matches.push(termInfo.standardTerm);
      }
    }
  }
  
  // If we found matches, return them
  if (matches.length > 0) {
    return matches.slice(0, 3); // Return up to 3 matches
  }
  
  // Fallback to keyword mapping if no direct matches
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
    'term limit': ['Term Limits', 'Political Reform', 'Government Accountability'],
    'transportation': ['Public Transportation', 'Infrastructure Development', 'Transit Policy'],
    'jan 6th': ['Law Enforcement', 'Criminal Justice', 'Democratic Institutions'],
    'rioters': ['Law Enforcement', 'Criminal Justice', 'Rule of Law'],
    'ai': ['Technology Policy', 'AI Regulation', 'Innovation'],
    'artificial intelligence': ['Technology Policy', 'AI Regulation', 'Innovation'],
    'hoax': ['Climate Skepticism', 'Environmental Policy'],
    'disgraceful': ['Merit-Based Hiring', 'Opposition to Race and Gender-Based Hiring Policies'],
    'income tax': ['Tax Policy', 'Income Tax Reform', 'Fiscal Policy']
  };
  
  // Find matching keywords
  const keywordMatches = [];
  for (const [keyword, mappedTerms] of Object.entries(keywordMap)) {
    if (normalizedInput.includes(keyword)) {
      mappedTerms.forEach(term => {
        if (!keywordMatches.includes(term)) {
          keywordMatches.push(term);
        }
      });
    }
  }
  
  // If we found keyword matches, return them
  if (keywordMatches.length > 0) {
    return keywordMatches.slice(0, 3); // Return up to 3 matches
  }
  
  // Default if no matches
  return ['Policy Reform', 'Government Accountability'];
};

// Add the classifyPoliticalStatement function with rule-based approach
export const classifyPoliticalStatement = async (statement) => {
  if (!statement || statement.trim() === '') {
    return { terms: [], confidenceScores: {} };
  }
  
  // Initialize the model to maintain API compatibility
  await initializeModel();
  
  try {
    // Map the statement to policy terms
    const mappedTerms = await mapUserPriority(statement);
    
    // Create confidence scores
    const confidenceScores = {};
    mappedTerms.forEach((term, index) => {
      // Assign decreasing confidence scores based on position
      confidenceScores[term] = 0.9 - (index * 0.1);
    });
    
    return {
      terms: mappedTerms,
      confidenceScores
    };
  } catch (error) {
    console.error('Error classifying statement:', error);
    // Provide basic default response on error
    return {
      terms: ['Policy Reform', 'Government Accountability'],
      confidenceScores: {
        'Policy Reform': 0.6,
        'Government Accountability': 0.6
      }
    };
  }
};
