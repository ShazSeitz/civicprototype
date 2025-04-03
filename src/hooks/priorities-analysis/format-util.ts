
// Format analysis text for better readability
export const formatAnalysisText = (text: string): string => {
  if (!text || text.includes('\n\n')) {
    return text;
  }
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length >= 4) {
    const paraLength = Math.ceil(sentences.length / 3);
    let newAnalysis = '';
    for (let i = 0; i < sentences.length; i += paraLength) {
      const paragraph = sentences.slice(i, i + paraLength).join(' ');
      newAnalysis += paragraph + '\n\n';
    }
    return newAnalysis.trim();
  }
  
  return text;
};

// Format conflict text with references to the original text
export const enhanceConflictingPriorities = (
  conflictingPriorities: string[], 
  userPriorities: string[]
): string[] => {
  if (conflictingPriorities.length === 0 || userPriorities.length === 0) {
    return conflictingPriorities;
  }
  
  return conflictingPriorities.map(conflict => {
    let enhancedConflict = conflict;
    
    const priorityRefPattern = /(priority|priorities)\s+#(\d+)(?:\s+and\s+#(\d+))?/gi;
    
    enhancedConflict = enhancedConflict.replace(priorityRefPattern, (match, term, firstNum, secondNum) => {
      const firstIndex = parseInt(firstNum) - 1;
      
      if (firstIndex >= 0 && firstIndex < userPriorities.length) {
        const firstPriority = `"${userPriorities[firstIndex].substring(0, 30)}${userPriorities[firstIndex].length > 30 ? '...' : ''}"`;
        
        if (secondNum) {
          const secondIndex = parseInt(secondNum) - 1;
          if (secondIndex >= 0 && secondIndex < userPriorities.length) {
            const secondPriority = `"${userPriorities[secondIndex].substring(0, 30)}${userPriorities[secondIndex].length > 30 ? '...' : ''}"`;
            return `${term} ${firstPriority} and ${secondPriority}`;
          }
        }
        return `${term} ${firstPriority}`;
      }
      return match;
    });
    
    return enhancedConflict;
  });
};

// Create priority mappings for display
export const createPriorityMappings = (
  userPriorities: string[],
  feedbackPriorities: string[],
  priorityToTermsMap: Record<number, string[]> | undefined,
  feedbackToTermsMap: Record<number, string[]> | undefined,
  mappedPriorities: string[] | undefined
): Array<{ userConcern: string; mappedTerms: string[] }> => {
  const priorityMappings: Array<{ userConcern: string; mappedTerms: string[] }> = [];
  
  // Process the main priorities
  if (userPriorities.length > 0) {
    userPriorities.forEach((priority, index) => {
      if (!priority.trim()) return; // Skip empty priorities
      
      const mappedTerms = priorityToTermsMap?.[index] || [];
      
      const terms = mappedTerms.length > 0 ? mappedTerms : 
                  mappedPriorities?.slice(0, 2) || [];
      
      priorityMappings.push({
        userConcern: priority,
        mappedTerms: terms.map((term: string) => {
          return term.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
        })
      });
    });
  }

  // Process feedback priorities
  if (feedbackPriorities.length > 0) {
    feedbackPriorities.forEach((priority, index) => {
      if (!priority.trim()) return; // Skip empty feedback
      
      const mappedTerms = feedbackToTermsMap?.[index] || [];
      
      const terms = mappedTerms.length > 0 ? mappedTerms :
                  mappedPriorities?.slice(0, 2) || [];
      
      priorityMappings.push({
        userConcern: priority,
        mappedTerms: terms.map((term: string) => {
          return term.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
        })
      });
    });
  }
  
  return priorityMappings;
};
