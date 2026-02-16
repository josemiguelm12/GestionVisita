# Arquitectura Técnica del Simulador

Este documento explica las decisiones de diseño, patrones arquitectónicos y flujos del simulador de GestionVisita.

---

## 📐 Principios de Diseño

### 1. Separation of Concerns

El código está dividido en capas con responsabilidades claras:

```
┌─────────────────────────────────────────────┐
│           index.ts (Entry Point)            │
│  - Inicialización                           │
│  - Manejo de señales del sistema            │
│  - Error handling global                    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│       simulation/engine.ts (Core)           │
│  - Orquestación del flujo                   │
│  - Scheduling de eventos                    │
│  - Estado de simulación                     │
└──────┬──────────────────────┬───────────────┘
       │                      │
┌──────▼──────┐      ┌────────▼───────────────┐
│  services/  │      │    generators/          │
│  apiClient  │      │  dataGenerators         │
│  logger     │      │  - Nombres, cédulas     │
└─────────────┘      │  - Placas, teléfonos    │
                     │  - Departamentos, etc.  │
                     └────────────────────────┘
```

### 2. Type Safety First

Todo el código usa **TypeScript strict mode**:

```typescript
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**Beneficios:**
- Errores detectados en **compile time** en vez de runtime
- Autocompletado completo en VSCode
- Refactoring seguro

### 3. Contract-First Integration

Las interfaces TypeScript mapean **exactamente** los DTOs del backend .NET:

```typescript
// Backend (C#)
public class CreateVisitorRequest {
    public string Name { get; set; }
    public string LastName { get; set; }
    public DocumentType DocumentType { get; set; }
    ...
}

// Simulador (TypeScript)
export interface CreateVisitorRequest {
  name: string;
  lastName: string;
  documentType: DocumentType;
  ...
}
```

Si el backend cambia un DTO, TypeScript lanza error → **fail fast**.

---

## 🏗️ Patrones Arquitectónicos

### 1. Singleton Pattern

**Uso**: ApiClient, Logger

**Razón**: Garantizar una única instancia con estado compartido

```typescript
// services/apiClient.ts
class ApiClient {
  private accessToken: string | null = null;
  // ...
}

export const apiClient = new ApiClient(); // ← Singleton
```

**Beneficio**: Un solo token JWT reutilizado en todos los requests.

### 2. Factory Pattern (Implícito)

**Uso**: Generadores de datos

```typescript
// generators/dataGenerators.ts
export function generateFullName(): { firstName: string; lastName: string } {
  return {
    firstName: generateFirstName(),
    lastName: generateLastName()
  };
}
```

**Beneficio**: Encapsula la lógica de creación, fácil de mockear en tests.

### 3. Strategy Pattern

**Uso**: Distribución de tráfico por bloques horarios

```typescript
const WORKDAY_CONFIG = {
  trafficWeights: {
    morning: 3.0,      // Estrategia: alta carga
    midMorning: 1.5,   // Estrategia: normal
    lunch: 0.5,        // Estrategia: baja
    afternoon: 1.5,
    lateAfternoon: 0.8
  }
};
```

**Beneficio**: Cambiar comportamiento sin modificar lógica de scheduling.

### 4. Observer Pattern (Implícito)

**Uso**: Sistema de logs

```typescript
logger.arrival(groupSize);        // ← Observable event
logger.createVisit(visitId, ...); // ← Observable event
logger.closeVisit(visitId, ...);  // ← Observable event
```

**Beneficio**: Desacopla lógica de negocio del logging.

---

## 🔄 Flujo de Ejecución

### Startup Sequence

```
main()
  ├─> validateConfig()          // Fail fast si falta configuración
  ├─> apiClient.authenticate()  // Obtiene JWT
  └─> startInfiniteSimulation()
       └─> while(true)
            ├─> simulateWorkday()
            │    ├─> scheduleArrivals()
            │    │    └─> setTimeout(() => simulateArrival(), ...)
            │    └─> waitForEndOfDay()
            │         └─> setInterval(processClosures, 1min)
            └─> pause(5s) → next day
```

### Arrival Flow

```
simulateArrival()
  ├─> generateGroupSize()         // 1-4 personas
  ├─> for each person:
  │    ├─> generateFullName()
  │    ├─> generateDocumentType()
  │    ├─> generateCedula()
  │    └─> apiClient.createVisitor(...)
  │         └─> POST /api/visitor
  ├─> apiClient.createVisit({ visitorIds: [...] })
  │    └─> POST /api/visit
  └─> scheduleVisitClose(visitId, ...)
       └─> pendingVisits.push({ visitId, scheduledCloseAt })
```

### Closure Flow

```
processClosures() [ejecutado cada 1 min]
  ├─> filtrar visitas donde scheduledCloseAt <= now
  └─> for each visit:
       ├─> random() > 0.05 ?
       │    ├─> YES: apiClient.closeVisit(visitId)
       │    │        └─> POST /api/visit/{id}/close
       │    └─> NO:  logger.unclosedVisit(...)
       └─> pendingVisits.remove(visit)
