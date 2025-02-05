import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '../components/Navbar';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Form validation schema
const formSchema = z.object({
  mode: z.enum(["current", "demo"], {
    required_error: "Please select a mode.",
  }),
  zipCode: z.string().length(5, "ZIP code must be exactly 5 digits").regex(/^\d+$/, "ZIP code must contain only numbers"),
  priorities: z.array(z.string().max(200, "Priority must not exceed 200 characters")).length(6, "Please enter all 6 priorities"),
});

interface SortablePriorityProps {
  id: string;
  index: number;
  field: any;
}

const SortablePriority = ({ id, index, field }: SortablePriorityProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <FormItem ref={setNodeRef} style={style} className="cursor-move">
      <FormControl>
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="p-2">
            ⋮⋮
          </div>
          <Input
            placeholder={`Priority ${index + 1}`}
            {...field}
            className="flex-1"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

const Index = () => {
  const [recommendations, setRecommendations] = useState<any>(null);
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // TODO: Implement API calls and data processing
    setRecommendations({
      region: "Sample Region",
      candidates: [
        {
          name: "Sample Candidate",
          office: "Sample Office",
          highlights: ["Sample highlight 1", "Sample highlight 2"],
        },
      ],
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id);
      const newIndex = parseInt(over.id);
      
      const currentPriorities = form.getValues("priorities");
      const newPriorities = arrayMove(currentPriorities, oldIndex, newIndex);
      form.setValue("priorities", newPriorities);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Voter Information Tool
          </h1>
          
          <Card className="mb-8">
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

                  <Button type="submit" className="w-full">
                    Get Recommendations
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Your Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="font-medium">Region: {recommendations.region}</p>
                  <div>
                    <h3 className="font-semibold mb-2">Candidates:</h3>
                    {recommendations.candidates.map((candidate: any, index: number) => (
                      <div key={index} className="mb-4">
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-gray-600">{candidate.office}</p>
                        <ul className="list-disc list-inside mt-2">
                          {candidate.highlights.map((highlight: string, hIndex: number) => (
                            <li key={hIndex} className="text-sm">{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;