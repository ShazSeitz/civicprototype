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

  const loadPersona = (persona: 'persona1' | 'persona2') => {
    const selectedPersona = testPersonas[persona];
    form.reset({
      mode: 'demo',
      zipCode: selectedPersona.zipCode,
      priorities: selectedPersona.priorities,
    });
  };

  return (
    <Card className="mb-8 animate-fade-up">
      <CardContent className="pt-6">
        {/* Test Persona Buttons */}
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-3">
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
              {isLoading ? "Analyzing..." : "Get Recommendations"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
