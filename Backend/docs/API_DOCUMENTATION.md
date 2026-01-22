# 📚 DOCUMENTACIÓN BACKEND - API GESTIÓN DE VISITAS

**Última Actualización:** 2026-01-22  
**Framework:** ASP.NET Core 8  
**Base de Datos:** SQL Server  
**URL Base:** `https://localhost:5125/api`

---

## 📖 ÍNDICE

1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Modelos de Datos](#modelos-de-datos)
5. [Endpoints API](#endpoints-api)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [DTOs (Data Transfer Objects)](#dtos)
8. [Guía para Desarrolladores Frontend](#guía-para-frontend)
9. [Testing y Ejemplos](#testing-y-ejemplos)

---

## 🎯 INTRODUCCIÓN

Sistema de gestión de visitas desarrollado en **ASP.NET Core 8** con las siguientes características:

### ✨ Características Principales
- 🔐 **Autenticación JWT** - Sistema seguro de autenticación
- 👥 **Gestión de Visitantes** - CRUD completo de visitantes
- 📋 **Gestión de Visitas** - Registro y seguimiento de visitas
- 📊 **Dashboard con Estadísticas** - KPIs y reportes en tiempo real
- 🔍 **Auditoría Completa** - Sistema de logs de todas las operaciones
- 🚀 **Cache Distribuido** - Optimización de rendimiento
- 📱 **API RESTful** - Endpoints bien estructurados

### 🛠️ Stack Tecnológico
- ASP.NET Core 8
- Entity Framework Core 8
- SQL Server
- JWT Authentication
- Serilog (Logging)
- AutoMapper
- StackExchange.Redis (Cache)

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Patrón de Arquitectura
El proyecto sigue el patrón **Repository + Service + Controller**:

```
Cliente (Frontend)
    ↓
Controllers (API Endpoints)
    ↓
Services (Lógica de Negocio)
    ↓
Repositories (Acceso a Datos)
    ↓
Database Context (Entity Framework)
    ↓
SQL Server
```

### Capas del Proyecto

1. **Controllers**: Endpoints HTTP que reciben requests
2. **Services**: Lógica de negocio y reglas de aplicación
3. **Repositories**: Acceso a datos y queries
4. **Models**: Entidades de base de datos
5. **DTOs**: Objetos de transferencia de datos
6. **Middleware**: Interceptores de requests (logging, error handling, etc.)

---

## 📁 ESTRUCTURA DE CARPETAS

```
GestionVisitaAPI/
│
├── 📂 Controllers/              # Endpoints API
│   ├── AuthController.cs        # Autenticación y autorización
│   ├── VisitorController.cs     # Gestión de visitantes
│   ├── VisitController.cs       # Gestión de visitas
│   ├── StatsController.cs       # Estadísticas y reportes
│   └── DiagnosticsController.cs # Health checks
│
├── 📂 Services/                 # Lógica de negocio
│   ├── AuthService.cs           # Login, JWT, validación
│   ├── VisitorService.cs        # Operaciones de visitantes
│   ├── VisitService.cs          # Operaciones de visitas
│   ├── ExportService.cs         # Exportación Excel/PDF
│   └── CacheService.cs          # Gestión de caché
│
├── 📂 Repositories/             # Acceso a datos
│   ├── Interfaces/
│   │   ├── IRepository.cs       # Interfaz genérica
│   │   ├── IVisitorRepository.cs
│   │   ├── IVisitRepository.cs
│   │   ├── IUserRepository.cs
│   │   └── IAuditLogRepository.cs
│   └── Implementations/
│       ├── Repository.cs        # Implementación genérica
│       ├── VisitorRepository.cs
│       ├── VisitRepository.cs
│       ├── UserRepository.cs
│       └── AuditLogRepository.cs
│
├── 📂 Models/                   # Entidades de BD
│   ├── BaseEntity.cs            # Clase base con timestamps
│   ├── User.cs                  # Usuarios del sistema
│   ├── Role.cs                  # Roles (Admin, Guardia, etc.)
│   ├── Visitor.cs               # Visitantes
│   ├── Visit.cs                 # Visitas
│   ├── VisitVisitor.cs          # Relación many-to-many
│   ├── VisitStatusEntity.cs     # Estados de visitas
│   └── AuditLog.cs              # Logs de auditoría
│
├── 📂 DTOs/                     # Data Transfer Objects
│   ├── Auth/
│   │   ├── LoginRequestDto.cs
│   │   ├── LoginResponseDto.cs
│   │   └── UserDto.cs
│   ├── Visitor/
│   │   ├── CreateVisitorRequestDto.cs
│   │   ├── UpdateVisitorRequestDto.cs
│   │   └── VisitorResponseDto.cs
│   ├── Visit/
│   │   ├── CreateVisitRequestDto.cs
│   │   ├── UpdateVisitRequestDto.cs
│   │   ├── CloseVisitRequestDto.cs
│   │   └── VisitResponseDto.cs
│   └── Stats/
│       ├── DashboardStatsDto.cs
│       └── DailyTrendResponseDto.cs
│
├── 📂 Middleware/               # Interceptores HTTP
│   ├── ExceptionHandlingMiddleware.cs    # Manejo global de errores
│   ├── RequestLoggingMiddleware.cs       # Log de requests
│   ├── AuditMiddleware.cs                # Auditoría automática
│   ├── PerformanceMonitoringMiddleware.cs # Monitoreo de performance
│   └── SecurityHeadersMiddleware.cs      # Headers de seguridad
│
├── 📂 Data/                     # Configuración de BD
│   ├── ApplicationDbContext.cs  # DbContext principal
│   └── ApplicationDbContextFactory.cs # Para migraciones
│
├── 📂 Helpers/                  # Utilidades
│   ├── JwtHelper.cs             # Generación y validación JWT
│   └── PasswordHelper.cs        # Hash de contraseñas
│
├── 📂 Enums/                    # Enumeraciones
│   ├── DocumentType.cs          # Tipos de documento
│   ├── VisitStatus.cs           # Estados de visita
│   └── AuditSeverity.cs         # Niveles de auditoría
│
├── 📂 Migrations/               # Migraciones EF Core
│   └── ...                      # Archivos de migración
│
├── 📂 Logs/                     # Archivos de log
│   └── log-YYYYMMDD.txt
│
├── Program.cs                   # Punto de entrada
├── appsettings.json             # Configuración
└── appsettings.Development.json # Configuración desarrollo
```

---

## 💾 MODELOS DE DATOS

### 1. User (Usuario)
```csharp
{
  "id": int,
  "name": string,
  "email": string,
  "passwordHash": string,
  "roleId": int,
  "role": Role,
  "isActive": bool,
  "createdAt": DateTime,
  "updatedAt": DateTime?
}
```

### 2. Role (Rol)
```csharp
{
  "id": int,
  "name": string,           // Admin, Guardia, Asist_adm, aux_ugc
  "description": string,
  "permissions": string[]
}
```

### 3. Visitor (Visitante)
```csharp
{
  "id": int,
  "identityDocument": string?,    // Cédula, pasaporte
  "documentType": DocumentType,   // 1=Cedula, 2=Pasaporte, 3=SinIdentificacion
  "name": string,
  "lastName": string,
  "phone": string?,
  "email": string?,
  "institution": string?,
  "createdAt": DateTime,
  "updatedAt": DateTime?
}
```

### 4. Visit (Visita)
```csharp
{
  "id": int,
  "namePersonToVisit": string,    // Persona a visitar
  "department": string,            // Departamento
  "building": int?,                // Edificio
  "floor": int?,                   // Piso
  "reason": string?,               // Motivo
  "missionCase": bool,             // ¿Es caso misional?
  "vehiclePlate": string?,         // Placa del vehículo
  "personToVisitEmail": string?,
  "assignedCarnet": int?,          // Carnet asignado
  "status": VisitStatus,           // Active, Closed
  "createdAt": DateTime,           // Hora de entrada
  "endAt": DateTime?,              // Hora de salida
  "createdBy": int,                // Usuario que registró
  "visitors": Visitor[]            // Lista de visitantes
}
```

### 5. VisitStatusEntity (Estado de Visita)
```csharp
{
  "id": int,
  "name": string,              // "Active", "Closed", "Cancelled"
  "description": string
}
```

### 6. AuditLog (Log de Auditoría)
```csharp
{
  "id": int,
  "userId": int?,
  "action": string,            // "Login", "Create", "Update", "Delete"
  "entityName": string?,       // "Visitor", "Visit"
  "entityId": string?,
  "changes": string?,          // JSON con cambios
  "ipAddress": string?,
  "userAgent": string?,
  "severity": AuditSeverity,   // Info, Warning, Error, Critical
  "timestamp": DateTime
}
```

---

## 🔌 ENDPOINTS API

### Base URL
```
https://localhost:5125/api
```

---

## 🔐 AUTENTICACIÓN

### POST /api/auth/login
Iniciar sesión y obtener token JWT

**Request:**
```json
{
  "email": "admin@gestionvisitas.com",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "Administrador Sistema",
    "email": "admin@gestionvisitas.com",
    "role": "Admin",
    "roleId": 1,
    "isActive": true,
    "permissions": ["manage_users", "manage_roles", ...]
  }
}
```

---

### GET /api/auth/me
Obtener información del usuario autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Administrador Sistema",
    "email": "admin@gestionvisitas.com",
    "role": "Admin",
    "roleId": 1,
    "isActive": true,
    "permissions": [...]
  }
}
```

---

### POST /api/auth/logout
Cerrar sesión

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### GET /api/auth/check
Verificar validez del token

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "valid": true,
  "userId": "1",
  "email": "admin@gestionvisitas.com"
}
```

---

## 👥 VISITANTES (VISITOR)

### GET /api/visitor
Listar todos los visitantes

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "identityDocument": "402-1234567-8",
    "documentType": 1,
    "name": "Juan",
    "lastName": "Pérez",
    "phone": "809-555-1234",
    "email": "juan@example.com",
    "institution": "Empresa ABC",
    "createdAt": "2026-01-22T10:00:00Z"
  }
]
```

---

### GET /api/visitor/{id}
Obtener visitante por ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "identityDocument": "402-1234567-8",
    "documentType": 1,
    "name": "Juan",
    "lastName": "Pérez",
    "phone": "809-555-1234",
    "email": "juan@example.com",
    "institution": "Empresa ABC",
    "visits": [...]
  }
}
```

