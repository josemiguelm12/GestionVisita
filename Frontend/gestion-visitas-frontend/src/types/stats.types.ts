export interface Stats {
  totalVisits: number;
  activeVisits: number;
  totalVisitors: number;
  averageVisitDuration?: number;
}

export interface VisitsByDate {
  date: string;
  count: number;
}
