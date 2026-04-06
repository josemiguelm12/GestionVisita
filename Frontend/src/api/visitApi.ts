import api from './axiosConfig';
import type { Visit, CreateVisitRequest, VisitsApiResponse } from '../types/visit.types';

export const visitApi = {
  getAll: async (): Promise<VisitsApiResponse> => {
    const response = await api.get<VisitsApiResponse>('/visit');
    return response.data;
  },

  getPaged: async (page: number, perPage: number, search?: string, statusId?: number): Promise<VisitsApiResponse> => {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (search) params.search = search;
    if (statusId !== undefined) params.status_id = statusId;
    const response = await api.get<VisitsApiResponse>('/visit', { params });
    return response.data;
  },

  getReport: async (page: number, perPage: number, dateFrom: string, dateTo: string, statusId?: number): Promise<VisitsApiResponse> => {
    const params: Record<string, string | number> = { page, per_page: perPage, date_from: dateFrom, date_to: dateTo };
    if (statusId !== undefined) params.status_id = statusId;
    const response = await api.get<VisitsApiResponse>('/visit', { params });
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
    const response = await api.get<{ data: Visit[] }>('/visit/active');
    return response.data.data || [];
  },
};
