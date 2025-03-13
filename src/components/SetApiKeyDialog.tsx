
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SetApiKeyDialogProps {
  apiType: 'fec' | 'googleCivic';
  onApiKeySet: () => void;
}

export function SetApiKeyDialog({ apiType, onApiKeySet }: SetApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const secretName = apiType === 'fec' ? 'FEC_API_KEY' : 'GOOGLE_CIVIC_API_KEY';
      const { error } = await supabase.functions.invoke('set-api-key', {
        body: { 
          apiType, 
          apiKey 
        }
      });

      if (error) {
        console.error('Error setting API key:', error);
        toast({
          title: "Error",
          description: error.message || `Failed to set ${apiType.toUpperCase()} API key`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${apiType.toUpperCase()} API key has been set successfully`,
          variant: "default",
        });
        onApiKeySet();
        setIsOpen(false);
        setApiKey('');
      }
    } catch (err) {
      console.error('Error in API key submission:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to set API key',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = apiType === 'fec' ? 'FEC API Key' : 'Google Civic API Key';
  const description = apiType === 'fec' 
    ? 'Enter your FEC API key to enable candidate data retrieval.' 
    : 'Enter your Google Civic API key to enable representative data retrieval.';
  const linkText = apiType === 'fec' 
    ? 'Get an FEC API key' 
    : 'Get a Google Civic API key';
  const linkUrl = apiType === 'fec' 
    ? 'https://api.data.gov/signup/' 
    : 'https://developers.google.com/civic-information/docs/using_api';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Set {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey" 
              type="text" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder={`Enter your ${title}`}
              className="w-full"
            />
          </div>
          <div className="text-sm text-blue-600 hover:underline">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkText}
            </a>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !apiKey.trim()}>
              {isSubmitting ? 'Saving...' : 'Save API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
