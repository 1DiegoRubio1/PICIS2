import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useApp } from '../context/AppContext';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClientAccount {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  nivelAutenticacion: number;
  politicasIAM: string;
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const { createRequestWithAuthCheck, setActionSessionExpired, actionSessionExpired, readOnlyMode } = useApp();
  const [clientName, setClientName] = useState('');
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState({
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
    if (pendingAction && pendingAction.type === 'addClient') {
      const success = createRequestWithAuthCheck('agregar cliente', pendingAction.data);
      if (success) {
        // Limpiar formulario
        setClientName('');
        setAccounts([]);
        setCurrentAccount({
          id: '',
          nombre: '',
          correo: '',
          rol: '',
          nivelAutenticacion: 2,
          politicasIAM: '',
        });

        toast.success(`Solicitud para crear cliente "${pendingAction.data.nombreCliente}" enviada para aprobación`);
        setIsProcessing(false);
        onOpenChange(false);
      }
      setPendingAction(null);
    }
  };

  const handleAddAccount = () => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    if (!currentAccount.id || !currentAccount.nombre || !currentAccount.correo || !currentAccount.rol) {
      toast.error('Por favor completa todos los campos de la cuenta');
      return;
    }

    const newAccount: ClientAccount = {
      ...currentAccount,
    };

    setAccounts([...accounts, newAccount]);
    setCurrentAccount({
      id: '',
      nombre: '',
      correo: '',
      rol: '',
      nivelAutenticacion: 2,
      politicasIAM: '',
    });
    toast.success('Cuenta agregada');
  };

  const handleRemoveAccount = (id: string) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    setAccounts(accounts.filter(acc => acc.id !== id));
    toast.success('Cuenta eliminada');
  };

  const handleSaveClient = () => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    if (isProcessing) return;
    if (!clientName) {
      toast.error('Por favor ingresa el nombre del cliente');
      return;
    }

    if (accounts.length === 0) {
      toast.error('Por favor agrega al menos una cuenta');
      return;
    }

    const requestData = {
      nombreCliente: clientName,
      cuentas: accounts,
    };

    // Verificar si requiere re-autenticación
    const success = createRequestWithAuthCheck('agregar cliente', requestData);
    
    if (!success) {
      // Si requiere re-auth, guardar la acción pendiente y mostrar modal
      setPendingAction({
        type: 'addClient',
        data: requestData
      });
      setActionSessionExpired(true);
      setIsProcessing(true);
      return;
    }

    // Si llegamos aquí, la acción fue exitosa inmediatamente
    setIsProcessing(true);
    
    // Limpiar formulario
    setClientName('');
    setAccounts([]);
    setCurrentAccount({
      id: '',
      nombre: '',
      correo: '',
      rol: '',
      nivelAutenticacion: 2,
      politicasIAM: '',
    });

    toast.success(`Solicitud para crear cliente "${clientName}" enviada para aprobación`);
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setClientName('');
    setAccounts([]);
    setCurrentAccount({
      id: '',
      nombre: '',
      correo: '',
      rol: '',
      nivelAutenticacion: 2,
      politicasIAM: '',
    });
    setPendingAction(null);
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Cliente</DialogTitle>
          <DialogDescription>
            Crea un nuevo grupo de cliente con sus cuentas asociadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              placeholder="Ej: Empresa Tecnológica S.A."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  placeholder="CLI-001"
                  value={currentAccount.id}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, id: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre completo"
                    value={currentAccount.nombre}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo</Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={currentAccount.correo}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, correo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={currentAccount.rol}
                  onValueChange={(value) => setCurrentAccount({ ...currentAccount, rol: value })}
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
                  placeholder="Ej: roles/viewer, roles/editor"
                  value={currentAccount.politicasIAM}
                  onChange={(e) => setCurrentAccount({ ...currentAccount, politicasIAM: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleAddAccount} 
                className="w-full"
                disabled={readOnlyMode}
                title={readOnlyMode ? "Modo solo lectura activo" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cuenta
              </Button>
            </CardContent>
          </Card>

          {accounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cuentas Agregadas ({accounts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p><strong>{account.nombre}</strong> - {account.rol}</p>
                        <p className="text-sm text-slate-600">
                          ID: {account.id} | {account.correo} | Nivel: {account.nivelAutenticacion} | Permisos: {account.politicasIAM || 'N/A'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAccount(account.id)}
                        disabled={readOnlyMode}
                        title={readOnlyMode ? "Modo solo lectura activo" : ""}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveClient} 
            disabled={isProcessing || readOnlyMode}
            title={readOnlyMode ? "Modo solo lectura activo" : ""}
          >
            {isProcessing ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}