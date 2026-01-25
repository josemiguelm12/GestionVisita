# 🗺️ ROADMAP DE DESARROLLO - Sistema de Gestión de Visitas

**Proyecto:** Sistema de Gestión de Visitas CONANI  
**Stack:** ASP.NET Core 8.0 + React + TypeScript + PostgreSQL (Supabase)  
**Última actualización:** 25 de enero de 2026

---

## 📊 Estado General del Proyecto

| Fase | Descripción | Estado | Progreso |
|------|-------------|--------|----------|
| **Fase 1** | Configuración Base y Autenticación | ✅ Completada | 100% |
| **Fase 2** | Layout, Navegación y Dashboard | 🔄 En Progreso | 0% |
| **Fase 3** | CRUD de Visitantes | ⏳ Pendiente | 0% |
| **Fase 4** | CRUD de Visitas y Funcionalidades Avanzadas | ⏳ Pendiente | 0% |

---

# ✅ FASE 1: CONFIGURACIÓN BASE Y AUTENTICACIÓN

**Estado:** ✅ Completada (25/01/2026)  
**Duración estimada:** ✅ Completada

## Backend

### 1.1 Configuración Inicial ✅
- [x] Proyecto ASP.NET Core 8.0 creado
- [x] Estructura de carpetas organizada (Controllers, Services, Repositories, Models, DTOs)
- [x] Configuración de dependencias (EF Core, JWT, Serilog, etc.)
- [x] Configuración de CORS para desarrollo

### 1.2 Base de Datos ✅
- [x] Migración de SQL Server a PostgreSQL
- [x] Configuración de Supabase (free tier)
- [x] Entity Framework Core con Npgsql
- [x] Modelos de datos: User, Role, Visitor, Visit, AuditLog
- [x] Migraciones aplicadas exitosamente
- [x] Connection string configurado

### 1.3 Sistema de Autenticación ✅
- [x] PasswordHelper con PBKDF2 + SHA256
- [x] JwtHelper para generación de tokens
- [x] AuthService con login y registro
- [x] AuthController con endpoints `/login` y `/register`
- [x] Middleware de autenticación JWT
- [x] Usuario admin funcional (`admin2@gestionvisitas.com`)

### 1.4 Logging y Auditoría ✅
- [x] Serilog configurado (consola + archivos)
- [x] AuditMiddleware para tracking de requests
- [x] ExceptionHandlingMiddleware
- [x] Logs estructurados en `Logs/`

## Frontend

### 1.5 Configuración Inicial ✅
- [x] Proyecto React + Vite + TypeScript
- [x] TailwindCSS v3 instalado y configurado
- [x] Estructura de carpetas organizada
- [x] Variables de entorno (.env.development)

### 1.6 Sistema de Autenticación ✅
- [x] AuthContext con Context API
- [x] Hook personalizado `useAuth`
- [x] Axios configurado con interceptors JWT
- [x] APIs: authApi, visitorApi, visitApi, statsApi
- [x] Página de Login con diseño moderno
- [x] ProtectedRoute component
- [x] React Router configurado

### 1.7 Tipos TypeScript ✅
- [x] auth.types.ts
- [x] visitor.types.ts
- [x] visit.types.ts
- [x] stats.types.ts

### 1.8 Utilidades ✅
- [x] Formatters (fechas, teléfonos, cédulas)
- [x] Validators (email, cédula, teléfono)

### 1.9 Páginas Placeholder ✅
- [x] Dashboard (placeholder)
- [x] Visitors (placeholder)
- [x] Visits (placeholder)
- [x] NotFound (404)

---

# 🔄 FASE 2: LAYOUT, NAVEGACIÓN Y DASHBOARD

**Estado:** 🔄 Iniciando  
**Duración estimada:** 3-4 días

## Objetivos
Crear la estructura visual del sistema con navegación completa y un dashboard funcional con estadísticas en tiempo real.

## Frontend

### 2.1 Componentes de Layout
- [ ] **Navbar.tsx**
  - Logo del sistema
  - Nombre del usuario logueado
  - Botón de logout
  - Avatar/inicial del usuario
  - Dropdown con perfil y configuración

- [ ] **Sidebar.tsx**
  - Navegación principal con iconos
  - Links: Dashboard, Visitantes, Visitas, Reportes
  - Indicador de ruta activa
  - Responsive (colapsable en móvil)

