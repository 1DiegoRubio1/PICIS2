import React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { LogOut, Check, X, Eye} from 'lucide-react';
import { RequestDetailsModal } from './RequestDetailsModal';
import { toast } from 'sonner@2.0.3';
import { ActionSessionStatus } from './ActionSessionStatus';

export function AuthSupervisorHumanDashboard() {
  const { currentUser, logout, clientGroups, systemUsers, getClientUsers, requests, approveRequest, rejectRequest } = useApp();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<{open: boolean; request: any}>({open: false, request: null});

  // Solicitudes recibidas (pendientes de aprobación del supervisor)
  const receivedRequests = requests.filter(
  req => (
    // Solicitudes de clientes (humanas)
    req.tipo === 'agregar cliente' ||
    req.tipo === 'eliminar cliente' ||
    req.tipo === 'agregar usuario del cliente' ||
    req.tipo === 'editar usuario del cliente' ||
    req.tipo === 'eliminar usuario del cliente' ||
    // Solicitudes del sistema (humanas)
    req.tipo === 'agregar entidad al sistema' ||
    req.tipo === 'editar entidad del sistema' ||
    req.tipo === 'eliminar entidad del sistema' ||
    // Solicitudes del equipo (humanas)
    req.tipo === 'agregar entidad al equipo' ||
    req.tipo === 'editar entidad del equipo' ||
    req.tipo === 'eliminar entidad del equipo'
  ) &&
  req.seguimiento === 'En proceso de aprobación del supervisor' &&
  !req.supervisoresAprobados.includes(currentUser?.id || '') &&
  !req.supervisoresRechazados.includes(currentUser?.id || '')
);

  // Solicitudes enviadas por el supervisor (aprobadas por él y enviadas al responsable, o rechazadas)
  const sentRequests = requests.filter(
  req => (
    req.tipo === 'agregar cliente' ||
    req.tipo === 'eliminar cliente' ||
    req.tipo === 'agregar usuario del cliente' ||
    req.tipo === 'editar usuario del cliente' ||
    req.tipo === 'eliminar usuario del cliente' ||
    req.tipo === 'agregar entidad al sistema' ||
    req.tipo === 'editar entidad del sistema' ||
    req.tipo === 'eliminar entidad del sistema' ||
    req.tipo === 'agregar entidad al equipo' ||
    req.tipo === 'editar entidad del equipo' ||
    req.tipo === 'eliminar entidad del equipo'
  ) &&
  (req.supervisoresAprobados.includes(currentUser?.id || '') ||
   req.supervisoresRechazados.includes(currentUser?.id || '')) &&
  (req.seguimiento === 'En proceso de aprobación por el responsable' || 
   req.seguimiento === 'Aprobado' || 
   req.seguimiento === 'Rechazado')
);

  const handleApprove = (requestId: string) => {
    approveRequest(requestId);
    toast.success('Solicitud aprobada');
  };

  const handleReject = (requestId: string) => {
    rejectRequest(requestId);
    toast.error('Solicitud rechazada');
  };

  const handleViewDetails = (request: any) => {
    setViewDetailsModal({open: true, request});
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600">PICIS</h1>
              <p className="text-sm text-slate-600">
                Bienvenido, {currentUser?.nombre} (Supervisor de autenticación)
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
          {/* Tables */}
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            </TabsList>

            {/* Clientes Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Listado de Clientes</CardTitle>
                  <CardDescription>Visualización de grupos de clientes (Solo lectura)</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedClient ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>No. Usuarios</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientGroups.map((client) => (
                          <TableRow 
                            key={client.id} 
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => setSelectedClient(client.id)}
                          >
                            <TableCell className="text-blue-600 underline">
                              {client.nombre}
                            </TableCell>
                            <TableCell>{client.numeroUsuarios}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedClient(null)}
                      >
                        ← Volver a clientes
                      </Button>
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
                  <CardDescription>Visualización de usuarios del sistema (Solo lectura)</CardDescription>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitudes Tab */}
            <TabsContent value="requests">
              <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="received">Recibidas</TabsTrigger>
                  <TabsTrigger value="sent">Enviadas</TabsTrigger>
                </TabsList>

                {/* Solicitudes Recibidas */}
                <TabsContent value="received">
                  <Card>
                    <CardHeader>
                      <CardTitle>Solicitudes Recibidas</CardTitle>
                      <CardDescription>Solicitudes pendientes de aprobación</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre del Gestor</TableHead>
                            <TableHead>Tipo de Solicitud</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Detalles</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receivedRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-slate-500">
                                No hay solicitudes pendientes
                              </TableCell>
                            </TableRow>
                          ) : (
                            receivedRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.gestorNombre}</TableCell>
                                <TableCell>{request.tipo}</TableCell>
                                <TableCell>{new Date(request.fecha).toLocaleDateString()}</TableCell>
                                <TableCell>{request.hora}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleApprove(request.id)}
                                      className="text-green-600 hover:bg-green-50"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReject(request.id)}
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
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

                {/* Solicitudes Enviadas */}
                <TabsContent value="sent">
                  <Card>
                    <CardHeader>
                      <CardTitle>Solicitudes Enviadas</CardTitle>
                      <CardDescription>Solicitudes aprobadas o rechazadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo de Solicitud</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Detalles</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sentRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-slate-500">
                                No hay solicitudes enviadas
                              </TableCell>
                            </TableRow>
                          ) : (
                            sentRequests.map((request) => (
                              <TableRow key={request.id}>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Request Details Modal */}
            <RequestDetailsModal
              open={viewDetailsModal.open}
              onOpenChange={(open) => setViewDetailsModal({open, request: null})}
              request={viewDetailsModal.request}
            />
    </div>
  );
}