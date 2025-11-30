import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Analysis, Comment, Report, ClientGroup, SystemUser, TeamMember, NonHumanEntity, Request } from '../types';
import { toast } from 'sonner';
import { SessionExpiredModal } from '../components/SessionExpiredModal';
import { ActionSessionExpiredModal } from '../components/ActionSessionExpiredModal';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  analyses: Analysis[];
  comments: Comment[];
  reports: Map<string, Report>;
  clientGroups: ClientGroup[];
  systemUsers: SystemUser[];
  teamMembers: TeamMember[];
  nonHumanEntities: NonHumanEntity[];
  requests: Request[];
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  actionSessionExpired: boolean;
  setActionSessionExpired: (expired: boolean) => void;
  actionSessionActive: boolean;
  actionSessionTimeLeft: number;
  readOnlyMode: boolean;
  setReadOnlyMode: (mode: boolean) => void;
  requiresReAuth: (actionType: string) => boolean;
  resetActionSession: () => void;
  createRequestWithAuthCheck: (tipo: any, detalles?: any) => boolean;
  executeActionWithAuthCheck: (actionType: string, action: () => void) => boolean;
  login: (correo: string, password: string) => boolean;
  logout: () => void;
  addAnalysis: (url: string) => void;
  addComment: (analysisId: string, contenido: string) => void;
  editComment: (commentId: string, contenido: string) => void;
  deleteComment: (commentId: string) => void;
  canEditComment: (comment: Comment) => boolean;
  completeAnalysis: (analysisId: string) => void;
  getClientUsers: (clientId: string) => SystemUser[];
  createRequest: (tipo: any, detalles?: any) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  addNonHumanEntity: (entity: Omit<NonHumanEntity, 'id'>) => void;
  updateNonHumanEntity: (id: string, entity: Partial<NonHumanEntity>) => void;
  deleteNonHumanEntity: (id: string) => void;
  startReAuthenticationProcess: () => void;
  reactivateActions: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data - Datos ficticios para prueba de visualización
const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    correo: 'supervisor@example.com',
    rol: 'Supervisor',
    estado: 'Activo',
    nivelAutenticacion: 2,
    grupoId: 'grupo1',
  },
  {
    id: '2',
    nombre: 'María García',
    correo: 'analista@example.com',
    rol: 'Analista',
    estado: 'Activo',
    nivelAutenticacion: 2,
    grupoId: 'grupo1',
  },
  {
    id: '3',
    nombre: 'Carlos López',
    correo: 'responsable@example.com',
    rol: 'Responsable',
    estado: 'Activo',
    nivelAutenticacion: 2,
    grupoId: 'grupo1',
  },
  {
    id: '4',
    nombre: 'Laura Rodríguez',
    correo: 'gestor-humanas@example.com',
    rol: 'Gestor de autenticación de entidades humanas',
    estado: 'Activo',
    nivelAutenticacion: 2,
  },
  {
    id: '5',
    nombre: 'Roberto Sánchez',
    correo: 'gestor-nohumanas@example.com',
    rol: 'Gestor de autenticación de entidades no humanas',
    estado: 'Activo',
    nivelAutenticacion: 2,
  },
  {
    id: '6',
    nombre: 'Patricia Fernández',
    correo: 'supervisor-humanas@example.com',
    rol: 'Supervisor de entidades humanas',
    estado: 'Activo',
    nivelAutenticacion: 2,
  },
  {
    id: '7',
    nombre: 'Miguel Torres',
    correo: 'supervisor-nohumanas@example.com',
    rol: 'Supervisor de entidades no humanas',
    estado: 'Activo',
    nivelAutenticacion: 2,
  },
  {
    id: '8',
    nombre: 'Elena Castro',
    correo: 'responsable-autenticacion@example.com',
    rol: 'Responsable de autenticación',
    estado: 'Activo',
    nivelAutenticacion: 2,
  },
];

const mockClientGroups: ClientGroup[] = [
  { id: 'grupo1', nombre: 'Empresa Tecnológica S.A.', numeroUsuarios: 15 },
  { id: 'grupo2', nombre: 'Consultoría Global', numeroUsuarios: 8 },
  { id: 'grupo3', nombre: 'Innovación Digital', numeroUsuarios: 12 },
];

