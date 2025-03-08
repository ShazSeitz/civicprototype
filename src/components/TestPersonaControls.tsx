
import { Button } from "@/components/ui/button";
import { testPersonas } from "@/data/testPersonas";
import { generatePersona3 } from "@/utils/personaGenerator";
import { VoterFormValues } from "@/schemas/voterFormSchema";

interface TestPersonaControlsProps {
  onSelectPersona: (persona: { zipCode: string; priorities: string[] }) => void;
}

export const TestPersonaControls = ({ onSelectPersona }: TestPersonaControlsProps) => {
  const loadPersona = (persona: 'persona1' | 'persona2' | 'persona3') => {
    // For persona3, we generate random data on each call
    const selectedPersona = persona === 'persona3' 
      ? generatePersona3() 
      : testPersonas[persona];
      
    onSelectPersona(selectedPersona);
  };

  return (
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
  );
};
