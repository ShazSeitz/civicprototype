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

// Pool of potential priorities for random generation with more everyday language
const priorityPool = [
  "I can't afford my medical bills and I'm worried about my family's health",
  "The schools in my neighborhood are falling apart and my kids aren't learning enough",
  "Gas prices are too high and I'm worried about being able to afford my commute",
  "Our veterans aren't getting the help they need when they come home",
  "Politicians stay in office too long and nothing ever changes",
  "I'm worried about companies knowing too much about me online",
  "I have no idea where my tax money goes and it feels like it's wasted",
  "The government keeps spending money we don't have",
  "I'm worried Social Security won't be there when I retire",
  "Small shops in my town are closing because they can't compete with big stores",
  "My prescription costs more than my car payment",
  "My kid's college loans are crushing them financially",
  "Internet at my house is terrible and I can't work from home",
  "I have to drive everywhere because there's no good bus service",
  "It seems like politicians pick their voters instead of voters picking politicians",
  "There are too many shootings in schools and we need to do something",
  "The government shouldn't touch our guns - it's our right to protect ourselves",
  "We should try talking to other countries more before getting into conflicts",
  "Too many people are crossing the border illegally and it's not fair",
  "It takes way too long for immigrants to become citizens even when they follow all the rules",
  "The Supreme Court seems more political than fair these days",
  "Some police officers get away with treating minorities badly",
  "Police are being attacked and disrespected and need more support",
  "Women should be able to make their own healthcare decisions without government interference",
  "My religious values are under attack in today's culture"
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
