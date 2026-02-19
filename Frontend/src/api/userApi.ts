import api from './axiosConfig';
import type { User, CreateUserRequest, UpdateUserRequest, Role } from '../types/user.types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<{ data: User[] }>('/user');
    return response.data.data || [];
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<{ data: User }>(`/user/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<{ data: User }>('/user', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<{ data: User }>(`/user/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/user/${id}`);
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<{ data: Role[] }>('/user/roles');
    return response.data.data || [];
  },
};
