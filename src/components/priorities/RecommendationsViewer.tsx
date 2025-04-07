import { useRef, useEffect } from 'react';
import { RecommendationsData } from '@/types/api';
import { Mode } from '@/contexts/ModeContext';

interface RecommendationsViewerProps {
  recommendations: RecommendationsData;
  mode: Mode;
}

export const RecommendationsViewer = ({
  recommendations,
  mode
}: RecommendationsViewerProps) => {
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div ref={recommendationsRef} className="space-y-6">
      <h3 className="text-lg font-semibold">Recommendations</h3>
      
      {/* Summary */}
      <div className="space-y-2">
        <h4 className="font-medium">Summary</h4>
        <p className="text-sm text-gray-600">{recommendations.summary}</p>
      </div>

      {/* Mapped Priorities */}
      <div className="space-y-2">
        <h4 className="font-medium">Your Priorities</h4>
        <ul className="list-disc list-inside space-y-1">
          {recommendations.priorities.map((priority, index) => (
            <li key={index} className="text-sm text-gray-600">{priority}</li>
          ))}
        </ul>
      </div>

      {/* Conflicts */}
      {recommendations.conflicts && recommendations.conflicts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Potential Conflicts</h4>
          <ul className="list-disc list-inside space-y-1">
            {recommendations.conflicts.map((conflict, index) => (
              <li key={index} className="text-sm text-gray-600">{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Candidates */}
      {recommendations.candidates && recommendations.candidates.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Candidate Recommendations</h4>
          <div className="space-y-4">
            {recommendations.candidates.map((candidate, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium">{candidate.name} ({candidate.party})</h5>
                {candidate.office && (
                  <p className="text-sm text-gray-600">Running for: {candidate.office}</p>
                )}
                <p className="text-sm mt-2">
                  <span className="font-medium">Recommendation: </span>
                  {candidate.recommendation.stance} - {candidate.recommendation.reason}
                </p>
                {candidate.keyPositions && candidate.keyPositions.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Key Positions:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {candidate.keyPositions.map((position, idx) => (
                        <li key={idx}>{position}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ballot Measures */}
      {recommendations.ballotMeasures && recommendations.ballotMeasures.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Ballot Measure Recommendations</h4>
          <div className="space-y-4">
            {recommendations.ballotMeasures.map((measure, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium">{measure.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{measure.description}</p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Recommendation: </span>
                  {measure.recommendation.stance} - {measure.recommendation.reason}
                </p>
                {measure.supportingGroups && measure.supportingGroups.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Supporting Groups:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {measure.supportingGroups.map((group, idx) => (
                        <li key={idx}>{group.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {measure.opposingGroups && measure.opposingGroups.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Opposing Groups:</span>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {measure.opposingGroups.map((group, idx) => (
                        <li key={idx}>{group.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Templates */}
      {recommendations.emailTemplates && recommendations.emailTemplates.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Draft Emails</h4>
          <div className="space-y-4">
            {recommendations.emailTemplates.map((template, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Subject: {template.subject}</p>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{template.body}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Recipients: </span>
                  <span className="text-sm text-gray-600">{template.recipients.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Civic Actions */}
      {recommendations.civicActions && recommendations.civicActions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Suggested Actions</h4>
          <div className="space-y-4">
            {recommendations.civicActions.map((action, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium">{action.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                {action.link && (
                  <a 
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Learn More
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode-specific content */}
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500">
          {mode === 'direct' 
            ? "These recommendations directly match your stated priorities."
            : "These recommendations include related issues that might interest you based on your priorities."}
        </p>
      </div>
    </div>
  );
};
