# 📚 PICIS - Documentación Completa

## 🎯 Bienvenido a la Documentación de PICIS

Sistema de Gestión de Análisis de Seguridad con control de acceso basado en roles (RBAC) y flujo de aprobación multinivel.

---

## 📖 Guías de Documentación

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Arquitectura General del Sistema**

Contiene:
- ✅ Visión general de la arquitectura
- ✅ Tecnologías utilizadas
- ✅ Roles del sistema explicados
- ✅ Diagrama de flujo de navegación general
- ✅ Flujo de aprobación multinivel
- ✅ Estructura de componentes
- ✅ Tipos de datos
- ✅ Reglas de negocio
- ✅ Flujo de usuario por rol
- ✅ Estado global (AppContext)
- ✅ Puntos de extensión
- ✅ Convenciones de código

**📌 Empieza aquí si quieres entender la aplicación completa**

---

### 📦 [COMPONENT_DOCS.md](./COMPONENT_DOCS.md)
**Documentación Detallada de Cada Componente**

Contiene:
- ✅ LoginPage.tsx - Autenticación
- ✅ Dashboard.tsx - Análisis de seguridad
- ✅ AuthManagerHumanDashboard.tsx - Gestión E. Humanas
- ✅ AuthManagerNonHumanDashboard.tsx - Gestión E. No Humanas
- ✅ AuthSupervisorHumanDashboard.tsx - Supervisión E. Humanas
- ✅ AuthSupervisorNonHumanDashboard.tsx - Supervisión E. No Humanas
- ✅ AuthResponsibleDashboard.tsx - Aprobación final
- ✅ Todos los modales (Add/Edit)
- ✅ Gestión de estado (AppContext)
- ✅ Componentes UI reutilizables
- ✅ Flujos de trabajo completos
- ✅ Casos especiales y excepciones

**📌 Lee esto para entender cada componente en detalle**

---

### 🗺️ [NAVIGATION_FLOW.md](./NAVIGATION_FLOW.md)
**Diagramas de Flujo de Navegación Visual**

Contiene:
- ✅ Vista general del sistema (diagrama)
- ✅ Flujo de autenticación (diagrama)
- ✅ Roles de análisis de seguridad (diagrama)
- ✅ Roles de autenticación (diagrama)
- ✅ Sistema de aprobaciones completo (diagrama)
- ✅ Flujos de datos (diagramas)
- ✅ Matriz de permisos
- ✅ Mapa de navegación por componente
- ✅ Guía de navegación para usuarios

**📌 Perfecto para visualizar cómo funciona el sistema**

---

## 🚀 Inicio Rápido

### 1. Estructura de Archivos Principales

```
/
├── App.tsx                          # 🎯 Componente raíz y enrutamiento
├── context/
│   └── AppContext.tsx               # 🧠 Estado global y lógica de negocio
├── components/
│   ├── LoginPage.tsx                # 🔐 Página de login
│   ├── Dashboard.tsx                # 📊 Dashboard de análisis
│   ├── AuthManagerHumanDashboard.tsx      # 👥 Gestión E. Humanas
│   ├── AuthManagerNonHumanDashboard.tsx   # 🤖 Gestión E. No Humanas
│   ├── AuthSupervisorHumanDashboard.tsx   # 👁️ Supervisión E. Humanas
│   ├── AuthSupervisorNonHumanDashboard.tsx# 👁️ Supervisión E. No Humanas
│   ├── AuthResponsibleDashboard.tsx       # ✅ Aprobación final
│   └── ...modales y otros componentes
└── DOCS/
    ├── ARCHITECTURE.md              # 📖 Arquitectura
    ├── COMPONENT_DOCS.md            # 📦 Componentes
    └── NAVIGATION_FLOW.md           # 🗺️ Flujos
```

---

### 2. Usuarios de Prueba

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| supervisor@example.com | cualquiera | Supervisor |
| analista@example.com | cualquiera | Analista |
| responsable@example.com | cualquiera | Responsable |
| gestor-humanas@example.com | cualquiera | Gestor E. Humanas |
| gestor-nohumanas@example.com | cualquiera | Gestor E. No Humanas |
| supervisor-humanas@example.com | cualquiera | Supervisor E. Humanas |
| supervisor-nohumanas@example.com | cualquiera | Supervisor E. No Humanas |
| responsable-autenticacion@example.com | cualquiera | Responsable de Autenticación |

---

### 3. Comandos Rápidos

La aplicación ya está lista para usar. No requiere instalación adicional.

**Para desarrollo local (si aplica):**
```bash
npm install
npm run dev
```

---

## 🎭 Roles del Sistema

### Roles de Análisis de Seguridad

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Supervisor** | Administrador de análisis | Ver, Crear, Editar, Eliminar |
| **Analista** | Usuario regular | Ver, Crear, Editar |
| **Responsable** | Solo visualización | Ver |

### Roles de Autenticación de Entidades Humanas

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Gestor de E. Humanas** | Gestión CRUD | Crear solicitudes para todo |
| **Supervisor de E. Humanas** | Aprobación nivel 1 | Ver y aprobar solicitudes |
| **Responsable de Autenticación** | Aprobación final | Aprobación final que ejecuta |

