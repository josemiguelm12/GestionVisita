import api from './axiosConfig';
import type { Visitor, CreateVisitorRequest } from '../types/visitor.types';

export const visitorApi = {
  getAll: async (): Promise<Visitor[]> => {
    const response = await api.get<Visitor[]>('/visitor');
    return response.data;
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
    const response = await api.get<Visitor[]>(`/visitor/search?q=${query}`);
    return response.data;
  },
};
