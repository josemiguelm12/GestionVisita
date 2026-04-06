import api from './axiosConfig';
import type { Visitor, CreateVisitorRequest } from '../types/visitor.types';

export interface PagedVisitorsResponse {
  data: Visitor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const visitorApi = {
  getPaged: async (page: number = 1, pageSize: number = 10, search?: string): Promise<PagedVisitorsResponse> => {
    const params: Record<string, string | number> = { page, pageSize };
    if (search?.trim()) params.search = search.trim();
    const response = await api.get<PagedVisitorsResponse>('/visitor', { params });
    return response.data;
  },

  getAll: async (): Promise<Visitor[]> => {
    const response = await api.get<{ data: Visitor[] }>('/visitor', { params: { page: 1, pageSize: 1000 } });
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Visitor> => {
    const response = await api.get<{ data: Visitor }>(`/visitor/${id}`);
    return response.data.data;
  },

  create: async (data: CreateVisitorRequest): Promise<Visitor> => {
    const response = await api.post<{ data: Visitor; message: string }>('/visitor', data);
    return response.data.data;
  },

  update: async (id: number, data: CreateVisitorRequest): Promise<Visitor> => {
    const response = await api.put<{ data: Visitor }>(`/visitor/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/visitor/${id}`);
  },

  search: async (query: string): Promise<Visitor[]> => {
    const response = await api.get<{ data: Visitor[] }>(`/visitor/search?q=${query}`);
    return response.data.data || [];
  },
};
