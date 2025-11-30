import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';

interface EditClientAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  clientId: string;
}

export function EditClientAccountModal({ open, onOpenChange, userId, clientId }: EditClientAccountModalProps) {
  const { getClientUsers, createRequestWithAuthCheck, setActionSessionExpired, actionSessionExpired } = useApp();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: '',
    politicasIAM: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: string, data: any} | null>(null);

  useEffect(() => {
    if (open && userId && clientId) {
      const users = getClientUsers(clientId);
      const user = users.find(u => u.id === userId);
      if (user) {
        setFormData({
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
          politicasIAM: user.politicasIAM || '',
        });
      }
    }
  }, [open, userId, clientId, getClientUsers]);

// Ejecutar acción pendiente después de re-autenticación
  useEffect(() => {
    if (open && pendingAction && !actionSessionExpired) {
      executePendingAction();
    }
  }, [open, pendingAction, actionSessionExpired]);

  const executePendingAction = () => {
    if (pendingAction && pendingAction.type === 'editClientAccount') {
      const success = createRequestWithAuthCheck('editar usuario del cliente', pendingAction.data);
      if (success) {
        toast.success('Solicitud de edición enviada para aprobación');
        setIsProcessing(false);
        onOpenChange(false);
      }
      setPendingAction(null);
    }
  };


  const handleSave = () => {
    if (isProcessing) return;
    if (!formData.nombre || !formData.correo || !formData.rol) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

     const requestData = {
      userId,
      clientId,
      updatedData: formData,
    };

    // Verificar si requiere re-autenticación
    const success = createRequestWithAuthCheck('editar usuario del cliente', requestData);
    
    if (!success) {
      // Si requiere re-auth, guardar la acción pendiente y mostrar modal
      setPendingAction({
        type: 'editClientAccount',
        data: requestData
      });
      setActionSessionExpired(true);
      setIsProcessing(true);
      return;
    }

    // Si llegamos aquí, la acción fue exitosa inmediatamente
    setIsProcessing(true);
    
    toast.success('Solicitud de edición enviada para aprobación');
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        nombre: '',
        correo: '',
        rol: '',
        politicasIAM: '',
      });
      setPendingAction(null);
      setIsProcessing(false);
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cuenta de Cliente</DialogTitle>
            <DialogDescription>
              Modifica los datos de la cuenta. Los cambios requieren aprobación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => setFormData({ ...formData, rol: value })}
              >
                <SelectTrigger id="rol">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Analista">Analista</SelectItem>
                  <SelectItem value="Responsable">Responsable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="politicas">Políticas IAM (Permisos)</Label>
              <Input
                id="politicas"
                placeholder="Ej: roles/viewer, roles/editor"
                value={formData.politicasIAM}
                onChange={(e) => setFormData({ ...formData, politicasIAM: e.target.value })}
              />
              <p className="text-xs text-slate-500">Opcional: Especifica los permisos IAM para esta cuenta</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}