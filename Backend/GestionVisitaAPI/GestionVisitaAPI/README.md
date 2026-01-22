# ?? Sistema de Gestión de Visitas - ASP.NET Web API

Sistema completo de gestión de visitas migrado de Laravel + Vue.js a **ASP.NET 10 Web API + React + SQL Server**, preparado para **Azure**.

## ?? Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Prerequisitos](#prerequisitos)
- [Configuración Inicial](#configuración-inicial)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Despliegue en Azure](#despliegue-en-azure)

---

## ??? Tecnologías

### Backend
- **.NET 10** - Framework principal
- **Entity Framework Core 10** - ORM para SQL Server
- **SQL Server** - Base de datos relacional
- **JWT** - Autenticación
- **Microsoft Identity Platform** - SSO con Microsoft 365
- **Microsoft Graph API** - Integración con Office 365
- **Serilog** - Logging avanzado
- **AutoMapper** - Mapeo objeto-objeto
- **Swagger/OpenAPI** - Documentación de API

### Frontend (próximamente)
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS

### Azure Services
- **Azure SQL Database** - Base de datos
- **Azure App Service** - Hosting de API
- **Azure Static Web Apps** - Hosting de React
- **Azure Key Vault** - Gestión de secretos
- **Azure Cache for Redis** - Caché distribuido
- **Application Insights** - Monitoreo

---

## ? Prerequisitos

1. **.NET 10 SDK** - [Descargar](https://dotnet.microsoft.com/download/dotnet/10.0)
2. **SQL Server 2022** o **SQL Server Express** - [Descargar](https://www.microsoft.com/sql-server/sql-server-downloads)
3. **Visual Studio 2025** o **VS Code** con extensiones de C#
4. **Node.js 20+** (para el frontend React)
5. **Git**

### Herramientas Opcionales
- **SQL Server Management Studio (SSMS)** - Para gestionar BD
- **Azure CLI** - Para deployment
- **Docker** - Para contenedores

---

## ?? Configuración Inicial

### 1. Clonar el Repositorio

```powershell
git clone <url-del-repositorio>
cd GestionVisitaAPI
```

### 2. Restaurar Paquetes NuGet

```powershell
dotnet restore
```

### 3. Configurar Base de Datos

Edita `appsettings.Development.json` y configura tu conexión a SQL Server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GestionVisitas;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

**Opciones de conexión:**

- **Windows Authentication (recomendado para desarrollo local):**
  ```
  Server=localhost;Database=GestionVisitas;Trusted_Connection=True;TrustServerCertificate=True
  ```

- **SQL Server Authentication:**
  ```
  Server=localhost;Database=GestionVisitas;User ID=sa;Password=YourPassword;TrustServerCertificate=True
  ```

- **Azure SQL Database:**
  ```
  Server=tcp:your-server.database.windows.net,1433;Database=GestionVisitas;User ID=your-user;Password=your-password;Encrypt=True;TrustServerCertificate=False;
  ```

### 4. Configurar JWT Secret Key

En `appsettings.Development.json`, asegúrate de tener configurado un secreto JWT (al menos 32 caracteres):

```json
{
  "JwtSettings": {
    "SecretKey": "YOUR-SECRET-KEY-HERE-MINIMUM-32-CHARACTERS",
    "Issuer": "GestionVisitasAPI",
    "Audience": "GestionVisitasApp",
    "ExpiryMinutes": 120
  }
}
```

**?? IMPORTANTE:** En producción, almacena este secreto en **Azure Key Vault**.

---

## ??? Migraciones de Base de Datos

### 1. Instalar Entity Framework Tools (si no está instalado)

```powershell
dotnet tool install --global dotnet-ef
```

### 2. Crear la Base de Datos

```powershell
dotnet ef database update
```

Este comando:
1. ? Crea la base de datos `GestionVisitas`
2. ? Aplica todas las migraciones
3. ? Ejecuta el seed data (roles y estados de visita)

### 3. Verificar la Base de Datos

Conecta con SSMS y verifica que existan las siguientes tablas:

- `users`
- `roles`
- `role_user` (tabla pivot)
- `visits`
- `visitors`
- `visit_visitor` (tabla pivot)
- `visit_statuses`
- `audit_logs`

---

## ?? Ejecución del Proyecto

### Modo Desarrollo

```powershell
dotnet run
```

O con hot reload:

```powershell
dotnet watch run
```

La API estará disponible en:
- **HTTP:** `http://localhost:5000`
- **HTTPS:** `https://localhost:5001`
- **Swagger UI:** `https://localhost:5001/swagger`

### Modo Producción (Build)

```powershell
dotnet build --configuration Release
dotnet run --configuration Release
```

---

## ?? Estructura del Proyecto

```
GestionVisitaAPI/
??? Controllers/              # Controladores de la API
?   ??? AuthController.cs
?   ??? VisitController.cs
?   ??? VisitorController.cs
?   ??? StatsController.cs
?   ??? ...
??? Data/                     # Contexto de BD y migraciones
?   ??? ApplicationDbContext.cs
?   ??? ApplicationDbContextFactory.cs
??? DTOs/                     # Data Transfer Objects
?   ??? Auth/
?   ??? Visit/
?   ??? Visitor/
??? Enums/                    # Enumeraciones
?   ??? DocumentType.cs
?   ??? VisitStatus.cs
?   ??? AuditSeverity.cs
??? Models/                   # Entidades del dominio
?   ??? User.cs
?   ??? Role.cs
?   ??? Visit.cs
?   ??? Visitor.cs
?   ??? VisitStatusEntity.cs
?   ??? VisitVisitor.cs
?   ??? AuditLog.cs
??? Repositories/             # Repositorios de datos
?   ??? Interfaces/
?   ??? Implementations/
??? Services/                 # Lógica de negocio
?   ??? AuthService.cs
?   ??? VisitService.cs
?   ??? ExportService.cs
?   ??? LoggerService.cs
?   ??? MicrosoftGraphService.cs
??? Helpers/                  # Utilidades
?   ??? JwtHelper.cs
?   ??? ...
??? Middleware/               # Middlewares personalizados
?   ??? ...
??? Migrations/               # Migraciones de EF Core
??? appsettings.json          # Configuración
??? appsettings.Development.json
??? Program.cs                # Entry point
??? README.md
```

---

## ?? Despliegue en Azure

### 1. Crear Recursos en Azure

```powershell
# Login en Azure
az login

# Crear grupo de recursos
az group create --name rg-gestionvisitas --location eastus

# Crear SQL Database
az sql server create --name sql-gestionvisitas --resource-group rg-gestionvisitas --location eastus --admin-user sqladmin --admin-password YourPassword123!

az sql db create --resource-group rg-gestionvisitas --server sql-gestionvisitas --name GestionVisitas --service-objective S0

# Crear App Service
az appservice plan create --name plan-gestionvisitas --resource-group rg-gestionvisitas --sku B1

az webapp create --resource-group rg-gestionvisitas --plan plan-gestionvisitas --name api-gestionvisitas --runtime "DOTNET|10.0"
```

### 2. Configurar Connection String en Azure

```powershell
az webapp config connection-string set --resource-group rg-gestionvisitas --name api-gestionvisitas --connection-string-type SQLAzure --settings DefaultConnection="Server=tcp:sql-gestionvisitas.database.windows.net,1433;Database=GestionVisitas;User ID=sqladmin;Password=YourPassword123!;Encrypt=True;"
```

### 3. Configurar Variables de Entorno

```powershell
az webapp config appsettings set --resource-group rg-gestionvisitas --name api-gestionvisitas --settings JwtSettings__SecretKey="YOUR-PRODUCTION-SECRET-KEY"
```

### 4. Deploy desde Visual Studio

1. Click derecho en el proyecto ? **Publish**
2. Seleccionar **Azure**
3. Elegir tu **App Service**
4. Publicar

---

## ?? Seguridad

### Mejores Prácticas

1. ? **Nunca** commitear secretos en Git
2. ? Usar **Azure Key Vault** en producción
3. ? Habilitar **HTTPS** obligatorio
4. ? Implementar **rate limiting**
5. ? Validar **todos** los inputs
6. ? Usar **parameterized queries** (EF Core lo hace automáticamente)
7. ? Habilitar **CORS** solo para orígenes confiables

---

## ?? Próximos Pasos

- [ ] Implementar DTOs y AutoMapper profiles
- [ ] Crear repositorios e interfaces
- [ ] Implementar servicios de negocio
- [ ] Crear controladores de la API
- [ ] Configurar autenticación JWT
- [ ] Integrar Microsoft Graph API
- [ ] Implementar exportación a Excel/PDF
- [ ] Crear proyecto React frontend
- [ ] Configurar Azure deployment pipeline

---

## ?? Próximos Pasos

### **? Completado hasta ahora**

1. ? Configuración inicial del proyecto
2. ? Modelos y entidades con relaciones
3. ? DbContext con Fluent API
4. ? Repositorios (patrón Repository)
5. ? Helpers (JWT, Password)

### **?? En Progreso - Siguiente Fase**

Para continuar con el desarrollo, sigue estos pasos:

#### **1. Crear los DTOs (Data Transfer Objects)**

Los DTOs se encuentran pendientes. Necesitas crear:

- `DTOs/Auth/LoginRequest.cs`
- `DTOs/Auth/LoginResponse.cs`
- `DTOs/Visit/CreateVisitRequest.cs`
- `DTOs/Visit/VisitResponse.cs`
- `DTOs/Visitor/CreateVisitorRequest.cs`
- `DTOs/Visitor/VisitorResponse.cs`

#### **2. Implementar los Servicios de Negocio**

- `Services/AuthService.cs` - Lógica de autenticación
- `Services/VisitService.cs` - Lógica de visitas
- `Services/VisitorService.cs` - Lógica de visitantes
- `Services/ExportService.cs` - Exportación Excel/PDF
- `Services/LoggerService.cs` - Sistema de logs

#### **3. Crear los Controladores**

- `Controllers/AuthController.cs`
- `Controllers/VisitController.cs`
- `Controllers/VisitorController.cs`
- `Controllers/StatsController.cs`

#### **4. Generar la Primera Migración**

```powershell
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### **5. Testear con Swagger**

Ejecuta el proyecto y abre: `https://localhost:5001/swagger`

---

Ver [ESTADO_PROYECTO.md](./ESTADO_PROYECTO.md) para más detalles del progreso.

---

## ?? Seguridad

### Error: "Cannot connect to SQL Server"

**Solución:**
1. Verifica que SQL Server esté ejecutándose
2. Verifica el connection string
3. Verifica que TCP/IP esté habilitado en SQL Server Configuration Manager

### Error: "dotnet-ef not found"

**Solución:**
```powershell
dotnet tool install --global dotnet-ef
```

### Error: Migraciones no se aplican

**Solución:**
```powershell
# Eliminar base de datos y recrear
dotnet ef database drop
dotnet ef database update
```

---

## ?? Contacto

Para soporte técnico, crear un issue en el repositorio.

---

**¡Desarrollado con ?? usando .NET 10 + React + Azure!**
