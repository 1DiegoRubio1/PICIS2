import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';

interface EditTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function EditTeamMemberModal({ open, onOpenChange, userId }: EditTeamMemberModalProps) {
  const { teamMembers, createRequestWithAuthCheck, setActionSessionExpired, actionSessionExpired } = useApp();
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    correo: '',
    rol: '',
    politicasIAM: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: string, data: any} | null>(null);

  useEffect(() => {
    if (open && userId) {
      const user = teamMembers.find(u => u.id === userId);
      if (user) {
        setFormData({
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
          politicasIAM: user.politicasIAM || '',
        });
      }
    }
  }, [open, userId, teamMembers]);

  // Ejecutar acción pendiente después de re-autenticación
  useEffect(() => {
    if (open && pendingAction && !actionSessionExpired) {
      executePendingAction();
    }
  }, [open, pendingAction, actionSessionExpired]);

  const executePendingAction = () => {
    if (pendingAction && pendingAction.type === 'editTeamMember') {
      const success = createRequestWithAuthCheck('editar entidad del equipo', pendingAction.data);
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
    if (!formData.id || !formData.nombre || !formData.correo || !formData.rol) {
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
      updatedData: formData,
    };

    // Verificar si requiere re-autenticación
    const success = createRequestWithAuthCheck('editar entidad del equipo', requestData);
    
    if (!success) {
      // Si requiere re-auth, guardar la acción pendiente y mostrar modal
      setPendingAction({
        type: 'editTeamMember',
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
        id: '',
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
          <DialogTitle>Editar Miembro del Equipo</DialogTitle>
          <DialogDescription>
            Modifica los datos del miembro. Los cambios requieren aprobación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              placeholder="TEAM-001"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>

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
                <SelectItem value="Gestor de autenticación de entidades humanas">Gestor de autenticación de entidades humanas</SelectItem>
                <SelectItem value="Gestor de autenticación de entidades no humanas">Gestor de autenticación de entidades no humanas</SelectItem>
                <SelectItem value="Supervisor de entidades humanas">Supervisor de entidades humanas</SelectItem>
                <SelectItem value="Supervisor de entidades no humanas">Supervisor de entidades no humanas</SelectItem>
                <SelectItem value="Responsable de autenticación">Responsable de autenticación</SelectItem>
                <SelectItem value="Gestor de Autenticación">Gestor de Autenticación</SelectItem>
                <SelectItem value="Supervisor de Autenticación">Supervisor de Autenticación</SelectItem>
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
  );
}