# 📚 Documentación de Arquitectura - PICIS

## 🏗️ Arquitectura General

PICIS es una Single Page Application (SPA) construida con React que implementa un sistema de gestión de análisis de seguridad con control de acceso basado en roles (RBAC) y un flujo de aprobación multinivel.

### Tecnologías Principales
- **React** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Context API** - Gestión de estado global
- **Shadcn/UI** - Componentes de UI

---

## 🎭 Roles del Sistema

### Roles de Análisis de Seguridad
1. **Supervisor** - Administrador con acceso completo a análisis de su grupo
2. **Analista** - Usuario regular que realiza análisis
3. **Responsable** - Solo visualización de análisis

### Roles de Autenticación de Entidades Humanas
4. **Gestor de autenticación de entidades humanas** - Gestión completa (CRUD)
5. **Supervisor de entidades humanas** - Solo visualización
6. **Responsable de autenticación** - Aprueba solicitudes finales

### Roles de Autenticación de Entidades No Humanas
7. **Gestor de autenticación de entidades no humanas** - Gestión completa (CRUD)
8. **Supervisor de entidades no humanas** - Solo visualización

---

## 📊 Diagrama de Flujo de Navegación

```
┌─────────────────────────────────────────────────────────────────┐
│                         INICIO DE APLICACIÓN                     │
│                         index.html + App.tsx                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │   ¿Usuario logueado? │
                  └────────┬───────┬─────┘
                           │       │
                    NO ◄───┘       └───► SÍ
                     │                   │
                     ▼                   ▼
          ┌──────────────────┐    ┌──────────────────┐
          │   LoginPage.tsx  │    │  Validar Rol     │
          │                  │    └────────┬─────────┘
          │  - Login form    │             │
          │  - Validación    │             │
          └──────────────────┘             │
                                           ▼
        ┌────────────────────────────────────────────────────────┐
        │              ENRUTAMIENTO POR ROL (App.tsx)            │
        └────────────────────────┬───────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌──────────────────┐    ┌──────────────────┐
│  SUPERVISOR   │      │    ANALISTA      │    │  RESPONSABLE     │
│  RESPONSABLE  │      │                  │    │                  │
│               │      │                  │    │                  │
│ Dashboard.tsx │      │ Dashboard.tsx    │    │ Dashboard.tsx    │
└───────────────┘      └──────────────────┘    └──────────────────┘
        │                        │                        │
        ├────────────────────────┴────────────────────────┤
        │         GESTIÓN DE ANÁLISIS DE SEGURIDAD        │
        │  - Ver análisis del grupo asignado              │
        │  - Crear/editar análisis (Supervisor/Analista)  │
        │  - Comentarios en tiempo real                   │
        │  - Reportes con criticidad                      │
        └─────────────────────────────────────────────────┘

        ┌────────────────────────┬────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────────┐   ┌───────────────────┐   ┌────────────────────┐
│ GESTOR ENTIDADES │   │ SUPERVISOR        │   │ GESTOR ENTIDADES   │
│ HUMANAS          │   │ ENTIDADES HUMANAS │   │ NO HUMANAS         │
│                  │   │                   │   │                    │
│ AuthManager      │   │ AuthSupervisor    │   │ AuthManager        │
│ HumanDashboard   │   │ HumanDashboard    │   │ NonHumanDashboard  │
└──────────────────┘   └───────────────────┘   └────────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────────┐   ┌───────────────────┐   ┌────────────────────┐
│ CRUD Completo:   │   │ Solo Lectura:     │   │ CRUD Completo:     │
│ - Clientes       │   │ - Clientes        │   │ - Listado Entidades│
│ - Sistema        │   │ - Sistema         │   │   No Humanas       │
│ - Equipo         │   │ - Equipo          │   │                    │
│                  │   │                   │   │ Gestión completa   │
│ Crea Solicitudes │   │ Ver Solicitudes   │   │ Crea Solicitudes   │
└──────────────────┘   └───────────────────┘   └────────────────────┘
        │                                                │
        └────────────────────┬───────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────────────┐
        │   SUPERVISOR ENTIDADES NO HUMANAS              │
        │   AuthSupervisorNonHumanDashboard.tsx          │
        │                                                │
        │   - Solo lectura de entidades no humanas       │
        │   - Ver solicitudes pendientes                 │
        └────────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────────────┐
        │   RESPONSABLE DE AUTENTICACIÓN                 │
        │   AuthResponsibleDashboard.tsx                 │
        │                                                │
        │   - Aprobación final de todas las solicitudes  │
        │   - Ver todas las solicitudes del sistema      │
        └────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Aprobación Multinivel

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUJO DE SOLICITUDES                          │
└─────────────────────────────────────────────────────────────────┘

1. GESTOR crea solicitud
   │
   ├─► Agregar/Editar/Eliminar Cliente
   ├─► Agregar/Editar/Eliminar Usuario del Sistema
   ├─► Agregar/Editar/Eliminar Miembro del Equipo
   ├─► Agregar/Editar/Eliminar Cuenta de Cliente
   └─► Agregar/Editar/Eliminar Entidad No Humana
   │
   ▼
2. TODOS los SUPERVISORES (del tipo correspondiente) deben aprobar
   │
   ├─► Supervisores de E. Humanas (para solicitudes humanas)
   └─► Supervisores de E. No Humanas (para solicitudes no humanas)
   │
   ▼
3. TODOS los RESPONSABLES DE AUTENTICACIÓN deben aprobar
   │
   ▼
4. Solicitud APROBADA → Acción se ejecuta automáticamente
   │
   ├─► Se actualiza el estado global (AppContext)
   ├─► Se sincroniza con todas las vistas
   └─► Usuario recibe notificación (toast)

RECHAZAR en cualquier nivel → Solicitud rechazada completamente
```

