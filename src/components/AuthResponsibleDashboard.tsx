import React, { useEffect } from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { LogOut, Check, X, Eye, Edit, Trash2 } from 'lucide-react';
import { RequestDetailsModal } from './RequestDetailsModal';
import { toast } from 'sonner';
import { ActionSessionStatus } from './ActionSessionStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

export function AuthResponsibleDashboard() {
  const { currentUser, logout, clientGroups, systemUsers, nonHumanEntities, getClientUsers, requests, approveRequest, rejectRequest } = useApp();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<{ open: boolean; request: any }>({ open: false, request: null });
  const [entities, setEntities] = useState<any[]>([]);
  const [requestsNH, setRequestsNH] = useState<any[]>([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [modalDetalles, setModalDetalles] = useState<{ open: boolean; request: any }>({ open: false, request: null });
  const [confirmAprobar, setConfirmAprobar] = useState<{ open: boolean; id: string | null }>({
    open: false, id: null
  });
  const [confirmRechazar, setConfirmRechazar] = useState<{ open: boolean; id: string | null }>({
    open: false, id: null
  });

  // Solicitudes recibidas (pendientes de aprobación del responsable que aún no ha aprobado/rechazado este usuario)
  const receivedRequests = requests.filter(
    req => req.seguimiento === 'En proceso de aprobación por el responsable' &&
      !req.responsablesAprobados.includes(currentUser?.id || '') &&
      !req.responsablesRechazados.includes(currentUser?.id || '')
  );


  const loadEntities = async () => {
    try {
      const res = await fetch("http://localhost:3001/entidades", {
        credentials: "include",
      });
      const data = await res.json();
      setEntities(data);
    } catch (error) {
      console.error("Error cargando entidades:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await fetch("http://localhost:3001/solicitudes?estado=pendiente-responsable", {
        credentials: "include",
      });
      const data = await res.json();
      setRequestsNH(data);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    }
  };

  async function cambiarEstado(id: string, nuevoEstado: string) {
    try {
      const respuesta = await fetch(`http://localhost:3001/solicitudes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado
        })
      });

      const data = await respuesta.json();
      console.log("Respuesta PUT:", data);

      if (!data.ok) {
        console.error("No se pudo actualizar el estado");
      }

      // Refrescar la lista de solicitudes
      loadEntities();
      loadRequests();

    } catch (error) {
      console.error("Error en cambiarEstado:", error);
    }
  }

   const handleApprove = (id: string, estado: string) => {
     cambiarEstado(id, estado);
     toast.success('Solicitud aprobada.');
   };
 
   const handleReject = (id: string, estado: string) => {
     cambiarEstado(id, estado);
     toast.error('Solicitud rechazada');
   };

  const handleViewDetails = (request: any) => {
    setViewDetailsModal({ open: true, request });
  };

  const handleLogout = () => {
    logout();
  };

  function parseTimestamp(ts: any): Date | null {
    if (!ts) return null;

    if (typeof ts.toDate === 'function') return ts.toDate();

    if (typeof ts._seconds === 'number') {
      const millis = ts._seconds * 1000 + Math.floor((ts._nanoseconds || 0) / 1e6);
      return new Date(millis);
    }

    const maybeNum = Number(ts);
    if (!Number.isNaN(maybeNum)) return new Date(maybeNum);

    return null;
  }

  function formatFecha(ts: any) {
    const fecha = parseTimestamp(ts);
    return fecha ? fecha.toLocaleString() : '—';
  }

  useEffect(() => {
    loadEntities();
    loadRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600">PICIS</h1>
              <p className="text-sm text-slate-600">
                Bienvenido, {currentUser?.nombre} (Responsable de Autenticación)
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="clients">Entidades Humanas - Clientes</TabsTrigger>
              <TabsTrigger value="system">Entidades Humanas - Sistema</TabsTrigger>
              <TabsTrigger value="nonhuman">Entidades No Humanas</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes</TabsTrigger>
              <TabsTrigger value="requests-nh">Solicitudes NH</TabsTrigger>
            </TabsList>

            {/* Clientes Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Entidades Humanas - Clientes</CardTitle>
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
                  <CardTitle>Entidades Humanas - Sistema</CardTitle>
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

            {/* Non-Human Entities Tab */}
            <TabsContent value="nonhuman">
              <Card>
                <CardHeader>
                  <CardTitle>Entidades No Humanas</CardTitle>
                  <CardDescription>Visualización de entidades no humanas (Solo lectura)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Nivel de Criticidad</TableHead>
                        <TableHead>Cuenta de Servicio de GCP</TableHead>
                        <TableHead>Políticas IAM (permisos)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-500 py-4">
                            No hay entidades registradas.
                          </TableCell>
                        </TableRow>
                      ) : (
                        entities.map((entidad: any) => (
                          <TableRow key={entidad.id}>
                            <TableCell>{entidad.id}</TableCell>
                            <TableCell>{entidad.nombre}</TableCell>
                            <TableCell>{entidad.nivel}</TableCell>
                            <TableCell>{entidad.descripcion}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {entidad.politicasIAM?.map((p: any, i: number) => (
                                  <Badge key={i} variant="outline">{p.rolAsignado} → {p.recursoDestino}</Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitudes Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes Recibidas</CardTitle>
                  <CardDescription>Solicitudes pendientes de aprobación final</CardDescription>
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
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitudes NH Tab */}
            <TabsContent value="requests-nh">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes Recibidas</CardTitle>
                  <CardDescription>Solicitudes pendientes de aprobación final</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre del Gestor</TableHead>
                        <TableHead>Tipo de Solicitud</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Detalles</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsNH.map((s) => (
                        <TableRow key={s.id || s.solicitudId}>
                          <TableCell>{s.gestor || '—'}</TableCell>
                          <TableCell>{s.tipoSolicitud || '—'}</TableCell>
                          <TableCell>{formatFecha(s.timestamp)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{s.estado || 'pendiente'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSolicitudSeleccionada(s);
                                setModalDetallesOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <Button variant="ghost"
                            className="text-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => setConfirmAprobar({ open: true, id: s.id })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost"
                            className="text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => setConfirmRechazar({ open: true, id: s.id })}
                          >
                            <X className="h-4 w-4" />
                          </Button>


                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Modal Detalles Solicitud */}
      < RequestDetailsModal open={modalDetalles.open} onOpenChange={(open) => setModalDetalles({ open, request: null })
      } request={modalDetalles.request} />
      <RequestDetailsModal
        open={modalDetallesOpen}
        onOpenChange={setModalDetallesOpen}
        request={solicitudSeleccionada}
      />
      {/* Modal Confirmar Aprobación */}
      <Dialog open={confirmAprobar.open} onOpenChange={(open: any) => setConfirmAprobar({ open, id: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aprobar Solicitud</DialogTitle>
            <DialogDescription>
              ¿Deseas aprobar esta solicitud? Se enviará al responsable para su validación.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmAprobar({ open: false, id: null })}
            >
              Cancelar
            </Button>

            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={async () => {
                if (confirmAprobar.id) {
                  await handleApprove(confirmAprobar.id, "pendiente-responsable");
                }
                setConfirmAprobar({ open: false, id: null });
              }}
            >
              Aprobar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Rechazo */}
      <Dialog open={confirmRechazar.open} onOpenChange={(open: any) => setConfirmRechazar({ open, id: null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              ¿Deseas rechazar la solicitud?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmRechazar({ open: false, id: null })}
            >
              Cancelar
            </Button>

            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (confirmRechazar.id) {
                  await handleReject(confirmRechazar.id, "rechazada");
                }
                setConfirmRechazar({ open: false, id: null });
              }}
            >
              Rechazar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}