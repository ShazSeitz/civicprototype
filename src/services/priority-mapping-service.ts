import { PoliticalIssue, PoliticalCategory, MappedPriority, PriorityAnalysis, ConflictDefinition } from '@/types/priority-mapping';
import { POLITICAL_ISSUES, ISSUE_CONFLICTS } from '@/data/political-issues';

export class PriorityMappingService {
  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private calculateTermMatch(priority: string, terms: string[]): number {
    const normalizedPriority = this.normalizeText(priority);
    let maxScore = 0;

    terms.forEach(term => {
      const normalizedTerm = this.normalizeText(term);
      if (normalizedPriority.includes(normalizedTerm)) {
        // Calculate match score based on term length and position
        const score = (term.length / priority.length) * 
          (normalizedPriority.startsWith(normalizedTerm) ? 1.2 : 1.0);
        maxScore = Math.max(maxScore, score);
      }
    });

    return maxScore;
  }

  private findPolicyConflicts(mappedIssues: PoliticalIssue[]): ConflictDefinition[] {
    const conflicts: ConflictDefinition[] = [];

    // Check direct conflicts from ISSUE_CONFLICTS
    ISSUE_CONFLICTS.forEach(conflict => {
      const [issue1, issue2] = conflict.issues;
      if (mappedIssues.some(i => i.id === issue1) && 
          mappedIssues.some(i => i.id === issue2)) {
        conflicts.push(conflict);
      }
    });

    // Check policy approach conflicts
    mappedIssues.forEach(issue1 => {
      if (!issue1.policyApproaches) return;

      mappedIssues.forEach(issue2 => {
        if (issue1 === issue2 || !issue2.policyApproaches) return;

        issue1.policyApproaches.forEach(approach1 => {
          issue2.policyApproaches.forEach(approach2 => {
            if (approach1.conflictingApproaches?.includes(approach2.name) ||
                approach2.conflictingApproaches?.includes(approach1.name)) {
              conflicts.push({
                issues: [issue1.id, issue2.id],
                reason: `Conflicting approaches: ${approach1.name} vs ${approach2.name}`,
                severity: 'medium',
                type: 'implementation',
                possibleCompromises: [
                  `Consider balanced approach between ${approach1.name} and ${approach2.name}`,
                  'Seek expert mediation for implementation strategy'
                ]
              });
            }
          });
        });
      });
    });

    // Check opposing issues
    mappedIssues.forEach(issue => {
      if (!issue.opposingIssues) return;

      issue.opposingIssues.forEach(opposingId => {
        const opposingIssue = mappedIssues.find(i => i.id === opposingId);
        if (opposingIssue) {
          conflicts.push({
            issues: [issue.id, opposingId],
            reason: `Direct policy opposition between ${issue.name} and ${opposingIssue.name}`,
            severity: 'high',
            type: 'policy',
            possibleCompromises: [
              'Seek balanced approach considering both perspectives',
              'Consider phased implementation to address concerns'
            ]
          });
        }
      });
    });

    return conflicts;
  }

  private mapSinglePriority(priority: string): MappedPriority {
    const mappedIssues = POLITICAL_ISSUES.map(issue => {
      // Check for exact matches in synonyms
      const synonymMatch = issue.synonyms.some(
        syn => this.normalizeText(priority) === this.normalizeText(syn)
      ) ? 1 : 0;

      // Check for partial matches in synonyms and related terms
      const termMatch = this.calculateTermMatch(
        priority,
        [...issue.synonyms, ...issue.relatedTerms]
      );

      // Calculate final confidence score
      const confidence = Math.max(
        synonymMatch,
        termMatch * issue.weight
      );

      return {
        issue,
        confidence,
        matchedTerms: [...issue.synonyms, ...issue.relatedTerms].filter(
          term => this.normalizeText(priority).includes(this.normalizeText(term))
        )
      };
    }).filter(match => match.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      userPriority: priority,
      mappedIssues
    };
  }

  analyzePriorities(priorities: string[]): PriorityAnalysis {
    // Map each priority to political issues
    const mappedPriorities = priorities
      .filter(priority => priority.trim().length > 0)
      .map(priority => this.mapSinglePriority(priority));

    // Find dominant categories with weighted scoring
    const categoryScores = new Map<PoliticalCategory, number>();
    mappedPriorities.forEach(mapped => {
      mapped.mappedIssues.forEach(({ issue, confidence }) => {
        const currentScore = categoryScores.get(issue.category) || 0;
        categoryScores.set(issue.category, currentScore + confidence);
      });
    });

    const dominantCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Get all mapped issues for conflict detection
    const allMappedIssues = Array.from(new Set(
      mappedPriorities.flatMap(mp => 
        mp.mappedIssues.map(mi => mi.issue)
      )
    ));

    // Find potential conflicts
    const potentialConflicts = this.findPolicyConflicts(allMappedIssues);

    return {
      mappedPriorities,
      dominantCategories,
      potentialConflicts
    };
  }
}
