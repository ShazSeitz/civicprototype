import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { VoterFormSchema, VoterFormValues } from '@/schemas/voterFormSchema';
import { useMode } from '@/contexts/ModeContext';
import { GripVertical } from 'lucide-react';

interface VoterFormProps {
  onSubmit: (values: VoterFormValues) => void;
  isLoading: boolean;
  initialValues?: Partial<VoterFormValues>;
}

export function VoterForm({ onSubmit, isLoading, initialValues }: VoterFormProps) {
  const { mode } = useMode();
  const form = useForm<VoterFormValues>({
    resolver: zodResolver(VoterFormSchema),
    defaultValues: {
      zipCode: initialValues?.zipCode || '',
      priorities: initialValues?.priorities || Array(6).fill('')
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ZIP Code Field */}
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input placeholder="00000" {...field} maxLength={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priorities Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Your Priorities</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your top 6 concerns and values. You can drag and drop to reorder them.
            </p>
          </div>

          <div className="space-y-2">
            {form.watch('priorities').map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`priorities.${index}`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-move"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                    <FormControl>
                      <Input 
                        placeholder={`Priority ${index + 1}`}
                        {...field}
                        className="flex-1"
                        maxLength={250}
                      />
                    </FormControl>
                    <div className="w-12 text-xs text-gray-400 text-right">
                      250
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Get Recommendations'}
        </Button>
      </form>
    </Form>
  );
}
