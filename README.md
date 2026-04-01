# Sistema de Gestión de Visitas 

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Sistema completo de gestión de visitas, con arquitectura empresarial, autenticación JWT, auditoría completa, dashboard con estadísticas en tiempo real y simulador de tráfico integrado.

---

## Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Base de Datos](#-base-de-datos)
- [API REST — Endpoints](#-api-rest--endpoints-completos)
- [DTOs — Contratos de la API](#-dtos--contratos-de-la-api)
- [Frontend — Aplicación React](#-frontend--aplicación-react)
- [Simulador de Tráfico](#-simulador-de-tráfico)
- [Seguridad](#-seguridad)
- [Middlewares](#-middlewares-personalizados)
- [Monitoreo y Logging](#-monitoreo-y-logging)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Roadmap](#-roadmap)
- [Autor](#-autor)

---

##  Características Principales
##  Características Principales

###  Seguridad
- Autenticación JWT con claims personalizados (HS256)
- Autorización basada en roles (Admin, Recepción, Analista)
- Hash de contraseñas con PBKDF2 + SHA256 (100,000 iteraciones + salt)
- Audit trail completo de todas las acciones
- IP tracking y User Agent logging
- Security headers OWASP (CSP, X-Frame-Options, HSTS, etc.)
- Preparado para SSO con Microsoft 365 (Azure AD)

###  Funcionalidades
- CRUD completo de visitas, visitantes y usuarios
- Dashboard con KPIs en tiempo real
- Estadísticas: tendencia diaria, por departamento, duración, picos horarios, comparación semanal
- Búsqueda y filtros avanzados (estado, departamento, fecha, misional, vehículo)
- Paginación server-side
- Gestión de carnets y vehículos
- Clasificación misional/no misional
- Tema claro/oscuro
- Exportación a PDF y Excel (EPPlus + QuestPDF)
- Generación de códigos QR (QRCoder)

###  Arquitectura
- Clean Architecture con Repository Pattern
- Dependency Injection nativo de ASP.NET Core
- DTOs para transferencia de datos
- 5 Custom Middlewares en pipeline
- Exception Handling global
- Caché distribuido (Redis producción / InMemory desarrollo)
- Logging estructurado con Serilog
- Performance monitoring middleware
- Azure Application Insights (producción)
- Retry logic con SQL Server (5 reintentos)

---

##  Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| ASP.NET Core | 8.0 | Framework Web API |
| Entity Framework Core | 8.0.2 | ORM |
| PostgreSQL (Supabase) | 16+ | Base de datos producción |
| SQL Server (LocalDB) | — | Base de datos desarrollo |
| JWT Bearer | 8.0.2 | Autenticación |
| Serilog | 8.0.3 | Logging estructurado |
| Redis | 8.0.2 | Caché distribuido |
| EPPlus | 7.5.4 | Exportación Excel |
| QuestPDF | 2024.12.3 | Generación PDF |
| QRCoder | 1.6.0 | Códigos QR |
| FluentValidation | 11.3.0 | Validación de modelos |
| Microsoft.Identity.Web | 3.4.0 | SSO Microsoft 365 |
| Microsoft.Graph | 5.91.0 | Integración Graph API |
| Azure Application Insights | 2.22.0 | Monitoreo producción |
| Azure Key Vault | 4.8.0 | Gestión de secretos |

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2 | Build tool & dev server |
| TailwindCSS | 3.4 | Estilos utility-first |
| React Router | 7.12 | Navegación SPA |
| Axios | 1.13 | HTTP Client |
| React Hook Form | 7.71 | Formularios |
| Zod | 4.3 | Validación de esquemas |
| Recharts | 3.7 | Gráficos y charts |
| Lucide React | 0.562 | Iconos |
| date-fns | 4.1 | Formateo de fechas |
| React Hot Toast | 2.6 | Notificaciones |

### Simulador

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Node.js | 18+ | Runtime |
| TypeScript | 5.3 | Type safety |
| Axios | 1.6 | HTTP Client |
| Day.js | 1.11 | Manejo de fechas |
| Faker.js | 8.4 | Datos sintéticos |
| Pino | 10.3 | Logging JSON |

---

## Estructura del Proyecto
## Estructura del Proyecto

```
GestionVisita/
├── Backend/                          # ASP.NET Core 8.0 Web API
│   ├── Controllers/                  # 7 API Controllers
│   │   ├── AuthController.cs         #   Autenticación (login, register, logout)
│   │   ├── VisitController.cs        #   CRUD visitas + estadísticas
│   │   ├── VisitorController.cs      #   CRUD visitantes + búsqueda
│   │   ├── UserController.cs         #   Gestión usuarios (Admin)
│   │   ├── StatsController.cs        #   Estadísticas avanzadas
│   │   ├── DepartmentController.cs   #   Departamentos
│   │   ├── DiagnosticsController.cs  #   Health checks
│   │   └── HealthController.cs       #   Estado de BD
│   ├── Services/                     # Lógica de negocio
│   │   ├── AuthService.cs            #   Autenticación y permisos
│   │   ├── VisitService.cs           #   Lógica de visitas
│   │   ├── VisitorService.cs         #   Lógica de visitantes
│   │   ├── CacheService.cs           #   Caché (Redis/InMemory)
│   │   └── LoggerService.cs          #   Auditoría de acciones
│   ├── Repositories/                 # Acceso a datos
│   │   ├── Interfaces/               #   Contratos (IRepository<T>, IVisitRepository, etc.)
│   │   └── Implementations/          #   Implementaciones EF Core
│   ├── DTOs/                         # Data Transfer Objects
│   │   ├── Auth/                     #   Login/Register request/response
│   │   ├── Visit/                    #   Create/Update/Close visit DTOs
│   │   ├── Visitor/                  #   Create/Update visitor DTOs
│   │   ├── User/                     #   CRUD usuario DTOs
│   │   └── Stats/                    #   Dashboard, tendencias, KPIs
│   ├── Models/                       # Entidades de BD
│   │   ├── User.cs                   #   Usuario con roles
│   │   ├── Visit.cs                  #   Visita con estado, departamento
│   │   ├── Visitor.cs                #   Visitante con documento
│   │   ├── Department.cs             #   Departamento institucional
│   │   ├── Role.cs                   #   Rol del sistema
│   │   ├── AuditLog.cs              #   Log de auditoría
│   │   ├── VisitStatusEntity.cs      #   Estado de visita
│   │   └── VisitVisitor.cs           #   Tabla pivote visita-visitante
│   ├── Data/                         # DbContext y configuración
│   │   ├── ApplicationDbContext.cs   #   EF Core context + seed data
│   │   └── ApplicationDbContextFactory.cs  # Design-time factory
│   ├── Helpers/                      # Utilidades
│   │   ├── JwtHelper.cs             #   Generación/validación JWT
│   │   └── PasswordHelper.cs        #   PBKDF2 hash + verificación
│   ├── Middleware/                   # 5 Custom Middlewares
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   ├── SecurityHeadersMiddleware.cs
│   │   ├── PerformanceMonitoringMiddleware.cs
│   │   ├── RequestLoggingMiddleware.cs
│   │   └── AuditMiddleware.cs
│   ├── Enums/                        # Enumeraciones
│   │   ├── VisitStatus.cs            #   Abierto(1), Cerrado(2)
│   │   ├── DocumentType.cs           #   Cédula(1), Pasaporte(2), SinID(3)
│   │   └── AuditSeverity.cs          #   Low, Medium, High, Critical
│   ├── Migrations/                   # EF Core migrations
│   ├── Logs/                         # Archivos de log diarios
│   ├── Program.cs                    # Entry point + service registration
│   └── appsettings.*.json            # Configuración por ambiente
│
├── Frontend/                         # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                      # Servicios HTTP
│   │   │   ├── axiosConfig.ts        #   Instancia Axios + interceptors JWT
│   │   │   ├── authApi.ts            #   Login, logout, me, check
│   │   │   ├── visitApi.ts           #   CRUD visitas
│   │   │   ├── visitorApi.ts         #   CRUD visitantes
│   │   │   ├── userApi.ts            #   CRUD usuarios
│   │   │   ├── statsApi.ts           #   KPIs y estadísticas
│   │   │   └── departmentApi.ts      #   Departamentos
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx    # Guard de rutas con roles
│   │   │   ├── common/
│   │   │   │   ├── Modal.tsx             # Modal genérico (sm/md/lg/xl)
│   │   │   │   ├── SearchBar.tsx         # Búsqueda con debounce
│   │   │   │   ├── LoadingSpinner.tsx    # Spinner de carga
│   │   │   │   └── ConfirmDialog.tsx     # Diálogo de confirmación
│   │   │   ├── dashboard/
│   │   │   │   ├── KPICards.tsx           # 4 tarjetas KPI
│   │   │   │   ├── VisitChart.tsx         # Gráfico por departamento
│   │   │   │   ├── ActiveVisitsTable.tsx  # Tabla visitas activas
│   │   │   │   └── RecentVisitorsWidget.tsx # Últimos visitantes
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx            # Wrapper principal
│   │   │   │   ├── Navbar.tsx            # Barra superior
│   │   │   │   └── Sidebar.tsx           # Menú lateral colapsable
│   │   │   ├── visitors/
│   │   │   │   ├── VisitorTable.tsx       # Tabla de visitantes
│   │   │   │   ├── VisitorForm.tsx        # Formulario crear/editar
│   │   │   │   └── VisitorFormModal.tsx   # Modal del formulario
│   │   │   ├── visits/
│   │   │   │   ├── VisitTable.tsx         # Tabla de visitas
│   │   │   │   ├── VisitForm.tsx          # Formulario crear visita
│   │   │   │   ├── VisitFormModal.tsx     # Modal del formulario
│   │   │   │   └── VisitorAutocomplete.tsx # Autocompletado visitantes
│   │   │   └── users/
│   │   │       └── UserFormModal.tsx      # Modal CRUD usuarios
│   │   ├── context/
│   │   │   ├── AuthContext.tsx        #   Estado autenticación + JWT
│   │   │   ├── SidebarContext.tsx     #   Estado sidebar colapsado
│   │   │   └── ThemeContext.tsx       #   Tema claro/oscuro
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            #   Acceso a AuthContext
│   │   │   └── usePermissions.ts     #   Permisos por rol
│   │   ├── pages/
│   │   │   ├── Login.tsx             #   Inicio de sesión
│   │   │   ├── Dashboard.tsx         #   Dashboard principal
│   │   │   ├── Visitors.tsx          #   Gestión visitantes
│   │   │   ├── Visits.tsx            #   Gestión visitas
│   │   │   ├── Reports.tsx           #   Reportes y exportación
│   │   │   ├── Users.tsx             #   Gestión usuarios (Admin)
│   │   │   ├── NotFound.tsx          #   Página 404
│   │   │   └── Unauthorized.tsx      #   Página 403
│   │   ├── types/
│   │   │   ├── auth.types.ts         #   User, LoginRequest/Response
│   │   │   ├── visit.types.ts        #   Visit, CreateVisitRequest
│   │   │   ├── visitor.types.ts      #   Visitor, DocumentType enum
│   │   │   ├── user.types.ts         #   Role, CreateUserRequest
│   │   │   └── stats.types.ts        #   Stats, DepartmentStats
│   │   ├── utils/
│   │   │   ├── formatters.ts         #   Formato fechas, teléfono, moneda
│   │   │   └── validators.ts         #   Email, cédula, teléfono
│   │   ├── App.tsx                   # Router + providers
│   │   ├── main.tsx                  # Entry point React
│   │   └── index.css                 # Tailwind base + componentes
│   ├── .env.development              # API local
│   ├── .env.production               # API producción (Azure)
│   └── vercel.json                   # SPA rewrites para Vercel
│
├── simulador/                        # Bot de simulación de tráfico
│   ├── src/
│   │   ├── index.ts                  # Entry point + signal handling
│   │   ├── config/config.ts          # Variables de entorno + validación
│   │   ├── types/api.types.ts        # DTOs TypeScript del backend
│   │   ├── services/
│   │   │   ├── apiClient.ts          # HTTP client + auto-refresh JWT
│   │   │   └── logger.ts             # Logger multilevel con emojis
│   │   ├── generators/
│   │   │   └── dataGenerators.ts     # Datos dominicanos realistas
│   │   └── simulation/
│   │       └── engine.ts             # Motor de simulación infinita
│   ├── build-webjob.ps1              # Script build Azure WebJob
│   ├── run.cmd                       # Entry point para Azure
│   ├── test-local.ps1                # Testing local
│   ├── DEPLOYMENT.md                 # Guía despliegue Azure
│   └── ARCHITECTURE.md               # Documentación arquitectura
│
├── README.md                         # Esta documentación
└── ROADMAP_DESARROLLO.md             # Plan de desarrollo por fases
```

---

##  Arquitectura del Sistema

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                       │
│   Login │ Dashboard │ Visits │ Visitors │ Users │ Reports   │
│         Context API + Hooks + Protected Routes               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Axios + JWT Bearer)
┌──────────────────────────▼──────────────────────────────────┐
│                  MIDDLEWARE PIPELINE                          │
│  ExceptionHandling → Security Headers → Performance Monitor  │
│  → Request Logging → CORS → Auth → Authorization → Audit    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    CONTROLLERS (7)                            │
│  Auth │ Visit │ Visitor │ User │ Stats │ Department │ Diag  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  SERVICES (Business Logic)                    │
│  AuthService │ VisitService │ VisitorService │ CacheService  │
│              │ LoggerService                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               REPOSITORIES (Data Access)                     │
│  IRepository<T> (Generic) │ IVisitRepository (Complex)       │
│  IVisitorRepository │ IUserRepository │ IAuditLogRepository  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Entity Framework Core 8.0
┌──────────────────────────▼──────────────────────────────────┐
│            BASE DE DATOS (PostgreSQL / SQL Server)            │
│  Users │ Roles │ Visits │ Visitors │ Departments │ AuditLogs │
└─────────────────────────────────────────────────────────────┘
```

### Patrones Implementados

| Patrón | Implementación |
|--------|---------------|
| **Repository Pattern** | `IRepository<T>` genérico + repositorios especializados |
| **Dependency Injection** | Registro en `Program.cs` con lifetime Scoped |
| **DTO Pattern** | Separación entre entidades y contratos API |
| **Middleware Pipeline** | Cross-cutting concerns (auth, logging, errores) |
| **Audit Trail** | Logging automático de todas las acciones |
| **Cache-Aside** | `CacheService` con fallback Memory/Redis |
| **Factory Pattern** | `ApplicationDbContextFactory` para design-time |

---

##  Base de Datos

### Diagrama Entidad-Relación

```
User (1) ───── (M) Visit          (usuario crea visitas)
User (1) ───── (M) Visit.ClosedBy (usuario cierra visitas)
User (M) ───── (M) Role           (via tabla role_user)
User (1) ───── (M) Visitor        (usuario registra visitantes)
User (1) ───── (M) AuditLog       (acciones del usuario)
User (1) ───── (M) User.CreatedBy (auto-referencia)

Visit (M) ───── (1) Department
Visit (M) ───── (1) VisitStatusEntity
Visit (M) ───── (M) Visitor       (via VisitVisitor pivote)

VisitVisitor: (VisitId, VisitorId) PK compuesto + CaseId (Sirenna)
```

### Modelos de Datos

#### **User**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id | int (PK) | Auto-increment |
| Name | string (255) | Nombre completo |
| Email | string (255) | Único, indexado |
| Password | string (255) | PBKDF2 hash + salt |
| MicrosoftId | string (255)? | Para SSO Microsoft 365 |
| IsActive | bool | Estado de la cuenta |
| LastLoginAt | DateTime? | Último acceso |
| CreatedBy | int? (FK) | Auto-referencia al creador |
| Roles | Collection&lt;Role&gt; | Many-to-many |

**Propiedades calculadas:** `IsAdmin`, `IsAsistAdm`, `IsGuardia`, `IsAuxUgc`, `PrimaryRole`

#### **Visit**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id | int (PK) | Auto-increment |
| UserId | int (FK) | Creador de la visita |
| ClosedBy | int? (FK) | Quién cerró la visita |
| NamePersonToVisit | string (255) | Persona visitada |
| Department | string (255)? | Departamento (texto) |
| DepartmentId | int? (FK) | Departamento (relación) |
| Building | int? | Edificio |
| Floor | int? | Piso |
| Reason | string (500)? | Motivo de la visita |
| StatusId | int (FK) | 1=Abierto, 2=Cerrado |
| EndAt | DateTime? | Hora de cierre |
| AssignedCarnet | int? | Número de carnet |
| MissionCase | bool | Caso misional |
| VehiclePlate | string (20)? | Placa del vehículo (indexada) |
| PersonToVisitEmail | string? | Email persona visitada |
| SendEmail | bool | Notificar por email |
| Visitors | Collection&lt;Visitor&gt; | Many-to-many |

**Índices:** StatusId, CreatedAt, EndAt, VehiclePlate, Department, DepartmentId

**Propiedades calculadas:** `IsActive`, `Duration`, `IsRecent`

#### **Visitor**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id | int (PK) | Auto-increment |
| IdentityDocument | string? | Cédula/pasaporte (único condicional) |
| DocumentType | enum | Cedula(1), Pasaporte(2), SinIdentificacion(3) |
| Name | string (255) | Nombre |
| LastName | string (255) | Apellido |
| Phone | string (20)? | Teléfono |
| Email | string? | Email (indexado) |
| Institution | string (255)? | Institución de procedencia |
| UserId | int? (FK) | Registrado por usuario |

**Propiedades calculadas:** `FullName`, `DocumentTypeLabel`

#### **Department**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id | int (PK) | Auto-increment |
| Name | string (255) | Único |
| Description | string (500)? | Descripción |
| IsActive | bool | Activo/Inactivo |

**Seed Data (10 departamentos):**
1. Dirección/Gerencia General
2. Recursos Humanos (RRHH)
3. Administración y Finanzas
4. Tecnologías de la Información (IT/TI)
5. Atención al Usuario
6. Legal
7. Servicios Generales
8. Planificación y Desarrollo
9. Comunicaciones
10. Auditoría Interna

#### **Role**
| Id | Name | Descripción |
|----|------|-------------|
| 1 | Admin | Administrador del sistema |
| 2 | Recepcion | Personal de recepción |
| 3 | Analista | Analista de datos |

#### **AuditLog**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id | int (PK) | Auto-increment |
| UserId | int? (FK) | Usuario que realizó la acción |
| Action | string | login, logout, create, update, delete, etc. |
| ResourceType | string | auth, visit, visitor, user, stats |
| ResourceId | int? | ID del recurso afectado |
| OldValues | string? (JSON) | Valores anteriores |
| NewValues | string? (JSON) | Valores nuevos |
| IpAddress | string (45)? | Dirección IP |
| UserAgent | string? | Navegador/cliente |
| RequestMethod | string (10) | GET, POST, PUT, DELETE |
| RequestUrl | string? | URL de la petición |
| StatusCode | int? | Código HTTP de respuesta |
| DurationMs | int? | Duración en milisegundos |
| Severity | enum | Low(1), Medium(2), High(3), Critical(4) |
| Tags | string? (JSON) | Etiquetas: ["security", "login_failed"] |

#### **VisitVisitor** (Tabla Pivote)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| VisitId | int (PK, FK) | FK a Visit (cascade) |
| VisitorId | int (PK, FK) | FK a Visitor (cascade) |
| CaseId | int? | ID externo sistema Sirenna |

---

##  API REST — Endpoints Completos

###  Autenticación (`/api/auth`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|:----:|-------------|
| POST | `/api/auth/login` |  | Login con email/password → JWT token |
| POST | `/api/auth/register` |  Admin | Registrar nuevo usuario |
| GET | `/api/auth/me` |  | Obtener usuario autenticado |
| POST | `/api/auth/logout` |  | Cerrar sesión |
| GET | `/api/auth/check` |  | Verificar validez del token |

###  Visitas (`/api/visit`)

| Método | Endpoint | Auth | Parámetros | Descripción |
|--------|----------|:----:|-----------|-------------|
| GET | `/api/visit` |  | `page, per_page, search, status_id, department, date_from, date_to, mission_case, has_vehicle` | Listar visitas paginadas con filtros |
| GET | `/api/visit/{id}` |  | — | Obtener visita con detalles completos |
| GET | `/api/visit/active` |  | `q` (búsqueda) | Visitas activas (abiertas) |
| GET | `/api/visit/active/mission` |  | `q` | Visitas activas misionales |
| GET | `/api/visit/active/non-mission` |  | `q` | Visitas activas no misionales |
| GET | `/api/visit/today` |  | `q` | Visitas creadas hoy |
| GET | `/api/visit/closed-today` | | `q` | Visitas cerradas hoy |
| GET | `/api/visit/stats/dashboard` |  | — | Estadísticas del dashboard |
| POST | `/api/visit` |  | Body: `CreateVisitRequestDto` | Crear nueva visita |
| POST | `/api/visit/{id}/close` |  | Body: `CloseVisitRequestDto` | Cerrar visita |
| PATCH | `/api/visit/{id}/vehicle-plate` |  | Body: `{vehiclePlate}` | Actualizar placa |
| POST | `/api/visit/{id}/assign-carnet` |  | Body: `{carnetNumber}` | Asignar carnet |
| DELETE | `/api/visit/{id}` |  | — | Eliminar visita |

### Visitantes (`/api/visitor`)

| Método | Endpoint | Auth | Parámetros | Descripción |
|--------|----------|:----:|-----------|-------------|
| GET | `/api/visitor` | | — | Listar visitantes (máx 1000) |
| GET | `/api/visitor/{id}` |  | — | Obtener con historial de visitas |
| GET | `/api/visitor/search` |  | `q` (requerido) | Buscar por nombre/doc/email |
| GET | `/api/visitor/document/{document}` |  | — | Buscar por documento de identidad |
| GET | `/api/visitor/frequent` |  | `min` (default: 5) | Visitantes frecuentes |
| GET | `/api/visitor/with-active-visits` |  | — | Visitantes con visitas activas |
| POST | `/api/visitor` |  | Body: `CreateVisitorRequestDto` | Registrar visitante |
| PUT | `/api/visitor/{id}` |  | Body: `UpdateVisitorRequestDto` | Actualizar visitante |
| DELETE | `/api/visitor/{id}` |  | — | Eliminar (sin visitas activas) |

### Usuarios (`/api/user`) — Solo Admin

| Método | Endpoint | Auth | Descripción |
|--------|----------|:----:|-------------|
| GET | `/api/user` |  Admin | Listar usuarios con roles |
| GET | `/api/user/{id}` |  Admin | Detalle de usuario |
| POST | `/api/user` |  Admin | Crear usuario con roles |
| PUT | `/api/user/{id}` |  Admin | Actualizar usuario |
| DELETE | `/api/user/{id}` |  Admin | Eliminar usuario |

### Estadísticas (`/api/stats`)

| Endpoint | Parámetros | Respuesta |
|----------|-----------|-----------|
| `/api/stats/kpis` | `mission_only` | `{todayVisits, weekVisits, activeVisits, dailyAverage}` |
| `/api/stats/daily` | `days` (default: 30) | `{dates[], visits[]}` — Tendencia diaria |
| `/api/stats/by-department` | `date_from, date_to` | `[{department, visits, percentage}]` |
| `/api/stats/duration` | — | `{average, min, max}` en minutos |
| `/api/stats/hourly` | `days` (default: 30) | `[{hour, label, visits}]` — Picos horarios |
| `/api/stats/weekday-average` | `weeks` (default: 4) | `[{day, label, average}]` |
| `/api/stats/weekly-compare` | — | `[{day, current, previous, change%}]` |

### Departamentos (`/api/department`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|:----:|-------------|
| GET | `/api/department` |  | Listar departamentos activos |

### Diagnósticos y Salud

| Método | Endpoint | Auth | Descripción |
|--------|----------|:----:|-------------|
| GET | `/api/diagnostics/health` |  | Health check (BD) |
| GET | `/api/diagnostics/status` |  | Estado detallado del sistema |
| GET | `/api/diagnostics/info` |  | Info de la API + endpoints |
| GET | `/api/diagnostics/ping` |  | Ping/pong |
| GET | `/api/health/db` || Test conexión BD |

---

##  DTOs — Contratos de la API

### Autenticación

```
LoginRequestDto
├── Email        (requerido, formato email)
└── Password     (requerido, mín 6 caracteres)

RegisterRequestDto
├── Name         (requerido, mín 3)
├── Email        (requerido, formato email)
├── Password     (requerido, mín 8)
└── RoleId       (default: 1)

LoginResponseDto
├── AccessToken  (JWT string)
├── TokenType    ("bearer")
├── ExpiresIn    (segundos)
└── User         (UserDto)

UserDto
├── Id, Name, Email
├── Role (string), RoleId (int)
├── IsActive
└── Permissions  (List<string>)
```

### Visitas

```
CreateVisitRequestDto
├── NamePersonToVisit  (requerido)
├── Department         (requerido)
├── DepartmentId       (opcional)
├── Building, Floor    (opcionales)
├── Reason             (opcional, máx 500)
├── MissionCase        (bool)
├── VehiclePlate       (opcional, regex validado)
├── PersonToVisitEmail (opcional)
├── AssignedCarnet     (opcional)
└── VisitorIds         (List<int>, opcional)

CloseVisitRequestDto
└── Observations       (opcional, máx 500)

VisitResponseDto
├── Id, NamePersonToVisit, Department
├── Building, Floor, Reason
├── StatusId, StatusName
├── MissionCase, VehiclePlate, AssignedCarnet
├── CreatedAt, EndAt, Duration (formateado)
├── IsActive, CreatorName, CloserName
└── Visitors (List<VisitorSummaryDto>)
```

### Visitantes

```
CreateVisitorRequestDto
├── IdentityDocument  (opcional)
├── DocumentType      (requerido: 1=Cédula, 2=Pasaporte, 3=SinID)
├── Name, LastName    (requeridos, máx 255)
├── Phone             (opcional, formato: 000-000-0000)
├── Email             (opcional, formato email)
└── Institution       (opcional, máx 255)

VisitorResponseDto
├── Id, IdentityDocument, DocumentType
├── Name, LastName, FullName
├── Phone, Email, Institution
└── CreatedAt
```

### Usuarios

```
CreateUserRequest
├── Name        (requerido, máx 255)
├── Email       (requerido, único)
├── Password    (requerido, mín 6)
└── RoleIds     (List<int>, al menos 1)

UserResponseDto
├── Id, Name, Email, IsActive
├── LastLoginAt, CreatedAt
└── Roles (List<RoleDto { Id, Name, Description }>)
```

### Estadísticas

```
DashboardStatsDto
├── TodayVisits, WeekVisits
├── ActiveVisits, DailyAverage

DailyTrendResponseDto
├── Dates  (List<string> YYYY-MM-DD)
└── Visits (List<int>)

DepartmentStatsResponseDto
├── Department, Visits, Percentage

DurationStatsResponseDto
├── Average, Min, Max (minutos)

HourlyPeakDto
├── Hour, Label, Visits

WeekdayAverageDto
├── Day (DayOfWeek), Label, Average

WeeklyCompareDto
├── Day, Label, Current, Previous, Change%
```

---

##  Frontend — Aplicación React

### Rutas y Navegación

| Ruta | Página | Protección | Roles Permitidos |
|------|--------|:----------:|-----------------|
| `/login` | Login | Pública | — |
| `/dashboard` | Dashboard |  | Todos los autenticados |
| `/visitors` | Visitantes |  | Todos los autenticados |
| `/visits` | Visitas |  | Todos los autenticados |
| `/reports` | Reportes |  | Admin, Analista |
| `/users` | Usuarios |  | Solo Admin |
| `/` | → `/dashboard` | Redirect | — |
| `*` | NotFound (404) | — | — |

### Stack de Providers

```
ThemeProvider (claro/oscuro)
  └── SidebarProvider (sidebar colapsable)
       └── AuthProvider (JWT + usuario)
            └── BrowserRouter (React Router)
                 └── Toaster (notificaciones)
```

### Sistema de Permisos (Hook `usePermissions`)

| Permiso | Admin | Recepción | Analista |
|---------|:-----:|:---------:|:--------:|
| `canAccessUsers` | ✅ | ❌ | ❌ |
| `canAccessReports` | ✅ | ❌ | ✅ |
| `canViewVisitors/Visits` | ✅ | ✅ | ✅ |
| `canCreateVisitors/Visits` | ✅ | ✅ | ✅ |
| `canEditVisitors/Visits` | ✅ | ✅ | ✅ |
| `canDeleteVisitors/Visits` | ✅ | ✅ | ✅ |
| `canCloseVisits` | ✅ | ✅ | ✅ |
| `canExportData` | ✅ | ❌ | ✅ |

### Permisos del Backend por Rol

**Admin**: `manage_users`, `manage_roles`, `create_visitors`, `edit_visitors`, `delete_visitors`, `view_visitors`, `create_visits`, `view_all_visits`, `edit_visits`, `delete_visits`, `close_visits`, `export_data`, `view_reports`, `manage_settings`

**Recepción**: `create_visitors`, `edit_visitors`, `delete_visitors`, `view_visitors`, `create_visits`, `view_all_visits`, `edit_visits`, `delete_visits`, `close_visits`

**Analista**: Todo lo de Recepción + `export_data`, `view_reports`

### Componentes Principales

| Componente | Descripción |
|-----------|-------------|
| `Layout` | Wrapper con Navbar + Sidebar + área de contenido |
| `Navbar` | Header con nombre app, tema, info usuario, logout |
| `Sidebar` | Menú de navegación con colapso e indicador de ruta activa |
| `ProtectedRoute` | Guard de ruta que verifica autenticación y roles |
| `KPICards` | 4 tarjetas: visitas hoy, semana, activas, total visitantes |
| `VisitChart` | Gráfico pie de visitas por departamento (Recharts) |
| `ActiveVisitsTable` | Tabla de visitas abiertas actualmente |
| `RecentVisitorsWidget` | Lista de últimos visitantes registrados |
| `VisitorTable` / `VisitorForm` | CRUD completo de visitantes |
| `VisitTable` / `VisitForm` | CRUD completo de visitas con autocompletado |
| `VisitorAutocomplete` | Dropdown de búsqueda de visitantes existentes |
| `UserFormModal` | Crear/editar usuarios con asignación de roles |
| `Modal` / `ConfirmDialog` / `SearchBar` / `LoadingSpinner` | Componentes comunes reutilizables |

### Flujo de Autenticación

1. Usuario ingresa credenciales en `Login.tsx`
2. `AuthContext.login()` → `POST /api/auth/login`
3. Token JWT y datos de usuario se guardan en `localStorage`
4. Interceptor de Axios agrega `Authorization: Bearer {token}` a todas las peticiones
5. En respuesta 401, se limpian datos y se redirige a `/login`

### Variables de Entorno

| Variable | Desarrollo | Producción |
|----------|-----------|------------|
| `VITE_API_BASE_URL` | `http://localhost:5125/api/` | `https://gestion-visitas-api-*.azurewebsites.net/` |
| `VITE_APP_NAME` | Gestión de Visitas | Gestión de Visitas |

---

##  Simulador de Tráfico

Bot autónomo que genera datos históricos realistas para poblar el sistema con tráfico simulado de visitantes.

### Qué Hace

Simula el comportamiento de una recepción empresarial dominicana real, ejecutándose en un ciclo infinito día tras día:

- Llegadas de visitantes durante horario laboral (8 AM - 6 PM)
- Grupos de 1-4 personas con distribución realista
- Datos dominicanos: nombres, cédulas con dígito verificador, placas, teléfonos (809/829/849)
- Patrones de tráfico variable por bloques horarios
- Duración de visitas con distribución normal (5-180 min, media ~45 min)
- 5% de visitas quedan sin cerrar (comportamiento realista)
- Auto-refresh de token JWT preventivo

### Bloques de Tráfico

| Bloque | Horario | Peso | Descripción |
|--------|---------|:----:|-------------|
| Mañana | 8:00 - 9:30 | 3.0 | Alta demanda, rush matutino |
| Media mañana | 9:30 - 12:00 | 1.5 | Flujo normal |
| Almuerzo | 12:00 - 1:30 | 0.5 | Baja actividad |
| Tarde | 1:30 - 4:30 | 1.5 | Flujo normal |
| Tarde final | 4:30 - 6:00 | 0.8 | Baja, más cierres |

### Distribución de Datos

| Característica | Distribución |
|---------------|-------------|
| Tiene cédula | 85% |
| Tiene pasaporte | 10% |
| Sin identificación | 5% |
| 1 visitante | 60% |
| 2 visitantes | 25% |
| 3 visitantes | 10% |
| 4 visitantes | 5% |
| Tiene vehículo | 15% |
| Caso misional | 5% |
| Tiene email | 30% |
| Visita sin cerrar | 5% |

### Resultado Esperado (velocidad 1.0x)

- **~50 visitas por día**
- **~250 visitas por semana**
- **~1,000 visitas por mes**

### Configuración

| Variable | Requerida | Default | Descripción |
|----------|:---------:|---------|-------------|
| `API_BASE_URL` | ✅ | — | URL del backend |
| `AUTH_EMAIL` | ✅ | — | Email del usuario simulador |
| `AUTH_PASSWORD` | ✅ | — | Contraseña |
| `SIMULATION_SPEED` | ❌ | `1.0` | Aceleración (10.0 = 10x más rápido) |
| `UNCLOSED_VISIT_PROBABILITY` | ❌ | `0.05` | Fracción de visitas sin cerrar |
| `TZ` | ❌ | `America/Santo_Domingo` | Zona horaria |
| `LOG_LEVEL` | ❌ | `info` | Nivel de logging |

### Uso Local

```bash
cd simulador
npm install
cp .env.example .env    # Editar con credenciales locales
npm run dev             # Ejecutar con ts-node
```

### Despliegue Azure WebJob

```bash
cd simulador
.\build-webjob.ps1      # Genera webjob.zip
```

Subir a Azure Portal:
1. **App Service** → Settings → WebJobs → Add
2. **Name**: `GestionVisitaSimulator`
3. **File**: `webjob.zip`
4. **Type**: Continuous
5. **Scale**: Single Instance
6. Configurar variables de entorno en App Service → Configuration

Ver guía detallada: [`simulador/DEPLOYMENT.md`](simulador/DEPLOYMENT.md)

---

##  Seguridad

### Autenticación y Autorización
- **JWT Bearer** con claims: userId, email, name, role, role_id, is_active
- **Algoritmo**: HS256 con clave secreta configurable
- **Expiración**: 60 min (producción) / 120 min (desarrollo)
- **PBKDF2 + SHA256**: 100,000 iteraciones + salt aleatorio de 32 bytes
- **Roles**: Admin, Recepción, Analista con permisos granulares
- **SSO Microsoft 365**: Preparado con Azure AD + Microsoft Graph

### Headers de Seguridad (OWASP)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Protección de Datos
- HTTPS obligatorio (redirect middleware)
- CORS configurado con orígenes específicos
- Foreign key constraints con Restrict/SetNull/Cascade
- Índices únicos en Email, IdentityDocument, Role Name
- No se exponen stack traces en producción

### Auditoría
- Todas las acciones registradas automáticamente en `AuditLog`
- Severidad clasificada: Low, Medium, High, Critical
- Tracking de IP y User Agent en cada petición
- Detección de incidentes de seguridad (login fallidos, 401s)
- Tags JSON para categorización (security, login_failed, etc.)

---

##  Middlewares Personalizados

Ejecutados en orden secuencial en cada petición:

| # | Middleware | Función |
|:-:|-----------|---------|
| 1 | `ExceptionHandlingMiddleware` | Captura excepciones no controladas y mapea a códigos HTTP: `UnauthorizedAccess→401`, `KeyNotFound→404`, `Argument→400`, `Default→500`. Respuesta JSON con timestamp. |
| 2 | `SecurityHeadersMiddleware` | Agrega headers OWASP: CSP, X-Frame-Options DENY, X-XSS-Protection, Referrer-Policy, Permissions-Policy. |
| 3 | `PerformanceMonitoringMiddleware` | Mide duración de requests. Log WARNING si >1s, CRITICAL si >3s. Agrega header `X-Response-Time-Ms`. |
| 4 | `RequestLoggingMiddleware` | Genera requestId (8 chars GUID). Log de inicio y fin con método, path y status code. Trazabilidad. |
| 5 | `AuditMiddleware` | Log automático de todas las acciones (excepto health/diagnostics/swagger). Captura: userId, action, resource, IP, UA, status, duration. Mapeo de severidad por código HTTP. |

---

##  Monitoreo y Logging

### Logging Estructurado (Serilog)

**Sinks configurados:**
- Consola (desarrollo y producción)
- Archivos rotativos diarios (`Backend/Logs/log-{date}.txt`)
- PostgreSQL (sink disponible)
- Azure Application Insights (producción)

**Niveles por ambiente:**
- **Desarrollo**: Debug para aplicación, Information para ASP.NET/EF
- **Producción**: Information para aplicación, Warning para framework

### Performance Monitoring

| Métrica | Umbral | Acción |
|---------|--------|--------|
| Duración request | > 1,000ms | Log WARNING |
| Duración request | > 3,000ms | Log CRITICAL |
| Conexión BD | Fallo | Retry (5 intentos) |

### Caché

| Dato | TTL | Storage |
|------|-----|---------|
| KPIs Dashboard | 5 min | Redis (prod) / Memory (dev) |
| Visitas Activas | 1 min | Redis (prod) / Memory (dev) |
| Estadísticas | 5 min | Redis (prod) / Memory (dev) |

---

##  Instalación y Configuración

### Requisitos Previos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) y npm
- [PostgreSQL 14+](https://www.postgresql.org/download/) o SQL Server (desarrollo)
- (Opcional) [Redis](https://redis.io/download/) para caché en producción

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/GestionVisita.git
cd GestionVisita
```

### 2. Configurar Backend

```bash
cd Backend
dotnet restore
```

Editar `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=gestion_visitas;Username=tu_usuario;Password=tu_password"
  },
  "JwtSettings": {
    "SecretKey": "TU_SECRET_KEY_MINIMO_32_CARACTERES_AQUI",
    "Issuer": "GestionVisitasAPI",
    "Audience": "GestionVisitasApp",
    "ExpiryMinutes": 120
  },
  "CorsSettings": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

Aplicar migraciones y ejecutar:
```bash
dotnet ef database update
dotnet run
# API disponible en: http://localhost:5125
```

### 3. Configurar Frontend

```bash
cd Frontend
npm install
```

Crear `.env.development`:
```env
VITE_API_BASE_URL=http://localhost:5125/api/
VITE_APP_NAME=Gestión de Visitas
```

Ejecutar:
```bash
npm run dev
# App disponible en: http://localhost:5173
```

### 4. (Opcional) Ejecutar Simulador

```bash
cd simulador
npm install
cp .env.example .env
# Editar .env con credenciales
npm run dev
```

---

##  Usuarios por Defecto

| Rol | Email | Password |
|-----|-------|----------|
| Administrador | `admin@conani.gob.do` | `Admin123!` |
| Recepcionista | `recepcion@conani.gob.do` | `Recepcion123!` |

---

##  Despliegue en Producción
##  Despliegue en Producción

### Backend — Azure App Service

**`appsettings.Production.json`:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=supabase-host;Database=postgres;Username=user;Password=pass;Pooling=true"
  },
  "JwtSettings": {
    "SecretKey": "CLAVE_SECRETA_PRODUCCION_MUY_SEGURA",
    "ExpiryMinutes": 60
  },
  "CorsSettings": {
    "AllowedOrigins": ["https://gestion-visita.vercel.app"]
  },
  "CacheSettings": {
    "RedisConnection": "tu-redis.cache.windows.net:6380,password=...,ssl=True"
  },
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=..."
  }
}
```

```bash
cd Backend
dotnet publish -c Release
# Deploy carpeta publish/ a Azure App Service
```

### Frontend — Vercel

```bash
cd Frontend
npm run build
# Archivos en /dist listos para deploy
# vercel.json configura SPA rewrites automáticamente
```

### Simulador — Azure WebJob

```bash
cd simulador
.\build-webjob.ps1
# Subir webjob.zip como Continuous WebJob en Azure Portal
```

### Configuración de Email (Producción)

```json
{
  "EmailSettings": {
    "FromEmail": "noreply@gestionvisitas.com",
    "SmtpHost": "smtp.office365.com",
    "SmtpPort": 587,
    "EnableSsl": true
  }
}
```

### Configuración de Almacenamiento

```json
{
  "FileStorage": {
    "QrCodesPath": "wwwroot/qrcodes",
    "ExportsPath": "wwwroot/exports",
    "MaxFileSizeMB": 5
  }
}
```

---

##  Roadmap

- [ ] Implementar SSO con Microsoft 365 (Azure AD configurado)
- [ ] Notificaciones push en tiempo real
- [ ] App móvil (React Native)
- [ ] Tests automatizados (>80% cobertura)
- [ ] Docker Compose para desarrollo
- [ ] CI/CD con GitHub Actions

---

##  Autor

**Jose Miguel Moquete Sierra**

-  Email: josemiguelmoquete2@gmail.com
-  LinkedIn: [linkedin.com/in/tuusuario](https://linkedin.com/in/tuusuario)
-  Portfolio: [tuportfolio.com](https://tuportfolio.com)
-  WhatsApp: (829) 945-2220
-  Email: josemiguelmoquete2@gmail.com
-  LinkedIn: [linkedin.com/in/tuusuario](https://linkedin.com/in/tuusuario)
-  Portfolio: [tuportfolio.com](https://tuportfolio.com)
-  WhatsApp: (829) 945-2220

---


##  Recursos Adicionales

- [Documentación ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Documentación React](https://react.dev/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [TailwindCSS](https://tailwindcss.com/docs)

---
