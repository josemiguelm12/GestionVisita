# Deployment para Azure WebJob

Esta guía explica cómo compilar, empaquetar y desplegar el simulador como un **Azure WebJob Continuous** en tu App Service existente.

---

## 📋 Pre-requisitos

- Node.js ≥ 18 instalado localmente
- Acceso al Azure Portal
- App Service de GestionVisita ya desplegado

---

## 🔧 Paso 1: Compilar el Proyecto

Desde la carpeta `/simulador`:

```bash
# Instalar dependencias de desarrollo
npm install

# Compilar TypeScript → JavaScript
npm run build
```

Esto genera la carpeta `dist/` con el código JavaScript compilado.

**Verifica que exista:**
```
dist/
├── index.js
├── config/
├── services/
├── generators/
└── simulation/
```

---

## 📦 Paso 2: Instalar Dependencias de Producción

**IMPORTANTE**: Solo incluir dependencias de producción (sin devDependencies):

```bash
# Eliminar node_modules existente
rmdir /s /q node_modules

# Instalar solo dependencias de producción
npm install --production
```

Esto instala únicamente:
- axios
- dayjs
- dotenv
- @faker-js/faker

**NO** instala:
- typescript
- ts-node
- @types/node

---

## 🗜️ Paso 3: Crear ZIP para Azure WebJob

Debes comprimir **estos archivos** en un ZIP:

```
webjob.zip
├── node_modules/        ← Solo dependencias de producción
├── dist/                ← Código JavaScript compilado
├── package.json
└── run.cmd              ← Script de inicio
```

### Opción A: Manualmente (Windows)

1. Selecciona las carpetas:
   - `node_modules/`
   - `dist/`
   - `package.json`
   - `run.cmd`

2. Click derecho → **Enviar a** → **Carpeta comprimida**

3. Renombra a `webjob.zip`

### Opción B: PowerShell

```powershell
# Crear ZIP con PowerShell
Compress-Archive -Path node_modules,dist,package.json,run.cmd -DestinationPath webjob.zip -Force
```

### Opción C: CMD (requiere 7-Zip)

```batch
7z a webjob.zip node_modules dist package.json run.cmd
```

**⚠️ NO INCLUYAS:**
- `src/` (código TypeScript original)
- `.env` (configuración local)
- `tsconfig.json`
- `node_modules` de desarrollo

---

## ☁️ Paso 4: Subir a Azure WebJob

### 4.1 Ir al Azure Portal

1. Navega a tu **App Service** (donde está el backend .NET)
2. En el menú izquierdo: **Settings** → **WebJobs**
3. Click en **+ Add**

### 4.2 Configurar WebJob

- **Name**: `GestionVisitaSimulator`
- **File Upload**: Selecciona `webjob.zip`
- **Type**: **Continuous** ⚠️ (importante)
- **Scale**: **Single Instance** (para evitar duplicados)

### 4.3 Subir

Click en **OK** y espera a que se suba (~30-60 segundos).

---

## ⚙️ Paso 5: Configurar Variables de Entorno

El simulador necesita variables de entorno. Configúralas en:

**App Service → Configuration → Application Settings → + New application setting**

Agregar:

| Key | Value | Ejemplo |
|-----|-------|---------|
| `API_BASE_URL` | URL de tu API | `https://gestionvisita-api.azurewebsites.net` |
| `AUTH_EMAIL` | Email del usuario | `recepcion@example.com` |
| `AUTH_PASSWORD` | Contraseña | `Password123!` |
| `SIMULATION_SPEED` | Velocidad de simulación | `1.0` (tiempo real) |
| `UNCLOSED_VISIT_PROBABILITY` | Prob. visita sin cerrar | `0.05` (5%) |
| `LOG_LEVEL` | Nivel de log | `info` |
| `TZ` | Zona horaria | `America/Santo_Domingo` |

**⚠️ Importante**: Click en **Save** después de agregar todas.

---

## ▶️ Paso 6: Iniciar el WebJob

