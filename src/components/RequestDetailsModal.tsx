import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

export function RequestDetailsModal({ open, onOpenChange, request }: RequestDetailsModalProps) {
  if (!request) return null;

  const detalles = request.detalle || request.detalles || null;

  // formateador visual de valores
  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc ml-6 space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-slate-700">
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="border rounded-md p-3 bg-slate-50 mt-1 space-y-1">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b pb-1">
              <span className="font-medium">{k}:</span>
              <span className="text-slate-700">
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-slate-700">{String(value)}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles de la Solicitud
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Detalle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {detalles ? (
                <div className="space-y-4">
                  {Object.entries(detalles).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <p className="font-semibold capitalize mb-1">
                        {key.replace(/([A-Z])/g, " $1")}
                      </p>
                      {renderValue(value)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Esta solicitud no contiene detalles.</p>
              )}

            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
