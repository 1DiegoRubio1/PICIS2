import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  useEffect(() => {
    const userParam = params.get("user");
    console.log("OAuthSuccess - Parámetros recibidos:", userParam);
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log("OAuthSuccess - Usuario parseado:", user);
        
        // Establecer el usuario en el contexto
        setCurrentUser(user);
        
        // Redirigir inmediatamente sin esperar
        console.log("OAuthSuccess - Redirigiendo a dashboard...");
        switch (user.rol) {
          case "Gestor de autenticación de entidades humanas":
            navigate("/dashboard-humanas", { replace: true });
            break;
          case "Gestor de autenticación de entidades no humanas":
            navigate("/dashboard-nohumanas", { replace: true });
            break;
          case "Supervisor de entidades humanas":
            navigate("/supervisor-humanas", { replace: true });
            break;
          case "Supervisor de entidades no humanas":
            navigate("/supervisor-nohumanas", { replace: true });
            break;
          case "Responsable de autenticación":
            navigate("/responsable-auth", { replace: true });
            break;
          default:
            console.warn("Rol no reconocido:", user.rol);
            navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("OAuthSuccess - Error parseando usuario:", error);
        navigate("/", { replace: true });
      }
    } else {
      console.error("OAuthSuccess - No se recibió parámetro 'user'");
      navigate("/", { replace: true });
    }
  }, [params, navigate, setCurrentUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  );
}