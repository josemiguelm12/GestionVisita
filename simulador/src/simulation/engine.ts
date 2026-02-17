/**
 * Simulation Engine - Motor de Simulación
 * 
 * Orquesta el comportamiento completo de una recepción empresarial:
 * 1. Llegada de grupos de visitantes
 * 2. Registro de visitantes
 * 3. Creación de visitas
 * 4. Duración y cierre de visitas
 * 5. Patrones de tráfico por hora
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import { apiClient } from '../services/apiClient';
import { logger } from '../services/logger';
import { SIMULATION_CONFIG, WORKDAY_CONFIG } from '../config/config';
import {
  generateFullName,
  generateDocumentType,
  generateDocumentNumber,
  generatePhone,
  generateEmail,
  generateInstitution,
  generateDepartment,
  generateEmployeeName,
  generateVisitReason,
  generateBuilding,
  generateFloor,
  generateVehiclePlate,
  generateCarnet,
  generateGroupSize,
  generateVisitDuration,
} from '../generators/dataGenerators';
import { CreateVisitorRequest } from '../types/api.types';

// Configurar dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

// ============================================
// TIPOS INTERNOS
// ============================================

/**
 * Representa una visita pendiente de cierre
 */
interface PendingVisit {
  visitId: number;
  visitorNames: string;
  department: string;
  createdAt: Date;
  scheduledCloseAt: Date;
}

/**
 * Estadísticas del día
 */
interface DayStats {
  visitsCreated: number;
  visitsClosed: number;
  visitorsRegistered: number;
  unclosedVisits: number;
}

// ============================================
// ESTADO GLOBAL DE SIMULACIÓN
// ============================================

/**
 * Lista de visitas pendientes de cierre
 * Se procesa en background
 */
const pendingVisits: PendingVisit[] = [];

/**
 * Estadísticas del día actual
 */
let dayStats: DayStats = {
  visitsCreated: 0,
  visitsClosed: 0,
  visitorsRegistered: 0,
  unclosedVisits: 0,
};

// ============================================
// SIMULACIÓN DE LLEGADA
// ============================================

/**
 * Simula la llegada de un grupo de visitantes
 * 
 * Flujo:
 * 1. Determina tamaño del grupo (1-4 personas)
 * 2. Registra cada visitante en el sistema
 * 3. Crea una visita asociada a todos
 * 4. Programa el cierre de la visita
 */
export async function simulateArrival(): Promise<void> {
  try {
    // 1. Determinar tamaño del grupo
    const groupSize = generateGroupSize();
    logger.arrival(groupSize);

    // 2. Registrar visitantes
    const visitorIds: number[] = [];
    const visitorNames: string[] = [];

    for (let i = 0; i < groupSize; i++) {
      const visitor = await createVisitor();
      visitorIds.push(visitor.id);
      visitorNames.push(visitor.fullName);
      dayStats.visitorsRegistered++;
    }

    // 3. Crear visita con todos los visitantes
    const visit = await createVisitForGroup(visitorIds);
    dayStats.visitsCreated++;

    logger.createVisit(
      visit.id,
      visitorNames.join(', '),
      visit.department
    );

    // 4. Programar cierre de visita
    scheduleVisitClose(visit.id, visitorNames.join(', '), visit.department);

  } catch (error) {
    logger.error('Error en simulateArrival:', error);
  }
}

/**
 * Crea un visitante con datos realistas
 */
async function createVisitor() {
  const { firstName, lastName } = generateFullName();
  const documentType = generateDocumentType();
  const identityDocument = generateDocumentNumber(documentType);

  const visitorData: CreateVisitorRequest = {
    name: firstName,
    lastName: lastName,
    documentType: documentType,
    identityDocument: identityDocument,
    phone: generatePhone(),
    email: generateEmail(),
    institution: generateInstitution(),
  };

  return await apiClient.createVisitor(visitorData);
}

/**
 * Crea una visita para un grupo de visitantes
 */
