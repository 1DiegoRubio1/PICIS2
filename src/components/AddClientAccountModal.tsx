import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';

interface AddClientAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function AddClientAccountModal({ open, onOpenChange, clientId, clientName }: AddClientAccountModalProps) {
  const { createRequestWithAuthCheck, setActionSessionExpired, actionSessionExpired } = useApp();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: '',
    politicasIAM: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: string, data: any} | null>(null);

  // Ejecutar acción pendiente después de re-autenticación
  useEffect(() => {
    if (open && pendingAction && !actionSessionExpired) {
      executePendingAction();
    }
  }, [open, pendingAction, actionSessionExpired]);

  const executePendingAction = () => {
    if (pendingAction && pendingAction.type === 'addClientAccount') {
      const success = createRequestWithAuthCheck('agregar usuario del cliente', pendingAction.data);
      if (success) {
        // Limpiar formulario
        setFormData({
          nombre: '',
          correo: '',
          rol: '',
          politicasIAM: '',
        });

        toast.success('Solicitud de agregación enviada para aprobación');
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
      clientId,
      clientName,
      nombre: formData.nombre,
      correo: formData.correo,
      rol: formData.rol,
      nivelAutenticacion: 2,
      politicasIAM: formData.politicasIAM,
    };

    // Verificar si requiere re-autenticación
    const success = createRequestWithAuthCheck('agregar usuario del cliente', requestData);
    
    if (!success) {
      // Si requiere re-auth, guardar la acción pendiente y mostrar modal
      setPendingAction({
        type: 'addClientAccount',
        data: requestData
      });
      setActionSessionExpired(true);
      setIsProcessing(true);
      return;
    }

    // Si llegamos aquí, la acción fue exitosa inmediatamente
    setIsProcessing(true);
    
    // Limpiar formulario
    setFormData({
      nombre: '',
      correo: '',
      rol: '',
      politicasIAM: '',
    });

    toast.success('Solicitud de agregación enviada para aprobación');
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar Cuenta al Cliente</DialogTitle>
          <DialogDescription>
            Agrega una nueva cuenta de usuario para el cliente: {clientName}
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
                <SelectItem value="Responsable">Responsable</SelectItem>
                <SelectItem value="Analista">Analista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nivel">Nivel de Autenticación</Label>
            <Input
              id="nivel"
              value="2"
              disabled
              className="bg-slate-100"
            />
            <p className="text-xs text-slate-500">El nivel de autenticación es siempre 2 para entidades humanas</p>
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
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}