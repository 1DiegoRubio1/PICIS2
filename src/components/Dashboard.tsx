import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { NewAnalysisModal } from './NewAnalysisModal';
import { CommentsModal } from './CommentsModal';
import { ReportModal } from './ReportModal';
import { UrlDisplay } from './UrlDisplay';
import { LogOut, Plus, MessageSquare, FileText, Eye } from 'lucide-react';
import { ActionSessionStatus } from './ActionSessionStatus';
import { SessionExpiredModal } from './SessionExpiredModal';
import { ActionSessionExpiredModal } from './ActionSessionExpiredModal';
import { ReAuthModal } from './ReAuthModal';
import { toast } from 'sonner@2.0.3';

export function Dashboard() {
  const { 
    currentUser, 
    logout, 
    users, 
    analyses, 
    addAnalysis,
    sessionExpired,
    actionSessionExpired,
    readOnlyMode,
    actionSessionActive,
    requiresReAuth,
    resetActionSession,
    setActionSessionExpired
  } = useApp();
  
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [commentsModal, setCommentsModal] = useState<{ open: boolean; analysisId: string; url: string } | null>(null);
  const [reportModal, setReportModal] = useState<{ open: boolean; analysisId: string } | null>(null);
  const [reAuthModalOpen, setReAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isSupervisor = currentUser?.rol === 'Supervisor';
  const isResponsable = currentUser?.rol === 'Responsable';
  const isAnalista = currentUser?.rol === 'Analista';
  const isResponsableAuth = currentUser?.rol === 'Responsable de autenticación';

  // Determinar qué pestañas mostrar
  // Responsable normal (no de autenticación) puede ver cuentas de su grupo
  const showAccountsTab = isSupervisor || isResponsable;

  // Filtrar análisis por grupo del usuario
  const filteredAnalyses = analyses.filter(analysis => {
    if (currentUser?.grupoId) {
      return analysis.grupoId === currentUser.grupoId;
    }
    return true;
  });

  // Función para manejar acciones que requieren autenticación
  const handleActionWithAuth = (action: () => void, actionType: string) => {
    if (readOnlyMode || requiresReAuth(actionType)) {
      toast.error('Debes re-autenticarte para realizar esta acción');
      setPendingAction(() => action);
      setActionSessionExpired(true);
      return false;
    }
    
    action();
    return true;
  };

  // Manejar agregar análisis con verificación de autenticación
  const handleAddAnalysis = (url: string) => {
    const action = () => {
      addAnalysis(url);
      toast.success('Análisis iniciado correctamente');
      setNewAnalysisOpen(false);
    };

    if (!handleActionWithAuth(action, 'addAnalysis')) {
      return;
    }
  };

  // Manejar apertura de reporte con verificación de autenticación
  const handleOpenReport = (analysisId: string) => {
    const action = () => {
      setReportModal({ open: true, analysisId });
    };

    if (!handleActionWithAuth(action, 'viewReport')) {
      return;
    }
  };

  // Re-autenticación exitosa
  const handleReAuthSuccess = () => {
    console.log('✅ Re-autenticación exitosa en Dashboard');
    resetActionSession();
    
    // Ejecutar acción pendiente si existe
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    
    toast.success('Re-autenticación exitosa');
  };

  const handleOpenComments = (analysisId: string, url: string) => {
    setCommentsModal({ open: true, analysisId, url });
  };

  const handleLogout = () => {
    logout();
  };

  // Función para abrir re-autenticación desde botones deshabilitados
  const handleReactivateActions = () => {
    setReAuthModalOpen(true);
  };

  const handleReAuthModalSuccess = () => {
    setReAuthModalOpen(false);
    resetActionSession();
    toast.success('Acciones reactivadas correctamente');
  };

  const handleReAuthModalCancel = () => {
    setReAuthModalOpen(false);
  };

  // Determinar si el botón de reporte está deshabilitado
  const isReportButtonDisabled = readOnlyMode || !actionSessionActive;

  // Obtener el texto del tooltip para el botón de reporte
  const getReportButtonTooltip = () => {
    if (readOnlyMode) return "Modo solo lectura activo";
    if (!actionSessionActive) return "Sesión de acciones expirada";
    return "";
  };

  // Filtrar usuarios para la pestaña de cuentas
  const getFilteredUsersForAccounts = () => {
    if (!currentUser?.grupoId) return [];
    
    // Solo mostrar usuarios del mismo grupo (Supervisor, Responsable, Analista)
    return users.filter(user => 
      user.grupoId === currentUser.grupoId && 
      // Solo roles de cliente, no roles del sistema/equipo
      ['Supervisor', 'Responsable', 'Analista'].includes(user.rol)
    );
  };

  const filteredUsersForAccounts = getFilteredUsersForAccounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600">PICIS</h1>
              <p className="text-sm text-slate-600">
                Bienvenido, {currentUser?.nombre} ({currentUser?.rol})
                {readOnlyMode && (
                  <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                    Modo Solo Lectura
                  </Badge>
                )}
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
          {/* Action Button - Solo para Supervisor */}
          {isSupervisor && (
            <div className="flex justify-end">
              <Button 
                onClick={() => setNewAnalysisOpen(true)}
                disabled={readOnlyMode || !actionSessionActive}
                title={readOnlyMode ? "Modo solo lectura activo" : !actionSessionActive ? "Sesión de acciones expirada" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Realizar Análisis
              </Button>
            </div>
          )}

          {/* Tables */}
          <Tabs defaultValue="analysis" className="w-full">
            {/* Tabs List - Diferente según el rol */}
            {showAccountsTab ? (
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="analysis">Análisis</TabsTrigger>
                <TabsTrigger value="accounts">Cuentas</TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="grid w-full max-w-md grid-cols-1">
                <TabsTrigger value="analysis">Análisis</TabsTrigger>
              </TabsList>
            )}

            {/* Analysis List - Para todos los roles */}
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Listado de Análisis</CardTitle>
                  <CardDescription>
                    Historial de análisis realizados en sitios web
                    {readOnlyMode && (
                      <span className="text-amber-600 ml-2">(Modo Solo Lectura)</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Estado</TableHead>
                        {!isResponsable && <TableHead>Comentarios</TableHead>}
                        {(isSupervisor || isAnalista || isResponsable) && <TableHead>Reporte</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnalyses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={(isSupervisor || isAnalista || isResponsable) ? 3 : 2} className="text-center text-slate-500">
                            No hay análisis disponibles
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAnalyses.map((analysis) => (
                          <TableRow key={analysis.id}>
                            <TableCell>
                              <UrlDisplay url={analysis.url} maxLength={30} />
                            </TableCell>
                            <TableCell>
                              {analysis.estado === 'Completado' ? (
                                <Badge className="bg-green-600">Completado</Badge>
                              ) : (
                                <Badge variant="secondary">En proceso</Badge>
                              )}
                            </TableCell>
                            {!isResponsable && (
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenComments(analysis.id, analysis.url)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  {analysis.comentariosCount}
                                </Button>
                              </TableCell>
                            )}
                            {isSupervisor && (
                              <TableCell>
                                {analysis.estado === 'Completado' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenReport(analysis.id)}
                                    disabled={isReportButtonDisabled}
                                    title={getReportButtonTooltip()}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ver y Descargar
                                  </Button>
                                ) : (
                                  <span className="text-sm text-slate-500">Procesando...</span>
                                )}
                              </TableCell>
                            )}
                            {(isAnalista || isResponsable) && (
                              <TableCell>
                                {analysis.estado === 'Completado' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenReport(analysis.id)}
                                    disabled={isReportButtonDisabled}
                                    title={getReportButtonTooltip()}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Reporte
                                  </Button>
                                ) : (
                                  <span className="text-sm text-slate-500">Procesando...</span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accounts List - Para Supervisor y Responsable (del mismo grupo) */}
            {showAccountsTab && (
              <TabsContent value="accounts">
                <Card>
                  <CardHeader>
                    <CardTitle>Listado de Cuentas</CardTitle>
                    <CardDescription>
                      Usuarios de su grupo (Supervisor, Responsable, Analista)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsersForAccounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-slate-500">
                              No hay cuentas en este grupo
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsersForAccounts.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.nombre}</TableCell>
                              <TableCell>{user.correo}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {user.rol}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.estado === 'Activo' ? (
                                  <Badge className="bg-green-600">Activo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inactivo</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <NewAnalysisModal 
        open={newAnalysisOpen} 
        onOpenChange={setNewAnalysisOpen}
        onAddAnalysis={handleAddAnalysis}
        readOnlyMode={readOnlyMode}
        actionSessionActive={actionSessionActive}
      />
      
      {commentsModal && (
        <CommentsModal
          open={commentsModal.open}
          onOpenChange={(open) => !open && setCommentsModal(null)}
          analysisId={commentsModal.analysisId}
          analysisUrl={commentsModal.url}
        />
      )}

      {reportModal && (
        <ReportModal
          open={reportModal.open}
          onOpenChange={(open) => !open && setReportModal(null)}
          analysisId={reportModal.analysisId}
          readOnlyMode={readOnlyMode}
          actionSessionActive={actionSessionActive}
        />
      )}

      {/* Modales de Seguridad */}
      <SessionExpiredModal 
        open={sessionExpired} 
        onOpenChange={() => {}} 
      />
      
      <ActionSessionExpiredModal 
        open={actionSessionExpired} 
        onOpenChange={setActionSessionExpired}
        onReAuthSuccess={handleReAuthSuccess}
      />

      <ReAuthModal
        open={reAuthModalOpen}
        onOpenChange={setReAuthModalOpen}
        onSuccess={handleReAuthModalSuccess}
        onCancel={handleReAuthModalCancel}
        actionType="reactivateActions"
      />
    </div>
  );
}