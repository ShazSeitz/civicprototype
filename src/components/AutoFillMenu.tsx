import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TestPersona, personas, getRandomPriorities, getRandomZipCode } from "@/data/test-personas";
import { VoterFormValues } from "@/schemas/voterFormSchema";
import { Mode } from "@/contexts/ModeContext";
import { Sparkles } from "lucide-react";

interface AutoFillMenuProps {
  onSelect: (values: VoterFormValues) => void;
  mode: Mode;
}

export function AutoFillMenu({ onSelect, mode }: AutoFillMenuProps) {
  const handlePersonaSelect = (persona: TestPersona) => {
    onSelect({
      zipCode: persona.zipCode,
      priorities: persona.priorities,
    });
  };

  const handleRandomSelect = () => {
    onSelect({
      zipCode: getRandomZipCode(),
      priorities: getRandomPriorities(),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Sparkles className="mr-2 h-4 w-4" />
          Auto-fill
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Test Personas</DropdownMenuLabel>
        {personas.map((persona) => (
          <DropdownMenuItem
            key={persona.name}
            onClick={() => handlePersonaSelect(persona)}
          >
            <div>
              <div className="font-medium">{persona.name}</div>
              <div className="text-xs text-muted-foreground">
                {persona.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRandomSelect}>
          <div>
            <div className="font-medium">Random User</div>
            <div className="text-xs text-muted-foreground">
              Generate random priorities
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
