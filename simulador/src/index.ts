/**
 * GestionVisita Simulator - Entry Point
 * 
 * Simulador de tráfico realista para generar datos históricos
 * en el sistema de gestión de visitas.
 * 
 * Ejecuta infinitamente simulando días laborales con:
 * - Llegadas de visitantes
 * - Registro y creación de visitas
 * - Cierre de visitas
 * - Patrones de tráfico realistas
 */

import { validateConfig } from './config/config';
import { startInfiniteSimulation } from './simulation/engine';
import { logger } from './services/logger';

/**
 * Función principal
 */
async function main(): Promise<void> {
  try {
    // Banner de inicio
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('  GESTIONVISITA - SIMULADOR DE TRÁFICO REALISTA');
    console.log('  Generador de datos históricos para dashboards y reportes');
    console.log('═'.repeat(70));
    console.log('\n');

    // 1. Validar configuración
    validateConfig();

    // 2. Iniciar simulación infinita
    await startInfiniteSimulation();

  } catch (error) {
    logger.error('💥 ERROR FATAL:', error);
    
    if (error instanceof Error) {
      logger.error('Mensaje:', error.message);
      if (error.stack) {
        logger.debug('Stack trace:', error.stack);
      }
    }

    // Salir con código de error
    process.exit(1);
  }
}

/**
 * Manejo de señales del sistema
 */
process.on('SIGINT', () => {
  logger.info('\n\n⏹️  Simulador detenido por el usuario (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('\n\n⏹️  Simulador detenido (SIGTERM)');
  process.exit(0);
});

/**
 * Manejo de errores no capturados
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Ejecutar
main();
