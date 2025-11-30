import { useEffect } from 'react';

export function ReauthenticationFailed() {
  useEffect(() => {
    console.log("❌ Página de fallo de re-autenticación cargada");
    
    // Notificar a la ventana padre
    const notifyParent = () => {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ 
            type: 'REAUTH_FAILED', 
            timestamp: Date.now() 
          }, 'http://localhost:5173');
          console.log("📨 Mensaje de fallo enviado a ventana padre");
        }
      } catch (error) {
        console.error("❌ Error notificando a ventana padre:", error);
      }
    };

    notifyParent();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Verificación Fallida</h1>
        <p className="text-gray-600 mb-4">
          La cuenta con la que te autenticaste no coincide con tu sesión actual.
        </p>
        <button 
          onClick={() => window.close()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Cerrar Ventana
        </button>
      </div>
    </div>
  );
}