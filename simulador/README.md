# GestionVisita - Simulador de Tráfico Realista

> **Generador de datos históricos** para dashboards y reportes.  
> Simula el comportamiento real de una recepción día tras día.

## 🎯 Propósito

Este **NO** es un test unitario. Es un **bot de carga realista** que:

- ✅ Simula llegadas de visitantes durante horario laboral (8 AM - 6 PM)
- ✅ Crea visitas con datos dominicanos realistas (nombres, cédulas, placas)
- ✅ Cierra visitas después de un tiempo aleatorio (5 min - 3 horas)
- ✅ Genera patrones de tráfico: picos en mañana, baja a mediodía, normal en tarde
- ✅ Algunas visitas olvidan cerrarse (~5%) como en la vida real
- ✅ Corre infinitamente generando históricos para análisis

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia el archivo de ejemplo:
```bash
copy .env.example .env
```

2. Edita `.env` con tus credenciales:
```env
API_BASE_URL=https://tu-app-service.azurewebsites.net
AUTH_EMAIL=recepcion@example.com
AUTH_PASSWORD=Password123!
```

## 🚀 Uso

### Desarrollo local (TypeScript directo)
```bash
npm run dev
```

### Producción (compilado)
```bash
npm run build
npm start
```

## 🏗️ Estructura

```
/src
  /config         → Configuración y constantes
  /types          → Interfaces TypeScript (DTOs del backend)
  /services       → Cliente HTTP y autenticación
  /generators     → Generadores de datos realistas
  /simulation     → Motor de simulación
  index.ts        → Punto de entrada
```

## 📊 Comportamiento

### Horarios
- **8:00-9:30 AM**: Alta carga (muchas llegadas)
- **9:30-12:00 PM**: Carga normal
- **12:00-1:30 PM**: Baja carga (hora de almuerzo)
- **1:30-4:30 PM**: Carga normal
- **4:30-6:00 PM**: Cierres frecuentes, pocas llegadas

### Datos Realistas
- **Nombres**: Latinos frecuentes en RD (María, José, Ana, etc.)
- **Cédulas**: Formato dominicano (000-0000000-0)
- **Placas**: Formatos dominicanos (A123456, G789012)
- **Departamentos**: IT, RRHH, Finanzas, Operaciones, etc.
- **Motivos**: Reunión, Entrevista, Entrega, Visita personal, etc.

## 🔧 Azure WebJob

Ver documentación completa en `/docs/azure-webjob-deployment.md`

Resumen rápido:
1. Compilar: `npm run build`
2. Crear `run.cmd` apuntando a `node dist/index.js`
3. Comprimir `dist/`, `node_modules/`, `package.json`, `run.cmd`
4. Subir ZIP a Azure WebJob (Continuous)

## 📝 Logs

El simulador emite logs estructurados:

```
[2026-02-15 08:15:23] [ARRIVAL] Grupo de 2 visitantes llegó
[2026-02-15 08:15:24] [CREATE VISIT] Visit ID: 1247 - María Rodríguez visitando IT
[2026-02-15 10:32:11] [CLOSE VISIT] Visit ID: 1247 - Duración: 2h 17m
[2026-02-15 18:00:00] [DAY FINISHED] Día laboral terminado. 47 visitas creadas, 45 cerradas
```

## 🛡️ Header Especial

Todas las peticiones incluyen:
```
X-Simulation: true
```

Esto permite al backend identificar tráfico simulado vs. real.

## 📄 Licencia

MIT