---

### GET /api/visitor/search?q={term}
Buscar visitantes

**Query Parameters:**
- `q` (string, required): Término de búsqueda

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Juan",
    "lastName": "Pérez",
    "identityDocument": "402-1234567-8"
  }
]
```

---

### GET /api/visitor/document/{document}
Buscar visitante por documento

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "identityDocument": "402-1234567-8",
    "name": "Juan",
    "lastName": "Pérez"
  }
}
```

---

### POST /api/visitor
Crear nuevo visitante

**Request:**
```json
{
  "identityDocument": "402-1234567-8",
  "documentType": 1,
  "name": "Juan",
  "lastName": "Pérez",
  "phone": "809-555-1234",
  "email": "juan@example.com",
  "institution": "Empresa ABC"
}
```

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "identityDocument": "402-1234567-8",
    "documentType": 1,
    "name": "Juan",
    "lastName": "Pérez",
    "phone": "809-555-1234",
    "email": "juan@example.com",
    "institution": "Empresa ABC"
  },
  "message": "Visitante creado exitosamente"
}
```

---

### PUT /api/visitor/{id}
Actualizar visitante

**Request:**
```json
{
  "identityDocument": "402-1234567-8",
  "documentType": 1,
  "name": "Juan",
  "lastName": "Pérez García",
  "phone": "809-555-9999",
  "email": "juan.nuevo@example.com",
  "institution": "Nueva Empresa"
}
```

**Response (200):**
```json
{
  "data": { ... },
  "message": "Visitante actualizado exitosamente"
}
```

---

### DELETE /api/visitor/{id}
Eliminar visitante

**Response (200):**
```json
{
  "message": "Visitante eliminado exitosamente"
}
```

---

## 📋 VISITAS (VISIT)

### GET /api/visit
Listar visitas con paginación y filtros

**Query Parameters:**
- `page` (int, default: 1): Página actual
- `per_page` (int, default: 15): Elementos por página
- `search` (string, optional): Búsqueda general
- `status_id` (int, optional): Filtrar por estado
- `department` (string, optional): Filtrar por departamento
- `date_from` (DateTime, optional): Fecha desde
- `date_to` (DateTime, optional): Fecha hasta
- `mission_case` (bool, optional): Solo casos misionales
- `has_vehicle` (bool, optional): Solo con vehículo

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "namePersonToVisit": "María González",
      "department": "Recursos Humanos",
      "building": 1,
      "floor": 2,
      "reason": "Reunión de trabajo",
      "missionCase": false,
      "vehiclePlate": "A123456",
      "status": "Active",
      "createdAt": "2026-01-22T10:00:00Z",
      "visitors": [...]
    }
  ],
  "pagination": {
    "total": 100,
    "per_page": 15,
    "current_page": 1,
    "last_page": 7
  }
}
```

