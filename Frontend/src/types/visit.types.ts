import type { Visitor } from './visitor.types';

export interface Visit {
  id: number;
  namePersonToVisit: string;
  department: string;
  building?: number;
  floor?: number;
  reason?: string;
  missionCase: boolean;
  vehiclePlate?: string;
  personToVisitEmail?: string;
  assignedCarnet?: number;
  visitorIds?: number[];
  createdAt: string;
  endAt?: string;
  status: string;
  visitors: Visitor[];
}

export interface CreateVisitRequest {
  namePersonToVisit: string;
  department: string;
  building?: number;
  floor?: number;
  reason?: string;
  missionCase?: boolean;
  vehiclePlate?: string;
  personToVisitEmail?: string;
  sendEmail?: boolean;
  assignedCarnet?: number;
  visitorIds: number[];
}