1. Regresa a **WebJobs**
2. Busca `GestionVisitaSimulator`
3. Click en **Start**

El WebJob comenzará a ejecutarse continuamente.

---

## 📊 Paso 7: Monitorear Logs

### Ver logs en tiempo real:

1. En la lista de WebJobs, click en **GestionVisitaSimulator**
2. Click en **Logs**
3. Se abrirá el **Kudu Dashboard**
4. Navega a: **Tools** → **Log Stream**

Deberías ver:

```
[2026-02-15 08:15:00] [INFO] 🚀 SIMULADOR DE GESTIONVISITA INICIADO
[2026-02-15 08:15:01] [INFO] ✅ Autenticado como: Recepción (Admin)
[2026-02-15 08:15:02] [INFO] 📅 Iniciando día laboral: 2026-02-15
[2026-02-15 08:15:23] [INFO] [ARRIVAL] 👥 Grupo de 2 visitante(s) llegó
```

### Descargar logs históricos:

1. En Kudu Dashboard: **Debug console** → **CMD**
2. Navega a: `D:\home\data\Jobs\Continuous\GestionVisitaSimulator\`
3. Descarga archivos `.log`

---

## 🔄 Paso 8: Actualizar el WebJob

Para actualizar el código:

```bash
# 1. Editar código fuente en src/
# 2. Recompilar
npm run build

# 3. Reinstalar dependencias de producción
rmdir /s /q node_modules
npm install --production

# 4. Recrear ZIP
Compress-Archive -Path node_modules,dist,package.json,run.cmd -DestinationPath webjob.zip -Force

# 5. En Azure Portal:
#    - Detener WebJob
#    - Eliminar WebJob
#    - Subir nuevo ZIP
#    - Iniciar WebJob
```

---

## 🛑 Paso 9: Detener/Eliminar

### Detener temporalmente:
1. WebJobs → `GestionVisitaSimulator` → **Stop**

### Eliminar permanentemente:
1. WebJobs → `GestionVisitaSimulator` → **Delete**

---

## 🐛 Troubleshooting

### El WebJob no inicia

**Revisar logs**:
1. WebJobs → GestionVisitaSimulator → **Logs**
2. Buscar errores en la salida

**Error común**: "Cannot find module 'axios'"
- **Causa**: No se incluyó `node_modules/` en el ZIP
- **Solución**: Asegúrate de comprimir `node_modules/` con dependencias de producción

### El WebJob se detiene solo

**Causa**: Error no capturado en el código
- **Revisar logs** para ver el stack trace
- Verificar que las variables de entorno estén configuradas

### Error 401 en autenticación

**Causa**: Credenciales incorrectas
- Verifica `AUTH_EMAIL` y `AUTH_PASSWORD` en Application Settings
- Verifica que el usuario exista en la base de datos del backend

### El WebJob crea visitas duplicadas

**Causa**: Múltiples instancias corriendo
- Asegúrate de configurar **Scale: Single Instance**
- En App Service → Scale → Manual Scale → Instance count = 1

---

## 📈 Velocidad de Simulación

Para generar datos históricos rápidamente:

```bash
# En Application Settings
SIMULATION_SPEED=100.0   # 100x más rápido

# 1 día laboral = ~10 minutos reales
# 1 mes = ~5 horas
# 1 año = ~2.5 días
```

**⚠️ Cuidado**: Alta velocidad = alta carga en API. Monitorea el rendimiento del backend.

---

## 🎯 Resultado Esperado

Con el WebJob corriendo a velocidad `1.0`:

- **~50 visitas por día** (8 AM - 6 PM)
- **~250 visitas por semana**
- **~1000 visitas por mes**

Suficiente para dashboards y reportes con datos significativos.

---

## 📚 Recursos Adicionales

- [Azure WebJobs Documentation](https://learn.microsoft.com/en-us/azure/app-service/webjobs-create)
- [Kudu Console Guide](https://github.com/projectkudu/kudu/wiki)

---

**¿Dudas?** Revisa los logs o contacta al equipo de DevOps.
