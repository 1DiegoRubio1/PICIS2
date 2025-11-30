import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
  actionType: string;
}

export function ReAuthModal({ open, onOpenChange, onSuccess, onCancel, actionType }: ReAuthModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSuccessRef = useRef(false);
  const isProcessingRef = useRef(false);
  const successCallbackRef = useRef(onSuccess);
  const onOpenChangeRef = useRef(onOpenChange);
  const onCancelRef = useRef(onCancel);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const modalInstanceIdRef = useRef<string>(`modal-${Date.now()}-${Math.random()}`);

  // Actualizar las referencias cuando las props cambien
  useEffect(() => {
    successCallbackRef.current = onSuccess;
    onOpenChangeRef.current = onOpenChange;
    onCancelRef.current = onCancel;
  }, [onSuccess, onOpenChange, onCancel]);

  // Resetear completamente cuando se abra/cierre el modal
  useEffect(() => {
    if (open) {
      console.log(`🔄 ReAuthModal [${modalInstanceIdRef.current}] - Inicializando estado fresco`);
      resetState();
      startStatusChecking();
    } else {
      cleanup();
    }
    
    return () => {
      cleanup();
    };
  }, [open]);

  const resetState = () => {
    hasSuccessRef.current = false;
    isProcessingRef.current = false;
    setIsAuthenticating(false);
    processedMessagesRef.current.clear();
  };

  const cleanup = () => {
    console.log(`🧹 ReAuthModal [${modalInstanceIdRef.current}] - Limpiando recursos`);
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  // Configurar el listener de mensajes - SOLO UNA VEZ por instancia
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:5173') return;
      
      const messageData = event.data;
      if (!messageData?.type) return;

      // Solo procesar si este modal está abierto y autenticando
      if (!open || !isAuthenticating) {
        return;
      }

      // Crear ID único para este mensaje
      const messageId = `${messageData.type}-${messageData.timestamp}-${messageData.source}-${modalInstanceIdRef.current}`;
      
      // Si ya procesamos este mensaje, ignorarlo
      if (processedMessagesRef.current.has(messageId)) {
        console.log(`🔄 ReAuthModal [${modalInstanceIdRef.current}] - Mensaje ya procesado, ignorando:`, messageId);
        return;
      }

      console.log(`📨 ReAuthModal [${modalInstanceIdRef.current}] - Mensaje recibido:`, messageData.type, "ID:", messageId);

      // Marcar como procesado inmediatamente
      processedMessagesRef.current.add(messageId);

      if (messageData.type === 'REAUTH_SUCCESS') {
        handleReAuthMessage();
      } else if (messageData.type === 'REAUTH_FAILED') {
        handleReAuthFailure('La verificación falló. Por favor intenta nuevamente.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, isAuthenticating]);

  const handleReAuthMessage = () => {
    // Doble verificación para evitar procesamiento múltiple
    if (hasSuccessRef.current || isProcessingRef.current) {
      console.log(`⚠️ ReAuthModal [${modalInstanceIdRef.current}] - Ya procesando o completado, ignorando mensaje`);
      return;
    }

    console.log(`✅ ReAuthModal [${modalInstanceIdRef.current}] - Procesando mensaje de éxito`);
    isProcessingRef.current = true;
    hasSuccessRef.current = true;
    handleReAuthSuccess();
  };

  const startStatusChecking = () => {
    cleanup(); // Limpiar intervalo previo

    let checks = 0;
    const maxChecks = 60; // 30 segundos (500ms * 60)

    checkIntervalRef.current = setInterval(() => {
      checks++;
      
      if (hasSuccessRef.current) {
        cleanup();
        return;
      }
      
      // Verificar estado cada 10 ciclos (5 segundos)
      if (checks % 10 === 0 && isAuthenticating) {
        checkReAuthStatus();
      }
      
      // Timeout
      if (checks >= maxChecks && isAuthenticating) {
        handleReAuthFailure('Tiempo de verificación agotado.');
      }
    }, 500);
  };

  const handleReAuthenticate = () => {
    console.log(`🔐 ReAuthModal [${modalInstanceIdRef.current}] - Iniciando re-autenticación`);
    resetState();
    setIsAuthenticating(true);
    
    const authUrl = 'http://localhost:3001/auth/google/reauthenticate';
    const newTab = window.open(authUrl, '_blank');
    
    if (!newTab) {
      toast.error('No se pudo abrir la ventana. Verifica los bloqueadores de popups.');
      setIsAuthenticating(false);
    }
  };

  const checkReAuthStatus = async () => {
    if (hasSuccessRef.current || isProcessingRef.current) return;

    try {
      const response = await fetch('http://localhost:3001/auth/reauthentication-status', {
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const status = await response.json();
        if (status.authenticated && !hasSuccessRef.current) {
          console.log(`✅ ReAuthModal [${modalInstanceIdRef.current}] - Confirmado por servidor`);
          isProcessingRef.current = true;
          hasSuccessRef.current = true;
          await handleReAuthSuccess();
        }
      }
    } catch (error) {
      console.error('ReAuthModal - Error verificando estado:', error);
    }
  };

  const handleReAuthSuccess = async () => {
    console.log(`✅✅ ReAuthModal [${modalInstanceIdRef.current}] - Ejecutando éxito FINAL`);
    
    try {
      cleanup();
      
      // Resetear estado en servidor
      try {
        await fetch('http://localhost:3001/auth/reset-reauthentication', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('ReAuthModal - Error reseteando estado:', error);
      }
      
      // Cerrar modal primero
      setIsAuthenticating(false);
      onOpenChangeRef.current(false);
      
      // Ejecutar callback SOLO UNA VEZ después de cerrar el modal
      setTimeout(() => {
        console.log(`🎯 ReAuthModal [${modalInstanceIdRef.current}] - Ejecutando callback de éxito`);
        successCallbackRef.current();
        toast.success('Verificación completada');
      }, 100);
      
    } catch (error) {
      console.error('ReAuthModal - Error en éxito:', error);
      setIsAuthenticating(false);
      onOpenChangeRef.current(false);
      setTimeout(() => {
        successCallbackRef.current();
        toast.success('Verificación completada');
      }, 100);
    }
  };

  const handleReAuthFailure = (message: string) => {
    console.log(`❌ ReAuthModal [${modalInstanceIdRef.current}] - Fallo:`, message);
    cleanup();
    resetState();
    toast.error(message);
  };

  const handleCancel = () => {
    console.log(`❌ ReAuthModal [${modalInstanceIdRef.current}] - Cancelado por usuario`);
    cleanup();
    resetState();
    onCancelRef.current();
    onOpenChangeRef.current(false);
  };

  const getActionDescription = () => {
    const actions: { [key: string]: string } = {
      'addClient': 'agregar un nuevo cliente',
      'addSystemUser': 'agregar un usuario al sistema',
      'addTeamMember': 'agregar un miembro al equipo',
      'addClientAccount': 'agregar una cuenta de cliente',
      'editClientAccount': 'editar una cuenta de cliente',
      'editSystemUser': 'editar un usuario del sistema',
      'editTeamMember': 'editar un miembro del equipo',
      'addNonHumanEntity': 'agregar una entidad no humana',
      'editNonHumanEntity': 'editar una entidad no humana',
      'deleteNonHumanEntity': 'eliminar una entidad no humana',
    };
    
    return actions[actionType] || 'realizar esta acción';
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-lg">Verificación de Seguridad</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Para {getActionDescription()}, confirma tu identidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isAuthenticating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 text-center">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Esperando verificación...
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!isAuthenticating ? (
              <>
                <Button
                  onClick={handleReAuthenticate}
                  style={{ 
                    backgroundColor: '#2563eb', 
                    color: 'white',
                    border: 'none'
                  }}
                  className="hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Confirmar Identidad
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  style={{ 
                    color: '#374151',
                    borderColor: '#d1d5db'
                  }}
                  className="hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessingRef.current}
                style={{ 
                  color: '#374151',
                  borderColor: '#d1d5db'
                }}
                className="hover:bg-gray-50"
              >
                {isProcessingRef.current ? 'Procesando...' : 'Cancelar Verificación'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}