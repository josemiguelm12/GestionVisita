/**
 * Data Generators - Generadores de Datos Realistas
 * 
 * Genera datos sintéticos que imitan tráfico real de República Dominicana:
 * - Nombres latinos frecuentes
 * - Cédulas dominicanas válidas (con dígito verificador)
 * - Placas vehiculares dominicanas
 * - Departamentos empresariales
 * - Motivos de visita
 * - Empleados ficticios
 */

import { faker } from '@faker-js/faker/locale/es'; // Locale español para nombres latinos
import { DocumentType } from '../types/api.types';

// ============================================
// NOMBRES Y APELLIDOS LATINOS
// ============================================

/**
 * Nombres latinos frecuentes en República Dominicana
 */
const DOMINICAN_FIRST_NAMES = {
  male: [
    'José', 'Juan', 'Luis', 'Carlos', 'Miguel', 'Rafael', 'Pedro', 'Manuel',
    'Francisco', 'Ramón', 'Antonio', 'Ángel', 'Fernando', 'Roberto', 'Víctor',
    'Julio', 'Enrique', 'Ricardo', 'Alberto', 'Raúl', 'Héctor', 'Rubén'
  ],
  female: [
    'María', 'Ana', 'Carmen', 'Rosa', 'Juana', 'Isabel', 'Luz', 'Yolanda',
    'Martha', 'Sandra', 'Patricia', 'Teresa', 'Olga', 'Maritza', 'Ángela',
    'Laura', 'Milagros', 'Ramona', 'Rosario', 'Altagracia', 'Esperanza'
  ]
};

/**
 * Apellidos frecuentes en República Dominicana
 */
const DOMINICAN_LAST_NAMES = [
  'Rodríguez', 'García', 'Pérez', 'Martínez', 'González', 'López', 'Hernández',
  'Ramírez', 'Sánchez', 'Cruz', 'Díaz', 'Reyes', 'Morales', 'Jiménez', 'Valdez',
  'Vargas', 'Castillo', 'Santos', 'Guzmán', 'Núñez', 'Méndez', 'Rosario',
  'Tejada', 'Peña', 'De La Rosa', 'Polanco', 'Marte', 'Cabrera', 'Mejía'
];

/**
 * Genera un nombre latino realista
 */
export function generateFirstName(): string {
  const gender = faker.helpers.arrayElement(['male', 'female'] as const);
  return faker.helpers.arrayElement(DOMINICAN_FIRST_NAMES[gender]);
}

/**
 * Genera un apellido dominicano realista
 */
export function generateLastName(): string {
  return faker.helpers.arrayElement(DOMINICAN_LAST_NAMES);
}

/**
 * Genera un nombre completo (nombre + apellido)
 */
export function generateFullName(): { firstName: string; lastName: string } {
  return {
    firstName: generateFirstName(),
    lastName: generateLastName()
  };
}

// ============================================
// CÉDULAS DOMINICANAS
// ============================================

/**
 * Genera una cédula dominicana válida con dígito verificador
 * Formato: XXX-XXXXXXX-Y
 * 
 * Algoritmo de verificación:
 * 1. Los primeros 10 dígitos (sin guiones)
 * 2. Cada dígito se multiplica por su posición (1-10)
 * 3. Se suma el resultado de todas las multiplicaciones
 * 4. El dígito verificador es el residuo de dividir la suma entre 10
 */
export function generateCedula(): string {
  // Generar 10 dígitos aleatorios
  const digits: number[] = [];
  for (let i = 0; i < 10; i++) {
    digits.push(faker.number.int({ min: 0, max: 9 }));
  }

  // Calcular dígito verificador
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (i + 1);
  }
  const verifier = sum % 10;

  // Formatear: XXX-XXXXXXX-Y
  const part1 = digits.slice(0, 3).join('');
  const part2 = digits.slice(3, 10).join('');
  
  return `${part1}-${part2}-${verifier}`;
}

// ============================================
// PLACAS VEHICULARES DOMINICANAS
// ============================================

/**
 * Prefijos de placas dominicanas por tipo de vehículo
 */
const VEHICLE_PLATE_PREFIXES = [
  'A', // Privado
  'G', // Gubernamental
  'H', // Alquiler
  'L', // Carga
];

/**
 * Genera una placa vehicular dominicana
 * Formato: AXXXXXX (letra + 6 dígitos)
 */
export function generateVehiclePlate(): string {
  const prefix = faker.helpers.arrayElement(VEHICLE_PLATE_PREFIXES);
  const numbers = faker.string.numeric(6);
  return `${prefix}${numbers}`;
}

// ============================================
// TELÉFONOS DOMINICANOS
// ============================================

/**
 * Prefijos de operadoras dominicanas
 */
const PHONE_PREFIXES = [
  '809', '829', '849' // Códigos de área de República Dominicana
];

/**
 * Genera un teléfono dominicano
 * Formato: XXX-XXX-XXXX
 */
export function generatePhone(): string {
  const prefix = faker.helpers.arrayElement(PHONE_PREFIXES);
  const middle = faker.string.numeric(3);
  const last = faker.string.numeric(4);
  return `${prefix}-${middle}-${last}`;
}

// ============================================
// DEPARTAMENTOS
// ============================================

/**
 * Departamentos comunes en empresas
 */
