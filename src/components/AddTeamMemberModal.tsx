import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const teamRoles = [
  'Gestor de autenticación',
  'Supervisor de autenticación',
  'Responsable de autenticación',
];

export function AddTeamMemberModal({ open, onOpenChange }: AddTeamMemberModalProps) {
  const { createRequestWithAuthCheck, setActionSessionExpired, actionSessionExpired } = useApp();
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    correo: '',
    rol: '',
    nivelAutenticacion: 2,
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
    if (pendingAction && pendingAction.type === 'addTeamMember') {
      const success = createRequestWithAuthCheck('agregar entidad al equipo', pendingAction.data);
      if (success) {
        // Limpiar formulario
        setFormData({
          id: '',
          nombre: '',
          correo: '',
          rol: '',
          nivelAutenticacion: 2,
          politicasIAM: '',
        });

        toast.success('Solicitud para agregar miembro al equipo enviada para aprobación');
        setIsProcessing(false);
        onOpenChange(false);
      }
      setPendingAction(null);
    }
  };

  const handleSubmit = () => {
    if (isProcessing) return;
    if (!formData.id || !formData.nombre || !formData.correo || !formData.rol) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const requestData = {
      id: formData.id,
      nombre: formData.nombre,
      correo: formData.correo,
      rol: formData.rol,
      nivelAutenticacion: formData.nivelAutenticacion,
      politicasIAM: formData.politicasIAM,
    };

    // Verificar si requiere re-autenticación
    const success = createRequestWithAuthCheck('agregar entidad al equipo', requestData);
    
    if (!success) {
      // Si requiere re-auth, guardar la acción pendiente y mostrar modal
      setPendingAction({
        type: 'addTeamMember',
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
      id: '',
      nombre: '',
      correo: '',
      rol: '',
      nivelAutenticacion: 2,
      politicasIAM: '',
    });

    toast.success('Solicitud para agregar miembro al equipo enviada para aprobación');
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      id: '',
      nombre: '',
      correo: '',
      rol: '',
      nivelAutenticacion: 2,
      politicasIAM: '',
    });
    setPendingAction(null);
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Miembro al Equipo</DialogTitle>
          <DialogDescription>Crear solicitud para agregar un nuevo miembro al equipo</DialogDescription>
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
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo">Correo</Label>
            <Input
              id="correo"
              type="email"
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
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {teamRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel">Nivel de Autenticación</Label>
            <Input
              id="nivel"
              type="number"
              value={2}
              disabled
              className="bg-slate-100"
            />
            <p className="text-xs text-slate-500">El nivel de autenticación para entidades humanas siempre es 2</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="politicas">Políticas IAM (Permisos)</Label>
            <Input
              id="politicas"
              placeholder="Ej: roles/iam.securityAdmin, roles/viewer"
              value={formData.politicasIAM}
              onChange={(e) => setFormData({ ...formData, politicasIAM: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}