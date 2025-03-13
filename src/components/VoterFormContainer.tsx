
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VoterForm } from '@/components/VoterForm';
import { useToast } from '@/hooks/use-toast';
import { VoterFormValues } from '@/schemas/voterFormSchema';
import { LoadingProgress } from '@/components/LoadingProgress';

export interface FormSubmissionResult {
  formData: VoterFormValues;
  recommendations: any;
}

interface VoterFormContainerProps {
  isLoading: boolean;
  onSubmit: (values: VoterFormValues) => void;
}

export const VoterFormContainer = ({ 
  isLoading,
  onSubmit
}: VoterFormContainerProps) => {
  return (
    <>
      {isLoading && (
        <LoadingProgress 
          message="Analyzing your priorities and generating recommendations..." 
          isLoading={isLoading}
        />
      )}
      <VoterForm 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
      />
    </>
  );
};
