
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { LoadingProgress } from '@/components/LoadingProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { classifyPoliticalStatement, initializeModel } from '@/utils/transformersMapping';

interface DebugResult {
  category: string;
  standardTerm: string;
  plainEnglish: string;
  score: number;
  details: string[];
  nuancedMapping?: Record<string, any>;
}

interface MLDebugResult {
  term: string;
  confidence: number;
  description: string;
}

export const DebugTool = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [mlResults, setMlResults] = useState<MLDebugResult[]>([]);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('api');
  const [showNuancedMapping, setShowNuancedMapping] = useState(false);

  // Initialize the ML model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await initializeModel();
        setIsModelLoading(false);
        console.log('ML model initialized for debug tool');
      } catch (error) {
        console.error('Error initializing ML model:', error);
        toast({
          title: "Model Loading Error",
          description: "Could not load the ML model. Using rule-based classification only.",
          variant: "destructive",
        });
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, [toast]);

  const handleApiSubmit = async () => {
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

  const handleMlSubmit = async () => {
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
      const result = await classifyPoliticalStatement(userInput);
      
      if (!result.terms || result.terms.length === 0) {
        toast({
          title: "No terms identified",
          description: "The model couldn't classify this input with high confidence.",
          variant: "default",
        });
        setMlResults([]);
      } else {
        // Convert to our debug format
        const mlDebugResults = result.terms.map(term => {
          // Get the term description from issueTerminology.json
          const termInfo = fetch('/src/config/issueTerminology.json')
            .then(res => res.json())
            .then(data => data[term])
            .catch(err => ({ plainEnglish: "Term description not available" }));
            
          return {
            term,
            confidence: result.confidenceScores[term] || 0.5,
            description: termInfo?.plainEnglish || "Term description not available"
          };
        });
        
        // Wait for all promises to resolve
        const resolvedResults = await Promise.all(
          result.terms.map(async (term) => {
            const confidence = result.confidenceScores[term] || 0.5;
            
            // Try to get term info from our config
            let description = "Term description not available";
            try {
              const response = await fetch('/src/config/issueTerminology.json');
              const data = await response.json();
              description = data[term]?.plainEnglish || description;
            } catch (error) {
              console.error('Error fetching term data:', error);
            }
            
            return {
              term,
              confidence,
              description
            };
          })
        );
        
        setMlResults(resolvedResults);
      }
    } catch (err: any) {
      console.error('ML debug error:', err);
      toast({
        title: "Error",
        description: err.message || 'An error occurred while analyzing with ML model',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'api') {
      handleApiSubmit();
    } else {
      handleMlSubmit();
    }
  };

  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const sortedMlResults = [...mlResults].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Terminology Mapping Debug Tool</CardTitle>
          <CardDescription>
            Test how user priorities are mapped to policy terminology using both API-based and ML-based approaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="api">API-Based Mapping</TabsTrigger>
              <TabsTrigger value="ml" disabled={isModelLoading}>
                {isModelLoading ? "Loading ML Model..." : "ML-Based Mapping"}
              </TabsTrigger>
            </TabsList>
            
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
              disabled={isLoading || (activeTab === 'ml' && isModelLoading)}
              className="w-full"
            >
              {isLoading ? "Analyzing..." : "Analyze Mapping"}
            </Button>
            
            {activeTab === 'api' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">
                  Show Nuanced Mapping:
                </label>
                <input 
                  type="checkbox" 
                  checked={showNuancedMapping} 
                  onChange={(e) => setShowNuancedMapping(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <LoadingProgress 
          message={activeTab === 'api' ? "Analyzing terminology mapping..." : "Analyzing with ML model..."}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'api' && sortedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Mapping Results</CardTitle>
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
                  
                  {showNuancedMapping && result.nuancedMapping && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Nuanced Mapping:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(result.nuancedMapping).map(([key, value]) => (
                            key !== 'reasoning' ? (
                              <TableRow key={key}>
                                <TableCell className="font-medium">{key.replace(/_/g, ' ')}</TableCell>
                                <TableCell>
                                  {typeof value === 'boolean' 
                                    ? (value ? '✅ Yes' : '❌ No')
                                    : value.toString()}
                                </TableCell>
                              </TableRow>
                            ) : null
                          ))}
                        </TableBody>
                      </Table>
                      {result.nuancedMapping.reasoning && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium">Reasoning:</p>
                          <p className="text-sm">{result.nuancedMapping.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {index < sortedResults.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ml' && sortedMlResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ML-Based Mapping Results</CardTitle>
            <CardDescription>Results using the Transformers.js model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedMlResults.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{result.term}</h3>
                      <p className="text-sm text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                    {index === 0 && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Best Match
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="mt-1 text-sm">{result.description}</p>
                  </div>
                  
                  {index < sortedMlResults.length - 1 && <Separator className="my-4" />}
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
