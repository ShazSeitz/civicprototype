import { PoliticalIssue, MappedPriority } from '@/types/priority-mapping';

interface TermLearning {
  originalTerm: string;
  clarifiedTerm: string;
  confidence: number;
  usageCount: number;
}

export class PriorityLearningService {
  // Session-specific learned mappings
  private sessionMappings = new Map<string, TermLearning>();
  
  // Threshold for considering terms similar
  private readonly SIMILARITY_THRESHOLD = 0.7;

  /**
   * Calculate similarity between two terms
   * Using a simple but effective algorithm that can be enhanced later
   */
  private calculateSimilarity(term1: string, term2: string): number {
    const normalize = (str: string) => str.toLowerCase().trim();
    const t1 = normalize(term1);
    const t2 = normalize(term2);
    
    // Check for exact match or containment
    if (t1 === t2) return 1;
    if (t1.includes(t2) || t2.includes(t1)) {
      return Math.min(t1.length, t2.length) / Math.max(t1.length, t2.length);
    }

    // Calculate word overlap
    const words1 = new Set(t1.split(/\s+/));
    const words2 = new Set(t2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Learn from user clarification
   * @param originalPriority The original priority text
   * @param clarification The user's clarification
   * @param mappedIssue The issue it was eventually mapped to
   */
  learnFromClarification(
    originalPriority: string,
    clarification: string,
    mappedIssue: PoliticalIssue
  ): void {
    const key = `${originalPriority}:${mappedIssue.id}`;
    const existing = this.sessionMappings.get(key);

    if (existing) {
      // Update existing mapping
      this.sessionMappings.set(key, {
        ...existing,
        usageCount: existing.usageCount + 1,
        confidence: Math.min(1, existing.confidence + 0.1)
      });
    } else {
      // Create new mapping
      this.sessionMappings.set(key, {
        originalTerm: originalPriority,
        clarifiedTerm: clarification,
        confidence: 0.6, // Start with moderate confidence
        usageCount: 1
      });
    }
  }

  /**
   * Apply learned mappings to enhance priority matching
   * @param priority The priority to check
   * @param issues Available political issues
   * @returns Enhanced confidence scores for matching
   */
  enhanceMatching(
    priority: string,
    issues: PoliticalIssue[]
  ): Array<{ issue: PoliticalIssue; confidenceBoost: number }> {
    const enhancements: Array<{ issue: PoliticalIssue; confidenceBoost: number }> = [];

    issues.forEach(issue => {
      const key = `${priority}:${issue.id}`;
      const learned = this.sessionMappings.get(key);

      if (learned) {
        // Direct match from learning
        enhancements.push({
          issue,
          confidenceBoost: learned.confidence * 0.3 // Cap the boost at 30%
        });
      } else {
        // Check for similar terms we've learned about
        for (const [, mapping] of this.sessionMappings) {
          const similarityToOriginal = this.calculateSimilarity(
            priority,
            mapping.originalTerm
          );
          
          if (similarityToOriginal > this.SIMILARITY_THRESHOLD) {
            enhancements.push({
              issue,
              confidenceBoost: similarityToOriginal * mapping.confidence * 0.2 // Cap at 20% for similarity matches
            });
          }
        }
      }
    });

    return enhancements;
  }

  /**
   * Get statistics about learned mappings
   */
  getLearningStats(): {
    totalMappings: number;
    averageConfidence: number;
  } {
    const mappings = Array.from(this.sessionMappings.values());
    const total = mappings.length;
    const avgConfidence = total > 0
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / total
      : 0;

    return {
      totalMappings: total,
      averageConfidence: avgConfidence
    };
  }
}
