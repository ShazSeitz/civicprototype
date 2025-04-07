import { z } from 'zod';

// Form validation schema
export const VoterFormSchema = z.object({
  zipCode: z
    .string()
    .min(5, 'ZIP code must be 5 digits')
    .max(5, 'ZIP code must be 5 digits')
    .regex(/^\d+$/, 'ZIP code must contain only numbers'),
  priorities: z
    .array(
      z
        .string()
        .max(250, 'Priority must be less than 250 characters')
    )
    .length(6, 'Must have exactly 6 priorities')
});

export type VoterFormValues = z.infer<typeof VoterFormSchema>;

// This schema is used to validate user input before sending to the API
// It ensures that:
// - The ZIP code is exactly 5 digits and contains only numbers
// - Exactly 6 priorities are provided, none of which are empty