- [ ] **Layout.tsx**
  - Wrapper que combine Navbar + Sidebar + Content
  - Aplicar a todas las rutas protegidas
  - Breadcrumbs de navegación

### 2.2 Dashboard Funcional
- [ ] **KPICards.tsx**
  - Total de visitantes registrados
  - Visitas del día actual
  - Visitas activas (en el edificio)
  - Promedio de visitas por día

- [ ] **ActiveVisitsTable.tsx**
  - Tabla de visitas activas (status: "CheckedIn")
  - Columnas: Visitante, Hora entrada, Motivo, Acciones
  - Botón de "Registrar Salida"
  - Actualización automática cada 30 segundos

- [ ] **VisitChart.tsx**
  - Gráfica de visitas de los últimos 7 días
  - Usar Chart.js o Recharts
  - Filtros por fecha

- [ ] **RecentVisitorsWidget.tsx**
  - Lista de últimos 5 visitantes registrados
  - Foto, nombre, fecha de registro

### 2.3 Funcionalidades de UI
- [ ] Loading states (spinners/skeletons)
- [ ] Toast notifications (react-hot-toast)
- [ ] Confirmación de logout
- [ ] Modo responsive completo

## Backend

### 2.4 Endpoints de Estadísticas
- [ ] **StatsController.cs**
  - `GET /api/stats/dashboard` - Todas las estadísticas del dashboard
  - `GET /api/stats/visits-by-day?days=7` - Visitas por día
  - `GET /api/stats/active-visits` - Visitas activas ahora
  - `GET /api/stats/kpis` - KPIs principales

- [ ] **StatsService.cs**
  - Lógica de cálculo de estadísticas
  - Caché de 1 minuto para KPIs
  - Queries optimizados con índices

### 2.5 Endpoints de Visitas (básicos)
- [ ] **VisitController.cs**
  - `GET /api/visits/active` - Listar visitas activas
  - `PUT /api/visits/{id}/checkout` - Registrar salida

---

# ⏳ FASE 3: CRUD DE VISITANTES

**Estado:** ⏳ Pendiente  
**Duración estimada:** 4-5 días

## Objetivos
Implementar la gestión completa de visitantes: listado, búsqueda, creación, edición y eliminación (soft delete).

## Frontend

### 3.1 Lista de Visitantes
- [ ] **VisitorList.tsx**
  - Tabla con todas las columnas del modelo Visitor
  - Paginación (10, 25, 50 por página)
  - Búsqueda en tiempo real (por nombre, cédula, email)
  - Filtros: Por fecha de registro, activos/inactivos
  - Ordenamiento por columna (nombre, fecha, etc.)
  - Acciones: Ver, Editar, Eliminar

- [ ] **VisitorTable.tsx**
  - Componente de tabla reutilizable
  - Mostrar foto del visitante (si existe)
  - Badge de estado (Activo/Inactivo)
  - Formateo de teléfono y cédula

### 3.2 Formulario de Visitante
- [ ] **VisitorForm.tsx**
  - Modo: Crear nuevo / Editar existente
  - Campos:
    - Nombre completo (requerido)
    - Tipo de documento (Cédula/Pasaporte/Otro)
    - Número de documento (requerido, validado)
    - Email (opcional, validado)
    - Teléfono (opcional, validado)
    - Empresa (opcional)
    - Foto (opcional, upload de imagen)
  - Validación en tiempo real
  - Mensajes de error claros
  - Loading state al guardar

- [ ] **VisitorFormModal.tsx**
  - Modal responsive
  - Cerrar con ESC o click fuera
  - Confirmación si hay cambios sin guardar

### 3.3 Vista Detalle de Visitante
- [ ] **VisitorDetail.tsx**
  - Vista completa del visitante
  - Historial de visitas del visitante
  - Estadísticas: Total visitas, última visita, etc.
  - Botón "Editar" y "Eliminar"

### 3.4 Componentes Auxiliares
- [ ] **ImageUpload.tsx**
  - Preview de imagen
  - Validación de tamaño y formato (max 2MB, JPG/PNG)
  - Crop/resize opcional

- [ ] **ConfirmDialog.tsx**
  - Diálogo de confirmación reutilizable
  - Usado para eliminar visitante

- [ ] **SearchBar.tsx**
  - Barra de búsqueda con debounce (300ms)
  - Icono de lupa
  - Clear button

## Backend

