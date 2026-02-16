/**
 * Configuración del Simulador
 * 
 * Carga variables de entorno y expone constantes validadas
 * Falla rápido si falta configuración crítica
 */

import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

/**
 * Valida que una variable de entorno exista
 * Si no existe, lanza error descriptivo
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Variable de entorno requerida no encontrada: ${key}\n` +
      `   Por favor, configura ${key} en tu archivo .env`
    );
  }
  return value;
}

/**
 * Obtiene variable de entorno opcional con valor por defecto
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Configuración de la API
 */
export const API_CONFIG = {
  baseURL: requireEnv('API_BASE_URL'),
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'X-Simulation': 'true', // 🔑 Header especial que identifica tráfico simulado
  },
} as const;

/**
 * Credenciales de autenticación
 */
export const AUTH_CONFIG = {
  email: requireEnv('AUTH_EMAIL'),
  password: requireEnv('AUTH_PASSWORD'),
} as const;

/**
 * Configuración de simulación
 */
export const SIMULATION_CONFIG = {
  // Velocidad de simulación (1.0 = tiempo real, 10.0 = 10x más rápido)
  speed: parseFloat(getEnv('SIMULATION_SPEED', '1.0')),
  
  // Probabilidad de que una visita NO se cierre (0.00 - 1.00)
  unclosedProbability: parseFloat(getEnv('UNCLOSED_VISIT_PROBABILITY', '0.05')),
  
  // Zona horaria
  timezone: getEnv('TZ', 'America/Santo_Domingo'),
} as const;

/**
 * Configuración de horario laboral (República Dominicana)
 */
export const WORKDAY_CONFIG = {
  startHour: 8,   // 8:00 AM
  endHour: 18,    // 6:00 PM
  
  // Distribución de tráfico por bloques horarios
  // Valores más altos = más visitas en ese periodo
  trafficWeights: {
    morning: 3.0,      // 8:00-9:30   (alta)
    midMorning: 1.5,   // 9:30-12:00  (normal)
    lunch: 0.5,        // 12:00-13:30 (baja)
    afternoon: 1.5,    // 13:30-16:30 (normal)
    lateAfternoon: 0.8 // 16:30-18:00 (baja, más cierres)
  },
} as const;

/**
 * Niveles de logging
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Configuración de logging
 */
export const LOG_CONFIG = {
  level: getEnv('LOG_LEVEL', 'info') as LogLevel,
} as const;

/**
 * Valida que todas las configuraciones estén correctas
 * Llama esto al inicio del programa para "fail fast"
 */
export function validateConfig(): void {
  console.log('🔍 Validando configuración...\n');
  
  console.log(`✅ API Base URL: ${API_CONFIG.baseURL}`);
  console.log(`✅ Auth Email: ${AUTH_CONFIG.email}`);
  console.log(`✅ Simulation Speed: ${SIMULATION_CONFIG.speed}x`);
  console.log(`✅ Unclosed Visit Probability: ${SIMULATION_CONFIG.unclosedProbability * 100}%`);
  console.log(`✅ Timezone: ${SIMULATION_CONFIG.timezone}`);
  console.log(`✅ Log Level: ${LOG_CONFIG.level}\n`);
  
  // Validaciones adicionales
  if (SIMULATION_CONFIG.speed <= 0) {
    throw new Error('SIMULATION_SPEED debe ser mayor a 0');
  }
  
  if (SIMULATION_CONFIG.unclosedProbability < 0 || SIMULATION_CONFIG.unclosedProbability > 1) {
    throw new Error('UNCLOSED_VISIT_PROBABILITY debe estar entre 0.00 y 1.00');
  }
  
  console.log('✅ Configuración válida\n');
}
