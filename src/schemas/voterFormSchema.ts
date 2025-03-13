
import * as z from "zod";

// Form validation schema
export const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().min(1, "Priority cannot be empty")).length(6, "Please enter all 6 priorities"),
});

export type VoterFormValues = z.infer<typeof formSchema>;

// This schema is used to validate user input before sending to the API
// It ensures that:
// - A valid mode is selected (current date or demo mode)
// - The ZIP code is exactly 5 digits and contains only numbers
// - Exactly 6 priorities are provided, none of which are empty
