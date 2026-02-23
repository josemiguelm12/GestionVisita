import api from './axiosConfig';

export interface Department {
  id: number;
  name: string;
  description: string | null;
}

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/department');
    return response.data;
  },
};
