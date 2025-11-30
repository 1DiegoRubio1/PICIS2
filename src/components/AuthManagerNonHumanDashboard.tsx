// Archivo: AuthManagerNonHumanDashboard.tsx
// Componente reescrito: consume POST /solicitudes para crear solicitudes (agregar/editar/eliminar).
// Notas: variables y comentarios en español. No se actualizan entidades reales desde aquí.

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../context/AppContext';
import { RequestDetailsModal } from './RequestDetailsModal';
import { LogOut, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ActionSessionStatus } from './ActionSessionStatus';

// Tipo local para una política IAM
type PoliticaIAM = { rolAsignado: string; recursoDestino: string };

export function AuthManagerNonHumanDashboard() {
  const {
    currentUser,
    logout,
    requests,
    createRequestWithAuthCheck,
    setActionSessionExpired,
    actionSessionExpired,
    readOnlyMode,
  } = useApp();

  // Formulario vacío
  const formularioVacio = {
    nombre: '',
    nivelCriticidad: 'Basico' as 'Basico' | 'Critico',
    descripcion: '',
    politicasIAM: [{ rolAsignado: '', recursoDestino: '' } as PoliticaIAM],
  };

  // Estados
  const [abrirModalAgregar, setAbrirModalAgregar] = useState(false);
  const [entidades, setEntidades] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [editarEntidad, setEditarEntidad] = useState<any | null>(null);
  const [formEntidad, setFormEntidad] = useState(() => ({ ...formularioVacio }));
  const [accionPendiente, setAccionPendiente] = useState<{ type: string; data?: any } | null>(null);
  const [modalDetalles, setModalDetalles] = useState<{ open: boolean; request: any }>({ open: false, request: null });
  const [procesando, setProcesando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // ------- util: clonar profundo de politicas
  const clonarPoliticas = (politicas: any[]) => (politicas ? politicas.map((p: any) => ({ ...p })) : [{ rolAsignado: '', recursoDestino: '' }]);

  // ------- cargar datos iniciales
  const cargarEntidades = async () => {
    try {
      const res = await fetch('http://localhost:3001/entidades');
      if (!res.ok) throw new Error('Error al obtener entidades');
      const data = await res.json();
      setEntidades(data || []);
    } catch (e) {
      console.error('Error cargarEntidades', e);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await fetch('http://localhost:3001/solicitudes');
      if (!res.ok) throw new Error('Error al obtener solicitudes');
      const data = await res.json();
      setSolicitudes(data || []);
    } catch (e) {
      console.error('Error cargarSolicitudes', e);
    }
  };

  useEffect(() => {
    cargarEntidades();
    cargarSolicitudes();
  }, []);

  // ------- API: crear solicitud (general)
  const crearSolicitudAPI = async (payload: any) => {
    try {
      const res = await fetch('http://localhost:3001/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data; // { ok: true, id: ... } o error
    } catch (e) {
      console.error('Error crearSolicitudAPI', e);
      return null;
    }
  };

  // ------- Helpers para no mutar estado compartido
  const abrirModalEdicion = (entidad: any) => {
    // clonar valores para que el formulario no comparta referencias
    setEditarEntidad(entidad);
    setFormEntidad({
      nombre: entidad.nombre || '',
      nivelCriticidad: entidad.nivel || 'Basico',
      descripcion: entidad.descripcion || '',
      politicasIAM: clonarPoliticas(entidad.politicasIAM || []),
    });
  };

  // ------- Acciones: agregar, editar, eliminar (crean solicitudes)
  const handleAgregarSolicitud = async () => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    if (procesando) return;

    // validaciones básicas
    if (!formEntidad.nombre || !formEntidad.descripcion || formEntidad.politicasIAM.some((p: any) => !p.rolAsignado || !p.recursoDestino)) {
      toast.error('Completa todos los campos');
      return;
    }

    setProcesando(true);

    const detalle = {
      nombre: formEntidad.nombre,
      nivel: formEntidad.nivelCriticidad,
      descripcion: formEntidad.descripcion,
      politicasIAM: formEntidad.politicasIAM,
    };

    const payload = {
      gestor: currentUser?.nombre || 'desconocido',
      tipoSolicitud: 'crear-entidad',
      estado: 'pendiente-supervisor',
      detalle,
    };

    // Intentar crear solicitud (server se encargará de validaciones)
    const resultado = await crearSolicitudAPI(payload);

    if (resultado && resultado.ok) {
      toast.success('Solicitud creada correctamente');
      setFormEntidad({ ...formularioVacio });
      setAbrirModalAgregar(false);
      cargarSolicitudes();
    } else {
      toast.error('Error al crear la solicitud');
    }

    setProcesando(false);
  };

  const handleEditarSolicitud = async () => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    if (procesando) return;

    if (!editarEntidad || !editarEntidad.id) {
      toast.error('Entidad a editar no encontrada');
      return;
    }

    if (!formEntidad.nombre || !formEntidad.descripcion || formEntidad.politicasIAM.some((p: any) => !p.rolAsignado || !p.recursoDestino)) {
      toast.error('Completa todos los campos');
      return;
    }

    setProcesando(true);

    const detalle = {
      nombre: formEntidad.nombre,
      nivel: formEntidad.nivelCriticidad,
      descripcion: formEntidad.descripcion,
      politicasIAM: formEntidad.politicasIAM,
    };

    const payload = {
      gestor: currentUser?.nombre || 'desconocido',
      tipoSolicitud: 'editar-entidad',
      estado: 'pendiente-supervisor',
      detalle,
      idEntidad: editarEntidad.id,
    };

    const resultado = await crearSolicitudAPI(payload);

    if (resultado && resultado.ok) {
      toast.success('Solicitud de edición creada correctamente');
      setEditarEntidad(null);
      setFormEntidad({ ...formularioVacio });
      cargarSolicitudes();
    } else {
      toast.error('Error al crear la solicitud');
    }

    setProcesando(false);
  };

  const handleCrearSolicitudEliminar = async (entidad: any) => {
    if (readOnlyMode) {
      toast.error('Modo solo lectura activo. Re-autentícate para realizar acciones.');
      return;
    }
    setProcesando(true);

    const detalle = {
      nombre: entidad.nombre,
      nivel: entidad.nivel,
      descripcion: entidad.descripcion,
      politicasIAM: entidad.politicasIAM || [],
    };

    const payload = {
      gestor: currentUser?.nombre || 'desconocido',
      tipoSolicitud: 'eliminar-entidad',
      estado: 'pendiente-supervisor',
      detalle,
      idEntidad: entidad.id,
    };

    const resultado = await crearSolicitudAPI(payload);

    if (resultado && resultado.ok) {
      toast.success('Solicitud de eliminación enviada');
      cargarSolicitudes();
    } else {
      toast.error('Error al crear la solicitud de eliminación');
    }

    setProcesando(false);
  };

  // ------- UI helpers para modificar politicas sin mutar
  const actualizarRolPolitica = (index: number, rol: string) => {
    const nuevas = formEntidad.politicasIAM.map((p: any, i: number) => ({ ...p }));
    nuevas[index].rolAsignado = rol;
    setFormEntidad({ ...formEntidad, politicasIAM: nuevas });
  };

  const actualizarRecursoPolitica = (index: number, recurso: string) => {
    const nuevas = formEntidad.politicasIAM.map((p: any, i: number) => ({ ...p }));
    nuevas[index].recursoDestino = recurso;
    setFormEntidad({ ...formEntidad, politicasIAM: nuevas });
  };

  const eliminarPolitica = (index: number) => {
    const nuevas = formEntidad.politicasIAM.filter((_: any, i: number) => i !== index).map((p: any) => ({ ...p }));
    setFormEntidad({ ...formEntidad, politicasIAM: nuevas.length ? nuevas : [{ rolAsignado: '', recursoDestino: '' }] });
  };

  const agregarPolitica = () => {
    setFormEntidad({ ...formEntidad, politicasIAM: [...formEntidad.politicasIAM.map((p: any) => ({ ...p })), { rolAsignado: '', recursoDestino: '' }] });
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

  // ------- render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600">PICIS</h1>
              <p className="text-sm text-slate-600">Bienvenido, {currentUser?.nombre || 'Gestor'}</p>
            </div>
            <div className="flex items-center gap-4">
              <ActionSessionStatus />
              <Button variant="outline" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setAbrirModalAgregar(true)} disabled={readOnlyMode || actionSessionExpired}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Entidad No Humana
            </Button>
          </div>

          <Tabs defaultValue="entities" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="entities">Entidades</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes</TabsTrigger>
            </TabsList>

            <TabsContent value="entities">
              <Card>
                <CardHeader>
                  <CardTitle>Entidades No Humanas</CardTitle>
                  <CardDescription>Gestión de entidades no humanas y sus configuraciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Cuenta</TableHead>
                        <TableHead>Políticas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entidades.map((ent) => (
                        <TableRow key={ent.id}>
                          <TableCell>{ent.id}</TableCell>
                          <TableCell>{ent.nombre}</TableCell>
                          <TableCell>{ent.nivel}</TableCell>
                          <TableCell>{ent.descripcion}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {ent.politicasIAM?.map((p: any, i: number) => (
                                <Badge key={i} variant="outline">{p.rolAsignado} → {p.recursoDestino}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => abrirModalEdicion(ent)}>
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button size="sm" variant="ghost" onClick={() => setConfirmEliminar({ open: true, id: ent.id })}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>

                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes</CardTitle>
                  <CardDescription>Historial de solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gestor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Detalles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudes.map((s) => (
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

      {/* Modal Agregar */ }
  <Dialog open={abrirModalAgregar} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => { setAbrirModalAgregar(open); if (open) { setEditarEntidad(null); setFormEntidad({ ...formularioVacio }); } }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Agregar Entidad No Humana</DialogTitle>
        <DialogDescription>Crear solicitud para agregar una nueva entidad</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" value={formEntidad.nombre} onChange={(e) => setFormEntidad({ ...formEntidad, nombre: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nivel">Nivel de Criticidad</Label>
          <Select value={formEntidad.nivelCriticidad} onValueChange={(value: 'Basico' | 'Critico') => setFormEntidad({ ...formEntidad, nivelCriticidad: value })}>
            <SelectTrigger id="nivel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Basico">Básico</SelectItem>
              <SelectItem value="Critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" value={formEntidad.descripcion} onChange={(e) => setFormEntidad({ ...formEntidad, descripcion: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Políticas IAM</Label>
          <div className="space-y-2">
            {formEntidad.politicasIAM.map((p: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <Select value={p.rolAsignado} onValueChange={(v: string) => actualizarRolPolitica(index, v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Rol asignado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roles/viewer">Viewer</SelectItem>
                    <SelectItem value="roles/editor">Editor</SelectItem>
                    <SelectItem value="roles/owner">Owner</SelectItem>
                    <SelectItem value="roles/storage.objectViewer">Storage Object Viewer</SelectItem>
                    <SelectItem value="roles/storage.objectCreator">Storage Object Creator</SelectItem>
                    <SelectItem value="roles/storage.objectAdmin">Storage Object Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={p.recursoDestino} onValueChange={(v: string) => actualizarRecursoPolitica(index, v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Recurso destino" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bucket1">Bucket 1</SelectItem>
                    <SelectItem value="bucket2">Bucket 2</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" size="sm" onClick={() => eliminarPolitica(index)} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={agregarPolitica} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Rol
            </Button>
          </div>
        </div>

      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setAbrirModalAgregar(false)}>Cancelar</Button>
        <Button onClick={handleAgregarSolicitud} disabled={readOnlyMode || actionSessionExpired}>Enviar Solicitud</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Modal Editar */ }
  <Dialog open={!!editarEntidad} onOpenChange={(open: any) => { if (!open) { setEditarEntidad(null); setFormEntidad({ ...formularioVacio }); } }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Entidad No Humana</DialogTitle>
        <DialogDescription>Crear solicitud para editar la entidad</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-nombre">Nombre</Label>
          <Input id="edit-nombre" disabled value={formEntidad.nombre} onChange={(e) => setFormEntidad({ ...formEntidad, nombre: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-nivel">Nivel de Criticidad</Label>
          <Select value={formEntidad.nivelCriticidad} onValueChange={(value: 'Basico' | 'Critico') => setFormEntidad({ ...formEntidad, nivelCriticidad: value })}>
            <SelectTrigger id="edit-nivel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Basico">Básico</SelectItem>
              <SelectItem value="Critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-descripcion">Descripción</Label>
          <Input id="edit-descripcion" value={formEntidad.descripcion} onChange={(e) => setFormEntidad({ ...formEntidad, descripcion: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Políticas IAM</Label>
          <div className="space-y-2">
            {formEntidad.politicasIAM.map((p: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <Select value={p.rolAsignado} onValueChange={(v: string) => actualizarRolPolitica(index, v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Rol asignado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roles/viewer">Viewer</SelectItem>
                    <SelectItem value="roles/editor">Editor</SelectItem>
                    <SelectItem value="roles/owner">Owner</SelectItem>
                    <SelectItem value="roles/storage.objectViewer">Storage Object Viewer</SelectItem>
                    <SelectItem value="roles/storage.objectCreator">Storage Object Creator</SelectItem>
                    <SelectItem value="roles/storage.objectAdmin">Storage Object Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={p.recursoDestino} onValueChange={(v: string) => actualizarRecursoPolitica(index, v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Recurso destino" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bucket1">Bucket 1</SelectItem>
                    <SelectItem value="bucket2">Bucket 2</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" size="sm" onClick={() => eliminarPolitica(index)} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={agregarPolitica} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Rol
            </Button>
          </div>
        </div>

      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => { setEditarEntidad(null); setFormEntidad({ ...formularioVacio }); }}>Cancelar</Button>
        <Button onClick={handleEditarSolicitud} disabled={readOnlyMode || actionSessionExpired}>Enviar Solicitud</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Modal Detalles Solicitud */ }
      <RequestDetailsModal open={modalDetalles.open} onOpenChange={(open) => setModalDetalles({ open, request: null })} request={modalDetalles.request} />
      <RequestDetailsModal
        open={modalDetallesOpen}
        onOpenChange={setModalDetallesOpen}
        request={solicitudSeleccionada}
      />

  {/* Confirmación Eliminar */ }
  <Dialog open={confirmEliminar.open} onOpenChange={(open: any) => setConfirmEliminar({ open, id: null })}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Eliminar Entidad</DialogTitle>
        <DialogDescription>¿Seguro que deseas solicitar la eliminación de esta entidad?</DialogDescription>
      </DialogHeader>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={() => setConfirmEliminar({ open: false, id: null })}>Cancelar</Button>
        <Button variant="destructive" onClick={async () => {
          const entidad = entidades.find(e => e.id === confirmEliminar.id);
          if (entidad) {
            await handleCrearSolicitudEliminar(entidad);
          } else {
            toast.error('Entidad no encontrada');
          }
          setConfirmEliminar({ open: false, id: null });
        }}>Eliminar</Button>
      </div>
    </DialogContent>
  </Dialog>

    </div >
  );
}