---

### GET /api/visit/{id}
Obtener visita por ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "namePersonToVisit": "María González",
    "department": "Recursos Humanos",
    "building": 1,
    "floor": 2,
    "reason": "Reunión de trabajo",
    "missionCase": false,
    "vehiclePlate": "A123456",
    "assignedCarnet": 15,
    "status": "Active",
    "createdAt": "2026-01-22T10:00:00Z",
    "endAt": null,
    "visitors": [
      {
        "id": 1,
        "name": "Juan",
        "lastName": "Pérez",
        "identityDocument": "402-1234567-8"
      }
    ]
  }
}
```

---

### GET /api/visit/active
Obtener visitas activas

**Query Parameters:**
- `q` (string, optional): Búsqueda

**Response (200):**
```json
[
  {
    "id": 1,
    "namePersonToVisit": "María González",
    "department": "Recursos Humanos",
    "status": "Active",
    "createdAt": "2026-01-22T10:00:00Z",
    "visitors": [...]
  }
]
```

---

### GET /api/visit/active/mission
Obtener visitas misionales activas

**Response (200):**
```json
[
  {
    "id": 2,
    "namePersonToVisit": "Carlos López",
    "department": "Dirección",
    "missionCase": true,
    "status": "Active"
  }
]
```

---

### GET /api/visit/today
Obtener visitas de hoy

**Response (200):**
```json
[
  {
    "id": 1,
    "namePersonToVisit": "María González",
    "createdAt": "2026-01-22T10:00:00Z"
  }
]
```

---

### POST /api/visit
Crear nueva visita

**Request:**
```json
{
  "namePersonToVisit": "María González",
  "department": "Recursos Humanos",
  "building": 1,
  "floor": 2,
  "reason": "Reunión de trabajo",
  "missionCase": false,
  "vehiclePlate": "A123456",
  "personToVisitEmail": "maria.gonzalez@example.com",
  "sendEmail": true,
  "assignedCarnet": 15,
  "visitorIds": [1, 2]
}
```

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "namePersonToVisit": "María González",
    "department": "Recursos Humanos",
    "status": "Active",
    "createdAt": "2026-01-22T10:00:00Z",
    "visitors": [...]
  },
  "message": "Visita registrada exitosamente"
}
```

