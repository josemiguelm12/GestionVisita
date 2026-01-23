import api from './axiosConfig';
import type { Visit, CreateVisitRequest } from '../types/visit.types';

export const visitApi = {
  getAll: async (): Promise<Visit[]> => {
    const response = await api.get<Visit[]>('/visit');
    return response.data;
  },

  getById: async (id: number): Promise<Visit> => {
    const response = await api.get<{ data: Visit }>(`/visit/${id}`);
    return response.data.data;
  },

  create: async (data: CreateVisitRequest): Promise<Visit> => {
    const response = await api.post<{ data: Visit }>('/visit', data);
    return response.data.data;
  },

  close: async (id: number): Promise<Visit> => {
    const response = await api.post<{ data: Visit }>(`/visit/${id}/close`);
    return response.data.data;
  },

  getActive: async (): Promise<Visit[]> => {
    const response = await api.get<Visit[]>('/visit/active');
    return response.data;
  },
};
