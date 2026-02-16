/**
 * Logger - Sistema de logging simple y efectivo
 * 
 * Características:
 * - Niveles de log: ERROR, WARN, INFO, DEBUG
 * - Timestamps automáticos
 * - Colores en consola (opcional)
 * - Configuración por variable de entorno
 */

import { LOG_CONFIG, LogLevel } from '../config/config';

/**
 * Niveles numéricos para comparación
 */
const LOG_LEVELS = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
};

/**
 * Clase Logger
 */
class Logger {
  private currentLevel: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level;
  }

  /**
   * Verifica si un nivel de log debe ser mostrado
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.currentLevel];
  }

  /**
   * Formatea un mensaje con timestamp
   */
  private formatMessage(level: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const prefix = `[${timestamp}] [${level}]`;
    return `${prefix} ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}`;
  }

  /**
   * Log de error (siempre se muestra)
   */
  error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', ...args));
    }
  }

  /**
   * Log de advertencia
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', ...args));
    }
  }

  /**
   * Log informativo (nivel por defecto)
   */
  info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', ...args));
    }
  }

  /**
   * Log de debug (muy verboso, solo para desarrollo)
   */
  debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', ...args));
    }
  }

  /**
   * Logs especializados para el simulador
   */

  arrival(groupSize: number): void {
    this.info(`[ARRIVAL] 👥 Grupo de ${groupSize} visitante(s) llegó`);
  }

  createVisit(visitId: number, visitorName: string, department: string): void {
    this.info(`[CREATE VISIT] 📝 Visit ID: ${visitId} - ${visitorName} visitando ${department}`);
  }

  closeVisit(visitId: number, duration: string): void {
    this.info(`[CLOSE VISIT] ✅ Visit ID: ${visitId} - Duración: ${duration}`);
  }

  unclosedVisit(visitId: number, visitorName: string): void {
    this.warn(`[UNCLOSED] ⚠️ Visit ID: ${visitId} - ${visitorName} olvidó cerrar la visita (realista)`);
  }

  dayFinished(date: string, created: number, closed: number): void {
    this.info(`[DAY FINISHED] 🌙 ${date} - ${created} visitas creadas, ${closed} cerradas`);
  }

  simulationStart(): void {
    this.info('═'.repeat(60));
    this.info('🚀 SIMULADOR DE GESTIONVISITA INICIADO');
    this.info('═'.repeat(60));
  }

  simulationError(error: unknown): void {
    this.error('💥 ERROR CRÍTICO EN SIMULACIÓN:', error);
  }
}

/**
 * Instancia singleton del logger
 */
export const logger = new Logger(LOG_CONFIG.level);
