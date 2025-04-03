
import { useToast } from '@/hooks/use-toast';

export const createUnmappedTermsHandler = (toast: ReturnType<typeof useToast>) => {
  return async (terms: string[]) => {
    try {
      if (!terms || terms.length === 0) {
        return;
      }
      
      console.log('Unmapped terms that need mapping:', terms);
      toast({
        title: "Unmapped Terms Detected",
        description: `${terms.length} priorities couldn't be mapped to existing terms and have been logged for future updates.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving unmapped terms:', error);
      toast({
        title: "Error",
        description: "Failed to process unmapped terms. This won't affect your recommendations.",
        variant: "destructive",
      });
    }
  };
};
