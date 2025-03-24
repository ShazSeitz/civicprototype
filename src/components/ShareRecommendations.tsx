
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
}

export const ShareRecommendations = ({ recommendationsData }: ShareRecommendationsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Function to save recommendations as PDF
  const saveRecommendations = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(18);
      doc.text('Your Voter Recommendations', 20, 20);
      
      // Add date
      const date = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.text(`Generated on: ${date}`, 20, 30);
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Add priorities section
      doc.setFontSize(14);
      doc.text('Your Priorities:', 20, 45);
      
      let yPosition = 55;
      // Add mapped priorities
      if (recommendationsData.mappedPriorities && recommendationsData.mappedPriorities.length > 0) {
        doc.setFontSize(12);
        recommendationsData.mappedPriorities.forEach((priority: string, index: number) => {
          doc.text(`${index + 1}. ${priority}`, 25, yPosition);
          yPosition += 8;
        });
      }
      
      // Add line separator
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Add recommendations sections
      doc.setFontSize(14);
      doc.text('Candidate Recommendations:', 20, yPosition);
      yPosition += 10;
      
      // Add candidate recommendations
      if (recommendationsData.candidates && recommendationsData.candidates.length > 0) {
        doc.setFontSize(12);
        recommendationsData.candidates.forEach((candidate: any, index: number) => {
          // Skip if we've reached the bottom of the page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(`${candidate.name} (${candidate.party})`, 25, yPosition);
          yPosition += 8;
          
          doc.setFont(undefined, 'normal');
          if (candidate.office) {
            doc.text(`Office: ${candidate.office}`, 30, yPosition);
            yPosition += 6;
          }
          
          if (candidate.alignment && candidate.alignment.type) {
            const alignmentText = `Alignment: ${candidate.alignment.type.charAt(0).toUpperCase() + candidate.alignment.type.slice(1)}`;
            doc.text(alignmentText, 30, yPosition);
            yPosition += 10;
          }
        });
      }
      
      // Add ballot measures if present
      if (recommendationsData.ballotMeasures && recommendationsData.ballotMeasures.length > 0) {
        // Check if we need a new page
        if (yPosition > 230) {
          doc.addPage();
          yPosition = 20;
        }
        
        yPosition += 5;
        doc.setFontSize(14);
        doc.text('Ballot Measure Recommendations:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        recommendationsData.ballotMeasures.forEach((measure: any, index: number) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(`${measure.title}`, 25, yPosition);
          yPosition += 8;
          
          doc.setFont(undefined, 'normal');
          if (measure.recommendation) {
            doc.text(`Recommendation: ${measure.recommendation}`, 30, yPosition);
            yPosition += 6;
          }
          
          if (measure.summary) {
            // Split the summary to fit on the page
            const summary = doc.splitTextToSize(measure.summary, 150);
            doc.text(summary, 30, yPosition);
            yPosition += (6 * summary.length) + 5;
          }
        });
      }
      
      // Save the PDF
      const fileName = `voter-recommendations-${date.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Recommendations Saved",
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
      // For now, we'll just copy the current URL
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
