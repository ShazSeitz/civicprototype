
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Share,
  Download,
  Copy,
  Check,
  Link as LinkIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ShareRecommendationsProps {
  recommendationsData: any;
  zipCode?: string;
  userPriorities?: string[];
  userClarifications?: string[];
}

export const ShareRecommendations = ({ 
  recommendationsData, 
  zipCode, 
  userPriorities = [], 
  userClarifications = [] 
}: ShareRecommendationsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Function to save recommendations as PDF
  const saveRecommendations = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text('Your Voter Recommendations', margin, yPosition);
      yPosition += 10;
      
      // Add date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${date}`, margin, yPosition);
      yPosition += 8;
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Add zip code information
      if (zipCode) {
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        doc.text(`Location: ZIP Code ${zipCode}`, margin, yPosition);
        yPosition += 8;
      }
      
      // Add user priorities section
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Your Priorities:', margin, yPosition);
      yPosition += 8;
      
      // Add user submitted priorities
      if (userPriorities && userPriorities.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        userPriorities.forEach((priority, index) => {
          if (priority.trim()) {
            const priorityText = `${index + 1}. ${priority}`;
            const splitText = doc.splitTextToSize(priorityText, contentWidth - 5);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += 6 * splitText.length;
          }
        });
      }
      
      // Add mapped priorities if different from user priorities
      if (recommendationsData.mappedPriorities && recommendationsData.mappedPriorities.length > 0) {
        yPosition += 5;
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Mapped Policy Priorities:', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        recommendationsData.mappedPriorities.forEach((priority: string, index: number) => {
          const priorityText = `${index + 1}. ${priority}`;
          const splitText = doc.splitTextToSize(priorityText, contentWidth - 5);
          doc.text(splitText, margin + 5, yPosition);
          yPosition += 6 * splitText.length;
        });
      }
      
      // Add user clarifications if any
      if (userClarifications && userClarifications.length > 0) {
        yPosition += 5;
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Your Clarifications:', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        userClarifications.forEach((clarification, index) => {
          if (clarification.trim()) {
            const clarificationText = `${index + 1}. ${clarification}`;
            const splitText = doc.splitTextToSize(clarificationText, contentWidth - 5);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += 6 * splitText.length;
          }
        });
      }
      
      // Add line separator
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      // Add recommendations sections
      if (recommendationsData.candidates && recommendationsData.candidates.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('Candidate Recommendations:', margin, yPosition);
        yPosition += 10;
        
        // Add candidate recommendations
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        
        recommendationsData.candidates.forEach((candidate: any) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Candidate name and party
          doc.setFont(undefined, 'bold');
          let candidateHeader = candidate.name;
          if (candidate.party) candidateHeader += ` (${candidate.party})`;
          doc.text(candidateHeader, margin, yPosition);
          yPosition += 6;
          
          // Candidate details
          doc.setFont(undefined, 'normal');
          doc.setFontSize(11);
          doc.setTextColor(50, 50, 50);
          
          if (candidate.office) {
            doc.text(`Office: ${candidate.office}`, margin + 5, yPosition);
            yPosition += 5;
          }
          
          if (candidate.alignment && candidate.alignment.type) {
            const alignmentText = `Alignment: ${candidate.alignment.type.charAt(0).toUpperCase() + candidate.alignment.type.slice(1)}`;
            doc.text(alignmentText, margin + 5, yPosition);
            yPosition += 5;
          }
          
          if (candidate.alignment && candidate.alignment.supportedPriorities && candidate.alignment.supportedPriorities.length > 0) {
            doc.text("Supported Priorities:", margin + 5, yPosition);
            yPosition += 5;
            
            candidate.alignment.supportedPriorities.forEach((priority: string) => {
              const priorityText = `• ${priority}`;
              const splitText = doc.splitTextToSize(priorityText, contentWidth - 10);
              doc.text(splitText, margin + 10, yPosition);
              yPosition += 5 * splitText.length;
            });
          }
          
          yPosition += 8; // Space between candidates
        });
      }
      
      // Add ballot measures if present
      if (recommendationsData.ballotMeasures && recommendationsData.ballotMeasures.length > 0) {
        // Check if we need a new page
        if (yPosition > 220) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('Ballot Measure Recommendations:', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        recommendationsData.ballotMeasures.forEach((measure: any) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Measure title
          doc.setFont(undefined, 'bold');
          doc.setTextColor(33, 33, 33);
          doc.text(measure.title, margin, yPosition);
          yPosition += 6;
          
          // Measure details
          doc.setFont(undefined, 'normal');
          doc.setFontSize(11);
          doc.setTextColor(50, 50, 50);
          
          if (measure.recommendation) {
            doc.text(`Recommendation: ${measure.recommendation}`, margin + 5, yPosition);
            yPosition += 5;
          }
          
          if (measure.summary) {
            doc.text("Summary:", margin + 5, yPosition);
            yPosition += 5;
            const summaryText = doc.splitTextToSize(measure.summary, contentWidth - 10);
            doc.text(summaryText, margin + 10, yPosition);
            yPosition += 5 * summaryText.length;
          }
          
          yPosition += 8; // Space between measures
        });
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const footerText = "Generated by VoterPrime - Your personalized voting assistant";
      doc.text(footerText, pageWidth / 2, 285, { align: 'center' });
      
      // Save the PDF
      const fileName = `voter-recommendations-${date.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Saved",
        description: "Your recommendations have been saved as a PDF.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to save recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to copy a link to the recommendations
  const copyLink = async () => {
    try {
      // In a real implementation, you would generate a shareable link
      await navigator.clipboard.writeText(window.location.href);
      
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Link copied to clipboard",
        variant: "default",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to use the Web Share API if available
  const shareRecommendations = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Voter Recommendations',
          text: 'Check out my voter recommendations from VoterPrime',
          url: window.location.href,
        });
        
        toast({
          title: "Shared Successfully",
          description: "Your recommendations have been shared.",
          variant: "default",
        });
      } else {
        // Fallback if Web Share API is not available
        copyLink();
      }
    } catch (error) {
      console.error('Error sharing recommendations:', error);
      
      // User cancelled sharing is not an error
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share recommendations. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={saveRecommendations}
        className="gap-1"
      >
        <Download className="h-4 w-4" />
        <span>Save as PDF</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={shareRecommendations}>
            <Share className="h-4 w-4 mr-2" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon className="h-4 w-4 mr-2" />
            <span>Copy as Permalink</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