---

## 📁 Estructura de Componentes

### 🔐 Autenticación
- **LoginPage.tsx** - Página de inicio de sesión

### 🏠 Dashboards Principales
- **Dashboard.tsx** - Para Supervisor, Analista, Responsable
- **AuthManagerHumanDashboard.tsx** - Gestor E. Humanas
- **AuthManagerNonHumanDashboard.tsx** - Gestor E. No Humanas
- **AuthSupervisorHumanDashboard.tsx** - Supervisor E. Humanas
- **AuthSupervisorNonHumanDashboard.tsx** - Supervisor E. No Humanas
- **AuthResponsibleDashboard.tsx** - Responsable Autenticación

### ➕ Modales de Agregar (Create)
- **AddClientModal.tsx** - Agregar cliente
- **AddSystemUserModal.tsx** - Agregar usuario del sistema
- **AddTeamMemberModal.tsx** - Agregar miembro del equipo
- **AddClientAccountModal.tsx** - Agregar cuenta de cliente
- **NewAnalysisModal.tsx** - Crear análisis de seguridad

### ✏️ Modales de Edición (Update)
- **EditClientAccountModal.tsx** - Editar cuenta de cliente
- **EditSystemUserModal.tsx** - Editar usuario del sistema
- **EditTeamMemberModal.tsx** - Editar miembro del equipo

### 📄 Modales de Visualización
- **CommentsModal.tsx** - Ver/agregar comentarios en análisis
- **ReportModal.tsx** - Ver reporte detallado de análisis