### Roles de Autenticación de Entidades No Humanas

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Gestor de E. No Humanas** | Gestión CRUD | Crear solicitudes para todo |
| **Supervisor de E. No Humanas** | Aprobación nivel 1 | Ver y aprobar solicitudes |
| **Responsable de Autenticación** | Aprobación final | Aprobación final que ejecuta |

---

## 🔄 Flujo de Aprobación Multinivel

```
Gestor crea solicitud
    ↓
TODOS los Supervisores (del tipo correspondiente) aprueban
    ↓
TODOS los Responsables de Autenticación aprueban
    ↓
Acción se ejecuta automáticamente
```

**Nota importante:** Un solo rechazo en cualquier nivel cancela toda la solicitud.

---

## 📊 Características Principales

### ✅ Análisis de Seguridad
- Creación y gestión de análisis de sitios web
- Indicadores de criticidad visual (Baja, Media, Alta, Crítica)
- Reportes detallados
- Sistema de comentarios en tiempo real
- Filtrado por grupo

### ✅ Gestión de Entidades Humanas
- Gestión de clientes y sus cuentas
- Gestión de usuarios del sistema
- Gestión de miembros del equipo
- Sincronización automática equipo ↔ sistema
- Nivel de autenticación fijo en 2

### ✅ Gestión de Entidades No Humanas
- Gestión de aplicaciones, servicios, APIs, bots
- Control de permisos y políticas IAM
- Estados activo/inactivo

### ✅ Sistema de Aprobación
- Flujo multinivel (Supervisores → Responsables)
- Todos deben aprobar para ejecutar
- Historial de aprobaciones
- Razones de rechazo registradas

### ✅ Seguridad y Restricciones
- Usuario no puede editar/eliminar su propia cuenta
- Roles con permisos específicos
- Validación de acceso por rol
- Estados de solicitudes rastreables

---

## 🛠️ Tecnologías

- **React** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Context API** - Gestión de estado global
- **Shadcn/UI** - Componentes de UI
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

---

## 📚 Orden de Lectura Recomendado

Para entender completamente el sistema, recomendamos leer en este orden:

1. **README_DOCS.md** (este archivo) - Visión general
2. **ARCHITECTURE.md** - Entender la estructura
3. **App.tsx** - Ver el punto de entrada
4. **AppContext.tsx** - Entender el estado global
5. **NAVIGATION_FLOW.md** - Visualizar los flujos
6. **COMPONENT_DOCS.md** - Detalles de cada componente
7. Componentes específicos según necesidad

---

## 🎯 Casos de Uso Comunes

### Caso 1: Crear un Análisis de Seguridad

```
1. Login como Supervisor o Analista
2. Click en "Nuevo Análisis"
3. Ingresar URL y seleccionar criticidad
4. Click en "Crear Análisis"
5. Análisis aparece en la tabla con estado "En progreso"
```

### Caso 2: Agregar Usuario al Sistema (con Aprobación)

```
1. Login como Gestor de E. Humanas
2. Ir a tab "Sistema"
3. Click en "Agregar Usuario del Sistema"
4. Llenar formulario
5. Click en "Enviar Solicitud"
6. Esperar aprobación de Supervisor de E. Humanas
7. Esperar aprobación de Responsable de Autenticación
8. Usuario se agrega automáticamente cuando todos aprueban
```

### Caso 3: Aprobar Solicitud

```
1. Login como Supervisor de E. Humanas
2. Ir a tab "Solicitudes"
3. Ver solicitudes pendientes
4. Click en "Aprobar" en una solicitud
5. Si todos los supervisores aprueban, pasa a responsables
6. Responsable aprueba → Acción se ejecuta
```

### Caso 4: Rechazar Solicitud

```
1. Login como Supervisor o Responsable
2. Ver solicitudes pendientes
3. Click en "Rechazar"
4. Ingresar razón del rechazo
5. Confirmar
6. Solicitud marcada como rechazada
7. Acción NO se ejecuta
```

---

## 🔍 Reglas de Negocio Importantes

### ⚠️ Restricciones

1. **Usuario no puede editarse a sí mismo** en la lista del sistema
2. **Nivel de autenticación siempre es 2** para entidades humanas (no modificable)
3. **Al agregar al equipo** → se agrega automáticamente al sistema
4. **Al editar miembro del equipo** → se actualiza automáticamente en sistema
5. **Roles de cuentas de cliente** → Solo: Supervisor, Analista, Responsable

### ✅ Flujo de Aprobación

1. **Gestor** crea la solicitud
2. **TODOS** los supervisores del tipo deben aprobar
3. **TODOS** los responsables deben aprobar
4. **Un solo rechazo** cancela la solicitud completa
5. **Aprobación completa** ejecuta la acción inmediatamente

### 📊 Grupos y Visibilidad

1. **Supervisores** solo ven análisis de su grupo asignado
2. **Comentarios** solo editables por su autor
3. **Datos se pierden al recargar** (sin persistencia actual)