---

### POST /api/visit/{id}/close
Cerrar visita

**Request:**
```json
{
  "exitNotes": "Visita completada exitosamente"
}
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "status": "Closed",
    "createdAt": "2026-01-22T10:00:00Z",
    "endAt": "2026-01-22T12:00:00Z"
  },
  "message": "Visita cerrada exitosamente"
}
```

---

### PUT /api/visit/{id}
Actualizar visita

**Request:**
```json
{
  "namePersonToVisit": "María González Actualizada",
  "department": "Nuevo Departamento",
  "reason": "Motivo actualizado"
}
```

**Response (200):**
```json
{
  "data": { ... },
  "message": "Visita actualizada exitosamente"
}
```

---

## 📊 ESTADÍSTICAS (STATS)

### GET /api/stats/kpis
Obtener KPIs del dashboard

**Query Parameters:**
- `mission_only` (bool, optional): Solo datos misionales

**Response (200):**
```json
{
  "totalVisitsToday": 15,
  "activeVisitsCount": 8,
  "uniqueVisitorsCount": 245,
  "averageVisitDuration": 45.5,
  "topPurposes": [
    { "purpose": "Reunión", "count": 50 },
    { "purpose": "Entrevista", "count": 30 }
  ],
  "visitsByDepartment": [
    { "department": "RRHH", "count": 25 },
    { "department": "Legal", "count": 20 }
  ]
}
```

---

### GET /api/stats/daily
Obtener tendencia diaria de visitas

