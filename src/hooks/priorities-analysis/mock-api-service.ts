import { VoterFormValues } from '@/schemas/voterFormSchema';
import { RecommendationsData } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useMode } from '@/contexts/ModeContext';
import { PriorityMappingService } from '@/services/priority-mapping-service';

const priorityMapper = new PriorityMappingService();

export function createMockApiService(toast: ReturnType<typeof useToast>) {
  return {
    analyzePriorities: async (
      formData: VoterFormValues,
      feedbackPriorities: string[]
    ): Promise<{ ok: boolean; data?: RecommendationsData; error?: string }> => {
      const { mode } = useMode();
      const { zipCode, priorities } = formData;
      const allPriorities = [...priorities, ...feedbackPriorities].filter(p => p.trim().length > 0);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use our priority mapping service to analyze priorities
      const analysis = priorityMapper.analyzePriorities(allPriorities);

      // Generate recommendations based on mapped priorities
      const recommendations: RecommendationsData = {
        zipCode,
        mode,
        analysis: {
          summary: "Based on your priorities, here are your recommendations",
          priorities: allPriorities,
          conflicts: analysis.potentialConflicts.map(conflict => conflict.reason)
        },
        mappedPriorities: analysis.mappedPriorities.map(mp => ({
          userPriority: mp.userPriority,
          mappedTerms: mp.mappedIssues.flatMap(mi => mi.matchedTerms)
        })),
        candidates: analysis.dominantCategories.map(category => ({
          name: `${category} Advocate`,
          party: "Independent",
          office: "City Council",
          recommendation: {
            stance: 'support',
            reason: `Strong track record on ${category.toLowerCase().replace('_', ' ')} issues`
          },
          priorityMatches: analysis.mappedPriorities
            .filter(mp => mp.mappedIssues.some(mi => mi.issue.category === category))
            .map(mp => ({
              userPriority: mp.userPriority,
              mappedTerms: mp.mappedIssues.flatMap(mi => mi.matchedTerms)
            })),
          keyPositions: [
            `${category.toLowerCase().replace('_', ' ')} reform advocate`,
            'Community engagement leader',
            'Data-driven decision maker'
          ]
        })),
        ballotMeasures: analysis.dominantCategories.map(category => ({
          title: `${category} Initiative`,
          description: `A measure to improve ${category.toLowerCase().replace('_', ' ')} in our community`,
          recommendation: {
            stance: 'support',
            reason: `Aligns with your priorities on ${category.toLowerCase().replace('_', ' ')}`
          },
          priorityMatches: analysis.mappedPriorities
            .filter(mp => mp.mappedIssues.some(mi => mi.issue.category === category))
            .map(mp => ({
              userPriority: mp.userPriority,
              mappedTerms: mp.mappedIssues.flatMap(mi => mi.matchedTerms)
            })),
          supportingGroups: [
            { name: `${category} Action Group`, description: `Leading advocates for ${category.toLowerCase().replace('_', ' ')}` }
          ],
          opposingGroups: []
        }))
      };

      return {
        ok: true,
        data: recommendations
      };
    }
  };
}
