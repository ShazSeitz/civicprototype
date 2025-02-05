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

// Form validation schema
const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().max(200, "Priority must not exceed 200 characters")).length(6, "Please enter all 6 priorities"),
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

  return (
    <Card className="mb-8 animate-fade-up">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="current" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Current Date
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
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
                    <Input placeholder="Enter your 5-digit ZIP code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Your Priorities</FormLabel>
              <p className="text-sm text-muted-foreground">Enter your top 6 concerns and values</p>
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
                        />
                      )}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Get Recommendations"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};