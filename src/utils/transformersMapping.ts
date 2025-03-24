
import { pipeline, env } from '@huggingface/transformers';
import issueTerminology from '@/config/issueTerminology.json';

// Enable using WebGPU if available for better performance
env.useBrowserCache = true;
env.allowLocalModels = true;

// Pre-defined label mapping (similar to the Python example)
const labelMapping: Record<number, string> = {
  0: "socialJustice",
  1: "economy",
  2: "antiDiscrimination",
  3: "taxWealthyMore",
  4: "healthcare",
  5: "climate",
  6: "immigration",
  7: "education",
  8: "publicSafety",
  9: "civilLiberties",
  10: "lgbtqRights",
  11: "reproductiveRights",
  12: "housing"
};

// Map model output labels to our terminology keys
const modelLabelToTerminologyKey: Record<string, string> = {
  "socialJustice": "civilLiberties",
  "economy": "economy",
  "antiDiscrimination": "civilLiberties",
  "taxWealthyMore": "taxWealthyMore",
  "healthcare": "healthcare",
  "climate": "climate",
  "immigration": "immigration",
  "education": "education", 
  "publicSafety": "publicSafety",
  "civilLiberties": "civilLiberties",
  "lgbtqRights": "lgbtqRights",
  "reproductiveRights": "reproductiveRights",
  "housing": "housing"
};

// Cache for the model pipeline
let classifierPipeline: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

/**
 * Initialize the model (should be called early in app lifecycle)
 */
export const initializeModel = async (): Promise<void> => {
  if (classifierPipeline !== null || isModelLoading) {
    return modelLoadPromise;
  }
  
  isModelLoading = true;
  
  // We'll use the DistilBERT model for sentiment analysis as a demonstration
  // In a real implementation, you'd use a fine-tuned model for political classification
  modelLoadPromise = new Promise(async (resolve) => {
    try {
      console.log('Loading text classification model...');
      classifierPipeline = await pipeline(
        'text-classification',
        'distilbert-base-uncased-finetuned-sst-2-english', // Fallback to sentiment analysis model
        { topk: 1, device: 'webgpu' }
      );
      console.log('Model loaded successfully');
      resolve();
    } catch (error) {
      console.error('Error loading model:', error);
      // Fall back to zero-shot classification which has broader capabilities
      try {
        console.log('Falling back to zero-shot classification...');
        classifierPipeline = await pipeline(
          'zero-shot-classification',
          'facebook/bart-large-mnli',
          { device: 'webgpu' }
        );
        console.log('Zero-shot model loaded successfully');
        resolve();
      } catch (fallbackError) {
        console.error('Error loading fallback model:', fallbackError);
        // Create a mock classifier that uses rule-based approach when model loading fails
        classifierPipeline = {
          mockClassifier: true,
          __call__: async (text: string) => {
            return await ruleBasedClassify(text);
          }
        };
        console.log('Using rule-based classifier due to model loading failures');
        resolve();
      }
    } finally {
      isModelLoading = false;
    }
  });
  
  return modelLoadPromise;
};

/**
 * Rule-based classification as a fallback
 */
const ruleBasedClassify = async (text: string): Promise<any> => {
  const textLower = text.toLowerCase();
  
  // Similar to the Python example, implementing rule-based classification
  if (textLower.includes('discriminat') && (textLower.includes('race') || textLower.includes('racial'))) {
    return { 
      labels: ["antiDiscrimination"],
      scores: [0.95] 
    };
  }
  
  // Additional rules
  if (textLower.includes('tax') && (textLower.includes('rich') || textLower.includes('wealthy'))) {
    return { 
      labels: ["taxWealthyMore"],
      scores: [0.92] 
    };
  }
  
  if (textLower.includes('health') || textLower.includes('medical') || textLower.includes('insurance')) {
    return { 
      labels: ["healthcare"],
      scores: [0.9] 
    };
  }
  
  if (textLower.includes('climate') || textLower.includes('environment') || textLower.includes('global warming')) {
    return { 
      labels: ["climate"],
      scores: [0.91] 
    };
  }
  
  // Default fallback
  return { 
    labels: ["economy"], // Default to economy as a common concern
    scores: [0.7] 
  };
};

/**
 * Classify a political statement and map it to our terminology
 */