async function createVisitForGroup(visitorIds: number[]) {
  const department = generateDepartment();
  const hasVehicle = Math.random() < 0.15; // 15% llega en vehículo
  const isMissionCase = Math.random() < 0.05; // 5% es caso misional

  const visitData = {
    namePersonToVisit: generateEmployeeName(),
    department: department,
    building: generateBuilding(),
    floor: generateFloor(),
    reason: generateVisitReason(),
    missionCase: isMissionCase,
    vehiclePlate: hasVehicle ? generateVehiclePlate() : null,
    personToVisitEmail: generateEmail(),
    sendEmail: false, // No enviar emails en simulación
    assignedCarnet: generateCarnet(),
    visitorIds: visitorIds,
  };

  return await apiClient.createVisit(visitData);
}

/**
 * Programa el cierre de una visita después de X minutos
 */
function scheduleVisitClose(
  visitId: number,
  visitorNames: string,
  department: string
): void {
  const durationMinutes = generateVisitDuration();
  const createdAt = new Date();
  const scheduledCloseAt = new Date(
    createdAt.getTime() + durationMinutes * 60 * 1000
  );

  // Agregar a lista de visitas pendientes
  pendingVisits.push({
    visitId,
    visitorNames,
    department,
    createdAt,
    scheduledCloseAt,
  });
}

// ============================================
// PROCESADOR DE CIERRES
// ============================================

/**
 * Procesa visitas pendientes de cierre
 * Se ejecuta cada minuto para verificar si alguna visita debe cerrarse
 */
export async function processClosures(): Promise<void> {
  const now = new Date();

  // Filtrar visitas que deben cerrarse
  const toClose = pendingVisits.filter(v => v.scheduledCloseAt <= now);

  for (const visit of toClose) {
    // Decidir si la visita se cierra o se olvida
    const shouldClose = Math.random() > SIMULATION_CONFIG.unclosedProbability;

    if (shouldClose) {
      await closeVisit(visit);
      dayStats.visitsClosed++;
    } else {
      // Visita olvidada (realista)
      logger.unclosedVisit(visit.visitId, visit.visitorNames);
      dayStats.unclosedVisits++;
    }

    // Remover de lista de pendientes
    const index = pendingVisits.indexOf(visit);
    if (index > -1) {
      pendingVisits.splice(index, 1);
    }
  }
}

/**
 * Cierra una visita
 */
async function closeVisit(visit: PendingVisit): Promise<void> {
  try {
    const observations = Math.random() < 0.2
      ? 'Visita completada satisfactoriamente'
      : undefined;

    await apiClient.closeVisit(visit.visitId, { observations });

    // Calcular duración
    const durationMs = new Date().getTime() - visit.createdAt.getTime();
    const durationFormatted = formatDuration(durationMs);

    logger.closeVisit(visit.visitId, durationFormatted);
  } catch (error) {
    logger.error(`Error cerrando visita ${visit.visitId}:`, error);
  }
}

/**
 * Formatea duración en milisegundos a formato legible
 */
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

// ============================================
// SIMULACIÓN DE DÍA LABORAL
// ============================================

/**
 * Simula un día laboral completo (8 AM - 6 PM)
 * Genera llegadas de visitantes según patrones de tráfico
 */
export async function simulateWorkday(): Promise<void> {
  const today = dayjs().format('YYYY-MM-DD');
  logger.info(`\n📅 Iniciando día laboral: ${today}`);
  logger.info('⏰ Horario: 8:00 AM - 6:00 PM\n');

  // Resetear estadísticas del día
  dayStats = {
    visitsCreated: 0,
    visitsClosed: 0,
    visitorsRegistered: 0,
    unclosedVisits: 0,
  };

  // Programar llegadas durante el día
  await scheduleArrivals();

  // Esperar a que termine el día laboral
  await waitForEndOfDay();

  // Mostrar resumen del día
  logger.dayFinished(
    today,
    dayStats.visitsCreated,
    dayStats.visitsClosed
  );

  logger.info(`   Visitantes registrados: ${dayStats.visitorsRegistered}`);
  logger.info(`   Visitas sin cerrar: ${dayStats.unclosedVisits}\n`);
}

