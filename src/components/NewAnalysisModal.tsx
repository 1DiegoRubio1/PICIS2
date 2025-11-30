import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner@2.0.3';

interface NewAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnalysis: (url: string) => void;
  readOnlyMode: boolean;
  actionSessionActive: boolean;
}

export function NewAnalysisModal({ 
  open, 
  onOpenChange, 
  onAddAnalysis,
  readOnlyMode,
  actionSessionActive 
}: NewAnalysisModalProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Por favor ingresa una URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Por favor ingresa una URL válida');
      return;
    }

    onAddAnalysis(url);
    setUrl('');
  };

  const isDisabled = readOnlyMode || !actionSessionActive;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Realizar Análisis</DialogTitle>
          <DialogDescription>
            Ingresa la URL del sitio web que deseas analizar. El sistema descargará todos los archivos y realizará un análisis de información sensible.
            {isDisabled && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                {readOnlyMode 
                  ? "Modo solo lectura activo. Re-autentícate para realizar acciones."
                  : "Sesión de acciones expirada. Re-autentícate para continuar."
                }
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL del Sitio Web</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isDisabled}>
              Iniciar Análisis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}