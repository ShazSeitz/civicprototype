import { PriorityMappingService } from '@/services/priority-mapping-service';
import { TEST_PERSONAS } from './personas';
import { PoliticalCategory } from '@/types/priority-mapping';

describe('Priority Mapping Tests', () => {
  const mapper = new PriorityMappingService();

  TEST_PERSONAS.forEach(persona => {
    describe(`Persona: ${persona.description}`, () => {
      const analysis = mapper.analyzePriorities(persona.values.priorities);

      test('maps to expected categories', () => {
        const foundCategories = analysis.dominantCategories;
        persona.expectedCategories.forEach(expected => {
          expect(foundCategories).toContain(expected as PoliticalCategory);
        });
      });

      test('has reasonable confidence scores', () => {
        analysis.mappedPriorities.forEach(mapped => {
          // Each priority should map to at least one issue
          expect(mapped.mappedIssues.length).toBeGreaterThan(0);
          
          // Top match should have reasonable confidence
          const topMatch = mapped.mappedIssues[0];
          expect(topMatch.confidence).toBeGreaterThan(0.3);
        });
      });

      test('identifies relevant terms', () => {
        analysis.mappedPriorities.forEach(mapped => {
          // Each mapping should have some matched terms
          const hasMatchedTerms = mapped.mappedIssues.some(
            mi => mi.matchedTerms.length > 0
          );
          expect(hasMatchedTerms).toBe(true);
        });
      });
    });
  });

  test('handles nuanced policy positions', () => {
    const nuancedPriorities = [
      'fair hiring practices',
      'affirmative action in education',
      'merit-based employment',
      'workplace diversity initiatives'
    ];

    const analysis = mapper.analyzePriorities(nuancedPriorities);
    
    // Should identify both employment and equity aspects
    expect(analysis.dominantCategories).toContain('ECONOMY');
    expect(analysis.dominantCategories).toContain('SOCIAL_SERVICES');

    // Should find potential conflicts
    expect(analysis.potentialConflicts.length).toBeGreaterThan(0);
  });
});
