import axios from 'axios';
import { Expense, ExpenseFormData, DailyReport, RevenueSummary } from '../types';

const API_URL = import.meta.env.VITE_REPORT_SERVICE_URL || 'http://localhost:3003';

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

export const reportApi = {
  // Expenses
  getExpenses: async (page: number = 1, limit: number = 20, startDate?: string, endDate?: string, category?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (category) params.append('category', category);

    const response = await api.get('/expenses', { params });
    return response.data;
  },

  createExpense: async (data: ExpenseFormData) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: number, data: Partial<Expense>) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: number) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getExpenseCategories: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get('/expenses/categories/summary', { params });
    return response.data;
  },

  // Reports
  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await api.get('/reports/daily', { params });
    return response.data;
  },

  getMonthlyReport: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },

  getYearlyReport: async (year?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());

    const response = await api.get('/reports/yearly', { params });
    return response.data;
  },

  getRevenueSummary: async (days: number = 30): Promise<RevenueSummary> => {
    const response = await api.get('/reports/revenue', { params: { days } });
    return response.data;
  },

  // Templates
  getTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  createTemplate: async (data: any) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  updateTemplate: async (id: number, data: any) => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: number) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  setDefaultTemplate: async (id: number) => {
    const response = await api.patch(`/templates/${id}/default`);
    return response.data;
  },

  // Print
  printReceipt: async (orderId: number, printerMAC: string, templateId?: number, copies: number = 1) => {
    const response = await api.post(`/print/receipt/${orderId}`, {
      printer_mac: printerMAC,
      template_id: templateId,
      copies,
    });
    return response.data;
  },

    printTest: async (printerMAC: string, paperWidth: string = '58mm') => {
    const response = await api.post('/print/test', {
      printer_mac: printerMAC,
      paper_width: paperWidth,
    });
    return response.data;
  },
};