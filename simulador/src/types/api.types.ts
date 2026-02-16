/**
 * Type Definitions - GestionVisita API
 * 
 * Interfaces TypeScript que mapean exactamente los DTOs del backend .NET
 * Esto garantiza type safety y autocompletado en todo el simulador
 */

// ============================================
// ENUMS
// ============================================

/**
 * DocumentType enum del backend
 * Mapea: GestionVisitaAPI.Enums.DocumentType
 */
export enum DocumentType {
  Cedula = 1,
  Pasaporte = 2,
  SinIdentificacion = 3
}

// ============================================
// AUTH DTOs
// ============================================

/**
 * Login Request
 * POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 * Incluye el JWT y datos del usuario autenticado
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

/**
 * User DTO
 */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string | null;
  roleId: number | null;
  isActive: boolean;
  permissions: string[];
}

// ============================================
// VISITOR DTOs
// ============================================

/**
 * Create Visitor Request
 * POST /api/visitor
 */
export interface CreateVisitorRequest {
  identityDocument?: string | null;
  documentType: DocumentType;
  name: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  institution?: string | null;
}

/**
 * Visitor Response
 * Retornado al crear o consultar un visitante
 */
export interface VisitorResponse {
  id: number;
  identityDocument: string | null;
  documentType: string;
  name: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  institution: string | null;
  createdAt: string; // ISO 8601 date string
}

// ============================================
// VISIT DTOs
// ============================================

/**
 * Create Visit Request
 * POST /api/visit
 */
export interface CreateVisitRequest {
  namePersonToVisit: string;
  department: string;
  building?: number | null;
  floor?: number | null;
  reason?: string | null;
  missionCase?: boolean;
  vehiclePlate?: string | null;
  personToVisitEmail?: string | null;
  sendEmail?: boolean;
  assignedCarnet?: number | null;
  visitorIds?: number[] | null;
}

/**
 * Close Visit Request
 * POST /api/visit/{id}/close
 */
export interface CloseVisitRequest {
  observations?: string | null;
}

/**
 * Visitor Summary (usado dentro de VisitResponse)
 */
export interface VisitorSummary {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  identityDocument: string | null;
}

/**
 * Visit Response
 * Retornado al crear o consultar una visita
 */
export interface VisitResponse {
  id: number;
  namePersonToVisit: string;
  department: string;
  building: number | null;
  floor: number | null;
  reason: string | null;
  statusId: number;
  statusName: string | null;
  missionCase: boolean;
  vehiclePlate: string | null;
  personToVisitEmail: string | null;
  assignedCarnet: number | null;
  createdAt: string; // ISO 8601
  endAt: string | null; // ISO 8601
  duration: string | null; // "hh:mm:ss"
  isActive: boolean;
  creatorName: string | null;
  closerName: string | null;
  visitors: VisitorSummary[];
}

// ============================================
// API ERROR RESPONSE
// ============================================

/**
 * Error Response estándar del backend
 */
export interface ApiErrorResponse {
  error: string;
  errors?: Record<string, string[]>; // ModelState errors
}
