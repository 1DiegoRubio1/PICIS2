import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { AuthManagerHumanDashboard } from './components/AuthManagerHumanDashboard';
import { AuthManagerNonHumanDashboard } from "./components/AuthManagerNonHumanDashboard";
import { AuthSupervisorHumanDashboard } from './components/AuthSupervisorHumanDashboard';
import { AuthSupervisorNonHumanDashboard } from './components/AuthSupervisorNonHumanDashboard';
import { AuthResponsibleDashboard } from './components/AuthResponsibleDashboard';
import { OAuthSuccess } from './components/OAuthSuccess';
import { ReauthenticationSuccess } from './components/ReauthenticationSuccess';
import { ReauthenticationFailed } from './components/ReauthenticationFailed';
import { ReAuthModal } from './components/ReAuthModal';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser, sessionExpired } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      console.log("ProtectedRoute - No hay usuario en contexto, verificando backend...");
      setIsChecking(true);
      
      fetch("http://localhost:3001/api/user", { 
        credentials: "include",
        cache: 'no-cache'
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No autorizado');
        })
        .then(data => {
          if (data && data.rol) {
            console.log("ProtectedRoute - Sesión válida encontrada en backend:", data.rol);
          }
        })
        .catch(err => {
          console.log("ProtectedRoute - No hay sesión válida");
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [currentUser]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || sessionExpired) {
    console.log("🔒 ProtectedRoute - Redirigiendo al login");
    return <Navigate to="/" replace />;
  }

  console.log("🔒 ProtectedRoute - Usuario válido, mostrando contenido");
  return children;
}

function AppContent() {
  const { currentUser, sessionExpired } = useApp();
  
  console.log("🎯 AppContent - Estado actual:", {
    tieneUsuario: !!currentUser,
    usuario: currentUser?.correo,
    rol: currentUser?.rol,
    sessionExpired
  });

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/reauthentication-success" element={<ReauthenticationSuccess />} />
        <Route path="/reauthentication-failed" element={<ReauthenticationFailed />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-humanas"
          element={
            <ProtectedRoute>
              <AuthManagerHumanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-nohumanas"
          element={
            <ProtectedRoute>
              <AuthManagerNonHumanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor-humanas"
          element={
            <ProtectedRoute>
              <AuthSupervisorHumanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor-nohumanas"
          element={
            <ProtectedRoute>
              <AuthSupervisorNonHumanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responsable-auth"
          element={
            <ProtectedRoute>
              <AuthResponsibleDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}