import apiClient from './apiClient';

export const authApi = {
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  refresh: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, new_password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, new_password });
    return response.data;
  }
};
