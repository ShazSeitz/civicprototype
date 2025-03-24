
import { useState } from 'react';
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

interface ShareRecommendationsProps {
  recommendationsData: any;
}

export const ShareRecommendations = ({ recommendationsData }: ShareRecommendationsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Function to save recommendations as JSON file
  const saveRecommendations = () => {
    try {
      // Create a JSON string from the recommendations data
      const jsonString = JSON.stringify(recommendationsData, null, 2);
      
      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      
      // Set the file name
      const date = new Date().toISOString().split('T')[0];
      a.download = `voter-recommendations-${date}.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Recommendations Saved",
        description: "Your recommendations have been saved to your device.",
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
        <span>Save</span>
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
