export interface Stats {
  todayVisits: number;
  weekVisits: number;
  activeVisits: number;
  dailyAverage: number;
}

// Legacy interface for compatibility
export interface LegacyStats {
  totalVisits: number;
  activeVisits: number;
  totalVisitors: number;
  averageVisitDuration?: number;
}

export interface VisitsByDate {
  date: string;
  count: number;
}
