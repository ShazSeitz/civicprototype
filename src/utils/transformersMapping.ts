// This file provides utility functions for mapping user priorities to policy terms
// using a simplified rule-based approach

// We're removing the Transformers.js dependencies due to loading issues
// and implementing a more reliable rule-based approach

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
  
  // Rule-based approach
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

// Add the classifyPoliticalStatement function with rule-based approach
export const classifyPoliticalStatement = async (statement) => {
  if (!statement || statement.trim() === '') {
    return { terms: [], confidenceScores: {} };
  }
  
  // Initialize the model to maintain API compatibility
  await initializeModel();
  
  try {
    // Use rule-based approach directly
    const normalizedInput = statement.toLowerCase();
    
    // Map for common political themes
    const politicalThemes = {
      'tax': ['Tax Policy', 'Fiscal Policy'],
      'spend': ['Government Spending', 'Fiscal Responsibility'],
      'health': ['Healthcare', 'Public Health'],
      'medic': ['Healthcare Policy', 'Medicare', 'Medicaid'],
      'education': ['Education Policy', 'School Reform'],
      'school': ['Education Policy', 'School Choice'],
      'environment': ['Environmental Protection', 'Climate Policy'],
      'climate': ['Climate Change', 'Environmental Policy'],
      'job': ['Employment', 'Economic Policy'],
      'economy': ['Economic Policy', 'Fiscal Policy'],
      'immigr': ['Immigration Reform', 'Border Security'],
      'border': ['Border Security', 'Immigration Policy'],
      'gun': ['Gun Rights', 'Second Amendment', 'Gun Control'],
      'right': ['Civil Rights', 'Constitutional Rights'],
      'freedom': ['Civil Liberties', 'Personal Freedom'],
      'security': ['National Security', 'Public Safety'],
      'military': ['Defense Policy', 'Veterans Affairs'],
      'foreign': ['Foreign Policy', 'International Relations'],
      'abortion': ['Reproductive Rights', 'Healthcare Policy'],
      'vote': ['Voting Rights', 'Election Security', 'Democratic Reform']
    };
    
    // Find matching political themes
    const terms = [];
    const confidenceScores = {};
    
    for (const [keyword, relatedTerms] of Object.entries(politicalThemes)) {
      if (normalizedInput.includes(keyword)) {
        relatedTerms.forEach(term => {
          if (!terms.includes(term)) {
            terms.push(term);
            // Assign higher confidence for more specific matches
            const matchLength = keyword.length;
            const baseConfidence = 0.7;
            const lengthBonus = matchLength / 20; // Longer matches get higher confidence
            const confidence = Math.min(0.95, baseConfidence + lengthBonus);
            confidenceScores[term] = confidence;
          }
        });
      }
    }
    
    // If we found themes, return them (up to 3)
    if (terms.length > 0) {
      return { 
        terms: terms.slice(0, 3), 
        confidenceScores 
      };
    }
    
    // Fall back to more generic mapping as last resort
    const policyTerms = await mapUserPriority(statement);
    const fallbackScores = {};
    
    policyTerms.forEach(term => {
      fallbackScores[term] = 0.7; // Default confidence score
    });
    
    return {
      terms: policyTerms,
      confidenceScores: fallbackScores
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