/**
 * Programa llegadas de visitantes durante el día
 * según patrones de tráfico
 */
async function scheduleArrivals(): Promise<void> {
  const timeBlocks = [
    { start: 8.0, end: 9.5, weight: WORKDAY_CONFIG.trafficWeights.morning },
    { start: 9.5, end: 12.0, weight: WORKDAY_CONFIG.trafficWeights.midMorning },
    { start: 12.0, end: 13.5, weight: WORKDAY_CONFIG.trafficWeights.lunch },
    { start: 13.5, end: 16.5, weight: WORKDAY_CONFIG.trafficWeights.afternoon },
    { start: 16.5, end: 18.0, weight: WORKDAY_CONFIG.trafficWeights.lateAfternoon },
  ];

  for (const block of timeBlocks) {
    await scheduleBlockArrivals(block.start, block.end, block.weight);
  }
}

/**
 * Programa llegadas para un bloque horario específico
 */
async function scheduleBlockArrivals(
  startHour: number,
  endHour: number,
  trafficWeight: number
): Promise<void> {
  const blockDurationHours = endHour - startHour;
  const baseArrivalsPerHour = 4; // Promedio de 4 visitas por hora
  const arrivals = Math.floor(blockDurationHours * baseArrivalsPerHour * trafficWeight);

  if (arrivals === 0) return;

  const intervalMinutes = (blockDurationHours * 60) / arrivals;

  for (let i = 0; i < arrivals; i++) {
    const delayMinutes = startHour * 60 + i * intervalMinutes;
    const delayMs = delayMinutes * 60 * 1000 / SIMULATION_CONFIG.speed;

    setTimeout(async () => {
      await simulateArrival();
    }, delayMs);
  }
}

/**
 * Espera a que termine el día laboral y procesa cierres pendientes
 */
async function waitForEndOfDay(): Promise<void> {
  const workdayDurationHours = WORKDAY_CONFIG.endHour - WORKDAY_CONFIG.startHour;
  const workdayDurationMs = workdayDurationHours * 60 * 60 * 1000 / SIMULATION_CONFIG.speed;

  // Procesar cierres cada minuto simulado
  const closureCheckInterval = 60 * 1000 / SIMULATION_CONFIG.speed;
  const closureProcessor = setInterval(async () => {
    await processClosures();
  }, closureCheckInterval);

  // Esperar a que termine el día
  await new Promise(resolve => setTimeout(resolve, workdayDurationMs));

  // Detener procesador de cierres
  clearInterval(closureProcessor);

  // Procesar cierres finales
  await processClosures();
}

// ============================================
// SIMULACIÓN INFINITA
// ============================================

/**
 * Inicia un loop infinito que simula días laborales consecutivos
 */
export async function startInfiniteSimulation(): Promise<void> {
  logger.simulationStart();
  logger.info(`⚡ Velocidad: ${SIMULATION_CONFIG.speed}x`);
  logger.info(`📊 Probabilidad visita sin cerrar: ${SIMULATION_CONFIG.unclosedProbability * 100}%\n`);

  // Autenticar antes de empezar
  await apiClient.authenticate();

  // Loop infinito de días
  while (true) {
    try {
      await simulateWorkday();
      
      // Pausa breve entre días (1 segundo en tiempo real = X según speed)
      const pauseBetweenDays = 5000 / SIMULATION_CONFIG.speed;
      await new Promise(resolve => setTimeout(resolve, pauseBetweenDays));
      
    } catch (error) {
      logger.simulationError(error);
      
      // Esperar 30 segundos antes de reintentar
      logger.warn('⏳ Esperando 30 segundos antes de reintentar...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}
