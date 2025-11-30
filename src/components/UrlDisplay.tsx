import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UrlDisplayProps {
  url: string;
  maxLength?: number;
}

export function UrlDisplay({ url, maxLength = 30 }: UrlDisplayProps) {
  const [open, setOpen] = useState(false);

  const truncateUrl = (url: string, max: number) => {
    if (url.length <= max) return url;
    return url.substring(0, max) + '...';
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const handleOpenUrl = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
      >
        {truncateUrl(url, maxLength)}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>URL Completa</DialogTitle>
            <DialogDescription>
              Detalles del sitio web analizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border break-all">
              <p className="font-mono text-sm">{url}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyUrl} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copiar URL
              </Button>
              <Button onClick={handleOpenUrl} variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Nueva Pestaña
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