**Query Parameters:**
- `days` (int, default: 30): Días hacia atrás

**Response (200):**
```json
{
  "dates": ["2026-01-01", "2026-01-02", ...],
  "visits": [10, 15, 12, ...]
}
```

---

### GET /api/stats/visitors/frequent
Obtener visitantes frecuentes

**Query Parameters:**
- `limit` (int, default: 10): Límite de resultados

**Response (200):**
```json
[
  {
    "visitor": {
      "id": 1,
      "name": "Juan",
      "lastName": "Pérez"
    },
    "visitCount": 25
  }
]
```

---

### POST /api/stats/export
Exportar estadísticas (Excel/PDF)

**Request:**
```json
{
  "format": "excel",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31",
  "includeMissionOnly": false
}
```

**Response (200):**
Archivo Excel/PDF para descargar

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### Headers Requeridos

Todos los endpoints (excepto `/api/auth/login`) requieren autenticación JWT:

```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Tokens JWT

Los tokens tienen una duración de **1 hora** y contienen:
- `userId`: ID del usuario
- `email`: Email del usuario
- `role`: Rol del usuario
- `permissions`: Lista de permisos

### Roles y Permisos

**Admin** (roleId: 1)
- Acceso completo al sistema
- Gestión de usuarios
- Todas las operaciones CRUD

**Asist_adm** (roleId: 2)
- Gestión de visitas
- Gestión de visitantes
- Ver estadísticas

**Guardia** (roleId: 3)
- Registrar visitas
- Cerrar visitas
- Ver visitas activas

**aux_ugc** (roleId: 4)
- Ver estadísticas
- Exportar reportes

---

## 📤 DTOs (DATA TRANSFER OBJECTS)

### Convenciones de Nomenclatura

- `*RequestDto`: Datos de entrada (POST/PUT)
- `*ResponseDto`: Datos de salida (GET)
- `Create*RequestDto`: Crear nuevo recurso
- `Update*RequestDto`: Actualizar recurso existente

### Validaciones

Todos los DTOs incluyen validaciones usando **Data Annotations**:
- `[Required]`: Campo obligatorio
- `[EmailAddress]`: Validación de email
- `[StringLength(max)]`: Longitud máxima
- `[Range(min, max)]`: Rango numérico

---

## 🎯 GUÍA PARA DESARROLLADORES FRONTEND

### 1. Configuración Inicial

**Base URL:**
```typescript
const API_BASE_URL = 'https://localhost:5125/api';
```

**Configurar Axios:**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5125/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. Flujo de Autenticación

```typescript
// 1. Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken, user } = response.data;
  
  // Guardar token
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { accessToken, user };
};

// 2. Verificar token al cargar app
const checkAuth = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  try {
    await api.get('/auth/check');
    return true;
  } catch {
    localStorage.removeItem('accessToken');
    return false;
  }
};

// 3. Logout
const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};
```

---

### 3. Operaciones CRUD Comunes

**Listar Visitantes:**
```typescript
const getVisitors = async () => {
  const response = await api.get('/visitor');
  return response.data;
};
```

**Crear Visitante:**
```typescript
const createVisitor = async (data) => {
  const response = await api.post('/visitor', data);
  return response.data;
};
```

**Actualizar Visitante:**
```typescript
const updateVisitor = async (id, data) => {
  const response = await api.put(`/visitor/${id}`, data);
  return response.data;
};
```

**Eliminar Visitante:**
```typescript
const deleteVisitor = async (id) => {
  await api.delete(`/visitor/${id}`);
};
```

---

### 4. Manejo de Errores

```typescript
try {
  const data = await createVisitor(visitorData);
  // Éxito
} catch (error) {
  if (error.response) {
    // Error del servidor
    const { status, data } = error.response;
    
    if (status === 422) {
      // Errores de validación
      console.error(data.errors);
    } else if (status === 404) {
      console.error('Recurso no encontrado');
    } else if (status === 500) {
      console.error('Error del servidor');
    }
  } else {
    // Error de red
    console.error('Error de conexión');
  }
}
```

---

### 5. Paginación

```typescript
const getVisits = async (page = 1, perPage = 15, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...filters
  });
  
  const response = await api.get(`/visit?${params}`);
  return response.data;
};