### 3.5 CRUD Completo de Visitantes
- [ ] **VisitorController.cs**
  - `GET /api/visitors` - Listar con paginación y búsqueda
  - `GET /api/visitors/{id}` - Obtener por ID
  - `GET /api/visitors/{id}/visits` - Historial de visitas
  - `POST /api/visitors` - Crear nuevo
  - `PUT /api/visitors/{id}` - Actualizar
  - `DELETE /api/visitors/{id}` - Soft delete
  - `POST /api/visitors/{id}/photo` - Subir foto

- [ ] **VisitorService.cs**
  - Validaciones de negocio
  - Verificar duplicados por cédula
  - Normalización de datos (mayúsculas, trim, etc.)

- [ ] **VisitorRepository.cs**
  - Métodos de repositorio optimizados
  - Búsqueda con LIKE en PostgreSQL
  - Include de relaciones necesarias

### 3.6 Upload de Imágenes
- [ ] Configurar almacenamiento (local o Azure Blob)
- [ ] Validación de archivos (tamaño, tipo)
- [ ] Generación de thumbnails (opcional)
- [ ] Servir imágenes estáticas

### 3.7 Validaciones y DTOs
- [ ] VisitorCreateDto con validaciones FluentValidation
- [ ] VisitorUpdateDto
- [ ] VisitorResponseDto con foto URL

---

# ⏳ FASE 4: CRUD DE VISITAS Y FUNCIONALIDADES AVANZADAS

**Estado:** ⏳ Pendiente  
**Duración estimada:** 5-7 días

## Objetivos
Implementar el registro completo de visitas, generación de QR, reportes y funcionalidades avanzadas.

## Frontend

### 4.1 Registro de Visitas
- [ ] **VisitForm.tsx**
  - Selección de visitante (autocomplete con búsqueda)
  - Botón "Crear nuevo visitante" si no existe
  - Motivo de visita (textarea)
  - Persona a visitar (input)
  - Departamento/Área
  - Checkbox: "¿Lleva laptop/equipos?"
  - Auto-rellenar fecha/hora de entrada
  - Generar QR code al confirmar

- [ ] **VisitorAutocomplete.tsx**
  - Búsqueda por nombre o cédula
  - Resultados con foto y datos
  - Crear nuevo si no existe

- [ ] **QRCodeDisplay.tsx**
  - Mostrar QR generado
  - Botón "Imprimir"
  - Botón "Descargar PDF"
  - Botón "Enviar por email"

### 4.2 Lista de Visitas
- [ ] **VisitList.tsx**
  - Tabla de todas las visitas
  - Filtros:
    - Por fecha (hoy, esta semana, este mes, rango)
    - Por estado (Pendiente, CheckedIn, CheckedOut, Cancelada)
    - Por visitante
  - Paginación y búsqueda
  - Badge de estado con colores
  - Tiempo transcurrido para visitas activas

- [ ] **VisitTimeline.tsx**
  - Vista de línea de tiempo de visitas del día
  - Agrupado por hora

### 4.3 Check-in / Check-out
- [ ] **QRScanner.tsx**
  - Escanear QR code para check-in/check-out
  - Usar cámara del dispositivo
  - Librería: react-qr-scanner o html5-qrcode
  - Feedback visual de éxito/error

- [ ] **ManualCheckout.tsx**
  - Registrar salida manual desde lista
  - Confirmación con hora de salida

### 4.4 Reportes y Exportación
- [ ] **ReportGenerator.tsx**
  - Filtros: Fecha inicio/fin, estado, visitante
  - Vista previa de reporte
  - Exportar a Excel
  - Exportar a PDF
  - Enviar por email

- [ ] **VisitStatistics.tsx**
  - Gráficas avanzadas (por día, hora, visitante frecuente)
  - Top 10 visitantes
  - Promedio de duración de visitas

### 4.5 Configuración y Perfil
- [ ] **ProfilePage.tsx**
  - Ver y editar datos del usuario
  - Cambiar contraseña
  - Configuración de notificaciones

- [ ] **SettingsPage.tsx**
  - Configuración del sistema
  - Logo personalizado
  - Mensaje de bienvenida
  - Horario de operación

## Backend

