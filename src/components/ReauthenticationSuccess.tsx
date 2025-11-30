import { useEffect, useRef } from 'react';

export function ReauthenticationSuccess() {
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (hasNotifiedRef.current) {
      return;
    }

    console.log("✅ Página de éxito de re-autenticación cargada");
    hasNotifiedRef.current = true;
    
    const notifyParent = () => {
      try {
        if (window.opener && !window.opener.closed) {
          // Enviar mensaje SOLO UNA VEZ con ID único
          const messageId = `reauth-success-${Date.now()}`;
          
          window.opener.postMessage({ 
            type: 'REAUTH_SUCCESS', 
            timestamp: Date.now(),
            source: 'reauthentication-success',
            messageId: messageId
          }, 'http://localhost:5173');
          
          console.log("📨 Mensaje de éxito enviado a ventana padre:", messageId);
        } else {
          console.log("❌ Ventana padre no disponible");
        }
      } catch (error) {
        console.error("❌ Error notificando a ventana padre:", error);
      }
    };

    // Notificar una sola vez
    notifyParent();

    // Cerrar después de delay
    const closeTimer = setTimeout(() => {
      console.log("🔒 Cerrando ventana de re-autenticación...");
      if (window.opener && !window.opener.closed) {
        window.close();
      }
    }, 1500);

    return () => {
      clearTimeout(closeTimer);
    };

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-green-800 mb-2">¡Verificación Exitosa!</h1>
        <p className="text-green-600 text-sm mb-4">
          Tu identidad ha sido verificada correctamente.
        </p>
        
        <button 
          onClick={() => window.close()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Cerrar Ventana
        </button>
      </div>
    </div>
  );
}