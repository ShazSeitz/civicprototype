import { Button } from "@/components/ui/button";
import { personas, getRandomPriorities, getRandomZipCode } from "@/data/testPersonas";
import { VoterFormValues } from "@/schemas/voterFormSchema";

interface TestPersonaControlsProps {
  onSelectPersona: (persona: { zipCode: string; priorities: string[] }) => void;
}

export const TestPersonaControls = ({ onSelectPersona }: TestPersonaControlsProps) => {
  const loadPersona = (personaIndex: number) => {
    const persona = personaIndex === -1 
      ? { zipCode: getRandomZipCode(), priorities: getRandomPriorities() }
      : personas[personaIndex];
      
    onSelectPersona(persona);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="flex items-center text-sm text-muted-foreground font-medium">
        Run test personas:
      </span>
      <Button
        type="button"
        variant="outline"
        onClick={() => loadPersona(0)}
        className="h-8 px-3"
      >
        Persona 1
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => loadPersona(1)}
        className="h-8 px-3"
      >
        Persona 2
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => loadPersona(-1)}
        className="h-8 px-3"
      >
        Random Persona
      </Button>
    </div>
  );
};
