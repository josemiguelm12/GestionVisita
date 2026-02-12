// 🔹 Visitor resumido (VisitorSummaryDto del backend)
export interface VisitorSummary {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  identityDocument: string | null;
}

// 🔹 VisitResponseDto del backend
export interface Visit {
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
  createdAt: string;
  endAt: string | null;
  duration: string | null;
  isActive: boolean;
  creatorName: string | null;
  closerName: string | null;
  visitors: VisitorSummary[];
}
// 🔹 Request para crear visita
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
  visitorIds?: number[];
}

// 🔹 Paginación
export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// 🔹 Respuesta completa de la API
export interface VisitsApiResponse {
  data: Visit[];
  pagination: Pagination;
}
