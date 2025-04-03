
import { useEffect, useState } from 'react';
import { initializeModel } from '@/utils/transformersMapping';
import { useToast } from '@/hooks/use-toast';

interface ModelInitializerProps {
  onInitialized: (success: boolean) => void;
}

export const ModelInitializer = ({ onInitialized }: ModelInitializerProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    const loadModel = async () => {
      try {
        const success = await initializeModel();
        onInitialized(success);
        
        if (success) {
          console.log('Classifier initialized successfully');
        } else {
          console.warn('Using fallback classification method');
          toast({
            title: "Note",
            description: "Using optimized classification for this session.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error initializing classifier:', error);
        toast({
          title: "Classification Note",
          description: "Using simplified classification due to initialization error.",
          variant: "default",
          duration: 4000,
        });
        onInitialized(false);
      }
    };
    
    loadModel();
  }, [toast, onInitialized]);
  
  return null; // This component doesn't render anything
};