// Uso
const { data, pagination } = await getVisits(1, 15, {
  search: 'Juan',
  department: 'RRHH',
  status_id: '1'
});
```

---

### 6. Tipos TypeScript Recomendados

```typescript
// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  isActive: boolean;
  permissions: string[];
}

// Visitor Types
export interface Visitor {
  id: number;
  identityDocument?: string;
  documentType: DocumentType;
  name: string;
  lastName: string;
  phone?: string;
  email?: string;
  institution?: string;
  createdAt: string;
}

export enum DocumentType {
  Cedula = 1,
  Pasaporte = 2,
  SinIdentificacion = 3
}

// Visit Types
export interface Visit {
  id: number;
  namePersonToVisit: string;
  department: string;
  building?: number;
  floor?: number;
  reason?: string;
  missionCase: boolean;
  vehiclePlate?: string;
  status: string;
  createdAt: string;
  endAt?: string;
  visitors: Visitor[];
}
```

---

## 🧪 TESTING Y EJEMPLOS

### Credenciales de Prueba

```
Email: admin@gestionvisitas.com
Password: Admin123!
```

### Ejemplo Completo: Registrar Visita

```typescript
// 1. Login
const { accessToken } = await login('admin@gestionvisitas.com', 'Admin123!');

// 2. Buscar o crear visitante
let visitor = await api.get('/visitor/document/402-1234567-8');

if (!visitor) {
  visitor = await api.post('/visitor', {
    identityDocument: '402-1234567-8',
    documentType: 1,
    name: 'Juan',
    lastName: 'Pérez',
    phone: '809-555-1234',
    email: 'juan@example.com',
    institution: 'Empresa ABC'
  });
}

// 3. Registrar visita
const visit = await api.post('/visit', {
  namePersonToVisit: 'María González',
  department: 'Recursos Humanos',
  building: 1,
  floor: 2,
  reason: 'Reunión de trabajo',
  missionCase: false,
  vehiclePlate: 'A123456',
  assignedCarnet: 15,
  visitorIds: [visitor.data.id]
});

// 4. Ver visita creada
console.log('Visita registrada:', visit.data);
```

---

### Ejemplo: Dashboard con Estadísticas

```typescript
// Obtener KPIs
const kpis = await api.get('/stats/kpis');

console.log('Visitas hoy:', kpis.data.totalVisitsToday);
console.log('Visitas activas:', kpis.data.activeVisitsCount);

// Obtener tendencia de últimos 30 días
const trend = await api.get('/stats/daily?days=30');

// Renderizar gráfica
renderChart(trend.data.dates, trend.data.visits);
```

---

### Ejemplo: Exportar Reportes

```typescript
// Exportar a Excel
const exportData = await api.post('/stats/export', {
  format: 'excel',
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31'
}, {
  responseType: 'blob'
});

// Descargar archivo
const url = window.URL.createObjectURL(new Blob([exportData.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'reporte-visitas.xlsx');
document.body.appendChild(link);
link.click();
```

---

## 📋 CÓDIGOS DE RESPUESTA HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | No tiene permisos |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable Entity | Errores de validación |
| 500 | Internal Server Error | Error del servidor |

---

## 🚀 CONFIGURACIÓN DEL PROYECTO

### Requisitos
- .NET 8 SDK
- SQL Server 2019+
- Visual Studio 2022 o VS Code

### Ejecutar el Proyecto

```powershell
# 1. Restaurar paquetes
dotnet restore

# 2. Actualizar base de datos
dotnet ef database update

# 3. Ejecutar API
dotnet run

# La API estará disponible en:
# https://localhost:5125
# http://localhost:5124
```

### Variables de Entorno

**appsettings.Development.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GestionVisitasDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-change-in-production",
    "Issuer": "GestionVisitaAPI",
    "Audience": "GestionVisitaClients",
    "ExpirationMinutes": 60
  }
}
```

---

## 📞 SOPORTE Y RECURSOS

### Documentación Adicional
- Swagger UI: `https://localhost:5125/swagger`
- Logs: `Backend/GestionVisitaAPI/GestionVisitaAPI/Logs/`

### Contacto
Para soporte técnico o preguntas sobre la API, consulta con el equipo de backend.

---

**Última actualización:** 2026-01-22  
**Versión:** 1.0.0  
**Autor:** Equipo de Desarrollo GestionVisita
