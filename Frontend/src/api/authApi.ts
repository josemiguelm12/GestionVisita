import api from './axiosConfig';
import type{ LoginRequest, LoginResponse, User } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  checkToken: async (): Promise<{ valid: boolean }> => {
    const response = await api.get<{ valid: boolean }>('/auth/check');
    return response.data;
  },
};
