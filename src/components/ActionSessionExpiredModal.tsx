import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Shield, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { ReAuthModal } from './ReAuthModal';

interface ActionSessionExpiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReAuthSuccess: () => void;
}

export function ActionSessionExpiredModal({ 
  open, 
  onOpenChange, 
  onReAuthSuccess 
}: ActionSessionExpiredModalProps) {
  const { setReadOnlyMode } = useApp();
  const [reAuthModalOpen, setReAuthModalOpen] = useState(false);

  const handleReAuthenticate = () => {
    console.log('🔄 Iniciando proceso de re-autenticación...');
    
    // Cerrar este modal primero
    onOpenChange(false);
    
    // Abrir el modal de re-autenticación
    setReAuthModalOpen(true);
  };

  const handleReAuthSuccess = () => {
    console.log('✅ Re-autenticación exitosa desde ActionSessionExpiredModal');
    setReAuthModalOpen(false);
    onReAuthSuccess(); // Llamar al callback del padre
    toast.success('Re-autenticación exitosa. Sesión de acciones renovada.');
  };

  const handleReAuthCancel = () => {
    console.log('❌ Re-autenticación cancelada');
    setReAuthModalOpen(false);
    // Al cancelar, activar modo solo lectura
    activateReadOnlyMode();
  };

  const activateReadOnlyMode = () => {
    console.log('🔒 Activando modo solo lectura automáticamente');
    setReadOnlyMode(true);
    onOpenChange(false);
    toast.info('Modo solo lectura activado automáticamente. Puedes re-autenticarte en cualquier momento desde cualquier botón de acción.');
  };

  const handleReadOnlyMode = () => {
    console.log('Usuario eligió modo solo lectura manualmente');
    activateReadOnlyMode();
  };

  // Manejar cuando se cierra el modal (clic fuera o en X)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && open) {
      // Si se está cerrando el modal, activar modo solo lectura
      activateReadOnlyMode();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md bg-white border-amber-200 shadow-lg">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-amber-800 mb-2">
              Sesión de Acciones Expirada
            </h2>
            <p className="text-amber-700 mb-4">
              Tu sesión de acciones ha caducado. Para realizar cambios (agregar, editar o eliminar), 
              debes re-autenticarte.
            </p>
            <p className="text-amber-600 text-sm mb-6">
              Las acciones de solo visualización siguen disponibles.
            </p>
            <div className="flex flex-col gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleReadOnlyMode}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Continuar Solo Lectura
              </Button>
              <Button
                onClick={handleReAuthenticate}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none'
                }}
                className="hover:bg-blue-700 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Re-autenticarse Ahora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Re-autenticación */}
      <ReAuthModal
        open={reAuthModalOpen}
        onOpenChange={setReAuthModalOpen}
        onSuccess={handleReAuthSuccess}
        onCancel={handleReAuthCancel}
        actionType="renewActionSession"
      />
    </>
  );
}