```

---

## ⏱️ Sistema de Temporización

### Simulation Speed

**Variable**: `SIMULATION_CONFIG.speed`

**Ejemplo**: Si `speed = 10.0`:

```
Real time:      1 segundo
Simulated time: 10 segundos

1 hora simulada = 6 minutos reales
1 día laboral (10h) = 60 minutos reales
1 mes = ~30 horas reales
```

**Implementación**:

```typescript
const delayMs = durationMinutes * 60 * 1000 / SIMULATION_CONFIG.speed;
setTimeout(() => simulateArrival(), delayMs);
```

### Traffic Distribution

**Algoritmo**:

```
arrivals_per_block = block_duration_hours * base_rate * traffic_weight
interval_between_arrivals = (block_duration_hours * 60) / arrivals_per_block
```

**Ejemplo**: Bloque `morning` (8:00-9:30):

```
block_duration = 1.5 horas
base_rate = 4 visitas/hora
traffic_weight = 3.0

arrivals = 1.5 * 4 * 3.0 = 18 visitas
interval = (1.5 * 60) / 18 = 5 minutos
```

→ Llega 1 visita cada 5 minutos durante 8:00-9:30.

---

## 📊 Distribuciones Estadísticas

### Duración de Visitas

**Distribución**: Normal (Gaussiana)

**Parámetros**:
- Media (μ): 45 minutos
- Desviación estándar (σ): 30 minutos
- Rango: [5, 180] minutos

**Implementación**: Box-Muller Transform

```typescript
// Genera número aleatorio con distribución normal
const u1 = Math.random();
const u2 = Math.random();
const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

let duration = Math.round(mean + z0 * stdDev);
duration = Math.max(5, Math.min(180, duration));
```

**Justificación**: Las visitas reales siguen distribución normal (muchas ~45 min, pocas muy cortas o muy largas).

### Tamaño de Grupo

**Distribución**: Categórica ponderada

```
P(1) = 0.60  → 60% individual
P(2) = 0.25  → 25% parejas
P(3) = 0.10  → 10% grupos de 3
P(4) = 0.05  → 5% grupos de 4
```

**Justificación**: Mayoría llega solo, menos común en grupos grandes.

### Tipo de Documento

```
P(Cedula) = 0.85           → 85%
P(Pasaporte) = 0.10        → 10%
P(SinIdentificacion) = 0.05 → 5%
```

**Justificación**: En RD, mayoría tiene cédula dominicana.

---

## 🔐 Seguridad

### JWT Token Management

**Renovación preventiva**:

```typescript
private async ensureAuthenticated(): Promise<void> {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  
  if (this.tokenExpiry < fiveMinutesFromNow) {
    await this.authenticate(); // Renovar antes de que expire
  }
}
```

**Beneficios**:
- Evita 401 en medio de simulación
- Reduce overhead de reautenticación

### Header Especial

**Header**: `X-Simulation: true`

**Propósito**:
- Backend puede identificar tráfico simulado
- Excluir de métricas de producción
- Aplicar rate limiting diferente
- Debugging facilitado

**Implementación**:

```typescript
// config/config.ts
export const API_CONFIG = {
  headers: {
    'X-Simulation': 'true',
  },
};

// Backend puede verificar:
var isSimulation = Request.Headers["X-Simulation"] == "true";
```

---

## 🧪 Generación de Datos Realistas

### Cédulas Dominicanas

**Formato**: `XXX-XXXXXXX-Y`

**Algoritmo de verificación**:

```typescript
// 10 primeros dígitos
const digits = [0,3,1,1,2,3,4,5,6,7];

// Suma ponderada: cada dígito × su posición (1-10)
let sum = 0;
for (let i = 0; i < 10; i++) {
  sum += digits[i] * (i + 1);
}

// Dígito verificador = suma % 10
const verifier = sum % 10; // 031-1234567-3
```

**Resultado**: `031-1234567-3` (cédula válida)

**Beneficio**: Las cédulas pasan validación en backend si existe.

### Placas Vehiculares RD

**Formatos**:
- `AXXXXXX` → Privado
- `GXXXXXX` → Gubernamental
- `HXXXXXX` → Alquiler
- `LXXXXXX` → Carga

**Implementación**:

```typescript
const prefix = faker.helpers.arrayElement(['A', 'G', 'H', 'L']);
const numbers = faker.string.numeric(6);
return `${prefix}${numbers}`; // Ej: A123456
```

### Teléfonos

**Formato**: `XXX-XXX-XXXX`

**Prefijos válidos**: `809`, `829`, `849` (códigos de área RD)

```typescript
const prefix = faker.helpers.arrayElement(['809', '829', '849']);
const middle = faker.string.numeric(3);
const last = faker.string.numeric(4);
return `${prefix}-${middle}-${last}`; // Ej: 809-555-1234
```

---

## 🚀 Performance Considerations

### Memory Management

**Problema**: `pendingVisits[]` array crece indefinidamente

**Solución**: Remover visitas después de procesarlas

```typescript
// Procesar y remover
const index = pendingVisits.indexOf(visit);
if (index > -1) {
  pendingVisits.splice(index, 1);
}
```

**Resultado**: Memoria constante (~100-200 visitas máximo en array).

### Async Patterns

**Event Loop**: setTimeout no bloquea

```typescript
// ❌ MAL: Bloquea event loop
for (let i = 0; i < 100; i++) {
  await simulateArrival(); // Secuencial
}