### 🎨 Componentes UI
- **/components/ui/** - Componentes reutilizables de Shadcn

### 🧠 Gestión de Estado
- **AppContext.tsx** - Estado global y lógica de negocio

---

## 🗂️ Tipos de Datos

### User
```typescript
interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  grupo?: string; // Solo para Supervisor
}
```

### Analysis
```typescript
interface Analysis {
  id: string;
  url: string;
  estado: 'En progreso' | 'Completado' | 'Fallido';
  criticidad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fecha: string;
  grupo: string;
  responsable: string;
  comentarios: Comment[];
  reporte?: string;
}
```

### Request (Solicitud)
```typescript
interface Request {
  id: string;
  tipo: string;
  solicitante: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  detalles: any;
  aprobaciones: {
    supervisores: string[];
    responsables: string[];
  };
}
```

### ClientGroup
```typescript
interface ClientGroup {
  id: string;
  nombre: string;
  descripcion: string;
  numeroUsuarios: number;
}
```

### SystemUser / TeamMember
```typescript
interface SystemUser {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  nivelAutenticacion: number;
  politicasIAM: string;
}
```

---

## 🔒 Reglas de Negocio

### Entidades Humanas
1. **Nivel de autenticación siempre es 2** (no modificable)
2. **Agregar al equipo** también agrega automáticamente al sistema
3. **Roles permitidos en cuentas de cliente**: Supervisor, Analista, Responsable
4. **Usuario no puede editarse a sí mismo** en la lista del sistema

### Flujo de Aprobación
1. **Gestor** crea la solicitud
2. **TODOS** los supervisores del tipo correspondiente deben aprobar
3. **TODOS** los responsables de autenticación deben aprobar
4. **Un solo rechazo** cancela toda la solicitud
5. **Aprobación completa** ejecuta la acción automáticamente

### Grupos y Permisos
1. **Supervisores** solo ven análisis de su grupo asignado
2. **Analistas** pueden crear y editar análisis
3. **Responsables** solo pueden visualizar
4. **Comentarios** solo editables por quien los creó (30 min después de crear)

---

## 🎯 Flujo de Usuario por Rol

### Supervisor (Análisis)
```
Login → Dashboard → [Ver análisis del grupo] → [Crear/Editar análisis]
                  → [Agregar comentarios] → [Ver reportes] → Logout
```

### Analista
```
Login → Dashboard → [Ver análisis del grupo] → [Crear análisis]
                  → [Agregar comentarios] → Logout
```

### Responsable (Análisis)
```
Login → Dashboard → [Ver análisis] → [Ver reportes] → Logout
```

### Gestor de Entidades Humanas
```
Login → Dashboard con Tabs → [Clientes] → CRUD Completo
                           → [Sistema] → CRUD Completo
                           → [Equipo] → CRUD Completo
                           → [Crear Solicitudes] → Logout
```

### Supervisor de Entidades Humanas
```
Login → Dashboard con Tabs → [Clientes] → Solo Lectura
                           → [Sistema] → Solo Lectura
                           → [Equipo] → Solo Lectura
                           → [Ver Solicitudes] → Logout
```

### Gestor de Entidades No Humanas
```
Login → Dashboard → [Listado Entidades] → CRUD Completo
                  → [Crear Solicitudes] → Logout
```

### Supervisor de Entidades No Humanas
```
Login → Dashboard → [Listado Entidades] → Solo Lectura
                  → [Ver Solicitudes] → Logout
```

### Responsable de Autenticación
```
Login → Dashboard → [Ver Todas las Solicitudes]
                  → [Aprobar/Rechazar Solicitudes]
                  → [Aprobación Final] → Logout
```

---

## 🔧 Estado Global (AppContext)

### Estado Gestionado
```typescript
- currentUser: Usuario actual autenticado
- analyses: Lista de análisis de seguridad
- requests: Solicitudes pendientes/aprobadas/rechazadas
- clientGroups: Grupos de clientes
- clientUsers: Usuarios por cliente
- systemUsers: Usuarios del sistema
- teamMembers: Miembros del equipo
- nonHumanEntities: Entidades no humanas
```

### Funciones Principales
```typescript
- login(email, password): Autenticar usuario
- logout(): Cerrar sesión
- createAnalysis(): Crear análisis
- updateAnalysis(): Actualizar análisis
- addComment(): Agregar comentario
- createRequest(): Crear solicitud
- approveRequest(): Aprobar solicitud
- rejectRequest(): Rechazar solicitud
- executeRequestAction(): Ejecutar acción aprobada
```

---

## 🚀 Puntos de Extensión

### Agregar Nuevo Rol
1. Crear componente en `/components/NuevoRolDashboard.tsx`
2. Agregar caso en `App.tsx` switch statement
3. Actualizar `AppContext.tsx` con permisos
4. Agregar tipo en `types/index.ts`

### Agregar Nueva Funcionalidad
1. Crear modal en `/components/NuevaFuncionalidadModal.tsx`
2. Agregar lógica en `AppContext.tsx`
3. Integrar en dashboard correspondiente
4. Actualizar tipos si es necesario

### Agregar Nuevo Tipo de Solicitud
1. Agregar caso en `createRequest()` de AppContext
2. Agregar caso en `executeRequestAction()` de AppContext
3. Actualizar UI de aprobación en dashboards
4. Agregar validaciones necesarias

---

## 📝 Notas Importantes

1. **Sin Backend**: Aplicación completamente frontend, datos en memoria
2. **Datos se pierden al recargar**: No hay persistencia (se puede agregar localStorage)
3. **Sincronización en tiempo real**: Gracias a Context API
4. **Componentes reutilizables**: Modales y UI components
5. **Tipado fuerte**: TypeScript para prevenir errores
6. **Responsive**: Diseño adaptable a móviles y desktop

---

## 🎨 Convenciones de Código

- **Nombres de archivos**: PascalCase para componentes (`LoginPage.tsx`)
- **Nombres de funciones**: camelCase (`createRequest()`)
- **Nombres de tipos**: PascalCase (`interface User`)
- **Estilos**: Tailwind CSS utility classes
- **Estado local**: `useState` hook
- **Estado global**: Context API

---

## 📚 Recursos Adicionales

- **Shadcn/UI**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

*Documentación generada para PICIS - Sistema de Gestión de Análisis de Seguridad*
