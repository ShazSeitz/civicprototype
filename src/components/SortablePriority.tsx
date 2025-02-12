
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePriorityProps {
  id: string;
  index: number;
  field: any;
  characterCount: number;
  maxLength: number;
}

export const SortablePriority = ({ id, index, field, characterCount, maxLength }: SortablePriorityProps) => {
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

  const isOverLimit = characterCount > maxLength;

  return (
    <FormItem ref={setNodeRef} style={style} className="cursor-move">
      <FormControl>
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="p-2">
            ⋮⋮
          </div>
          <div className="flex-1">
            <Input
              placeholder={`Priority ${index + 1}`}
              {...field}
              className={isOverLimit ? "border-red-500" : undefined}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-gray-500"}`}>
                {characterCount}/{maxLength}
              </span>
            </div>
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
