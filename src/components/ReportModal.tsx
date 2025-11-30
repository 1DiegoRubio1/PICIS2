import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useApp } from '../context/AppContext';
import { Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  readOnlyMode?: boolean;
  actionSessionActive?: boolean;
}

export function ReportModal({ 
  open, 
  onOpenChange, 
  analysisId, 
  readOnlyMode = false,
  actionSessionActive = true 
}: ReportModalProps) {
  const { reports, currentUser } = useApp();
  const report = reports.get(analysisId);

  if (!report) {
    return null;
  }

  const handleDownloadReport = () => {
    if (readOnlyMode || !actionSessionActive) {
      toast.error(readOnlyMode 
        ? "Modo solo lectura activo. Re-autentícate para descargar." 
        : "Sesión de acciones expirada. Re-autentícate para descargar."
      );
      return;
    }

    const reportData = {
      url: report.url,
      totalDetecciones: report.totalDetecciones,
      nivelCriticidad: report.nivelCriticidad,
      detecciones: report.detecciones,
      fechaGeneracion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${analysisId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Reporte descargado correctamente');
  };

  const getCriticalityColor = () => {
    switch (report.nivelCriticidad) {
      case 'seguro':
        return 'bg-green-500';
      case 'advertencia':
        return 'bg-yellow-500';
      case 'critico':
        return 'bg-red-500';
    }
  };

  const getCriticalityIcon = () => {
    switch (report.nivelCriticidad) {
      case 'seguro':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'advertencia':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critico':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getCriticalityText = () => {
    switch (report.nivelCriticidad) {
      case 'seguro':
        return 'Sin Detecciones';
      case 'advertencia':
        return 'Con Hallazgos No Críticos';
      case 'critico':
        return 'Crítico - Riesgo de Integridad';
    }
  };

  const getCriticalityBadge = (criticidad: 'baja' | 'media' | 'critica') => {
    switch (criticidad) {
      case 'baja':
        return <Badge variant="secondary">Baja</Badge>;
      case 'media':
        return <Badge className="bg-yellow-500">Media</Badge>;
      case 'critica':
        return <Badge variant="destructive">Crítica</Badge>;
    }
  };

  const canDownload = currentUser?.rol === 'Supervisor' && !readOnlyMode && actionSessionActive;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>Reporte de Análisis</DialogTitle>
            <DialogDescription>
              URL: {report.url}
              {readOnlyMode && (
                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                  Modo Solo Lectura
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-6 gap-4 overflow-hidden">
          {/* Status Bar */}
          <div className="space-y-2 flex-shrink-0">
            <div className={`h-3 rounded-full ${getCriticalityColor()}`}></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCriticalityIcon()}
                <span>Nivel de Criticidad: {getCriticalityText()}</span>
              </div>
              <div>
                <span>Hallazgos: {report.totalDetecciones}</span>
              </div>
            </div>
          </div>

          {/* Download Button - Only for Supervisor */}
          {currentUser?.rol === 'Supervisor' && (
            <Button 
              onClick={handleDownloadReport} 
              className="w-full flex-shrink-0"
              disabled={!canDownload}
              title={!canDownload ? (readOnlyMode ? "Modo solo lectura activo" : "Sesión de acciones expirada") : ""}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Reporte
            </Button>
          )}

          {/* Detections Table with Horizontal and Vertical Scroll */}
          <div className="flex-1 border rounded-lg overflow-hidden flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="min-w-[100px]">No. Detección</TableHead>
                    <TableHead className="min-w-[200px]">Tipo de Información</TableHead>
                    <TableHead className="min-w-[250px]">Ruta de Archivo</TableHead>
                    <TableHead className="min-w-[150px]">Fila y Columna</TableHead>
                    <TableHead className="min-w-[120px]">Criticidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.detecciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        No se encontraron detecciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.detecciones.map((deteccion) => (
                      <TableRow key={deteccion.numero}>
                        <TableCell>{deteccion.numero}</TableCell>
                        <TableCell>{deteccion.tipoInformacion}</TableCell>
                        <TableCell className="font-mono text-sm">{deteccion.rutaArchivo}</TableCell>
                        <TableCell>{deteccion.filaColumna}</TableCell>
                        <TableCell>{getCriticalityBadge(deteccion.criticidad)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}