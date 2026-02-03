import type { Visitor } from './visitor.types';

export interface VisitVisitor {
  visitId: number;
  visitorId: number;
  caseId?: string;
  visitor: Visitor;
}

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
  status: { name: string; id: number } | string;
  visitors: Visitor[];
  visitVisitors?: VisitVisitor[];
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
