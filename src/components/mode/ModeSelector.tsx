import { useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export function ModeSelector() {
  const { mode, setMode } = useMode();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Select Mode</CardTitle>
        <CardDescription>
          Choose between current election data or demo mode for November 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as 'current' | 'demo')}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <RadioGroupItem
              value="current"
              id="current"
              className="peer sr-only"
            />
            <Label
              htmlFor="current"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-lg font-semibold">Current Date</span>
              <span className="text-sm text-muted-foreground">
                Uses live election data from official sources
              </span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="demo"
              id="demo"
              className="peer sr-only"
            />
            <Label
              htmlFor="demo"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-lg font-semibold">DEMO: November 2024</span>
              <span className="text-sm text-muted-foreground">
                Simulates the November 2024 election with fixed data
              </span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
