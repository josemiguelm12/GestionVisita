# Sistema de Gestión de Visitas Institucionales

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Sistema completo de gestión de visitas institucionales con arquitectura empresarial, autenticación JWT y monitoreo avanzado.

---

##  Vista Previa

<!-- TODO: Agregar screenshots -->
```
[Screenshot 1: Dashboard]
[Screenshot 2: Login]
[Screenshot 3: Gestión de Visitas]
```

---

##  Características Principales

### Seguridad
- Autenticación JWT con claims personalizados
- Autorización basada en roles
- Audit trail completo de acciones
- IP tracking y user agent logging
- Security headers middleware

### Funcionalidades
- CRUD completo de visitas y visitantes
- Dashboard con estadísticas en tiempo real
- Búsqueda y filtros avanzados
- Paginación server-side
- Gestión de carnets y vehículos
- Clasificación misional/no misional
- Soft delete para trazabilidad

### Arquitectura
- Clean Architecture
- Repository Pattern
- Dependency Injection
- DTOs para transferencia de datos
- Custom Middlewares (5 diferentes)
- Exception Handling global

### Performance & Monitoreo
- Caché distribuido (Redis + InMemory fallback)
- Logging estructurado con Serilog
- Performance monitoring middleware
- Azure Application Insights (producción)
- Retry logic con Polly

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| ASP.NET Core | 8.0 | Framework Web API |
| Entity Framework Core | 8.0 | ORM |
| PostgreSQL | 16+ | Base de datos |
| JWT Bearer | 8.0 | Autenticación |
| Serilog | 3.x | Logging |
| Redis | 7.x | Caché distribuido |
| Polly | 8.x | Resiliencia |

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| React Router | 6.x | Navegación |
| Axios | 1.x | HTTP Client |

---

## Estructura del Proyecto

```
GestionVisita/
├── Backend/
│   ├── Controllers/          # API Controllers
│   ├── Services/             # Lógica de negocio
│   ├── Repositories/         # Acceso a datos
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Models/               # Entidades de BD
│   ├── Data/                 # DbContext
│   ├── Helpers/              # Utilidades (JWT, etc.)
│   ├── Middlewares/          # Custom middlewares
│   └── Migrations/           # EF Migrations
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas/Vistas
│   │   ├── services/         # API calls
│   │   ├── context/          # Context API
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   └── public/
│
├── Simulador/                #  Bot de simulación de tráfico
│   ├── src/
│   │   ├── config/           # Configuración
│   │   ├── types/            # TypeScript definitions
│   │   ├── services/         # HTTP Client + Logger
│   │   ├── generators/       # Generadores de datos
│   │   └── simulation/       # Motor de simulación
│   ├── build-webjob.ps1      # Script de build
│   ├── DEPLOYMENT.md         # Guía Azure WebJob
│   └── README.md
│
└── README.md
```

---

## 🤖 Simulador de Tráfico

El proyecto incluye un **simulador de tráfico realista** para generar datos históricos:

### ¿Qué hace?

Simula el comportamiento de una recepción empresarial real:
- Llegadas de visitantes durante horario laboral (8 AM - 6 PM)
- Grupos de 1-4 personas
- Datos dominicanos realistas (nombres, cédulas, placas)
- Patrones de carga variable (picos en mañana, baja a mediodía)
- Duración de visitas con distribución normal (5-180 min)
- 5% de visitas olvidan cerrarse (comportamiento realista)

### Stack Técnico

- **Node.js 18+** con TypeScript
- **Axios** para HTTP
- **Dayjs** para manejo de fechas
- **Faker.js** para datos realistas

### Uso Rápido

```bash
cd Simulador

# Desarrollo local
npm install
cp .env.example .env
# Edita .env con tu API local
npm run dev

# Build para Azure WebJob
.\build-webjob.ps1
# Sube webjob.zip a Azure Portal
```

### Deployment a Azure

El simulador se despliega como **Azure WebJob Continuous** en el mismo App Service del backend:

```
App Service → WebJobs → Add
- Name: GestionVisitaSimulator
- File: webjob.zip
- Type: Continuous
- Scale: Single Instance
```

 **Ver guía completa**: [`simulador/DEPLOYMENT.md`](simulador/DEPLOYMENT.md)

### Configuración

Variables de entorno en Azure App Service:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_BASE_URL` | URL del backend | `https://tu-api.azurewebsites.net` |
| `AUTH_EMAIL` | Usuario simulador | `recepcion@example.com` |
| `AUTH_PASSWORD` | Contraseña | `Password123!` |
| `SIMULATION_SPEED` | Velocidad (1.0 = real time) | `1.0` |
| `UNCLOSED_VISIT_PROBABILITY` | % visitas sin cerrar | `0.05` |

### Resultado Esperado

