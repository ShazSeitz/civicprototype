
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { LoadingProgress } from '@/components/LoadingProgress';

interface DebugResult {
  category: string;
  standardTerm: string;
  plainEnglish: string;
  score: number;
  details: string[];
}

export const DebugTool = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-terminology', {
        body: { input: userInput }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze input');
      }

      setResults(data.results || []);
    } catch (err: any) {
      console.error('Debug error:', err);
      toast({
        title: "Error",
        description: err.message || 'An error occurred while analyzing input',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Terminology Mapping Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter user priority text:
            </label>
            <Textarea
              placeholder="e.g., I am tired of paying so much income tax! I work hard for my money..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Analyzing..." : "Analyze Mapping"}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <LoadingProgress 
          message="Analyzing terminology mapping..." 
          isLoading={isLoading}
        />
      )}

      {sortedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mapping Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedResults.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{result.category}</h3>
                      <p className="text-sm text-gray-500">Score: {result.score.toFixed(2)}</p>
                    </div>
                    {index === 0 && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Best Match
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">Standard Term: {result.standardTerm}</p>
                    <p className="mt-1 text-sm">{result.plainEnglish}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Match Details:</p>
                    <ul className="text-xs space-y-1">
                      {result.details.map((detail, i) => (
                        <li key={i} className="bg-gray-100 p-1.5 rounded">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {index < sortedResults.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebugTool;
