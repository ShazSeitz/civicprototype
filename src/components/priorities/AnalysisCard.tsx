
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PriorityMapping } from '@/hooks/priorities-analysis/types';

interface AnalysisCardProps {
  analysis: string;
  priorityMappings: PriorityMapping[] | undefined;
}

export const AnalysisCard = ({ analysis, priorityMappings }: AnalysisCardProps) => {
  // Function to render paragraphed analysis
  const renderAnalysis = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text?.split('\n\n') || [];
    
    if (paragraphs.length > 1) {
      return paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 text-left">{paragraph}</p>
      ));
    }
    
    // If no double newlines, render as a single paragraph
    return <p className="text-left">{text}</p>;
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="text-left">Analysis of Your Priorities</CardTitle>
        <CardDescription className="text-left">
          We have mapped your priorities to policy terms to provide the best recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display priorities mapping in a table format */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 font-bold">Your Priorities</TableHead>
              <TableHead className="w-1/2 font-bold">Policy Terms</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priorityMappings && priorityMappings.map((mapping, index) => (
              <TableRow key={index} className="border">
                <TableCell className="text-left align-top font-medium">{mapping.userConcern}</TableCell>
                <TableCell className="text-left">{mapping.mappedTerms.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Display the prose analysis after the table */}
        <div className="prose prose-sm text-left mt-6">
          {renderAnalysis(analysis)}
        </div>
      </CardContent>
    </Card>
  );
};
