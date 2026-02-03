import api from './axiosConfig';
import type { Stats, VisitsByDate } from '../types/stats.types';

export const statsApi = {
  // KPIs principales del dashboard
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/stats/kpis');
    return response.data;
  },

  // Tendencia diaria: se transforma a {date, count}[]
  getVisitsByDate: async (days: number = 7): Promise<VisitsByDate[]> => {
    const response = await api.get<{ dates: string[]; visits: number[] }>(`/stats/daily?days=${days}`);
    const { dates, visits } = response.data;
    return dates.map((date, idx) => ({ date, count: visits[idx] ?? 0 }));
  },
};
