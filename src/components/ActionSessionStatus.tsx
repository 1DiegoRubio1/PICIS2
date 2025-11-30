import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Shield, Clock, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ActionSessionStatus() {
  const { 
    actionSessionActive, 
    actionSessionTimeLeft, 
    readOnlyMode, 
    reactivateActions,
    actionSessionExpired 
  } = useApp();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (readOnlyMode) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Eye className="h-4 w-4 text-amber-600" />
        <span className="text-amber-700 text-sm">Modo solo lectura</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={reactivateActions}
          className="h-6 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <Shield className="h-3 w-3 mr-1" />
          Re-autenticar
        </Button>
      </div>
    );
  }

  if (actionSessionActive && actionSessionTimeLeft > 0) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-green-700 text-sm">Sesión activa</span>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(actionSessionTimeLeft)}
        </Badge>
      </div>
    );
  }

  if (actionSessionExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <Clock className="h-4 w-4 text-red-600" />
        <span className="text-red-700 text-sm">Sesión expirada</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={reactivateActions}
          className="h-6 text-xs border-red-300 text-red-700 hover:bg-red-100"
        >
          <Shield className="h-3 w-3 mr-1" />
          Re-autenticar
        </Button>
      </div>
    );
  }

  return null;
}