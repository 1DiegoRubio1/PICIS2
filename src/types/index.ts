export type UserRole = 
  | 'Supervisor' 
  | 'Analista' 
  | 'Responsable'
  | 'Gestor de autenticación de entidades humanas'
  | 'Gestor de autenticación de entidades no humanas'
  | 'Supervisor de entidades humanas'
  | 'Supervisor de entidades no humanas'
  | 'Responsable de autenticación';

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  estado: 'Activo' | 'Inactivo';
  nivelAutenticacion?: number;
  grupoId?: string; // Para usuarios que pertenecen a un grupo/cliente
}

export interface Analysis {
  id: string;
  url: string;
  estado: 'Completado' | 'En proceso';
  fechaCreacion: Date;
  comentariosCount: number;
  grupoId?: string; // Para análisis específicos de un grupo
}

export interface Comment {
  id: string;
  analysisId: string;
  userId: string;
  userName: string;
  contenido: string;
  fechaCreacion: Date;
  fechaEdicion?: Date;
}

export interface Detection {
  numero: number;
  tipoInformacion: string;
  rutaArchivo: string;
  filaColumna: string;
  criticidad: 'baja' | 'media' | 'critica';
}

export interface Report {
  analysisId: string;
  url: string;
  totalDetecciones: number;
  nivelCriticidad: 'seguro' | 'advertencia' | 'critico';
  detecciones: Detection[];
}

// Nuevos tipos para gestión de autenticación

export interface ClientGroup {
  id: string;
  nombre: string;
  numeroUsuarios: number;
}

export interface SystemUser {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  nivelAutenticacion: number;
  politicasIAM: string;
}

export interface TeamMember {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  nivelAutenticacion: number;
  politicasIAM: string;
}

export interface NonHumanEntity {
  id: string;
  nombre: string;
  nivelCriticidad: 'Basico' | 'Critico';
  cuentaServicioGCP: string;
  politicasIAM: string;
}

export type RequestType = 
  | 'agregar cliente'
  | 'agregar entidad al sistema'
  | 'agregar entidad al equipo'
  | 'editar entidad del sistema'
  | 'editar entidad del equipo'
  | 'eliminar entidad del sistema'
  | 'eliminar entidad del equipo'
  | 'eliminar cliente'
  | 'agregar usuario del cliente'
  | 'editar usuario del cliente'
  | 'eliminar usuario del cliente'
  | 'agregar entidad no humana'
  | 'editar entidad no humana'
  | 'eliminar entidad no humana';

export type RequestStatus = 
  | 'En proceso de aprobación del supervisor'
  | 'En proceso de aprobación por el responsable'
  | 'Aprobado'
  | 'Rechazado';

export interface Request {
  id: string;
  gestorNombre: string;
  gestorId: string;
  tipo: RequestType;
  fecha: Date;
  hora: string;
  seguimiento: RequestStatus;
  detalles?: any; // Detalles específicos de la solicitud
  supervisoresAprobados: string[]; // IDs de supervisores que aprobaron
  supervisoresRechazados: string[]; // IDs de supervisores que rechazaron
  responsablesAprobados: string[]; // IDs de responsables que aprobaron
  responsablesRechazados: string[]; // IDs de responsables que rechazaron
}

export interface AppContextType {
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