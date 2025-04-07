import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Info } from "lucide-react";

interface SortablePriorityProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const SortablePriority = ({ id, value, onChange, disabled, error }: SortablePriorityProps) => {
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

  const maxLength = 250;
  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;
  const remainingChars = maxLength - characterCount;
  const index = parseInt(id);

  return (
    <FormItem ref={setNodeRef} style={style} className="cursor-move">
      <FormControl>
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="p-2">
            ⋮⋮
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder={`Priority ${index + 1}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`${isOverLimit || error ? "border-red-500" : ""} pr-16`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-gray-500"}`}>
                {remainingChars}
              </span>
            </div>
          </div>
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
      {isOverLimit && <FormMessage>Maximum {maxLength} characters allowed</FormMessage>}
    </FormItem>
  );
};