const mockSystemUsers: SystemUser[] = [
  { id: 's1', nombre: 'Admin Sistema', correo: 'admin@system.com', rol: 'Administrador de sistema', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/admin, roles/owner' },
  { id: 's2', nombre: 'Usuario Sistema 1', correo: 'user1@system.com', rol: 'Analista', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
  { id: 's3', nombre: 'Usuario Sistema 2', correo: 'user2@system.com', rol: 'Supervisor', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/editor' },
  { id: 's4', nombre: 'Laura Rodríguez', correo: 'gestor-humanas@example.com', rol: 'Gestor de autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityAdmin' },
  { id: 's5', nombre: 'Roberto Sánchez', correo: 'gestor-nohumanas@example.com', rol: 'Gestor de autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityAdmin' },
  { id: 's6', nombre: 'Patricia Fernández', correo: 'supervisor-humanas@example.com', rol: 'Supervisor de autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityReviewer' },
];

const mockTeamMembers: TeamMember[] = [
  { id: 't1', nombre: 'Laura Rodríguez', correo: 'gestor-humanas@example.com', rol: 'Gestor de Autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityAdmin' },
  { id: 't2', nombre: 'Roberto Sánchez', correo: 'gestor-nohumanas@example.com', rol: 'Gestor de Autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityAdmin' },
  { id: 't3', nombre: 'Patricia Fernández', correo: 'supervisor-humanas@example.com', rol: 'Supervisor de Autenticación', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/iam.securityReviewer' },
];

const mockClientUsers: Record<string, SystemUser[]> = {
  'grupo1': [
    { id: 'c1-1', nombre: 'Cliente 1 - Usuario 1', correo: 'cliente1user1@example.com', rol: 'Analista', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
    { id: 'c1-2', nombre: 'Cliente 1 - Usuario 2', correo: 'cliente1user2@example.com', rol: 'Supervisor', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/editor' },
    { id: 'c1-3', nombre: 'Cliente 1 - Usuario 3', correo: 'cliente1user3@example.com', rol: 'Responsable', estado: 'Inactivo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
  ],
  'grupo2': [
    { id: 'c2-1', nombre: 'Cliente 2 - Usuario 1', correo: 'cliente2user1@example.com', rol: 'Analista', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
    { id: 'c2-2', nombre: 'Cliente 2 - Usuario 2', correo: 'cliente2user2@example.com', rol: 'Responsable', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
  ],
  'grupo3': [
    { id: 'c3-1', nombre: 'Cliente 3 - Usuario 1', correo: 'cliente3user1@example.com', rol: 'Supervisor', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/editor' },
    { id: 'c3-2', nombre: 'Cliente 3 - Usuario 2', correo: 'cliente3user2@example.com', rol: 'Analista', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
    { id: 'c3-3', nombre: 'Cliente 3 - Usuario 3', correo: 'cliente3user3@example.com', rol: 'Responsable', estado: 'Activo', nivelAutenticacion: 2, politicasIAM: 'roles/viewer' },
  ],
};

const mockNonHumanEntities: NonHumanEntity[] = [
  { id: 'nh1', nombre: 'Servidor API Principal', nivelCriticidad: 'Critico', cuentaServicioGCP: 'api-service@project.iam.gserviceaccount.com', politicasIAM: 'roles/editor, roles/storage.admin' },
  { id: 'nh2', nombre: 'Bot de Procesamiento', nivelCriticidad: 'Basico', cuentaServicioGCP: 'bot-processor@project.iam.gserviceaccount.com', politicasIAM: 'roles/viewer' },
  { id: 'nh3', nombre: 'Servicio de Backup', nivelCriticidad: 'Critico', cuentaServicioGCP: 'backup-service@project.iam.gserviceaccount.com', politicasIAM: 'roles/storage.objectAdmin' },
  { id: 'nh4', nombre: 'Microservicio Analytics', nivelCriticidad: 'Basico', cuentaServicioGCP: 'analytics@project.iam.gserviceaccount.com', politicasIAM: 'roles/bigquery.dataViewer' },
];

const mockRequests: Request[] = [
  {
    id: 'req1',
    gestorNombre: 'Laura Rodríguez',
    gestorId: '4',
    tipo: 'agregar cliente',
    fecha: new Date('2025-11-09T10:30:00'),
    hora: '10:30',
    seguimiento: 'En proceso de aprobación del supervisor',
    detalles: { 
      nombreCliente: 'Nueva Empresa Tech', 
      cuentas: [
        {
          id: 'NET-001',
          nombre: 'Juan Pérez Tech',
          correo: 'juan@nuevatech.com',
          rol: 'Supervisor',
          nivelAutenticacion: 3
        },
        {
          id: 'NET-002',
          nombre: 'María González Tech',
          correo: 'maria@nuevatech.com',
          rol: 'Analista',
          nivelAutenticacion: 2
        }
      ]
    },
    supervisoresAprobados: [],
    supervisoresRechazados: [],
    responsablesAprobados: [],
    responsablesRechazados: [],
  },
  {
    id: 'req2',
    gestorNombre: 'Laura Rodríguez',
    gestorId: '4',
    tipo: 'agregar entidad al sistema',
    fecha: new Date('2025-11-08T14:20:00'),
    hora: '14:20',
    seguimiento: 'Aprobado',
    detalles: { 
      id: 'SYS-003',
      nombre: 'Usuario Nuevo',
      correo: 'nuevo@example.com',
      rol: 'Analista de seguridad',
      nivelAutenticacion: 2
    },
    supervisoresAprobados: ['5'],
    supervisoresRechazados: [],
    responsablesAprobados: ['6'],
    responsablesRechazados: [],
  },
  {
    id: 'req3',
    gestorNombre: 'Carlos Mendoza',
    gestorId: '5',
    tipo: 'agregar entidad no humana',
    fecha: new Date('2025-11-09T09:15:00'),
    hora: '09:15',
    seguimiento: 'En proceso de aprobación del supervisor',
    detalles: { 
      nombre: 'Servicio de Notificaciones',
      nivelCriticidad: 'Basico',
      cuentaServicioGCP: 'notifications@project.iam.gserviceaccount.com',
      politicasIAM: 'roles/pubsub.publisher'
    },
    supervisoresAprobados: [],
    supervisoresRechazados: [],
    responsablesAprobados: [],
    responsablesRechazados: [],
  },
  {
    id: 'req4',
    gestorNombre: 'Carlos Mendoza',
    gestorId: '5',
    tipo: 'editar entidad no humana',
    fecha: new Date('2025-11-08T16:45:00'),
    hora: '16:45',
    seguimiento: 'En proceso de aprobación por el responsable',
    detalles: { 
      id: 'nh1',
      nombre: 'Servidor API Principal Actualizado',
      nivelCriticidad: 'Critico',
      cuentaServicioGCP: 'api-service-v2@project.iam.gserviceaccount.com',
      politicasIAM: 'roles/editor, roles/storage.admin, roles/bigquery.admin'
    },
    supervisoresAprobados: ['7'],
    supervisoresRechazados: [],
    responsablesAprobados: [],
    responsablesRechazados: [],
  },
];

const mockAnalyses: Analysis[] = [
  {
    id: '1',
    url: 'https://example.com',
    estado: 'Completado',
    fechaCreacion: new Date('2025-11-07T10:00:00'),
    comentariosCount: 2,
    grupoId: 'grupo1',
  },
  {
    id: '2',
    url: 'https://test-website.com',
    estado: 'En proceso',
    fechaCreacion: new Date('2025-11-08T09:30:00'),
    comentariosCount: 0,
    grupoId: 'grupo1',
  },
  {
    id: '3',
    url: 'https://secure-site.com',
    estado: 'Completado',
    fechaCreacion: new Date('2025-11-06T14:00:00'),
    comentariosCount: 1,
    grupoId: 'grupo2',
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    analysisId: '1',
    userId: '1',
    userName: 'Juan Pérez',
    contenido: 'Se encontraron múltiples detecciones críticas.',
    fechaCreacion: new Date('2025-11-07T11:00:00'),
  },
  {
    id: '2',
    analysisId: '1',
    userId: '2',
    userName: 'María García',
    contenido: 'Revisado. Requiere atención inmediata.',
    fechaCreacion: new Date('2025-11-07T12:00:00'),
  },
];

const mockReports = new Map<string, Report>([
  [
    '1',
    {
      analysisId: '1',
      url: 'https://example.com',
      totalDetecciones: 15,
      nivelCriticidad: 'critico',
      detecciones: [
        {
          numero: 1,
          tipoInformacion: 'Número de Seguro Social',
          rutaArchivo: '/data/users.json',
          filaColumna: 'Fila 45, Columna 12',
          criticidad: 'critica',
        },
        {
          numero: 2,
          tipoInformacion: 'Número de Tarjeta de Crédito',
          rutaArchivo: '/payment/transactions.csv',
          filaColumna: 'Fila 120, Columna 8',
          criticidad: 'critica',
        },
        {
          numero: 3,
          tipoInformacion: 'Dirección Personal',
          rutaArchivo: '/data/profiles.json',
          filaColumna: 'Fila 78, Columna 15',
          criticidad: 'media',
        },
        {
          numero: 4,
          tipoInformacion: 'Número Telefónico',
          rutaArchivo: '/contacts/list.txt',
          filaColumna: 'Fila 234, Columna 3',
          criticidad: 'baja',
        },
        {
          numero: 5,
          tipoInformacion: 'RFC',
          rutaArchivo: '/fiscal/datos.xml',
          filaColumna: 'Fila 56, Columna 20',
          criticidad: 'critica',
        },
        {
          numero: 6,
          tipoInformacion: 'CURP',
          rutaArchivo: '/personal/info.db',
          filaColumna: 'Fila 89, Columna 7',
          criticidad: 'critica',
        },
        {
          numero: 7,
          tipoInformacion: 'Correo Electrónico',
          rutaArchivo: '/mailing/subscribers.csv',
          filaColumna: 'Fila 345, Columna 2',
          criticidad: 'baja',
        },
        {
          numero: 8,
          tipoInformacion: 'Contraseña (Hash)',
          rutaArchivo: '/auth/credentials.json',
          filaColumna: 'Fila 12, Columna 25',
          criticidad: 'critica',
        },
        {
          numero: 9,
          tipoInformacion: 'Fecha de Nacimiento',
          rutaArchivo: '/data/users.json',
          filaColumna: 'Fila 45, Columna 18',
          criticidad: 'media',
        },
        {
          numero: 10,
          tipoInformacion: 'Número de Cuenta Bancaria',
          rutaArchivo: '/banking/accounts.json',
          filaColumna: 'Fila 67, Columna 10',
          criticidad: 'critica',
        },
        {
          numero: 11,
          tipoInformacion: 'IP Privada',
          rutaArchivo: '/logs/access.log',
          filaColumna: 'Fila 1234, Columna 5',
          criticidad: 'media',
        },
        {
          numero: 12,
          tipoInformacion: 'Token de Sesión',
          rutaArchivo: '/cache/sessions.txt',
          filaColumna: 'Fila 890, Columna 15',
          criticidad: 'critica',
        },
        {
          numero: 13,
          tipoInformacion: 'Número de Identificación',
          rutaArchivo: '/records/ids.csv',
          filaColumna: 'Fila 456, Columna 4',
          criticidad: 'critica',
        },
        {
          numero: 14,
          tipoInformacion: 'Código Postal',
          rutaArchivo: '/locations/addresses.json',
          filaColumna: 'Fila 123, Columna 22',
          criticidad: 'baja',
        },
        {
          numero: 15,
          tipoInformacion: 'Nombre Completo',
          rutaArchivo: '/data/users.json',
          filaColumna: 'Fila 45, Columna 5',
          criticidad: 'media',
        },
      ],
    },
  ],
]);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [reports, setReports] = useState<Map<string, Report>>(mockReports);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>(mockClientGroups);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(mockSystemUsers);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [nonHumanEntities, setNonHumanEntities] = useState<NonHumanEntity[]>(mockNonHumanEntities);
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [clientUsers, setClientUsers] = useState<Record<string, SystemUser[]>>(mockClientUsers);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [actionSessionExpired, setActionSessionExpired] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  
  const timeoutsRef = React.useRef<Set<NodeJS.Timeout>>(new Set());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionSessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionSessionWarningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionSessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para controlar si la sesión de acciones está activa
  const [actionSessionActive, setActionSessionActive] = useState(false);
  const [actionSessionTimeLeft, setActionSessionTimeLeft] = useState<number>(0);

  const startReAuthenticationProcess = () => {
  // Abre el modal de sesión de acciones expirada
  console.log('🔄 AppContext: Iniciando proceso de re-autenticación');
  setActionSessionExpired(true);
};

  //Inactividad del usuario
    // Determinar timeout según el tipo de usuario
    const getSessionTimeout = (user: User | null) => {
    if (!user) return 10 * 60 * 1000; // 10 minutos por defecto
    
    // Cuentas de cliente (Responsable, Supervisor, Analista con grupoId)
    const clientRoles = ['Responsable', 'Supervisor', 'Analista'];
    if (user.grupoId && clientRoles.includes(user.rol)) {
      return 15 * 60 * 1000; // 15 minutos
    }
    
    // Cuentas del sistema/equipo
    return 10 * 60 * 1000; // 10 minutos
  };

 // SESIÓN DE ACCIONES - 20 minutos para todos los usuarios
  const ACTION_SESSION_DURATION = 20 * 60 * 1000; // 20 minutos
  const ACTION_WARNING_TIME = 1 * 60 * 1000; // 3 minutos para advertencia

  // Iniciar sesión de acciones (se llama al hacer login o re-autenticación)
  const startActionSession = () => {
    console.log('🔐 Iniciando sesión de acciones - 20 minutos');
    
    // Limpiar timers anteriores
    if (actionSessionTimerRef.current) {
      clearTimeout(actionSessionTimerRef.current);
    }
    if (actionSessionWarningTimerRef.current) {
      clearTimeout(actionSessionWarningTimerRef.current);
    }
    if (actionSessionIntervalRef.current) {
      clearInterval(actionSessionIntervalRef.current);
    }

    setActionSessionActive(true);
    setActionSessionExpired(false);
    setReadOnlyMode(false); // Desactivar modo lectura al iniciar sesión
    setActionSessionTimeLeft(ACTION_SESSION_DURATION);

    // Timer para advertencia (3 minutos antes)
    actionSessionWarningTimerRef.current = setTimeout(() => {
      toast.warning('La sesión de acciones expirará en 3 minutos', {
        duration: 180000, // 3 minutos
      });
    }, ACTION_SESSION_DURATION - ACTION_WARNING_TIME);

    // Timer para expiración completa de acciones
    actionSessionTimerRef.current = setTimeout(() => {
      handleActionSessionExpiry();
    }, ACTION_SESSION_DURATION);

    // Actualizar el tiempo restante cada minuto
    actionSessionIntervalRef.current = setInterval(() => {
      setActionSessionTimeLeft(prev => {
        const newTime = prev - 60000;
        if (newTime <= 0) {
          clearInterval(actionSessionIntervalRef.current!);
          return 0;
        }
        return newTime;
      });
    }, 60000);
  };

  // Manejar expiración de sesión de acciones
  const handleActionSessionExpiry = () => {
    console.log('⏰ Sesión de acciones expirada');
    setActionSessionExpired(true);
    setActionSessionActive(false);
    setActionSessionTimeLeft(0);
    
    if (actionSessionIntervalRef.current) {
      clearInterval(actionSessionIntervalRef.current);
    }
    
    toast.error('La sesión de acciones ha expirado. Debes re-autenticarte para realizar acciones.', {
      duration: 5000,
    });
  };

  // Verificar si se requiere re-autenticación para una acción
  const requiresReAuth = (actionType: string): boolean => {
  // Si está en modo lectura, bloquear todas las acciones
  if (readOnlyMode) {
    console.log('🔐 Acción bloqueada - modo lectura activo:', actionType);
    return true;
  }

  // Las acciones de solo lectura no requieren re-autenticación
  const readOnlyActions = [
    'view',
    'details', 
    'viewDetails',
    'get',
    'list',
    'search'
  ];

  const isReadOnly = readOnlyActions.some(readAction => 
    actionType.toLowerCase().includes(readAction.toLowerCase())
  );

  if (isReadOnly) {
    return false;
  }

  // SOLO requerir re-autenticación si la sesión de acciones está EXPIRADA
  if (actionSessionExpired) {
    console.log('🔐 Acción requiere re-autenticación porque la sesión expiró:', actionType);
    return true;
  }

  // Si la sesión está activa, NO requerir re-autenticación
  console.log('✅ Sesión activa, acción permitida sin re-autenticación:', actionType);
  return false;
};

  // Reiniciar sesión de acciones (se llama después de re-autenticación exitosa)
  const resetActionSession = () => {
    console.log('🔄 Reiniciando sesión de acciones');
    startActionSession();
  };

  // Función para reactivar acciones desde botones deshabilitados
  const reactivateActions = () => {
    console.log('🔄 Reactivando acciones - iniciando re-autenticación');
    setActionSessionExpired(true);
  };
  
    // Reiniciar timer de inactividad (PARA LA SESIÓN PRINCIPAL)
  const resetInactivityTimer = () => {
    // Limpiar timers anteriores
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (!currentUser) return;

    const timeout = getSessionTimeout(currentUser);
    const warningTime = 3 * 60 * 1000; // 3 minutos para advertencia

    // Timer para advertencia (3 minutos antes)
    warningTimerRef.current = setTimeout(() => {
      toast.warning('La sesión expirará en 3 minutos', {
        duration: 180000, // 3 minutos
      });
    }, timeout - warningTime);

    // Timer para expiración completa
    inactivityTimerRef.current = setTimeout(() => {
      handleSessionExpiry();
    }, timeout);
  };


   // Manejar expiración de sesión principal
  const handleSessionExpiry = () => {
    console.log('Sesión expirada por inactividad');
    setSessionExpired(true);
    
    // Cerrar sesión después de mostrar el modal
    setTimeout(() => {
      logout();
      setSessionExpired(false);
    }, 3000); // 3 segundos para mostrar el modal
  };

  // Detectar actividad del usuario
  useEffect(() => {
    if (!currentUser) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Iniciar timers
    resetInactivityTimer();
    startActionSession();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (actionSessionTimerRef.current) {
        clearTimeout(actionSessionTimerRef.current);
      }
      if (actionSessionWarningTimerRef.current) {
        clearTimeout(actionSessionWarningTimerRef.current);
      }
      if (actionSessionIntervalRef.current) {
        clearInterval(actionSessionIntervalRef.current);
      }
    };
  }, [currentUser]);


 // Limpiar todos los timeouts cuando se desmonte el componente
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (actionSessionTimerRef.current) {
        clearTimeout(actionSessionTimerRef.current);
      }
      if (actionSessionWarningTimerRef.current) {
        clearTimeout(actionSessionWarningTimerRef.current);
      }
      if (actionSessionIntervalRef.current) {
        clearInterval(actionSessionIntervalRef.current);
      }
    };
  }, []);


   // Actualizar el número de usuarios de cada cliente cuando cambie clientUsers
  useEffect(() => {
    setClientGroups(prev => prev.map(client => ({
      ...client,
      numeroUsuarios: clientUsers[client.id]?.length || 0,
    })));
  }, [clientUsers]);

  //Iniciar sesión
  const login = (correo: string, password: string): boolean => {
    const user = users.find((u) => u.correo === correo);
    if (user) {
      setCurrentUser(user);
      // Iniciar sesión de acciones inmediatamente al hacer login
      startActionSession();
      return true;
    }
    return false;
  };


  //Cerrar sesión
  const logout = () => {
    console.log("Cerrando sesión...");
    
    // Limpiar todos los timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (actionSessionTimerRef.current) {
      clearTimeout(actionSessionTimerRef.current);
    }
    if (actionSessionWarningTimerRef.current) {
      clearTimeout(actionSessionWarningTimerRef.current);
    }
    if (actionSessionIntervalRef.current) {
      clearInterval(actionSessionIntervalRef.current);
    }
    
    // Limpiar estados
    setCurrentUser(null);
    setSessionExpired(false);
    setActionSessionExpired(false);
    setActionSessionActive(false);
    setActionSessionTimeLeft(0);
    setReadOnlyMode(false);
    
    // Forzar una navegación al login para limpiar el historial
    window.history.replaceState(null, '', '/');
    
    // Hacer logout en el backend
    fetch('http://localhost:3001/logout', { 
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache'
    })
    .then(() => {
      console.log('Sesión cerrada en backend');
      
      // Limpiar cualquier cache del navegador
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Forzar recarga completa para limpiar estado
      window.location.href = '/';
    })
    .catch(err => {
      console.error('Error al cerrar sesión en backend:', err);
      // Aún así redirigir al login
      window.location.href = '/';
    });
  };

  // Función wrapper para crear requests que verifica la sesión de acciones
  const createRequestWithAuthCheck = (tipo: any, detalles?: any) => {
  if (requiresReAuth(tipo)) {
    console.log('🔐 Acción bloqueada - sesión expirada:', tipo);
    return false; // NO crear la solicitud
  }
  
  // Solo crear la solicitud si NO requiere re-autenticación
  createRequest(tipo, detalles);
  return true;
};

  // Función wrapper para acciones que requieren autenticación
  const executeActionWithAuthCheck = (actionType: string, action: () => void) => {
    if (requiresReAuth(actionType)) {
      toast.error('Debes re-autenticarte para realizar esta acción');
      return false;
    }
    
    action();
    return true;
  };

  const addAnalysis = (url: string) => {
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      url,
      estado: 'En proceso',
      fechaCreacion: new Date(),
      comentariosCount: 0,
      grupoId: currentUser?.grupoId, // Asignar el grupo del usuario actual
    };
    setAnalyses((prev) => [newAnalysis, ...prev]);

    // Simular completado después de 10 segundos
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      completeAnalysis(newAnalysis.id, url);
    }, 10000);
    
    timeoutsRef.current.add(timeout);
  };

  const completeAnalysis = (analysisId: string, url?: string) => {
    // Actualizar el estado del análisis a Completado
    let analysisUrl = url;
    
    setAnalyses((prev) => {
      const updated = prev.map((a) => {
        if (a.id === analysisId) {
          analysisUrl = a.url; // Capturar la URL del análisis
          return { ...a, estado: 'Completado' as const };
        }
        return a;
      });
      return updated;
    });

    // Generar reporte mock
    setReports((prevReports) => {
      // Verificar si ya existe un reporte para este análisis
      if (prevReports.has(analysisId)) {
        return prevReports;
      }

      // Generar nivel de criticidad aleatorio primero
      const randomLevel = Math.random();
      let nivelCriticidad: 'seguro' | 'advertencia' | 'critico';
      let totalDetecciones: number;
      
      if (randomLevel < 0.33) {
        // Verde - Sin detecciones o muy pocas detecciones no críticas
        nivelCriticidad = 'seguro';
        totalDetecciones = Math.floor(Math.random() * 3); // 0-2 detecciones
      } else if (randomLevel < 0.66) {
        // Amarillo - Hallazgos no críticos
        nivelCriticidad = 'advertencia';
        totalDetecciones = Math.floor(Math.random() * 8) + 3; // 3-10 detecciones
      } else {
        // Rojo - Crítico
        nivelCriticidad = 'critico';
        totalDetecciones = Math.floor(Math.random() * 15) + 5; // 5-19 detecciones
      }

      const detecciones: any[] = [];

      const tiposInformacion = [
        'Correo Electrónico',
        'Número Telefónico',
        'RFC',
        'CURP',
        'Tarjeta de Crédito',
        'Número de Seguro Social',
        'Dirección Personal',
        'Fecha de Nacimiento',
        'Número de Cuenta Bancaria',
        'Contraseña (Hash)',
        'Token de Sesión',
        'IP Privada',
        'Número de Identificación',
        'Código Postal',
        'Nombre Completo'
      ];

      const archivos = [
        '/data/users.json',
        '/payment/transactions.csv',
        '/data/profiles.json',
        '/contacts/list.txt',
        '/fiscal/datos.xml',
        '/personal/info.db',
        '/mailing/subscribers.csv',
        '/auth/credentials.json',
        '/banking/accounts.json',
        '/logs/access.log',
        '/cache/sessions.txt',
        '/records/ids.csv',
        '/locations/addresses.json'
      ];

      // Generar detecciones basadas en el nivel de criticidad
      for (let i = 0; i < totalDetecciones; i++) {
        let criticidad: 'baja' | 'media' | 'critica';
        
        if (nivelCriticidad === 'seguro') {
          // Solo baja criticidad
          criticidad = 'baja';
        } else if (nivelCriticidad === 'advertencia') {
          // Mezcla de baja y media, sin crítica
          criticidad = Math.random() < 0.5 ? 'baja' : 'media';
        } else {
          // Crítico - incluye crítica y algunas medias
          const rand = Math.random();
          if (rand < 0.5) {
            criticidad = 'critica';
          } else if (rand < 0.8) {
            criticidad = 'media';
          } else {
            criticidad = 'baja';
          }
        }
        
        detecciones.push({
          numero: i + 1,
          tipoInformacion: tiposInformacion[Math.floor(Math.random() * tiposInformacion.length)],
          rutaArchivo: archivos[Math.floor(Math.random() * archivos.length)],
          filaColumna: `Fila ${Math.floor(Math.random() * 1000) + 1}, Columna ${Math.floor(Math.random() * 50) + 1}`,
          criticidad,
        });
      }

      const mockReport: Report = {
        analysisId,
        url: analysisUrl || '',
        totalDetecciones,
        nivelCriticidad,
        detecciones,
      };

      const newReports = new Map(prevReports);
      newReports.set(analysisId, mockReport);
      return newReports;
    });
  };

  const addComment = (analysisId: string, contenido: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      analysisId,
      userId: currentUser.id,
      userName: currentUser.nombre,
      contenido,
      fechaCreacion: new Date(),
    };

    setComments((prev) => [...prev, newComment]);
    setAnalyses((prev) =>
      prev.map((a) =>
        a.id === analysisId
          ? { ...a, comentariosCount: a.comentariosCount + 1 }
          : a
      )
    );
  };

  const editComment = (commentId: string, contenido: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, contenido, fechaEdicion: new Date() }
          : c
      )
    );
  };

  const deleteComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === comment.analysisId
            ? { ...a, comentariosCount: Math.max(0, a.comentariosCount - 1) }
            : a
        )
      );
    }
  };

  const canEditComment = (comment: Comment): boolean => {
    if (!currentUser) return false;

    // El supervisor puede editar sus propios comentarios siempre
    if (currentUser.rol === 'Supervisor' && comment.userId === currentUser.id) {
      return true;
    }

    // Otros usuarios pueden editar en 3 minutos
    if (comment.userId === currentUser.id) {
      const now = new Date();
      const commentTime = new Date(comment.fechaCreacion);
      const diffMinutes = (now.getTime() - commentTime.getTime()) / (1000 * 60);
      return diffMinutes < 3;
    }

    return false;
  };

  const getClientUsers = (clientId: string): SystemUser[] => {
    return clientUsers[clientId] || [];
  };

  const createRequest = (tipo: any, detalles?: any) => {
  if (!currentUser) return;

  const now = new Date();
  // Generar ID único usando timestamp y random
  const uniqueId = `req${now.getTime()}${Math.random().toString(36).substr(2, 9)}`;
  
  const newRequest: Request = {
    id: uniqueId, // Usar ID único
    gestorNombre: currentUser.nombre,
    gestorId: currentUser.id,
    tipo,
    fecha: now,
    hora: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
    seguimiento: 'En proceso de aprobación del supervisor',
    detalles,
    supervisoresAprobados: [],
    supervisoresRechazados: [],
    responsablesAprobados: [],
    responsablesRechazados: [],
  };

  setRequests(prev => [newRequest, ...prev]);
};

  const executeRequestAction = (request: Request) => {
    // Ejecutar la acción según el tipo de solicitud
    switch (request.tipo) {
      case 'agregar cliente':
        if (request.detalles) {
          const newClientId = `client${Date.now()}`;
          
          // Agregar las cuentas asociadas al cliente primero
          if (request.detalles.cuentas && request.detalles.cuentas.length > 0) {
            const newClientUsersList: SystemUser[] = request.detalles.cuentas.map((cuenta: any) => ({
              id: cuenta.id,
              nombre: cuenta.nombre,
              correo: cuenta.correo,
              rol: cuenta.rol,
              estado: 'Inactivo',
              nivelAutenticacion: cuenta.nivelAutenticacion,
              politicasIAM: cuenta.politicasIAM || '',
            }));
            
            setClientUsers(prev => ({
              ...prev,
              [newClientId]: newClientUsersList,
            }));
          }
          
          // Luego agregar el cliente (el useEffect actualizará el contador)
          const newClient: ClientGroup = {
            id: newClientId,
            nombre: request.detalles.nombreCliente,
            numeroUsuarios: request.detalles.cuentas?.length || 0,
          };
          setClientGroups(prev => [...prev, newClient]);
        }
        break;

      case 'agregar entidad no humana':
        if (request.detalles) {
          addNonHumanEntity(request.detalles);
        }
        break;

      case 'editar entidad no humana':
        if (request.detalles?.id) {
          updateNonHumanEntity(request.detalles.id, request.detalles);
        }
        break;

      case 'eliminar entidad no humana':
        if (request.detalles?.id) {
          deleteNonHumanEntity(request.detalles.id);
        }
        break;

      case 'agregar entidad al sistema':
        if (request.detalles) {
          const newSystemUser: SystemUser = {
            id: request.detalles.id,
            nombre: request.detalles.nombre,
            correo: request.detalles.correo,
            rol: request.detalles.rol,
            estado: 'Inactivo',
            nivelAutenticacion: request.detalles.nivelAutenticacion,
            politicasIAM: request.detalles.politicasIAM || '',
          };
          setSystemUsers(prev => [...prev, newSystemUser]);
          // SOLO si es un rol de autenticación, agregar también al equipo
          const authRoles = [
            'Gestor de autenticación de entidades humanas',
            'Gestor de autenticación de entidades no humanas', 
            'Supervisor de entidades humanas',
            'Supervisor de entidades no humanas',
            'Responsable de autenticación',
            'Gestor de Autenticación',
           'Supervisor de Autenticación',
           'Responsable de Autenticación'
           ];
        
          if (authRoles.includes(request.detalles.rol)) {
            const newTeamMember: TeamMember = {
              id: request.detalles.id,
              nombre: request.detalles.nombre,
              correo: request.detalles.correo,
              rol: request.detalles.rol,
              estado: 'Activo',
              nivelAutenticacion: request.detalles.nivelAutenticacion,
              politicasIAM: request.detalles.politicasIAM || '',
           };
           setTeamMembers(prev => [...prev, newTeamMember]);
          }
        }
        break;
        
      case 'agregar entidad al equipo':
        if (request.detalles) {
          const newTeamMember: TeamMember = {
            id: request.detalles.id,
            nombre: request.detalles.nombre,
            correo: request.detalles.correo,
            rol: request.detalles.rol,
            estado: 'Activo',
            nivelAutenticacion: request.detalles.nivelAutenticacion,
            politicasIAM: request.detalles.politicasIAM || '',
          };
          setTeamMembers(prev => [...prev, newTeamMember]);
          
          // NO agregar automáticamente a systemUsers desde agregar equipo
          // Solo agregar si específicamente se solicita agregar al sistema
        }
        break;

      case 'agregar usuario del cliente':
        if (request.detalles?.clientId) {
          const newClientUser: SystemUser = {
            id: `CLNT-${Date.now()}`,
            nombre: request.detalles.nombre,
            correo: request.detalles.correo,
            rol: request.detalles.rol,
            estado: 'Activo',
            nivelAutenticacion: request.detalles.nivelAutenticacion || 2,
            politicasIAM: request.detalles.politicasIAM || '',
          };
          
          // Agregar el usuario al cliente
          setClientUsers(prev => ({
            ...prev,
            [request.detalles.clientId]: [...(prev[request.detalles.clientId] || []), newClientUser],
          }));
          
          // Actualizar el contador de usuarios del cliente
          setClientGroups(prev => prev.map(client =>
            client.id === request.detalles.clientId
              ? { ...client, numeroUsuarios: client.numeroUsuarios + 1 }
              : client
          ));
        }
        break;

      case 'editar usuario del cliente':
        if (request.detalles?.userId && request.detalles?.clientId && request.detalles?.updatedData) {
          setClientUsers(prev => ({
            ...prev,
            [request.detalles.clientId]: prev[request.detalles.clientId].map(user =>
              user.id === request.detalles.userId
                ? { ...user, ...request.detalles.updatedData }
                : user
            ),
          }));
        }
        break;

      case 'editar entidad del sistema':
        if (request.detalles?.userId && request.detalles?.updatedData) {
        setSystemUsers(prev => prev.map(user =>
          user.id === request.detalles.userId
            ? { ...user, ...request.detalles.updatedData }
            : user
        ));
        
        // Actualizar en teamMembers SOLO si existe y es un rol de autenticación
        const authRoles = [
          'Gestor de autenticación de entidades humanas',
          'Gestor de autenticación de entidades no humanas', 
          'Supervisor de entidades humanas',
          'Supervisor de entidades no humanas',
          'Responsable de autenticación',
          'Gestor de Autenticación',
          'Supervisor de Autenticación',
          'Responsable de Autenticación'
        ];
        
        setTeamMembers(prev => prev.map(member => {
          if (member.id === request.detalles.userId && 
              authRoles.includes(request.detalles.updatedData.rol || member.rol)) {
            return { ...member, ...request.detalles.updatedData };
          }
          return member;
        }));
      }
        break;

      case 'editar entidad del equipo':
         if (request.detalles?.userId && request.detalles?.updatedData) {
        setTeamMembers(prev => prev.map(user =>
          user.id === request.detalles.userId
            ? { ...user, ...request.detalles.updatedData }
            : user
        ));
        
        // NO actualizar automáticamente en systemUsers desde editar equipo
      }
        break;
      default:
        break;
    }
  };

  const approveRequest = (requestId: string) => {
    if (!currentUser) return;

    // Verificar permisos según el tipo de solicitud
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    // Supervisor de humanas solo puede aprobar solicitudes humanas
    if (currentUser.rol === 'Supervisor de entidades humanas') {
      const humanRequests = [
        'agregar cliente', 'eliminar cliente', 'agregar usuario del cliente', 
        'editar usuario del cliente', 'eliminar usuario del cliente',
        'agregar entidad al sistema', 'editar entidad del sistema', 'eliminar entidad del sistema',
        'agregar entidad al equipo', 'editar entidad del equipo', 'eliminar entidad del equipo'
      ];
      if (!humanRequests.includes(request.tipo)) {
        toast.error('No tienes permisos para aprobar este tipo de solicitud');
        return;
      }
    }

    // Supervisor de no humanas solo puede aprobar solicitudes no humanas
    if (currentUser.rol === 'Supervisor de entidades no humanas') {
      const nonHumanRequests = [
        'agregar entidad no humana', 'editar entidad no humana', 'eliminar entidad no humana'
      ];
      if (!nonHumanRequests.includes(request.tipo)) {
        toast.error('No tienes permisos para aprobar este tipo de solicitud');
        return;
      }
    }

    // Obtener supervisores ESPECÍFICOS según el tipo de solicitud
    let supervisoresRequeridos = [];
    const responsables = mockUsers.filter(u => u.rol === 'Responsable de autenticación');

    // Determinar qué supervisores deben aprobar según el tipo de solicitud
    const humanRequests = [
      'agregar cliente', 'eliminar cliente', 'agregar usuario del cliente', 
      'editar usuario del cliente', 'eliminar usuario del cliente',
      'agregar entidad al sistema', 'editar entidad del sistema', 'eliminar entidad del sistema',
      'agregar entidad al equipo', 'editar entidad del equipo', 'eliminar entidad del equipo'
    ];

    const nonHumanRequests = [
      'agregar entidad no humana', 'editar entidad no humana', 'eliminar entidad no humana'
    ];

    if (humanRequests.includes(request.tipo)) {
      // Solo supervisores de entidades humanas
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades humanas'
      );
    } else if (nonHumanRequests.includes(request.tipo)) {
      // Solo supervisores de entidades no humanas
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades no humanas'
      );
    } else {
      // Para otros tipos (por si acaso)
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades humanas' ||
        u.rol === 'Supervisor de entidades no humanas'
      );
    }

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // Si está en proceso de aprobación del supervisor
        if (req.seguimiento === 'En proceso de aprobación del supervisor') {
          const newSupAprobados = [...req.supervisoresAprobados, currentUser.id];
          
          // Verificar si todos los supervisores REQUERIDOS han aprobado
          if (newSupAprobados.length >= supervisoresRequeridos.length) {
            return { 
              ...req, 
              supervisoresAprobados: newSupAprobados,
              seguimiento: 'En proceso de aprobación por el responsable' 
            };
          }
          
          return { ...req, supervisoresAprobados: newSupAprobados };
        }
        
        // Si está en proceso de aprobación del responsable
        if (req.seguimiento === 'En proceso de aprobación por el responsable') {
          const newRespAprobados = [...req.responsablesAprobados, currentUser.id];
          
          // Verificar si todos los responsables han aprobado
          if (newRespAprobados.length >= responsables.length) {
            executeRequestAction(req);
            return { 
              ...req, 
              responsablesAprobados: newRespAprobados,
              seguimiento: 'Aprobado' 
            };
          }
          
          return { ...req, responsablesAprobados: newRespAprobados };
        }
      }
      return req;
    }));
  };

  const rejectRequest = (requestId: string) => {
    if (!currentUser) return;

    // Verificar permisos según el tipo de solicitud
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    // Supervisor de humanas solo puede rechazar solicitudes humanas
    if (currentUser.rol === 'Supervisor de entidades humanas') {
      const humanRequests = [
        'agregar cliente', 'eliminar cliente', 'agregar usuario del cliente', 
        'editar usuario del cliente', 'eliminar usuario del cliente',
        'agregar entidad al sistema', 'editar entidad del sistema', 'eliminar entidad del sistema',
        'agregar entidad al equipo', 'editar entidad del equipo', 'eliminar entidad del equipo'
      ];
      if (!humanRequests.includes(request.tipo)) {
        toast.error('No tienes permisos para rechazar este tipo de solicitud');
        return;
      }
    }

    // Supervisor de no humanas solo puede rechazar solicitudes no humanas
    if (currentUser.rol === 'Supervisor de entidades no humanas') {
      const nonHumanRequests = [
        'agregar entidad no humana', 'editar entidad no humana', 'eliminar entidad no humana'
      ];
      if (!nonHumanRequests.includes(request.tipo)) {
        toast.error('No tienes permisos para rechazar este tipo de solicitud');
        return;
      }
    }

    // Obtener supervisores ESPECÍFICOS según el tipo de solicitud
    let supervisoresRequeridos = [];
    const responsables = mockUsers.filter(u => u.rol === 'Responsable de autenticación');

    // Determinar qué supervisores deben rechazar según el tipo de solicitud
    const humanRequests = [
      'agregar cliente', 'eliminar cliente', 'agregar usuario del cliente', 
      'editar usuario del cliente', 'eliminar usuario del cliente',
      'agregar entidad al sistema', 'editar entidad del sistema', 'eliminar entidad del sistema',
      'agregar entidad al equipo', 'editar entidad del equipo', 'eliminar entidad del equipo'
    ];

    const nonHumanRequests = [
      'agregar entidad no humana', 'editar entidad no humana', 'eliminar entidad no humana'
    ];

    if (humanRequests.includes(request.tipo)) {
      // Solo supervisores de entidades humanas
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades humanas'
      );
    } else if (nonHumanRequests.includes(request.tipo)) {
      // Solo supervisores de entidades no humanas
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades no humanas'
      );
    } else {
      // Para otros tipos (por si acaso)
      supervisoresRequeridos = mockUsers.filter(u => 
        u.rol === 'Supervisor de entidades humanas' ||
        u.rol === 'Supervisor de entidades no humanas'
      );
    }

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // Si está en proceso de aprobación del supervisor
        if (req.seguimiento === 'En proceso de aprobación del supervisor') {
          const newSupRechazados = [...req.supervisoresRechazados, currentUser.id];
          
          // Si todos los supervisores REQUERIDOS rechazan, se marca como rechazada
          if (newSupRechazados.length >= supervisoresRequeridos.length) {
            return { 
              ...req, 
              supervisoresRechazados: newSupRechazados,
              seguimiento: 'Rechazado' 
            };
          }
          
          return { ...req, supervisoresRechazados: newSupRechazados };
        }
        
        // Si está en proceso de aprobación del responsable
        if (req.seguimiento === 'En proceso de aprobación por el responsable') {
          const newRespRechazados = [...req.responsablesRechazados, currentUser.id];
          
          // Si todos los responsables rechazan, se marca como rechazada
          if (newRespRechazados.length >= responsables.length) {
            return { 
              ...req, 
              responsablesRechazados: newRespRechazados,
              seguimiento: 'Rechazado' 
            };
          }
          
          return { ...req, responsablesRechazados: newRespRechazados };
        }
      }
      return req;
    }));
  };

  const addNonHumanEntity = (entity: Omit<NonHumanEntity, 'id'>) => {
    const newEntity: NonHumanEntity = {
      ...entity,
      id: `nh${Date.now()}`,
    };
    setNonHumanEntities(prev => [...prev, newEntity]);
  };

  const updateNonHumanEntity = (id: string, updates: Partial<NonHumanEntity>) => {
    setNonHumanEntities(prev => prev.map(entity => 
      entity.id === id ? { ...entity, ...updates } : entity
    ));
  };

  const deleteNonHumanEntity = (id: string) => {
    setNonHumanEntities(prev => prev.filter(entity => entity.id !== id));
  };

      return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        analyses,
        comments,
        reports,
        clientGroups,
        systemUsers,
        teamMembers,
        nonHumanEntities,
        requests,
        sessionExpired,
        setSessionExpired,
        actionSessionExpired,
        setActionSessionExpired,
        actionSessionActive,
        actionSessionTimeLeft,
        readOnlyMode,
        setReadOnlyMode,
        requiresReAuth,
        resetActionSession,
        createRequestWithAuthCheck,
        executeActionWithAuthCheck,
        login,
        logout,
        addAnalysis,
        addComment,
        editComment,
        deleteComment,
        canEditComment,
        completeAnalysis,
        getClientUsers,
        createRequest,
        approveRequest,
        rejectRequest,
        addNonHumanEntity,
        updateNonHumanEntity,
        deleteNonHumanEntity,
        startReAuthenticationProcess,
        reactivateActions,
      }}
    >
      {children}
      <SessionExpiredModal 
        open={sessionExpired} 
        onOpenChange={setSessionExpired} 
      />
      <ActionSessionExpiredModal 
        open={actionSessionExpired} 
        onOpenChange={setActionSessionExpired} 
        onReAuthSuccess={resetActionSession}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}