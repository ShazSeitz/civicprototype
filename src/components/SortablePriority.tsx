import { FormControl, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePriorityProps {
  id: string;
  index: number;
  field: any;
}

export const SortablePriority = ({ id, index, field }: SortablePriorityProps) => {
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
    </FormItem>
  );
};