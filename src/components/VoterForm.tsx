
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePriority } from "./SortablePriority";

// Test personas data
const testPersonas = {
  persona1: {
    zipCode: "94925",
    priorities: [
      "Funding for headstart and after school programs (important for single mom)",
      "The cost of housing in the Bay Area",
      "I suspect that there is a lot of waste in government and that many departments need to be made more effective and efficient and accountable",
      "I support everyone's right to live however they wish to live and to have all of the rights and protections set out in the constitution and BIll of Rights, but I don't want to be asked what my pronouns are!",
      "Homelessness and fentanyl problem",
      "Protection of national parks and wildlife sanctuaries"
    ]
  },
  persona2: {
    zipCode: "15301",
    priorities: [
      "I am tired of paying so much income tax! I work hard for my money and want some to pass on to my children.",
      "I think that it is disgraceful that race or gender are used to decide whether or not to hire someone.",
      "I think climate change is probably a hoax but I'm not sure",
      "My town desperately needs more and more affordable local transportation options",
      "I am angry that Jan 6th rioters may get pardoned as many are violent criminals",
      "I'm afraid AI could lead to scary Sci-fy like stuff, but it's too hard for me to understand."
    ]
  }
};

// Pool of potential priorities for random generation
const priorityPool = [
  "Concerned about access to affordable healthcare in my community",
  "Worried about the quality of education in public schools",
  "Want to see more investment in renewable energy",
  "Think we need better mental health services for veterans",
  "Would like to see term limits for elected officials",
  "Concerned about privacy and data security online",
  "Want more transparency in how tax dollars are spent",
  "Concerned about the national debt and government spending",
  "Want to protect Social Security for future generations",
  "Think local small businesses need more support",
  "Worried about drug prices and prescription medication costs",
  "Concerned about the cost of college education and student loan debt",
  "Want to see more investment in rural broadband access",
  "Think we need better public transportation options",
  "Concerned about gerrymandering and fair district boundaries",
  "Want stricter gun control measures",
  "Believe in stronger Second Amendment protections",
  "Think foreign policy should focus more on diplomacy",
  "Want stronger border security measures",
  "Believe in creating easier paths to citizenship",
  "Concerned about Supreme Court decisions and judicial impartiality",
  "Want to see police reform and accountability",
  "Think we need more support for law enforcement",
  "Want to see protection for reproductive rights",
  "Concerned about religious freedom protections"
];

// Function to generate a random US ZIP code
const generateRandomZipCode = () => {
  const zipDigits = [];
  for (let i = 0; i < 5; i++) {
    zipDigits.push(Math.floor(Math.random() * 10));
  }
  return zipDigits.join('');
};

// Function to generate random priorities
const generateRandomPriorities = () => {
  // Shuffle the priority pool and take 6 items
  const shuffled = [...priorityPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

// Generate random data for persona3
const generatePersona3 = () => {
  return {
    zipCode: generateRandomZipCode(),
    priorities: generateRandomPriorities()
  };
};

// Form validation schema
const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().min(1, "Priority cannot be empty")).length(6, "Please enter all 6 priorities"),
});

interface VoterFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export const VoterForm = ({ onSubmit, isLoading }: VoterFormProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "current",
      zipCode: "",
      priorities: ["", "", "", "", "", ""],
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());
      
      const currentPriorities = form.getValues("priorities");
      const newPriorities = arrayMove(currentPriorities, oldIndex, newIndex);
      form.setValue("priorities", newPriorities);
    }
  };

  const loadPersona = (persona: 'persona1' | 'persona2' | 'persona3') => {
    // For persona3, we generate random data on each call
    const selectedPersona = persona === 'persona3' 
      ? generatePersona3() 
      : testPersonas[persona];
      
    form.reset({
      mode: 'demo',
      zipCode: selectedPersona.zipCode,
      priorities: selectedPersona.priorities,
    });
  };

  // Handle form submission with validation
  const handleSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.log("Form validation errors:", errors);
    if (errors.priorities) {
      // Scroll to the priorities section
      document.querySelector('.priorities-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });

  return (
    <Card className="mb-8 animate-fade-up">
      <CardContent className="pt-6">
        {/* Test Persona Buttons */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="flex items-center text-sm text-muted-foreground font-medium">
            Run test personas:
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadPersona('persona1')}
            className="h-8 px-3"
          >
            Persona 1
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadPersona('persona2')}
            className="h-8 px-3"
          >
            Persona 2
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => loadPersona('persona3')}
            className="h-8 px-3"
          >
            Random Persona
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Select Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="current" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Current Date
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="demo" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          DEMO: November 2024 Election
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="00000" {...field} className="w-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 priorities-section">
              <FormLabel>Your Priorities</FormLabel>
              <p className="text-sm text-muted-foreground">Enter your top 6 concerns and values (max 250 characters each)</p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={[0, 1, 2, 3, 4, 5].map(String)}
                  strategy={verticalListSortingStrategy}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`priorities.${index}`}
                      render={({ field }) => (
                        <SortablePriority
                          key={index}
                          id={index.toString()}
                          index={index}
                          field={field}
                          characterCount={field.value.length}
                          maxLength={250}
                        />
                      )}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "SUBMIT"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VoterForm;
