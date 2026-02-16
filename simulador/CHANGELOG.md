# Changelog - Simulador GestionVisita

Todos los cambios notables en el simulador serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-02-15

### 🎉 Initial Release

Primera versión completa del simulador de tráfico realista para GestionVisita.

#### Agregado

**Core Features:**
- ✅ Motor de simulación de días laborales (8 AM - 6 PM)
- ✅ Generación de grupos de visitantes (1-4 personas)
- ✅ Registro automático de visitantes vía API
- ✅ Creación y cierre automático de visitas
- ✅ Loop infinito para generación continua de históricos

**Data Generators:**
- ✅ Nombres latinos frecuentes en República Dominicana
- ✅ Apellidos dominicanos realistas
- ✅ Cédulas dominicanas con dígito verificador válido
- ✅ Placas vehiculares formato RD (A/G/H/L)
- ✅ Teléfonos con prefijos dominicanos (809/829/849)
- ✅ Emails (30% probabilidad)
- ✅ Departamentos empresariales (15 tipos)
- ✅ Motivos de visita (14 tipos)
- ✅ Distribución normal para duración de visitas (5-180 min)

**Configuración:**
- ✅ Variables de entorno con dotenv
- ✅ Validación de configuración al inicio (fail fast)
- ✅ Velocidad de simulación ajustable (SIMULATION_SPEED)
- ✅ Probabilidad de visitas sin cerrar configurable
- ✅ Soporte para zona horaria (TZ)

**HTTP Client:**
- ✅ Cliente Axios centralizado con autenticación JWT
- ✅ Interceptors para inyección automática de token
- ✅ Renovación preventiva de token (5 min antes de expirar)
- ✅ Retry automático en 401 Unauthorized
- ✅ Header `X-Simulation: true` en todos los requests
- ✅ Type safety completo con TypeScript

**Logging:**
- ✅ Sistema de logging con niveles (ERROR, WARN, INFO, DEBUG)
- ✅ Timestamps automáticos en formato ISO 8601
- ✅ Logs especializados: [ARRIVAL], [CREATE VISIT], [CLOSE VISIT], [DAY FINISHED]
- ✅ Estadísticas diarias (visitas creadas/cerradas, visitantes, sin cerrar)

**Patrones de Tráfico:**
- ✅ Distribución temporal realista por bloques horarios:
  - Morning (8:00-9:30): Alta carga (weight: 3.0)
  - Mid-Morning (9:30-12:00): Normal (weight: 1.5)
  - Lunch (12:00-13:30): Baja (weight: 0.5)
  - Afternoon (13:30-16:30): Normal (weight: 1.5)
  - Late Afternoon (16:30-18:00): Baja con cierres (weight: 0.8)

**Azure WebJob Support:**
- ✅ Compilación TypeScript → JavaScript
- ✅ Script `run.cmd` para Azure WebJobs
- ✅ Script PowerShell `build-webjob.ps1` para build automático
- ✅ Generación de `webjob.zip` listo para deployment
- ✅ Soporte para Azure App Service Application Settings

**Documentation:**
- ✅ README.md completo con ejemplos de uso
- ✅ DEPLOYMENT.md con guía paso a paso para Azure WebJob
- ✅ ARCHITECTURE.md con decisiones técnicas y patrones
- ✅ .env.example con todas las variables documentadas
- ✅ .env.local.example para testing local
- ✅ Comentarios extensivos en código (JSDoc)

**Scripts:**
- ✅ `npm run dev` - Ejecución directa con ts-node
- ✅ `npm run build` - Compilación TypeScript
- ✅ `npm start` - Ejecuta código compilado
- ✅ `.\build-webjob.ps1` - Build y empaquetado automático
- ✅ `.\test-local.ps1` - Test rápido local

**Type Definitions:**
- ✅ Interfaces completas para DTOs del backend:
  - LoginRequest/Response
  - CreateVisitorRequest
  - VisitorResponse
  - CreateVisitRequest
  - VisitResponse
  - CloseVisitRequest
- ✅ Enums: DocumentType, LogLevel

#### Características Realistas

- ✅ 85% visitantes con cédula, 10% pasaporte, 5% sin ID
- ✅ 15% visitas llega en vehículo
- ✅ 5% visitas son caso misional
- ✅ 5% visitas olvidan cerrarse (comportamiento real)
- ✅ 60% visitantes individuales, 40% en grupos
- ✅ Duración de visitas sigue distribución normal (media: 45 min)
- ✅ ~50 visitas por día (velocidad 1.0)

#### Dependencias

**Production:**
- axios ^1.6.5 - HTTP client
- dayjs ^1.11.10 - Date manipulation
- dotenv ^16.4.0 - Environment variables
- @faker-js/faker ^8.4.0 - Fake data generation

**Development:**
- typescript ^5.3.3 - Type safety
- ts-node ^10.9.2 - TS execution
- @types/node ^20.11.0 - Node.js types

#### Requisitos

- Node.js ≥18.0.0
- Backend GestionVisita API desplegado
- Usuario con permisos para crear visitantes y visitas

---

## [Unreleased]

### Planeado para futuras versiones

- [ ] Tests unitarios (Jest)
- [ ] Tests de integración
- [ ] Métricas exportadas a Prometheus
- [ ] Dashboard de monitoreo (Grafana)
- [ ] Simulación de escenarios específicos (picos, incidentes)
- [ ] Generación de reportes en CSV
- [ ] Soporte para múltiples zonas horarias simultáneas
- [ ] API REST para control del simulador (start/stop/stats)
- [ ] Webhooks para notificaciones de eventos

---

## Formato del Changelog

### Types of changes

- `Agregado` - Nuevas características
- `Cambiado` - Cambios en funcionalidad existente
- `Deprecado` - Características que serán removidas
- `Removido` - Características eliminadas
- `Arreglado` - Bug fixes
- `Seguridad` - Vulnerabilidades

---

[1.0.0]: https://github.com/tu-usuario/GestionVisita/releases/tag/v1.0.0
