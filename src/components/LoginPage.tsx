import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { FcGoogle } from 'react-icons/fc';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function LoginPage() {
    const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser, setCurrentUser } = useApp(); 
  const navigate = useNavigate();

  // Función para redirigir según el rol del usuario
  const redirectByRole = (rol: string) => {
    switch (rol) {
      case 'Gestor de autenticación de entidades humanas':
        navigate('/dashboard-humanas');
        break;
      case 'Gestor de autenticación de entidades no humanas':
        navigate('/dashboard-nohumanas');
        break;
      case 'Supervisor de entidades humanas':
        navigate('/supervisor-humanas');
        break;
      case 'Supervisor de entidades no humanas':
        navigate('/supervisor-nohumanas');
        break;
      case 'Responsable de autenticación':
        navigate('/responsable-auth');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

    //Redirigir si hay usuario
    useEffect(() => {
    // Solo redirigir si hay usuario en el contexto
    if (currentUser) {
      console.log("👤 LoginPage - Usuario detectado, redirigiendo...");
      redirectByRole(currentUser.rol);
      }
    // NO verificar sesión backend automáticamente
    }, [currentUser]);


  // Login manual (correo y contraseña)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = login(correo, password);
      if (success) {
        toast.success('Inicio de sesión exitoso');
        setTimeout(() => {
          if (currentUser?.rol) redirectByRole(currentUser.rol);
        }, 300);
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error durante login:', error);
      toast.error('Error al iniciar sesión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };


  // Login con Google → redirige al backend (puerto 3001)
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-3xl text-blue-600">PICIS</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales o usa tu cuenta de Google
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@example.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Botón de inicio con Google */}
          <Button type="button"variant="outline" className="w-full flex items-center justify-center gap-2 mt-4"
            onClick={handleGoogleLogin} disabled={isLoading}>
            <FcGoogle className="h-5 w-5" />
              {isLoading ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
          </Button>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg space-y-2 text-sm text-slate-600">
            <p className="font-semibold">Credenciales de prueba:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <p><strong>Supervisor:</strong> supervisor@example.com</p>
              <p><strong>Analista:</strong> analista@example.com</p>
              <p><strong>Responsable:</strong> responsable@example.com</p>
              <p><strong>Gestor Humanas:</strong> gestor-humanas@example.com</p>
              <p><strong>Gestor No Humanas:</strong> gestor-nohumanas@example.com</p>
              <p><strong>Sup. Humanas:</strong> supervisor-humanas@example.com</p>
              <p><strong>Sup. No Humanas:</strong> supervisor-nohumanas@example.com</p>
              <p><strong>Resp. Auth:</strong> responsable-autenticacion@example.com</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">* Cualquier contraseña es válida</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}