import axios from 'axios';
import { Order, OrderRequest } from '../types';

const API_URL = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderApi = {
  createOrder: async (order: OrderRequest): Promise<Order> => {
    const response = await api.post('/orders', order);
    return response.data;
  },

  getOrders: async (page: number = 1, limit: number = 20, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getRecentOrders: async (days: number = 7): Promise<Order[]> => {
    const response = await api.get(`/orders/tenant/${days}`);
    return response.data;
  },

  deleteOldOrders: async (days: number): Promise<{ deleted: number; message: string }> => {
    const response = await api.delete(`/orders/cleanup?days=${days}`);
    return response.data;
  },
};