export const classifyPoliticalStatement = async (text: string): Promise<{
  terms: string[];
  confidenceScores: Record<string, number>;
  nuancedMappings?: Record<string, Record<string, any>>;
}> => {
  if (!classifierPipeline && !isModelLoading) {
    await initializeModel();
  } else if (isModelLoading) {
    await modelLoadPromise;
  }
  
  if (!classifierPipeline) {
    console.error('Model failed to load');
    return { terms: [], confidenceScores: {} };
  }
  
  try {
    let result;
    
    if (classifierPipeline.mockClassifier) {
      // Use our rule-based classifier
      result = await classifierPipeline.__call__(text);
    } else if (classifierPipeline.task === 'zero-shot-classification') {
      // For zero-shot, provide candidate labels based on our terminology
      const candidateLabels = Object.keys(modelLabelToTerminologyKey);
      result = await classifierPipeline(text, candidateLabels, { multi_label: true });
    } else {
      // Standard classification
      result = await classifierPipeline(text);
    }
    
    console.log('Classification result:', result);
    
    // Process results based on the type of classifier
    let mappedLabels: string[] = [];
    let scores: Record<string, number> = {};
    
    if (classifierPipeline.task === 'zero-shot-classification') {
      // Process zero-shot results
      const threshold = 0.5; // Minimum confidence threshold
      mappedLabels = result.labels.filter((_: string, i: number) => result.scores[i] > threshold)
        .map((label: string) => modelLabelToTerminologyKey[label] || label);
        
      // Record scores
      result.labels.forEach((label: string, i: number) => {
        const termKey = modelLabelToTerminologyKey[label] || label;
        scores[termKey] = result.scores[i];
      });
    } else {
      // Process standard classification results
      if (Array.isArray(result)) {
        result.forEach((item) => {
          const labelIndex = parseInt(item.label.replace('LABEL_', ''));
          const modelLabel = labelMapping[labelIndex] || item.label;
          const termKey = modelLabelToTerminologyKey[modelLabel] || modelLabel;
          
          mappedLabels.push(termKey);
          scores[termKey] = item.score;
        });
      } else if (result.labels) {
        // For rule-based or custom format
        mappedLabels = result.labels.map((label: string) => {
          return modelLabelToTerminologyKey[label] || label;
        });
        
        result.labels.forEach((label: string, i: number) => {
          const termKey = modelLabelToTerminologyKey[label] || label;
          scores[termKey] = result.scores ? result.scores[i] : 0.8;
        });
      }
    }
    
    // Final mapping to our terminology structure - ensure we return valid keys
    const validTerms = mappedLabels.filter(term => 
      issueTerminology[term as keyof typeof issueTerminology] !== undefined
    );
    
    // If no valid terms are found, try rule-based as a final fallback
    if (validTerms.length === 0) {
      const ruleBasedResult = await ruleBasedClassify(text);
      return await classifyPoliticalStatement(text + " " + ruleBasedResult.labels[0]);
    }

    // Extract nuanced mappings for the valid terms
    const nuancedMappings: Record<string, Record<string, any>> = {};
    validTerms.forEach(term => {
      const termData = issueTerminology[term as keyof typeof issueTerminology];
      if (termData && termData.nuancedMapping) {
        nuancedMappings[term] = termData.nuancedMapping;
      }
    });
    
    return {
      terms: validTerms,
      confidenceScores: scores,
      nuancedMappings: Object.keys(nuancedMappings).length > 0 ? nuancedMappings : undefined
    };
  } catch (error) {
    console.error('Error classifying text:', error);
    return { terms: [], confidenceScores: {} };
  }
};

/**
 * Enhanced terminology mapping that incorporates the ML model
 */
export const enhancedTerminologyMapping = async (
  priorities: string[]
): Promise<{
  mappedPriorities: string[];
  unmappedTerms: string[];
  analysis: string;
  modelInsights: Record<string, any>;
  nuancedMappings?: Record<string, Record<string, any>>;
}> => {
  // Initialize the model if it hasn't been yet
  await initializeModel();
  
  // Store classification results for each priority
  const classificationResults = await Promise.all(
    priorities.map(async (priority) => {
      if (!priority.trim()) return { terms: [], confidenceScores: {} };
      return await classifyPoliticalStatement(priority);
    })
  );
  
  // Combine results - we'll collect all terms with their confidence scores
  const termScores: Record<string, number> = {};
  const priorityToTermsMap: Record<number, string[]> = {};
  const allNuancedMappings: Record<string, Record<string, any>> = {};
  
  classificationResults.forEach((result, priorityIndex) => {
    priorityToTermsMap[priorityIndex] = result.terms;
    
    result.terms.forEach(term => {
      // Sum up confidence scores for each term across all priorities
      const score = result.confidenceScores[term] || 0.5;
      termScores[term] = (termScores[term] || 0) + score;
      
      // Collect nuanced mappings
      if (result.nuancedMappings && result.nuancedMappings[term]) {
        allNuancedMappings[term] = result.nuancedMappings[term];
      }
    });
  });
  
  // Sort terms by total confidence score
  const sortedTerms = Object.entries(termScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([term]) => term);
  
  // Generate analysis text based on the mapped terms
  let analysis = "Based on your priorities, we've identified several key policy areas that align with your concerns. ";
  
  if (sortedTerms.length > 0) {
    // Get the plain English descriptions for the top terms
    const topTerms = sortedTerms.slice(0, Math.min(3, sortedTerms.length));
    const descriptions = topTerms.map(term => {
      const termData = issueTerminology[term as keyof typeof issueTerminology];
      return termData ? termData.plainEnglish : `interests related to ${term}`;
    });
    
    analysis += "Your priorities most strongly relate to " + descriptions.join(", ") + ". ";
    analysis += "\n\nOur system has mapped your personal concerns to standardized policy terms that can help you compare candidates and issues. ";
    analysis += "Please review our mapping and let us know if we've missed anything important to you.";
  } else {
    analysis += "We couldn't clearly identify specific policy areas from your input. Please review our mapping or try providing more specific concerns.";
  }
  
  // Identify any priorities that didn't map to terms
  const unmappedPriorities = priorities.filter((_, index) => 
    !priorityToTermsMap[index] || priorityToTermsMap[index].length === 0
  );
  
  return {
    mappedPriorities: sortedTerms,
    unmappedTerms: unmappedPriorities,
    analysis,
    modelInsights: {
      priorityToTermsMap,
      confidenceScores: termScores
    },
    nuancedMappings: Object.keys(allNuancedMappings).length > 0 ? allNuancedMappings : undefined
  };
};