---

## 🎨 Convenciones de Código

### Nombres de Archivos
- **Componentes**: PascalCase (`LoginPage.tsx`)
- **Utilidades**: camelCase (`useApp.ts`)

### Estructura de Componentes
```typescript
/**
 * Documentación del componente
 */
import { ... } from '...';

export function ComponentName() {
  // Estado local
  const [state, setState] = useState();
  
  // Contexto global
  const { ... } = useApp();
  
  // Funciones
  const handleAction = () => { ... };
  
  // Render
  return ( ... );
}
```

### Estilos
- **Tailwind CSS** utility classes
- **Variantes** de componentes Shadcn
- **Responsive** por defecto

---

## 🚨 Solución de Problemas

### "Usuario no encontrado"
- Verifica que estés usando uno de los correos de prueba
- Cualquier contraseña es válida

### "No veo análisis en el dashboard"
- Los supervisores solo ven análisis de su grupo asignado
- Verifica que el grupo del usuario coincida con el grupo del análisis

### "Mi solicitud no se ejecuta"
- Verifica que TODOS los supervisores hayan aprobado
- Verifica que TODOS los responsables hayan aprobado
- Si alguien rechazó, la solicitud se cancela

### "No puedo editar mi cuenta"
- Esto es intencional por seguridad
- Un usuario no puede editar/eliminar su propia cuenta

### "Perdí mis datos al recargar"
- Los datos están en memoria (no hay persistencia)
- Se puede agregar localStorage para persistencia

---

## 📞 Referencia Rápida

### Componentes Principales

| Componente | Archivo | Rol(es) |
|-----------|---------|---------|
| Login | LoginPage.tsx | Todos |
| Dashboard Análisis | Dashboard.tsx | Supervisor, Analista, Responsable |
| Gestión E. Humanas | AuthManagerHumanDashboard.tsx | Gestor E. Humanas |
| Gestión E. No Humanas | AuthManagerNonHumanDashboard.tsx | Gestor E. No Humanas |
| Supervisión E. Humanas | AuthSupervisorHumanDashboard.tsx | Supervisor E. Humanas |
| Supervisión E. No Humanas | AuthSupervisorNonHumanDashboard.tsx | Supervisor E. No Humanas |
| Aprobación Final | AuthResponsibleDashboard.tsx | Responsable de Autenticación |

### Modales de Creación

- `AddClientModal.tsx` - Agregar cliente
- `AddClientAccountModal.tsx` - Agregar cuenta a cliente
- `AddSystemUserModal.tsx` - Agregar usuario al sistema
- `AddTeamMemberModal.tsx` - Agregar miembro al equipo
- `NewAnalysisModal.tsx` - Crear análisis

### Modales de Edición

- `EditClientAccountModal.tsx` - Editar cuenta de cliente
- `EditSystemUserModal.tsx` - Editar usuario del sistema
- `EditTeamMemberModal.tsx` - Editar miembro del equipo

### Modales de Visualización

- `CommentsModal.tsx` - Ver/agregar comentarios
- `ReportModal.tsx` - Ver reporte de análisis

---

## 🔗 Enlaces Útiles

- **Shadcn/UI**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Lucide Icons**: https://lucide.dev/

---

## 📄 Licencia y Créditos

**PICIS** - Sistema de Gestión de Análisis de Seguridad

Desarrollado con React, TypeScript y Tailwind CSS.

---

## 🎓 Para Desarrolladores

### Agregar Nuevo Rol

1. Crear componente dashboard en `/components/NuevoRolDashboard.tsx`
2. Actualizar `App.tsx` con nuevo caso en switch
3. Agregar usuario de prueba en `AppContext.tsx`
4. Actualizar tipos en `types/index.ts`
5. Documentar el nuevo rol

### Agregar Nueva Funcionalidad

1. Crear modal en `/components/NuevaFuncionalidadModal.tsx`
2. Agregar lógica en `AppContext.tsx`
3. Integrar en dashboard correspondiente
4. Agregar validaciones
5. Documentar la funcionalidad

### Agregar Tipo de Solicitud

1. Agregar caso en `createRequest()` de AppContext
2. Agregar caso en `executeRequestAction()` de AppContext
3. Actualizar UI de aprobación
4. Agregar validaciones
5. Documentar el flujo

---

## 📚 Recursos Adicionales

### Archivos de Documentación

1. **ARCHITECTURE.md** - 📖 Arquitectura completa
2. **COMPONENT_DOCS.md** - 📦 Documentación de componentes
3. **NAVIGATION_FLOW.md** - 🗺️ Diagramas de flujo

### Archivos de Código Clave

1. **App.tsx** - Punto de entrada y enrutamiento
2. **AppContext.tsx** - Estado global y lógica
3. **types/index.ts** - Definiciones de tipos

---

**¡Gracias por usar PICIS!**

Para cualquier duda, consulta la documentación detallada o revisa los diagramas de flujo.

*Última actualización: Noviembre 2025*
