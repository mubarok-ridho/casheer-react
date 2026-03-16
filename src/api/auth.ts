import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register (tenant baru)
  register: async (data: RegisterData): Promise<{ message: string; tenant_id: number }> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Get tenant profile
  getTenantProfile: async () => {
    const response = await api.get('/tenant/profile');
    return response.data;
  },

  // Update store setup
  updateStoreSetup: async (data: any) => {
    const response = await api.put('/tenant/setup', data);
    return response.data;
  },

  // Upload logo
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/tenant/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};