const DEPARTMENTS = [
  'Recursos Humanos',
  'Tecnología',
  'Finanzas',
  'Operaciones',
  'Ventas',
  'Marketing',
  'Compras',
  'Legal',
  'Administración',
  'Gerencia General',
  'Auditoría',
  'Logística',
  'Servicio al Cliente',
  'Calidad',
  'Seguridad',
];

/**
 * Genera un departamento aleatorio
 */
export function generateDepartment(): string {
  return faker.helpers.arrayElement(DEPARTMENTS);
}

// ============================================
// EMPLEADOS (PERSONAS A VISITAR)
// ============================================

/**
 * Nombres de empleados ficticios para "NamePersonToVisit"
 */
const EMPLOYEE_NAMES = [
  'Ing. Carlos Pérez',
  'Lic. María González',
  'Dr. Luis Martínez',
  'Lcda. Ana Rodríguez',
  'Ing. José Ramírez',
  'Lic. Carmen López',
  'Arq. Rafael Santos',
  'Lcda. Rosa Hernández',
  'Lic. Miguel Cruz',
  'Dra. Patricia Díaz',
  'Ing. Juan Reyes',
  'Lic. Sandra Morales',
  'MBA. Roberto Valdez',
  'Lcda. Martha Vargas',
  'Ing. Fernando Castillo',
];

/**
 * Genera un nombre de empleado aleatorio
 */
export function generateEmployeeName(): string {
  return faker.helpers.arrayElement(EMPLOYEE_NAMES);
}

// ============================================
// MOTIVOS DE VISITA
// ============================================

/**
 * Motivos comunes de visita
 */
const VISIT_REASONS = [
  'Reunión de trabajo',
  'Entrevista de trabajo',
  'Entrega de documentos',
  'Visita personal',
  'Consultoría',
  'Capacitación',
  'Presentación de propuesta',
  'Auditoría',
  'Soporte técnico',
  'Negociación comercial',
  'Firma de contrato',
  'Revisión de proyecto',
  'Servicio de mantenimiento',
  'Entrega de producto',
];

/**
 * Genera un motivo de visita aleatorio
 */
export function generateVisitReason(): string {
  return faker.helpers.arrayElement(VISIT_REASONS);
}

// ============================================
// INSTITUCIONES
// ============================================

/**
 * Instituciones comunes de visitantes
 */
const INSTITUTIONS = [
  'Empresa Privada',
  'Consultoría Independiente',
  'Proveedor',
  'Cliente',
  null, // Muchas visitas no tienen institución
  null,
  null,
];

/**
 * Genera una institución aleatoria (puede ser null)
 */
export function generateInstitution(): string | null {
  return faker.helpers.arrayElement(INSTITUTIONS);
}

// ============================================
// TIPO DE DOCUMENTO
// ============================================

/**
 * Genera un tipo de documento aleatorio con ponderación realista
 * 85% Cédula, 10% Pasaporte, 5% Sin Identificación
 */
export function generateDocumentType(): DocumentType {
  const rand = Math.random();
  
  if (rand < 0.85) return DocumentType.Cedula;
  if (rand < 0.95) return DocumentType.Pasaporte;
  return DocumentType.SinIdentificacion;
}

/**
 * Genera un número de documento según el tipo
 */
export function generateDocumentNumber(type: DocumentType): string | null {
  switch (type) {
    case DocumentType.Cedula:
      return generateCedula();
    case DocumentType.Pasaporte:
      return faker.string.alphanumeric(9).toUpperCase();
    case DocumentType.SinIdentificacion:
      return null;
    default:
      return null;
  }
}

// ============================================
// EDIFICIO Y PISO
// ============================================

/**
 * Genera un número de edificio (1-4)
 */
export function generateBuilding(): number {
  return faker.number.int({ min: 1, max: 4 });
}

/**
 * Genera un número de piso (1-10)
 */
export function generateFloor(): number {
  return faker.number.int({ min: 1, max: 10 });
}

// ============================================
// CARNET ASIGNADO
// ============================================

/**
 * Genera un número de carnet para visitantes (1-100)
 */
export function generateCarnet(): number {
  return faker.number.int({ min: 1, max: 100 });
}

// ============================================
// EMAIL
// ============================================

/**
 * Genera un email aleatorio (30% de probabilidad de tenerlo)
 */
export function generateEmail(): string | null {
  if (Math.random() < 0.3) {
    return faker.internet.email().toLowerCase();
  }
  return null;
}

// ============================================
// TAMAÑO DE GRUPO
// ============================================

/**
 * Genera un tamaño de grupo de visitantes (1-4 personas)
 * Ponderación: 60% individual, 25% parejas, 10% grupos de 3, 5% grupos de 4
 */
export function generateGroupSize(): number {
  const rand = Math.random();
  
  if (rand < 0.60) return 1; // 60% individual
  if (rand < 0.85) return 2; // 25% parejas
  if (rand < 0.95) return 3; // 10% grupos de 3
  return 4;                   // 5% grupos de 4
}

// ============================================
// DURACIÓN DE VISITA
// ============================================

/**
 * Genera una duración de visita en minutos (5-180 min)
 * Distribución normal con media ~45 minutos
 */
export function generateVisitDuration(): number {
  // Media: 45 minutos, desviación estándar: 30 minutos
  const mean = 45;
  const stdDev = 30;
  
  // Aproximación de distribución normal (Box-Muller transform)
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  let duration = Math.round(mean + z0 * stdDev);
  
  // Limitar entre 5 y 180 minutos
  duration = Math.max(5, Math.min(180, duration));
  
  return duration;
}