### 4.6 CRUD Completo de Visitas
- [ ] **VisitController.cs**
  - `GET /api/visits` - Listar con filtros avanzados
  - `GET /api/visits/{id}` - Obtener por ID
  - `POST /api/visits` - Crear nueva visita (genera QR)
  - `PUT /api/visits/{id}` - Actualizar
  - `PUT /api/visits/{id}/checkin` - Check-in (manual o QR)
  - `PUT /api/visits/{id}/checkout` - Check-out (manual o QR)
  - `DELETE /api/visits/{id}` - Cancelar visita
  - `GET /api/visits/qr/{code}` - Validar QR code

- [ ] **VisitService.cs**
  - Generación de QR único
  - Validación de check-in/check-out
  - Cálculo de duración
  - Notificaciones (opcional)

### 4.7 Generación de QR Code
- [ ] Usar QRCoder library
- [ ] Generar código único por visita
- [ ] Almacenar QR como imagen o solo código
- [ ] API para validar QR

### 4.8 Exportación de Reportes
- [ ] **ReportController.cs**
  - `POST /api/reports/excel` - Generar Excel
  - `POST /api/reports/pdf` - Generar PDF
  - `POST /api/reports/email` - Enviar por email

- [ ] **ExcelService.cs**
  - Usar EPPlus para generar .xlsx
  - Formateo profesional (colores, filtros)

- [ ] **PdfService.cs**
  - Usar QuestPDF para generar PDFs
  - Incluir logo, fechas, firmas

### 4.9 Notificaciones (Opcional)
- [ ] **NotificationService.cs**
  - Email cuando visitante llega
  - Email de resumen diario
  - Configuración por usuario

### 4.10 Caché y Performance
- [ ] Implementar Redis cache para estadísticas
- [ ] Índices optimizados en PostgreSQL
- [ ] Background jobs para limpieza de datos antiguos

---

## 🛠️ Herramientas y Librerías Requeridas

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.5",
    "react-hot-toast": "^2.4.1",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "html5-qrcode": "^2.3.8",
    "date-fns": "^3.0.6",
    "clsx": "^2.1.0"
  }
}
```

### Backend
```xml
<PackageReference Include="QRCoder" Version="1.6.0" />
<PackageReference Include="EPPlus" Version="7.5.4" />
<PackageReference Include="QuestPDF" Version="2024.12.3" />
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="8.0.2" />
```

---

## 📅 Timeline Estimado

| Fase | Inicio Estimado | Fin Estimado | Días |
|------|----------------|--------------|------|
| Fase 1 | 22/01/2026 | 25/01/2026 | ✅ Completada |
| Fase 2 | 26/01/2026 | 29/01/2026 | 3-4 días |
| Fase 3 | 30/01/2026 | 03/02/2026 | 4-5 días |
| Fase 4 | 04/02/2026 | 11/02/2026 | 5-7 días |
| **Testing y Deploy** | 12/02/2026 | 14/02/2026 | 2-3 días |

**Total estimado:** 14-19 días hábiles

---

## ✅ Criterios de Aceptación por Fase

### Fase 1 ✅
- [x] Usuario puede hacer login
- [x] Token JWT se guarda y renueva
- [x] Rutas protegidas funcionan
- [x] Backend conectado a Supabase

### Fase 2
- [ ] Dashboard muestra estadísticas reales
- [ ] Navegación completa funcional
- [ ] Usuario puede hacer logout
- [ ] UI responsive en móvil y desktop

### Fase 3
- [ ] CRUD de visitantes 100% funcional
- [ ] Búsqueda y filtros funcionan
- [ ] Validaciones frontend y backend
- [ ] Puede subir foto de visitante

### Fase 4
- [ ] Registrar visita genera QR
- [ ] Check-in/out con QR funciona
- [ ] Exportar a Excel y PDF
- [ ] Reportes muestran datos correctos

---

## 🚀 Comandos Útiles

### Desarrollo
```powershell
# Backend
cd Backend
dotnet run

# Frontend
cd Frontend/gestion-visitas-frontend
npm run dev
```

### Base de Datos
```powershell
# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Revertir última migración
dotnet ef migrations remove
```

### Producción
```powershell
# Build frontend
npm run build

# Build backend
dotnet publish -c Release
```

---

## 📞 Contacto y Soporte

- **Desarrollador:** José Miguel Moquete
- **Organización:** CONANI - Santo Domingo
- **Repositorio:** (Agregar URL de Git cuando esté disponible)

---

**Última actualización:** 25 de enero de 2026  
**Versión del documento:** 1.0
