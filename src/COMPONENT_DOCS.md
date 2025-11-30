# 📦 Documentación Detallada de Componentes - PICIS

## 📑 Índice
- [Componentes de Autenticación](#autenticación)
- [Dashboards por Rol](#dashboards)
- [Modales de Creación](#modales-de-creación)
- [Modales de Edición](#modales-de-edición)
- [Modales de Visualización](#modales-de-visualización)
- [Gestión de Estado](#gestión-de-estado)

---

## 🔐 Autenticación

### LoginPage.tsx

**Propósito**: Página de inicio de sesión de la aplicación

**Responsabilidades**:
- Renderizar formulario de login
- Validar credenciales del usuario
- Manejar estados de carga
- Mostrar notificaciones de éxito/error
- Proporcionar credenciales de prueba visibles

**Estado Local**:
```typescript
- correo: string // Email del usuario
- password: string // Contraseña del usuario
- isLoading: boolean // Estado de carga durante autenticación
```

**Funciones**:
- `handleLogin(e: FormEvent)`: Procesa el formulario y valida credenciales

**Flujo de Usuario**:
1. Usuario ingresa correo y contraseña
2. Presiona "Iniciar Sesión"
3. Sistema valida contra usuarios predefinidos
4. Si válido → redirección automática a dashboard
5. Si inválido → muestra error

**Usuarios de Prueba**:
| Correo | Rol |
|--------|-----|
| supervisor@example.com | Supervisor |
| analista@example.com | Analista |
| responsable@example.com | Responsable |
| gestor-humanas@example.com | Gestor E. Humanas |
| gestor-nohumanas@example.com | Gestor E. No Humanas |
| supervisor-humanas@example.com | Supervisor E. Humanas |
| supervisor-nohumanas@example.com | Supervisor E. No Humanas |
| responsable-autenticacion@example.com | Responsable de Autenticación |

---

## 🏠 Dashboards

### Dashboard.tsx

**Propósito**: Dashboard principal para Supervisor, Analista y Responsable

**Roles que lo usan**: 
- Supervisor (acceso completo)
- Analista (puede crear/editar)
- Responsable (solo lectura)

**Responsabilidades**:
- Mostrar lista de análisis de seguridad del grupo
- Crear nuevos análisis (Supervisor/Analista)
- Ver reportes detallados
- Gestionar comentarios
- Indicadores de criticidad visuales

**Estado Local**:
```typescript
- newAnalysisOpen: boolean // Control del modal de nuevo análisis
- selectedAnalysisId: string | null // Análisis seleccionado para ver detalles
- reportOpen: boolean // Control del modal de reporte
- commentsOpen: boolean // Control del modal de comentarios
```

**Datos del Contexto**:
```typescript
- currentUser: User // Usuario autenticado
- analyses: Analysis[] // Lista de análisis filtrada por grupo
- createAnalysis(url, criticidad): void
- updateAnalysis(id, updates): void
- addComment(analysisId, comment): void
```

**Características Especiales**:
- **Filtrado por grupo**: Solo muestra análisis del grupo asignado al supervisor
- **Badges de criticidad**: Colores según nivel (Baja: verde, Media: amarillo, Alta: naranja, Crítica: rojo)
- **Estados de análisis**: En progreso, Completado, Fallido
- **Permisos dinámicos**: Botones habilitados/deshabilitados según rol

**Vista de Tabla**:
| Columna | Descripción |
|---------|-------------|
| ID | Identificador único del análisis |
| URL | Sitio web analizado |
| Estado | En progreso / Completado / Fallido |
| Criticidad | Baja / Media / Alta / Crítica |
| Fecha | Fecha de creación |
| Responsable | Usuario que realizó el análisis |
| Acciones | Ver reporte, comentarios |

---

### AuthManagerHumanDashboard.tsx

**Propósito**: Dashboard de gestión para Gestor de Entidades Humanas

**Rol**: Gestor de autenticación de entidades humanas

**Responsabilidades**:
- Gestión CRUD completa de clientes
- Gestión CRUD completa de usuarios del sistema
- Gestión CRUD completa de miembros del equipo
- Crear solicitudes de modificación que requieren aprobación multinivel

**Estructura con Tabs**:

#### Tab 1: Clientes
- **Lista de clientes**: Muestra grupos de clientes con nombre, descripción y número de usuarios
- **Ver cuentas**: Al hacer clic en un cliente, muestra sus cuentas de usuario
- **Acciones disponibles**:
  - Agregar cliente (modal)
  - Ver cuentas del cliente
  - Agregar cuenta al cliente
  - Editar cuenta del cliente
  - Eliminar cuenta del cliente
  - Volver a lista de clientes

#### Tab 2: Sistema
- **Lista de usuarios del sistema**: Muestra todos los usuarios con roles y permisos
- **Columnas**: ID, Nombre, Correo, Rol, Estado, Nivel de Autenticación, Políticas IAM
- **Acciones disponibles**:
  - Agregar usuario del sistema
  - Editar usuario (excepto el propio)
  - Eliminar usuario (excepto el propio)

#### Tab 3: Equipo
- **Lista de miembros del equipo**: Usuarios con autenticación de equipo
- **Características especiales**:
  - Usuario actual identificado con badge "Usuario actual"
  - Al agregar al equipo, también se agrega al sistema automáticamente
  - Nivel de autenticación fijo en 2
- **Acciones disponibles**:
  - Agregar miembro del equipo
  - Editar miembro (excepto el propio)
  - Eliminar miembro (excepto el propio)

**Estado Local**:
```typescript
- selectedClient: string | null // Cliente seleccionado para ver cuentas
- addClientOpen: boolean // Control modal agregar cliente
- addSystemUserOpen: boolean // Control modal agregar usuario sistema
- addTeamMemberOpen: boolean // Control modal agregar miembro equipo
- addClientAccountOpen: boolean // Control modal agregar cuenta cliente
- editClientAccountOpen: boolean // Control modal editar cuenta cliente
- editSystemUserOpen: boolean // Control modal editar usuario sistema
- editTeamMemberOpen: boolean // Control modal editar miembro equipo
- editingUserId: string | null // ID del usuario siendo editado
```

**Reglas de Negocio Especiales**:
1. Usuario no puede editar/eliminar su propia cuenta
2. Nivel de autenticación siempre 2 para entidades humanas
3. Al agregar al equipo → se agrega automáticamente al sistema también
4. Roles permitidos en cuentas de cliente: Supervisor, Analista, Responsable
5. Todas las acciones CRUD generan solicitudes que requieren aprobación

**Flujo de Solicitudes**:
```
Gestor crea solicitud
    ↓
TODOS los Supervisores de E. Humanas aprueban
    ↓
TODOS los Responsables de Autenticación aprueban
    ↓
Acción se ejecuta automáticamente
```

---

### AuthManagerNonHumanDashboard.tsx

**Propósito**: Dashboard de gestión para Gestor de Entidades No Humanas

**Rol**: Gestor de autenticación de entidades no humanas

**Responsabilidades**:
- Gestión CRUD completa de entidades no humanas
- Crear solicitudes de modificación
- Ver solicitudes pendientes/aprobadas/rechazadas

**Estructura**:
- **Lista principal**: Tabla con todas las entidades no humanas
- **Columnas**: ID, Nombre, Tipo, Estado, Nivel de Autenticación, Permisos
- **Botón de agregar**: En la parte superior
- **Filtros**: Por estado (Activo/Inactivo)

**Estado Local**:
```typescript
- addEntityOpen: boolean // Control modal agregar entidad
- editingEntityId: string | null // ID de entidad siendo editada
- editEntityOpen: boolean // Control modal editar entidad
```

**Tipos de Entidades No Humanas**:
- Aplicaciones
- Servicios
- APIs
- Bots
- Procesos automatizados

**Acciones Disponibles**:
- Agregar entidad no humana
- Editar entidad
- Eliminar entidad
- Ver detalles de permisos

**Flujo de Solicitudes**:
```
Gestor crea solicitud
    ↓
TODOS los Supervisores de E. No Humanas aprueban
    ↓
TODOS los Responsables de Autenticación aprueban
    ↓
Acción se ejecuta automáticamente
```

---

### AuthSupervisorHumanDashboard.tsx

**Propósito**: Dashboard de solo lectura para Supervisor de Entidades Humanas

**Rol**: Supervisor de entidades humanas

**Responsabilidades**:
- Ver clientes y sus cuentas (sin edición)
- Ver usuarios del sistema (sin edición)
- Ver miembros del equipo (sin edición)
- Ver solicitudes pendientes
- Aprobar/rechazar solicitudes de gestores

**Diferencias con AuthManagerHumanDashboard**:
- ❌ Sin botones de agregar
- ❌ Sin botones de editar
- ❌ Sin botones de eliminar
- ✅ Solo visualización
- ✅ Puede aprobar/rechazar solicitudes

**Estructura con Tabs**:
1. **Clientes** (solo lectura)
2. **Sistema** (solo lectura)
3. **Equipo** (solo lectura)
4. **Solicitudes** (puede aprobar/rechazar)

**Tab de Solicitudes**:
- Lista de solicitudes pendientes de aprobación
- Información: Tipo, Solicitante, Fecha, Detalles
- Acciones: Aprobar o Rechazar
- Historial de aprobaciones

**Estado Local**:
```typescript
- selectedClient: string | null // Cliente seleccionado para ver
```

---

### AuthSupervisorNonHumanDashboard.tsx

**Propósito**: Dashboard de solo lectura para Supervisor de Entidades No Humanas

**Rol**: Supervisor de entidades no humanas

**Responsabilidades**:
- Ver entidades no humanas (sin edición)
- Ver solicitudes pendientes
- Aprobar/rechazar solicitudes de gestores

**Estructura con Tabs**:
1. **Entidades** (solo lectura)
2. **Solicitudes** (puede aprobar/rechazar)

**Diferencias con AuthManagerNonHumanDashboard**:
- ❌ Sin botones de agregar
- ❌ Sin botones de editar
- ❌ Sin botones de eliminar
- ✅ Solo visualización
- ✅ Puede aprobar/rechazar solicitudes

---

### AuthResponsibleDashboard.tsx

**Propósito**: Dashboard de aprobación final para Responsable de Autenticación

**Rol**: Responsable de autenticación

**Responsabilidades**:
- Ver TODAS las solicitudes del sistema
- Aprobar/rechazar solicitudes que ya fueron aprobadas por supervisores
- Última instancia de aprobación antes de ejecutar acciones

**Características Especiales**:
- Ve solicitudes de entidades humanas Y no humanas
- Solo puede actuar sobre solicitudes ya aprobadas por supervisores
- Su aprobación es el paso final que ejecuta la acción

**Vista Principal**:
- Tabla de solicitudes con estado de aprobación
- Filtros: Pendientes, Aprobadas, Rechazadas
- Detalles de cada solicitud
- Historial de aprobaciones previas

**Información Mostrada**:
| Columna | Descripción |
|---------|-------------|
| Tipo | Tipo de solicitud |
| Solicitante | Gestor que creó la solicitud |
| Fecha | Fecha de creación |
| Estado | Pendiente/Aprobada/Rechazada |
| Aprobaciones | Supervisores que ya aprobaron |
| Detalles | Información específica de la solicitud |

**Flujo de Aprobación**:
```
1. Solicitud creada por Gestor
2. Supervisores aprueban (todos deben aprobar)
3. Responsable ve la solicitud
4. Responsable aprueba → ACCIÓN SE EJECUTA
   O
   Responsable rechaza → SOLICITUD CANCELADA
```

---

## ➕ Modales de Creación

### AddClientModal.tsx

**Propósito**: Modal para agregar nuevo cliente

**Campos del Formulario**:
```typescript
- nombre: string (requerido)
- descripcion: string (requerido)
```

**Proceso**:
1. Usuario llena formulario
2. Validación de campos requeridos
3. Crea solicitud de tipo "agregar cliente"
4. Solicitud entra en flujo de aprobación
5. Al aprobar → cliente se agrega a la lista

**Validaciones**:
- Nombre no puede estar vacío
- Descripción no puede estar vacía

---

### AddSystemUserModal.tsx

**Propósito**: Modal para agregar usuario del sistema

**Campos del Formulario**:
```typescript
- nombre: string (requerido)
- correo: string (requerido, validación de email)
- rol: string (requerido, select)
- nivelAutenticacion: number (siempre 2, no editable)
- politicasIAM: string (opcional)
```

**Roles Disponibles**:
- Administrador
- Usuario
- Invitado
- Supervisor
- Analista
- Responsable

**Validaciones**:
- Formato de correo válido
- Todos los campos requeridos llenos
- Nivel de autenticación fijo en 2

---

### AddTeamMemberModal.tsx

**Propósito**: Modal para agregar miembro del equipo

**Campos del Formulario**:
```typescript
- nombre: string (requerido)
- correo: string (requerido, validación de email)
- rol: string (requerido, select)
- nivelAutenticacion: number (siempre 2, no editable)
- politicasIAM: string (opcional)
```

**Comportamiento Especial**:
- Al aprobar solicitud → agrega a lista de equipo
- Al aprobar solicitud → agrega a lista de sistema automáticamente
- Mantiene sincronización entre ambas listas

**Validaciones**:
- Formato de correo válido
- Todos los campos requeridos llenos
- Nivel de autenticación fijo en 2

---

### AddClientAccountModal.tsx

**Propósito**: Modal para agregar cuenta de usuario a un cliente específico

**Campos del Formulario**:
```typescript
- nombre: string (requerido)
- correo: string (requerido, validación de email)
- rol: string (requerido, select limitado)
- nivelAutenticacion: number (siempre 2, no editable)
- politicasIAM: string (opcional)
```

**Roles Permitidos** (solo estos 3):
- Supervisor
- Responsable
- Analista

**Contexto Requerido**:
- clientId: ID del cliente al que se agrega la cuenta
- clientName: Nombre del cliente (para mostrar en descripción)

**Comportamiento**:
- Al aprobar → cuenta se agrega a clientUsers[clientId]
- Al aprobar → numeroUsuarios del cliente se incrementa en 1

---

### NewAnalysisModal.tsx

**Propósito**: Modal para crear nuevo análisis de seguridad

**Campos del Formulario**:
```typescript
- url: string (requerido, validación de URL)
- criticidad: 'Baja' | 'Media' | 'Alta' | 'Crítica' (requerido)
```

**Proceso**:
1. Usuario ingresa URL y selecciona criticidad
2. Sistema crea análisis con estado "En progreso"
3. Análisis se asigna al grupo del usuario
4. Responsable es el usuario que lo creó

**Validaciones**:
- URL debe ser válida
- Criticidad debe estar seleccionada

**Estados del Análisis**:
- En progreso (inicial)
- Completado (manual)
- Fallido (manual)

---

## ✏️ Modales de Edición

### EditClientAccountModal.tsx

**Propósito**: Modal para editar cuenta de usuario de un cliente

**Campos Editables**:
```typescript
- nombre: string
- correo: string
- rol: 'Supervisor' | 'Responsable' | 'Analista'
- politicasIAM: string
```

**Campos No Editables**:
- nivelAutenticacion (siempre 2)

**Proceso**:
1. Carga datos actuales del usuario
2. Usuario modifica campos
3. Crea solicitud de tipo "editar usuario del cliente"
4. Solicitud entra en flujo de aprobación
5. Al aprobar → cambios se aplican

**Validaciones**:
- Formato de correo válido
- Campos requeridos no vacíos

---

### EditSystemUserModal.tsx

**Propósito**: Modal para editar usuario del sistema

**Campos Editables**:
```typescript
- nombre: string
- correo: string
- rol: string
- estado: 'Activo' | 'Inactivo'
- politicasIAM: string
```

**Campos No Editables**:
- nivelAutenticacion (siempre 2)

**Proceso**:
1. Carga datos actuales del usuario
2. Usuario modifica campos
3. Crea solicitud de tipo "editar entidad del sistema"
4. Solicitud entra en flujo de aprobación
5. Al aprobar → cambios se aplican

---

### EditTeamMemberModal.tsx

**Propósito**: Modal para editar miembro del equipo

**Campos Editables**:
```typescript
- nombre: string
- correo: string
- rol: string
- estado: 'Activo' | 'Inactivo'
- politicasIAM: string
```

**Campos No Editables**:
- nivelAutenticacion (siempre 2)

**Comportamiento Especial**:
- Al aprobar solicitud → actualiza en lista de equipo
- Al aprobar solicitud → actualiza en lista de sistema automáticamente
- Mantiene sincronización entre ambas listas

**Sincronización**:
```typescript
// Al editar miembro del equipo con correo X
// 1. Se actualiza en teamMembers
// 2. Se busca en systemUsers con mismo correo
// 3. Se actualiza también en systemUsers
```

---

## 📄 Modales de Visualización

### CommentsModal.tsx

**Propósito**: Modal para ver y agregar comentarios a un análisis

**Características**:
- Lista de comentarios con autor, fecha y texto
- Formulario para agregar nuevo comentario
- Indicador de quién comentó
- Restricción de edición (solo autor puede editar, 30 min después de crear)

**Información Mostrada**:
```typescript
interface Comment {
  id: string;
  autor: string;
  fecha: string;
  texto: string;
}
```

**Permisos**:
- Todos pueden ver comentarios
- Todos pueden agregar comentarios
- Solo el autor puede editar su comentario
- Solo dentro de 30 minutos después de crear

**Vista**:
```
┌────────────────────────────────────┐
│ Comentarios: Análisis #123         │
├────────────────────────────────────┤
│ Juan Pérez - 10/11/2025 14:30     │
│ "Este análisis muestra..."         │
├────────────────────────────────────┤
│ María García - 10/11/2025 15:45   │
│ "Importante revisar..."            │
├────────────────────────────────────┤
│ [Textarea para nuevo comentario]   │
│ [Botón: Agregar Comentario]        │
└────────────────────────────────────┘
```

---

### ReportModal.tsx

**Propósito**: Modal para ver reporte detallado de un análisis de seguridad

**Información Mostrada**:
```typescript
- ID del análisis
- URL analizada
- Estado del análisis
- Criticidad (con badge de color)
- Fecha de realización
- Responsable
- Reporte completo (texto largo)
- Métricas de seguridad (opcional)
```

**Vista de Reporte**:
```
┌────────────────────────────────────────┐
│ Reporte de Análisis #123               │
├────────────────────────────────────────┤
│ URL: https://ejemplo.com               │
│ Estado: [Badge: Completado]            │
│ Criticidad: [Badge Rojo: Crítica]      │
│ Fecha: 10/11/2025                      │
│ Responsable: Juan Pérez                │
├────────────────────────────────────────┤
│ [Contenido del reporte completo]       │
│                                        │
│ Se encontraron las siguientes          │
│ vulnerabilidades...                    │
│                                        │
└────────────────────────────────────────┘
```

**Indicadores de Criticidad**:
- 🟢 Baja - Badge verde
- 🟡 Media - Badge amarillo
- 🟠 Alta - Badge naranja
- 🔴 Crítica - Badge rojo

---

## 🧠 Gestión de Estado

### AppContext.tsx

**Propósito**: Context Provider de React para estado global de la aplicación

**Estado Global Completo**:
```typescript
interface AppState {
  // Autenticación
  currentUser: User | null;
  
  // Análisis de Seguridad
  analyses: Analysis[];
  
  // Entidades Humanas
  clientGroups: ClientGroup[];
  clientUsers: Record<string, ClientUser[]>;
  systemUsers: SystemUser[];
  teamMembers: TeamMember[];
  
  // Entidades No Humanas
  nonHumanEntities: NonHumanEntity[];
  
  // Sistema de Solicitudes
  requests: Request[];
}
```

**Funciones Principales**:

#### Autenticación
```typescript
login(email: string, password: string): boolean
logout(): void
```

#### Análisis
```typescript
createAnalysis(url: string, criticidad: string): void
updateAnalysis(id: string, updates: Partial<Analysis>): void
deleteAnalysis(id: string): void
addComment(analysisId: string, comment: Comment): void
```

#### Gestión de Clientes
```typescript
getClientUsers(clientId: string): ClientUser[]
```

#### Sistema de Solicitudes
```typescript
createRequest(tipo: string, detalles: any): void
approveRequest(requestId: string, approverRole: string): void
rejectRequest(requestId: string, approverRole: string, reason: string): void
executeRequestAction(request: Request): void
```

**Tipos de Solicitudes Soportadas**:
1. `'agregar cliente'`
2. `'agregar entidad del sistema'`
3. `'agregar entidad al equipo'`
4. `'agregar usuario del cliente'`
5. `'editar usuario del cliente'`
6. `'editar entidad del sistema'`
7. `'editar entidad del equipo'`
8. `'eliminar cliente'`
9. `'eliminar entidad del sistema'`
10. `'eliminar entidad del equipo'`
11. `'eliminar usuario del cliente'`
12. `'agregar entidad no humana'`
13. `'editar entidad no humana'`
14. `'eliminar entidad no humana'`

**Lógica de Aprobación Multinivel**:
```typescript
// Para aprobar una solicitud:
function approveRequest(requestId, approverRole) {
  // 1. Agregar aprobador a la lista correspondiente
  if (esRolSupervisor(approverRole)) {
    request.aprobaciones.supervisores.push(approverRole);
  } else if (esRolResponsable(approverRole)) {
    request.aprobaciones.responsables.push(approverRole);
  }
  
  // 2. Verificar si TODOS los supervisores aprobaron
  const todosSupervisoresAprobaron = verificarTodosSupervisores(request);
  
  // 3. Verificar si TODOS los responsables aprobaron
  const todosResponsablesAprobaron = verificarTodosResponsables(request);
  
  // 4. Si todos aprobaron → ejecutar acción
  if (todosSupervisoresAprobaron && todosResponsablesAprobaron) {
    executeRequestAction(request);
    request.estado = 'aprobada';
  }
}

function rejectRequest(requestId, approverRole, reason) {
  // Un solo rechazo cancela la solicitud completa
  request.estado = 'rechazada';
  request.razonRechazo = reason;
  // No se ejecuta la acción
}
```

**Usuarios Predefinidos**:
```typescript
const mockUsers = [
  { id: '1', nombre: 'Supervisor', correo: 'supervisor@example.com', rol: 'Supervisor', grupo: 'Grupo A' },
  { id: '2', nombre: 'Analista', correo: 'analista@example.com', rol: 'Analista', grupo: 'Grupo A' },
  { id: '3', nombre: 'Responsable', correo: 'responsable@example.com', rol: 'Responsable', grupo: 'Grupo A' },
  { id: '4', nombre: 'Gestor Humanas', correo: 'gestor-humanas@example.com', rol: 'Gestor de autenticación de entidades humanas' },
  { id: '5', nombre: 'Gestor No Humanas', correo: 'gestor-nohumanas@example.com', rol: 'Gestor de autenticación de entidades no humanas' },
  { id: '6', nombre: 'Supervisor Humanas', correo: 'supervisor-humanas@example.com', rol: 'Supervisor de entidades humanas' },
  { id: '7', nombre: 'Supervisor No Humanas', correo: 'supervisor-nohumanas@example.com', rol: 'Supervisor de entidades no humanas' },
  { id: '8', nombre: 'Responsable Auth', correo: 'responsable-autenticacion@example.com', rol: 'Responsable de autenticación' },
];
```

**Sincronización de Datos**:
- Todos los componentes que usen `useApp()` reciben datos actualizados automáticamente
- Cambios en el estado global se propagan inmediatamente a todas las vistas
- React Context API maneja la reactividad

**Persistencia**:
- ⚠️ **Datos en memoria**: Se pierden al recargar la página
- 💡 **Extensión posible**: Se puede agregar localStorage para persistencia

---

## 🎨 Componentes UI Reutilizables

### Componentes de Shadcn/UI Utilizados

#### Button
```typescript
<Button variant="default|outline|ghost" size="sm|default|lg">
  Texto del botón
</Button>
```

#### Card
```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

#### Table
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Columna 1</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Badge
```typescript
<Badge className="bg-green-600">Activo</Badge>
<Badge variant="secondary">Inactivo</Badge>
```

#### Tabs
```typescript
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    {/* Contenido Tab 1 */}
  </TabsContent>
  <TabsContent value="tab2">
    {/* Contenido Tab 2 */}
  </TabsContent>
</Tabs>
```

#### Dialog (Modal)
```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descripción</DialogDescription>
    </DialogHeader>
    {/* Contenido */}
    <DialogFooter>
      <Button>Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Select
```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcion1">Opción 1</SelectItem>
    <SelectItem value="opcion2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

---

## 🔄 Flujos de Trabajo Completos

### Flujo 1: Crear Análisis de Seguridad

```
1. Usuario (Supervisor/Analista) hace login
   ↓
2. Ve Dashboard.tsx con lista de análisis
   ↓
3. Click en "Nuevo Análisis"
   ↓
4. Se abre NewAnalysisModal
   ↓
5. Usuario ingresa URL y selecciona criticidad
   ↓
6. Click en "Crear Análisis"
   ↓
7. AppContext.createAnalysis() se ejecuta
   ↓
8. Análisis se agrega a la lista con estado "En progreso"
   ↓
9. Modal se cierra y tabla se actualiza automáticamente
   ↓
10. Notificación: "Análisis creado exitosamente"
```

### Flujo 2: Agregar Usuario del Sistema (con Aprobación)

```
1. Gestor E. Humanas hace login
   ↓
2. Ve AuthManagerHumanDashboard.tsx
   ↓
3. Navega a tab "Sistema"
   ↓
4. Click en "Agregar Usuario del Sistema"
   ↓
5. Se abre AddSystemUserModal
   ↓
6. Gestor llena formulario (nombre, correo, rol, políticas IAM)
   ↓
7. Click en "Enviar Solicitud"
   ↓
8. AppContext.createRequest() crea solicitud
   ↓
9. Solicitud entra en estado "pendiente"
   ↓
10. Notificación: "Solicitud enviada para aprobación"
   ↓
   
11. Supervisor E. Humanas hace login
   ↓
12. Ve AuthSupervisorHumanDashboard.tsx
   ↓
13. Navega a tab "Solicitudes"
   ↓
14. Ve la solicitud pendiente
   ↓
15. Revisa detalles y hace click en "Aprobar"
   ↓
16. AppContext.approveRequest() se ejecuta
   ↓
17. Supervisor se agrega a lista de aprobadores
   ↓
18. Sistema verifica: ¿Todos los supervisores aprobaron? → SÍ
   ↓
19. Solicitud sigue en "pendiente" (falta responsable)
   ↓
   
20. Responsable de Autenticación hace login
   ↓
21. Ve AuthResponsibleDashboard.tsx
   ↓
22. Ve solicitud pendiente (ya aprobada por supervisor)
   ↓
23. Revisa detalles y hace click en "Aprobar"
   ↓
24. AppContext.approveRequest() se ejecuta
   ↓
25. Responsable se agrega a lista de aprobadores
   ↓
26. Sistema verifica: ¿Todos aprobaron? → SÍ
   ↓
27. AppContext.executeRequestAction() se ejecuta
   ↓
28. Usuario se crea y agrega a systemUsers
   ↓
29. Solicitud cambia a estado "aprobada"
   ↓
30. Todas las vistas se actualizan automáticamente
   ↓
31. Notificaciones a todos los involucrados
```

### Flujo 3: Rechazar Solicitud

```
1. Gestor crea solicitud (cualquier tipo)
   ↓
2. Solicitud entra en flujo de aprobación
   ↓
3. Supervisor la revisa
   ↓
4. Supervisor hace click en "Rechazar"
   ↓
5. Se abre modal pidiendo razón del rechazo
   ↓
6. Supervisor ingresa razón y confirma
   ↓
7. AppContext.rejectRequest() se ejecuta
   ↓
8. Solicitud cambia a estado "rechazada"
   ↓
9. NO se ejecuta la acción
   ↓
10. Notificación al gestor: "Solicitud rechazada"
   ↓
11. Gestor puede ver razón del rechazo
```

### Flujo 4: Editar Miembro del Equipo (Sincronización)

```
1. Gestor E. Humanas edita miembro del equipo
   ↓
2. Crea solicitud "editar entidad del equipo"
   ↓
3. Solicitud pasa por flujo de aprobación completo
   ↓
4. Al aprobar, AppContext.executeRequestAction() ejecuta:
   
   a. Actualiza en teamMembers[]
      teamMembers = teamMembers.map(user =>
        user.id === userId ? { ...user, ...updatedData } : user
      )
   
   b. Busca en systemUsers[] por correo
      const systemUser = systemUsers.find(u => u.correo === correo)
   
   c. Si existe, actualiza también en systemUsers[]
      systemUsers = systemUsers.map(user =>
        user.correo === correo ? { ...user, ...updatedData } : user
      )
   ↓
5. Ambas listas quedan sincronizadas
   ↓
6. Todas las vistas muestran datos actualizados
```

---

## 🚨 Casos Especiales y Excepciones

### Usuario No Puede Editarse a Sí Mismo

**Implementación**:
```typescript
// En AuthManagerHumanDashboard.tsx - Tab Sistema
<Button
  disabled={user.correo === currentUser?.correo}
  onClick={() => handleEdit(user.id)}
>
  Editar
</Button>
```

**Razón**: Prevenir que un gestor se quite permisos a sí mismo o se elimine

---

### Nivel de Autenticación Siempre 2

**Implementación**:
```typescript
// En todos los modales de entidades humanas
<Input
  value="2"
  disabled
  className="bg-slate-100"
/>
```

**Razón**: Regla de negocio para todas las entidades humanas

---

### Agregar a Equipo = Agregar a Sistema

**Implementación**:
```typescript
// En AppContext.tsx - caso 'agregar entidad al equipo'
case 'agregar entidad al equipo':
  // Agregar a teamMembers
  setTeamMembers(prev => [...prev, newMember]);
  
  // Agregar automáticamente a systemUsers
  setSystemUsers(prev => [...prev, newMember]);
  break;
```

**Razón**: Los miembros del equipo siempre deben estar en el sistema

---

### Comentarios Solo Editables por Autor

**Implementación**:
```typescript
// En CommentsModal.tsx
{comment.autor === currentUser?.nombre && (
  <Button onClick={() => handleEdit(comment.id)}>
    Editar
  </Button>
)}
```

**Restricción Temporal**: Solo dentro de 30 minutos después de crear

---

## 📚 Recursos y Referencias

### Archivos Clave para Entender la Aplicación

1. **App.tsx** - Enrutamiento principal
2. **AppContext.tsx** - Toda la lógica de negocio y estado
3. **Dashboard.tsx** - Análisis de seguridad
4. **AuthManagerHumanDashboard.tsx** - Gestión de entidades humanas
5. **ARCHITECTURE.md** - Arquitectura general

### Orden de Lectura Recomendado

```
1. ARCHITECTURE.md (visión general)
   ↓
2. App.tsx (entender enrutamiento)
   ↓
3. AppContext.tsx (estado y lógica)
   ↓
4. LoginPage.tsx (punto de entrada)
   ↓
5. Dashboard.tsx (funcionalidad principal)
   ↓
6. AuthManagerHumanDashboard.tsx (gestión compleja)
   ↓
7. Modales específicos según necesidad
```

---

*Documentación detallada generada para PICIS v1.0*
