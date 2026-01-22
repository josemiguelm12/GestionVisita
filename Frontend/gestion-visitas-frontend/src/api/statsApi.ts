import api from './axiosConfig';
import { Stats, VisitsByDate } from '../types/stats.types';

export const statsApi = {
  getStats: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/stats');
    return response.data;
  },

  getVisitsByDate: async (startDate?: string, endDate?: string): Promise<VisitsByDate[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<VisitsByDate[]>(`/stats/visits-by-date?${params}`);
    return response.data;
  },
};