Con velocidad `1.0` (tiempo real):
- **~50 visitas por día**
- **~250 visitas por semana**
- **~1000 visitas por mes**

Suficiente para dashboards y reportes con datos significativos.

---

##  Requisitos Previos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) y npm/yarn
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- (Opcional) [Redis](https://redis.io/download/) para caché

---

##  Instalación y Configuración

### 1️ Clonar el Repositorio
```bash
git clone https://github.com/tuusuario/GestionVisita.git
cd GestionVisita
```

### 2️ Configurar Backend

#### a) Restaurar dependencias
```bash
cd Backend
dotnet restore
```

#### b) Configurar `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=gestion_visitas;Username=tu_usuario;Password=tu_password"
  },
  "JwtSettings": {
    "SecretKey": "TU_SECRET_KEY_AQUI_MIN_32_CARACTERES",
    "Issuer": "GestionVisitaAPI",
    "Audience": "GestionVisitaClient",
    "ExpirationMinutes": 60
  },
  "CorsSettings": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

#### c) Crear base de datos
```bash
# Aplicar migraciones
dotnet ef database update

# O crear migración inicial si es necesario
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### d) Ejecutar backend
```bash
dotnet run
# API disponible en: https://localhost:7001
```

### 3️ Configurar Frontend

#### a) Instalar dependencias
```bash
cd ../Frontend
npm install
# o
yarn install
```

#### b) Configurar variables de entorno
Crear archivo `.env`:
```env
VITE_API_URL=https://localhost:7001/api
```

#### c) Ejecutar frontend
```bash
npm run dev
# o
yarn dev
# Aplicación disponible en: http://localhost:5173
```

---

##  Usuarios por Defecto

```javascript
// Administrador
Email: admin@conani.gob.do
Password: Admin123!

// Recepcionista
Email: recepcion@conani.gob.do
Password: Recepcion123!
```

---

##  Endpoints Principales

### Autenticación
```http
POST   /api/auth/login          # Login
POST   /api/auth/register        # Registro
GET    /api/auth/me             # Usuario actual
POST   /api/auth/logout         # Logout
GET    /api/auth/check          # Verificar token
```

### Visitas
```http
GET    /api/visit                     # Listar visitas (paginado)
GET    /api/visit/{id}                # Obtener visita
POST   /api/visit                     # Crear visita
PUT    /api/visit/{id}                # Actualizar visita
DELETE /api/visit/{id}                # Eliminar visita
GET    /api/visit/active              # Visitas activas
GET    /api/visit/stats/dashboard     # Estadísticas
```

### Visitantes
```http
GET    /api/visitor                   # Listar visitantes
GET    /api/visitor/{id}              # Obtener visitante
POST   /api/visitor                   # Crear visitante
PUT    /api/visitor/{id}              # Actualizar visitante
```

---

##  Testing

```bash
# Backend
cd Backend
dotnet test

# Frontend
cd Frontend
npm run test
```

---

##  Despliegue en Producción

### Configuraciones Adicionales

#### Backend (`appsettings.Production.json`)
```json
{
  "CacheSettings": {
    "RedisConnection": "tu-servidor-redis:6379"
  },
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    }
  }
}
```

#### Frontend
```bash
npm run build
# Archivos en /dist listos para deploy
```

---

##  Middlewares Personalizados

| Middleware | Función | Orden |
|-----------|---------|-------|
| `ExceptionHandlingMiddleware` | Manejo global de errores | 1 |
| `SecurityHeadersMiddleware` | Headers de seguridad | 2 |
| `PerformanceMonitoringMiddleware` | Métricas de rendimiento | 3 |
| `RequestLoggingMiddleware` | Logging de requests | 4 |
| `AuditMiddleware` | Auditoría de acciones | 5 |

---

##  Características de Seguridad

-  **JWT Authentication**: Tokens firmados con HS256
-  **CORS**: Orígenes permitidos configurables
-  **Audit Logging**: Registro de todas las acciones críticas
-  **Exception Handling**: Sin exposición de stack traces
-  **Security Headers**: HSTS, XSS Protection, etc.
-  **IP Tracking**: Registro de IPs en autenticación

---

##  Monitoreo y Logging

### Logs disponibles:
```
Backend/Logs/
├── log-20240203.txt         # Logs del día
├── log-20240202.txt
└── ...
```

### Estructura de logs:
```json
{
  "Timestamp": "2024-02-03T10:30:45",
  "Level": "Information",
  "Message": "Usuario admin@conani.gob.do autenticado",
  "Properties": {
    "UserId": 1,
    "IPAddress": "192.168.1.100",
    "UserAgent": "Mozilla/5.0..."
  }
}
```

---

##  Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

##  Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

##  Autor

**Jose Miguel Moquete Sierra**

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



** Si este proyecto te fue útil, considera darle una estrella **

Desarrollado con  por Jose Miguel Moquete Sierra

</div>
