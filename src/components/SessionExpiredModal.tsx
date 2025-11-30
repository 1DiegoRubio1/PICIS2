import { useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';

interface SessionExpiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionExpiredModal({ open, onOpenChange }: SessionExpiredModalProps) {
  useEffect(() => {
    if (open) {
      // El modal se cierra automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-blue-600 text-white border-0 shadow-xl" hideCloseButton>
        <div className="text-center p-8">
          <div className="text-6xl mb-6">:(</div>
          <h2 className="text-2xl font-bold mb-4">La sesión ha expirado</h2>
          <p className="text-blue-100 text-lg mb-2">
            Por seguridad, tu sesión ha caducado por inactividad.
          </p>
          <p className="text-blue-100 text-sm">
            Serás redirigido al login en 3 segundos...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}