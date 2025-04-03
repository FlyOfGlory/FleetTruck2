import { Overtime, OvertimeFormData } from '../types/overtime';
import { api } from './api';

export const overtimeService = {
  getAll: async (): Promise<Overtime[]> => {
    const response = await api.get('/overtime');
    return response.data;
  },

  getById: async (id: string): Promise<Overtime> => {
    const response = await api.get(`/overtime/${id}`);
    return response.data;
  },

  create: async (data: OvertimeFormData): Promise<Overtime> => {
    const response = await api.post('/overtime', data);
    return response.data;
  },

  update: async (id: string, data: OvertimeFormData): Promise<Overtime> => {
    const response = await api.put(`/overtime/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/overtime/${id}`);
  },

  getByEmployeeId: async (employeeId: string): Promise<Overtime[]> => {
    const response = await api.get(`/overtime/employee/${employeeId}`);
    return response.data;
  }
}; 