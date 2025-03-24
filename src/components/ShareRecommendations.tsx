import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function ShareRecommendations({ 
  recommendationsData, 
  zipCode,
  userPriorities = [],
  userClarifications = []
}: { 
  recommendationsData: any, 
  zipCode?: string,
  userPriorities?: string[],
  userClarifications?: string[]
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSavePDF = async () => {
    setIsSaving(true);
    toast({
      title: "Preparing PDF",
      description: "Please wait while we generate your PDF...",
    });

    try {
      // Wait a moment to ensure UI is up to date
      setTimeout(async () => {
        // Create a container to hold the content we want to capture
        const contentContainer = document.createElement('div');
        contentContainer.className = 'pdf-content';
        contentContainer.style.width = '800px';
        contentContainer.style.padding = '40px';
        contentContainer.style.fontFamily = 'Arial, sans-serif';
        contentContainer.style.backgroundColor = 'white';
        contentContainer.style.position = 'absolute';
        contentContainer.style.left = '-9999px';
        document.body.appendChild(contentContainer);

        // Create content for PDF
        contentContainer.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 10px; color: #333;">Voter Information Guide</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            ${zipCode ? `<p>For Zip Code: ${zipCode}</p>` : ''}
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; margin-bottom: 10px; color: #555;">Your Priorities</h2>
            <ul style="padding-left: 20px;">
              ${userPriorities.map((priority, index) => `
                <li style="margin-bottom: 6px;">${priority}</li>
              `).join('')}
            </ul>
            
            ${userClarifications.length > 0 ? `
              <h3 style="font-size: 16px; margin-top: 15px; margin-bottom: 10px; color: #555;">Your Clarifications</h3>
              <ul style="padding-left: 20px;">
                ${userClarifications.map((clarification) => `
                  <li style="margin-bottom: 6px;">${clarification}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 20px; margin-bottom: 10px; color: #555;">Mapped Priorities</h2>
            <ul style="padding-left: 20px;">
              ${recommendationsData.mappedPriorities.map((priority: string) => `
                <li style="margin-bottom: 6px;">${priority}</li>
              `).join('')}
            </ul>
          </div>
          
          ${recommendationsData.candidates && recommendationsData.candidates.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: #555;">Candidate Recommendations</h2>
              
              <!-- Presidential Candidates Section -->
              ${recommendationsData.candidates.some((c: any) => c.office?.toLowerCase().includes('president')) ? `
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 18px; margin-bottom: 10px; color: #555;">Presidential Candidates</h3>
                  <div style="margin-bottom: 15px;">
                    ${recommendationsData.candidates
                      .filter((c: any) => c.office?.toLowerCase().includes('president'))
                      .map((candidate: any) => `
                        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                          <h4 style="font-size: 16px; margin: 0 0 5px 0;">${candidate.name} (${candidate.party})</h4>
                          
                          <div style="margin-top: 10px;">
                            <h5 style="font-size: 14px; margin: 0 0 5px 0;">Platform Highlights</h5>
                            <ul style="margin: 0; padding-left: 20px;">
                              ${(candidate.platformHighlights || []).map((point: string) => `
                                <li style="font-size: 12px;">${point}</li>
                              `).join('')}
                              ${(!candidate.platformHighlights || candidate.platformHighlights.length === 0) ? `
                                <li style="font-size: 12px; color: #777;">No platform highlights available</li>
                              ` : ''}
                            </ul>
                          </div>
                          
                          ${candidate.alignment ? `
                            <div style="margin-top: 10px;">
                              <h5 style="font-size: 14px; margin: 0 0 5px 0;">Alignment with Your Priorities</h5>
                              ${candidate.alignment.supportedPriorities.length > 0 ? `
                                <p style="font-size: 12px; margin: 0 0 3px 0;"><strong>Supports:</strong> ${candidate.alignment.supportedPriorities.join(', ')}</p>
                              ` : ''}
                              ${candidate.alignment.conflictingPriorities.length > 0 ? `
                                <p style="font-size: 12px; margin: 0; color: #d32f2f;"><strong>Conflicts:</strong> ${candidate.alignment.conflictingPriorities.join(', ')}</p>
                              ` : ''}
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                  </div>
                </div>
              ` : ''}
              
              <!-- Other Candidates Section -->
              ${(() => {
                // Group other candidates by office
                const candidatesByOffice: Record<string, any[]> = {};
                recommendationsData.candidates
                  .filter((c: any) => !c.office?.toLowerCase().includes('president'))
                  .forEach((candidate: any) => {
                    const office = candidate.office || 'Other';
                    if (!candidatesByOffice[office]) {
                      candidatesByOffice[office] = [];
                    }
                    candidatesByOffice[office].push(candidate);
                  });
                
                return Object.entries(candidatesByOffice).map(([office, candidates]) => `
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 18px; margin-bottom: 10px; color: #555;">${office}</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <tr style="background-color: #f5f5f5;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Issue/Candidate</th>
                        ${candidates.map((c: any) => `
                          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${c.name} (${c.party})</th>
                        `).join('')}
                      </tr>
                      <!-- Get all unique issues across candidates in this office -->
                      ${(() => {
                        const allIssues = Array.from(
                          new Set(candidates.flatMap((c: any) => (c.stances || []).map((s: any) => s.issue)))
                        );
                        
                        return allIssues.map(issue => `
                          <tr>
                            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${issue}</td>
                            ${candidates.map((candidate: any) => {
                              const stance = (candidate.stances || []).find((s: any) => s.issue === issue);
                              return `
                                <td style="border: 1px solid #ddd; padding: 8px;">
                                  ${stance ? `
                                    <div>
                                      <span style="
                                        display: inline-block; 
                                        padding: 2px 6px; 
                                        border-radius: 4px; 
                                        font-size: 11px;
                                        margin-bottom: 4px;
                                        background-color: ${
                                          stance.stance === 'support' ? '#e6f7e6' : 
                                          stance.stance === 'oppose' ? '#fce7e7' : 
                                          '#f0f0f0'
                                        };
                                        color: ${
                                          stance.stance === 'support' ? '#2e7d32' : 
                                          stance.stance === 'oppose' ? '#c62828' : 
                                          '#757575'
                                        };
                                        border: 1px solid ${
                                          stance.stance === 'support' ? '#a5d6a7' : 
                                          stance.stance === 'oppose' ? '#ef9a9a' : 
                                          '#e0e0e0'
                                        };"
                                      >
                                        ${stance.stance}
                                      </span>
                                      <div>${stance.description}</div>
                                    </div>
                                  ` : `<span style="color: #777;">No stated position</span>`}
                                </td>
                              `;
                            }).join('')}
                          </tr>
                        `).join('');
                      })()}
                      <!-- Add alignment row -->
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Alignment with Your Priorities</td>
                        ${candidates.map((candidate: any) => `
                          <td style="border: 1px solid #ddd; padding: 8px;">
                            ${candidate.alignment ? `
                              <div>
                                <span style="
                                  display: inline-block; 
                                  padding: 2px 6px; 
                                  border-radius: 4px; 
                                  font-size: 11px;
                                  margin-bottom: 4px;
                                  background-color: ${
                                    candidate.alignment.type === 'aligned' ? '#e6f7e6' : 
                                    candidate.alignment.type === 'opposing' ? '#fce7e7' : 
                                    '#f0f0f0'
                                  };
                                  color: ${
                                    candidate.alignment.type === 'aligned' ? '#2e7d32' : 
                                    candidate.alignment.type === 'opposing' ? '#c62828' : 
                                    '#757575'
                                  };
                                  border: 1px solid ${
                                    candidate.alignment.type === 'aligned' ? '#a5d6a7' : 
                                    candidate.alignment.type === 'opposing' ? '#ef9a9a' : 
                                    '#e0e0e0'
                                  };"
                                >
                                  ${candidate.alignment.type === 'aligned' ? 'Strong Match' :
                                   candidate.alignment.type === 'opposing' ? 'Weak Match' :
                                   'Partial Match'}
                                </span>
                                ${candidate.alignment.supportedPriorities.length > 0 ? `
                                  <div style="font-size: 11px; margin-top: 4px;">
                                    <strong>Supports:</strong> ${candidate.alignment.supportedPriorities.join(', ')}
                                  </div>
                                ` : ''}
                                ${candidate.alignment.conflictingPriorities.length > 0 ? `
                                  <div style="font-size: 11px; margin-top: 2px; color: #d32f2f;">
                                    <strong>Conflicts:</strong> ${candidate.alignment.conflictingPriorities.join(', ')}
                                  </div>
                                ` : ''}
                              </div>
                            ` : `<span style="color: #777;">Alignment unknown</span>`}
                          </td>
                        `).join('')}
                      </tr>
                    </table>
                  </div>
                `).join('');
              })()}
            </div>
          ` : ''}
          
          ${recommendationsData.ballotMeasures && recommendationsData.ballotMeasures.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: #555;">Ballot Measures</h2>
              
              ${recommendationsData.ballotMeasures.map((measure: any) => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                  <h3 style="font-size: 16px; margin: 0 0 10px 0;">${measure.title}</h3>
                  <p style="margin: 0 0 10px 0; font-size: 14px;">${measure.description}</p>
                  
                  ${measure.recommendation ? `
                    <div style="margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
                      <p style="margin: 0; font-weight: bold;">Recommendation: ${measure.recommendation}</p>
                    </div>
                  ` : ''}
                  
                  ${measure.matchedPriorities && measure.matchedPriorities.length > 0 ? `
                    <div style="margin: 10px 0;">
                      <p style="font-weight: bold; margin: 0 0 5px 0; font-size: 14px;">Matched Priorities:</p>
                      <ul style="margin: 0; padding-left: 20px;">
                        ${measure.matchedPriorities.map((priority: string) => `
                          <li style="font-size: 12px;">${priority}</li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  
                  <div style="display: flex; margin-top: 15px; font-size: 13px;">
                    <div style="flex: 1; padding-right: 10px;">
                      <p style="font-weight: bold; margin: 0 0 5px 0;">Supporting Groups:</p>
                      ${measure.supportingGroups && measure.supportingGroups.length > 0 ? `
                        <ul style="margin: 0; padding-left: 20px;">
                          ${measure.supportingGroups.map((group: string) => `
                            <li>${group}</li>
                          `).join('')}
                        </ul>
                      ` : `<p style="color: #777; margin: 0;">No information available</p>`}
                    </div>
                    
                    <div style="flex: 1; padding-left: 10px;">
                      <p style="font-weight: bold; margin: 0 0 5px 0;">Opposing Groups:</p>
                      ${measure.opposingGroups && measure.opposingGroups.length > 0 ? `
                        <ul style="margin: 0; padding-left: 20px;">
                          ${measure.opposingGroups.map((group: string) => `
                            <li>${group}</li>
                          `).join('')}
                        </ul>
                      ` : `<p style="color: #777; margin: 0;">No information available</p>`}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${recommendationsData.draftEmails && recommendationsData.draftEmails.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: #555;">Email Templates for Officials</h2>
              
              ${recommendationsData.draftEmails.map((email: any, index: number) => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                  <h3 style="font-size: 16px; margin: 0 0 5px 0;">For: ${email.officialName} (${email.role})</h3>
                  <p style="margin: 0 0 5px 0; font-size: 13px;">Email: ${email.email}</p>
                  <div style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px; font-size: 12px;">
                    <p style="margin: 0 0 5px 0;"><strong>Subject:</strong> ${email.subject}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Message:</strong></p>
                    <div style="white-space: pre-line; font-family: monospace; font-size: 12px;">${email.body}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${recommendationsData.interestGroups && recommendationsData.interestGroups.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: #555;">Relevant Interest Groups</h2>
              
              <ul style="padding-left: 20px;">
                ${recommendationsData.interestGroups.map((group: any) => `
                  <li style="margin-bottom: 10px;">
                    <strong>${group.name}</strong>
                    <p style="margin: 5px 0; font-size: 13px;">${group.description}</p>
                    <p style="margin: 5px 0; font-size: 12px;">Website: ${group.url}</p>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${recommendationsData.petitions && recommendationsData.petitions.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; margin-bottom: 15px; color: #555;">Relevant Petitions</h2>
              
              <ul style="padding-left: 20px;">
                ${recommendationsData.petitions.map((petition: any) => `
                  <li style="margin-bottom: 10px;">
                    <strong>${petition.title}</strong>
                    <p style="margin: 5px 0; font-size: 13px;">${petition.description}</p>
                    <p style="margin: 5px 0; font-size: 12px;">URL: ${petition.url}</p>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        `;

        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture the HTML content as an image
        const canvas = await html2canvas(contentContainer, {
          scale: 1,
          useCORS: true,
          logging: false
        });

        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        // Save the PDF
        pdf.save(`VoterRecommendations_${new Date().toISOString().slice(0, 10)}.pdf`);

        // Clean up
        document.body.removeChild(contentContainer);
        setIsSaving(false);
        toast({
          title: "PDF Created",
          description: "Your voting recommendations have been saved as a PDF.",
        });
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsSaving(false);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Voter Recommendations',
          text: `My personalized voter recommendations for ${zipCode || 'my area'}`,
          // url: window.location.href
        });
        toast({
          title: "Shared",
          description: "Your recommendations have been shared.",
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support sharing. Try saving as PDF instead.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        disabled={isSaving}
        onClick={handleSavePDF}
      >
        {isSaving ? (
          <>
            <span className="animate-spin mr-1">◌</span> Saving...
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4" /> Save as PDF
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleShare}
      >
        <Share className="h-4 w-4" /> Share
      </Button>
    </div>
  );
}