// ✅ BIEN: No bloquea
for (let i = 0; i < 100; i++) {
  setTimeout(() => simulateArrival(), i * 1000); // Paralelo
}
```

**Beneficio**: El simulador puede procesar múltiples visitas simultáneamente.

### HTTP Concurrency

**Axios default**: Max 6 conexiones paralelas

Para alta velocidad (`speed > 50`), considera:

```typescript
// Aumentar límite de conexiones
import http from 'http';
import https from 'https';

const agent = new https.Agent({ maxSockets: 50 });
axios.create({ httpsAgent: agent });
```

---

## 🧩 Extensibilidad

### Agregar Nuevos Generadores

```typescript
// generators/dataGenerators.ts

/**
 * Genera un nuevo campo
 */
export function generateNuevoCampo(): string {
  return faker.helpers.arrayElement(['Opción A', 'Opción B']);
}
```

### Modificar Patrones de Tráfico

```typescript
// config/config.ts

export const WORKDAY_CONFIG = {
  trafficWeights: {
    morning: 5.0,      // ← Aumentar carga matutina
    lunch: 0.1,        // ← Reducir almuerzo
  }
};
```

### Agregar Nuevos Endpoints

```typescript
// services/apiClient.ts

async createNewEntity(data: NewEntityRequest): Promise<NewEntityResponse> {
  await this.ensureAuthenticated();
  
  const response = await this.axiosInstance.post<NewEntityResponse>(
    '/api/newentity',
    data
  );
  return response.data;
}
```

---

## 📈 Métricas y Observabilidad

### Logs Estructurados

**Formato**:

```
[TIMESTAMP] [LEVEL] [EVENT] Message
[2026-02-15 08:15:23] [INFO] [ARRIVAL] 👥 Grupo de 2 visitante(s) llegó
```

**Campos**:
- `TIMESTAMP`: ISO 8601
- `LEVEL`: ERROR, WARN, INFO, DEBUG
- `EVENT`: ARRIVAL, CREATE VISIT, CLOSE VISIT, DAY FINISHED
- `Message`: Descripción legible

**Beneficio**: Fácil parsing para análisis (Splunk, Elasticsearch, etc.)

### Estadísticas Diarias

```typescript
interface DayStats {
  visitsCreated: number;      // Total de visitas creadas
  visitsClosed: number;       // Total cerradas
  visitorsRegistered: number; // Total de personas
  unclosedVisits: number;     // Visitas olvidadas
}
```

**Output**:

```
[DAY FINISHED] 2026-02-15 - 47 visitas creadas, 45 cerradas
   Visitantes registrados: 73
   Visitas sin cerrar: 2
```

**Uso**: Monitorear tasa de cierre (~95% esperado).

---

## 🔧 Testing Strategy

### Unit Tests (Propuesta)

```typescript
// __tests__/generators.test.ts
describe('generateCedula', () => {
  it('should generate valid Dominican cedula', () => {
    const cedula = generateCedula();
    expect(cedula).toMatch(/^\d{3}-\d{7}-\d$/);
    
    // Verificar dígito verificador
    const parts = cedula.split('-');
    const digits = (parts[0] + parts[1]).split('').map(Number);
    const sum = digits.reduce((acc, d, i) => acc + d * (i + 1), 0);
    const verifier = sum % 10;
    
    expect(parseInt(parts[2])).toBe(verifier);
  });
});
```

### Integration Tests

```typescript
// __tests__/apiClient.test.ts
describe('ApiClient', () => {
  it('should authenticate and create visitor', async () => {
    await apiClient.authenticate();
    
    const visitor = await apiClient.createVisitor({
      name: 'Test',
      lastName: 'User',
      documentType: DocumentType.Cedula,
      identityDocument: '001-0000001-0'
    });
    
    expect(visitor.id).toBeGreaterThan(0);
  });
});
```

---

## 📚 Referencias

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Day.js Documentation](https://day.js.org/docs/en/installation/installation)
- [Faker.js Documentation](https://fakerjs.dev/guide/)
- [Azure WebJobs Documentation](https://learn.microsoft.com/en-us/azure/app-service/webjobs-create)
- [Box-Muller Transform](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform)

---

**Autor**: GestionVisita DevOps Team  
**Fecha**: Febrero 2026  
**Versión**: 1.0
