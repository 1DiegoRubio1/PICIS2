import React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { AddClientModal } from './AddClientModal';
import { AddSystemUserModal } from './AddSystemUserModal';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { EditClientAccountModal } from './EditClientAccountModal';
import { EditSystemUserModal } from './EditSystemUserModal';
import { EditTeamMemberModal } from './EditTeamMemberModal';
import { AddClientAccountModal } from './AddClientAccountModal';
import { LogOut, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { RequestDetailsModal } from './RequestDetailsModal';
import { toast } from 'sonner@2.0.3';
import { ActionSessionStatus } from './ActionSessionStatus';

export function AuthManagerHumanDashboard() {
  const { currentUser, logout, clientGroups, systemUsers, teamMembers, getClientUsers, requests, createRequestWithAuthCheck, executeActionWithAuthCheck, setActionSessionExpired, readOnlyMode, actionSessionExpired } = useApp();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addSystemUserOpen, setAddSystemUserOpen] = useState(false);
  const [addTeamMemberOpen, setAddTeamMemberOpen] = useState(false);
  const [addClientAccountOpen, setAddClientAccountOpen] = useState(false);
  const [editClientAccountOpen, setEditClientAccountOpen] = useState(false);
  const [editSystemUserOpen, setEditSystemUserOpen] = useState(false);
  const [editTeamMemberOpen, setEditTeamMemberOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<{open: boolean; request: any}>({open: false, request: null});
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{type: string, data: any} | null>(null);

  const handleEdit = (id: string, type: string) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    // Verificar si requiere re-autenticación
    if (!createRequestWithAuthCheck(`editar entidad del ${type}` as any, { entityId: id })) {
      return; // No proceder si requiere re-auth
    }
    toast.info(`Solicitud de edición enviada para aprobación`);
  };

  const handleDelete = (id: string, type: string, nombre?: string) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    // Verificar si requiere re-autenticación
    let actionType = '';
    let detalles = {};
     
    switch (type) {
      case 'sistema':
        actionType = 'eliminar entidad del sistema';
        detalles = { 
          entityId: id,
          entityName: nombre || `Usuario del sistema ${id}`
        };
        break;
      case 'equipo':
        actionType = 'eliminar entidad del equipo';
        detalles = { 
          entityId: id,
          entityName: nombre || `Miembro del equipo ${id}`
        };
        break;
      case 'cliente_user':
        actionType = 'eliminar usuario del cliente';
        detalles = { 
          userId: id,
          clientId: selectedClient,
          userName: nombre || `Usuario ${id}`
        };
        break;
      default:
        actionType = 'eliminar entidad';
        detalles = { entityId: id };
    }

    if (!createRequestWithAuthCheck(actionType as any, detalles)) {
      // Guardar la acción pendiente
      setPendingDeleteAction({ type: actionType, data: detalles });
      setActionSessionExpired(true);
      return;
    }

    toast.info(`Solicitud de eliminación enviada para aprobación`);
  };

  React.useEffect(() => {
    if (pendingDeleteAction) {
      const { type, data } = pendingDeleteAction;
      createRequestWithAuthCheck(type as any, data);
      toast.info(`Solicitud de eliminación enviada para aprobación`);
      setPendingDeleteAction(null);
    }
  }, [pendingDeleteAction]);

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    // Verificar si requiere re-autenticación
    if (!createRequestWithAuthCheck('eliminar cliente', { clientId, clientName })) {
      return; // No proceder si requiere re-auth
    }
    toast.info(`Solicitud para eliminar cliente "${clientName}" enviada para aprobación`);
  };

  const handleDeleteUser = (userId: string, clientId: string) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    
    executeActionWithAuthCheck('eliminar usuario del cliente', () => {
      createRequestWithAuthCheck('eliminar usuario del cliente', { userId, clientId });
      toast.info('Solicitud de eliminación enviada');
    });
  };

  const handleViewDetails = (request: any) => {
    setViewDetailsModal({open: true, request});
  };

  const handleLogout = () => {
    logout();
  };

  // Filtrar solicitudes del usuario actual
  const myRequests = requests.filter(req => req.gestorId === currentUser?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600">PICIS</h1>
              <p className="text-sm text-slate-600">
                Bienvenido, {currentUser?.nombre} (Gestor de autenticación)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ActionSessionStatus />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button 
              onClick={() => setAddClientOpen(true)}
              disabled={readOnlyMode || actionSessionExpired}
              title={readOnlyMode ? "Modo solo lectura activo" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
            <Button 
              onClick={() => setAddSystemUserOpen(true)}
              disabled={readOnlyMode || actionSessionExpired}
              title={readOnlyMode ? "Modo solo lectura activo" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar al Sistema
            </Button>
            <Button 
              onClick={() => setAddTeamMemberOpen(true)}
              disabled={readOnlyMode || actionSessionExpired}
              title={readOnlyMode ? "Modo solo lectura activo" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar al Equipo
            </Button>
          </div>

          {/* Tables */}
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4">
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="team">Equipo</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            </TabsList>

            {/* Clientes Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Listado de Clientes</CardTitle>
                  <CardDescription>Grupos de clientes registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedClient ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>No. Usuarios</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientGroups.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell 
                              className="text-blue-600 underline cursor-pointer"
                              onClick={() => setSelectedClient(client.id)}
                            >
                              {client.nombre}
                            </TableCell>
                            <TableCell>{client.numeroUsuarios}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClient(client.id, client.nombre)}
                                disabled={readOnlyMode || actionSessionExpired}
                                title={readOnlyMode ? "Modo solo lectura activo" : ""}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedClient(null)}
                        >
                          ← Volver a clientes
                        </Button>
                        <Button 
                          onClick={() => setAddClientAccountOpen(true)}
                          disabled={readOnlyMode || actionSessionExpired}
                          title={readOnlyMode ? "Modo solo lectura activo" : ""}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Cuenta
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Nivel de Autenticación</TableHead>
                            <TableHead>Políticas IAM (Permisos)</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getClientUsers(selectedClient).map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.nombre}</TableCell>
                              <TableCell>{user.correo}</TableCell>
                              <TableCell>{user.rol}</TableCell>
                              <TableCell>
                                {user.estado === 'Activo' ? (
                                  <Badge className="bg-green-600">Activo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inactivo</Badge>
                                )}
                              </TableCell>
                              <TableCell>{user.nivelAutenticacion}</TableCell>
                              <TableCell className="max-w-xs truncate" title={user.politicasIAM}>{user.politicasIAM}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setEditClientAccountOpen(true);
                                    }}
                                    disabled={readOnlyMode || actionSessionExpired}
                                    title={readOnlyMode ? "Modo solo lectura activo" : ""}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      createRequestWithAuthCheck('eliminar usuario del cliente', { userId: user.id, clientId: selectedClient });
                                      toast.info('Solicitud de eliminación enviada');
                                    }}
                                    disabled={readOnlyMode || actionSessionExpired}
                                    title={readOnlyMode ? "Modo solo lectura activo" : ""}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sistema Tab */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios del Sistema</CardTitle>
                  <CardDescription>Cuentas de usuarios dentro del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Nivel de Autenticación</TableHead>
                        <TableHead>Políticas IAM (Permisos)</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.nombre}</TableCell>
                          <TableCell>{user.correo}</TableCell>
                          <TableCell>{user.rol}</TableCell>
                          <TableCell>
                            {user.estado === 'Activo' ? (
                              <Badge className="bg-green-600">Activo</Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </TableCell>
                          <TableCell>{user.nivelAutenticacion}</TableCell>
                          <TableCell className="max-w-xs truncate" title={user.politicasIAM}>{user.politicasIAM}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={readOnlyMode || actionSessionExpired || user.correo === currentUser?.correo}
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setEditSystemUserOpen(true);
                                }}
                                title={
                                  readOnlyMode ? "Modo solo lectura activo" :
                                  user.correo === currentUser?.correo ? "No puedes editar tu propia cuenta" : 
                                  "Editar usuario"
                                }
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={readOnlyMode || actionSessionExpired || user.correo === currentUser?.correo}
                                onClick={() => handleDelete(user.id, 'sistema')}
                                title={
                                  readOnlyMode ? "Modo solo lectura activo" :
                                  user.correo === currentUser?.correo ? "No puedes eliminar tu propia cuenta" : 
                                  "Eliminar usuario"
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Equipo Tab */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Miembros del Equipo</CardTitle>
                  <CardDescription>Usuarios de autenticación del equipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Nivel de Autenticación</TableHead>
                        <TableHead>Políticas IAM (Permisos)</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => {
                        const isCurrentUser = currentUser?.correo === member.correo;
                        return (
                          <TableRow key={member.id}>
                            <TableCell>{member.id}</TableCell>
                            <TableCell>{member.nombre}</TableCell>
                            <TableCell>{member.correo}</TableCell>
                            <TableCell>{member.rol}</TableCell>
                            <TableCell>
                              {member.estado === 'Activo' ? (
                                <Badge className="bg-green-600">Activo</Badge>
                              ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </TableCell>
                            <TableCell>{member.nivelAutenticacion}</TableCell>
                            <TableCell className="max-w-xs truncate" title={member.politicasIAM}>{member.politicasIAM}</TableCell>
                            <TableCell>
                              {!isCurrentUser && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUserId(member.id);
                                      setEditTeamMemberOpen(true);
                                    }}
                                    disabled={readOnlyMode || actionSessionExpired}
                                    title={readOnlyMode ? "Modo solo lectura activo" : ""}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(member.id, 'equipo')}
                                    disabled={readOnlyMode || actionSessionExpired}
                                    title={readOnlyMode ? "Modo solo lectura activo" : ""}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              {isCurrentUser && (
                                <span className="text-xs text-slate-500">Usuario actual</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitudes Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Solicitudes</CardTitle>
                  <CardDescription>Historial de solicitudes enviadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre del Gestor</TableHead>
                        <TableHead>Tipo de Solicitud</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Seguimiento</TableHead>
                        <TableHead>Detalles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-500">
                            No hay solicitudes
                          </TableCell>
                        </TableRow>
                      ) : (
                        myRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.gestorNombre}</TableCell>
                            <TableCell>{request.tipo}</TableCell>
                            <TableCell>{new Date(request.fecha).toLocaleDateString()}</TableCell>
                            <TableCell>{request.hora}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  request.seguimiento === 'Aprobado' ? 'default' :
                                  request.seguimiento === 'Rechazado' ? 'destructive' :
                                  'secondary'
                                }
                                className={
                                  request.seguimiento === 'Aprobado' ? 'bg-green-600' : ''
                                }
                              >
                                {request.seguimiento}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleViewDetails(request)} 
                                title="Ver detalles de la solicitud">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
      <AddSystemUserModal open={addSystemUserOpen} onOpenChange={setAddSystemUserOpen} />
      <AddTeamMemberModal open={addTeamMemberOpen} onOpenChange={setAddTeamMemberOpen} />
      {selectedClient && (
        <AddClientAccountModal 
          open={addClientAccountOpen} 
          onOpenChange={setAddClientAccountOpen} 
          clientId={selectedClient}
          clientName={clientGroups.find(c => c.id === selectedClient)?.nombre || ''}
        />
      )}
      {editingUserId && selectedClient && (
        <EditClientAccountModal 
          open={editClientAccountOpen} 
          onOpenChange={(open) => {
            setEditClientAccountOpen(open);
            if (!open) {
              setEditingUserId(null);
            }
          }} 
          userId={editingUserId} 
          clientId={selectedClient}
        />
      )}
      {editingUserId && (
        <EditSystemUserModal 
          open={editSystemUserOpen} 
          onOpenChange={(open) => {
            setEditSystemUserOpen(open);
            if (!open) {
              setEditingUserId(null);
            }
          }} 
          userId={editingUserId}
        />
      )}
      {editingUserId && (
        <EditTeamMemberModal 
          open={editTeamMemberOpen} 
          onOpenChange={(open) => {
            setEditTeamMemberOpen(open);
            if (!open) {
              setEditingUserId(null);
            }
          }} 
          userId={editingUserId}
        />
      )}

      <RequestDetailsModal
              open={viewDetailsModal.open}
              onOpenChange={(open) => setViewDetailsModal({open, request: null})}
              request={viewDetailsModal.request}
            />
    </div>
  );
}