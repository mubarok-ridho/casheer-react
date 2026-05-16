import axios from 'axios';
import { Menu, Category } from '../types';

const API_URL = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const menuApi = {
  // ── Categories ────────────────────────────────────────────────────────────
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },
  createCategory: async (data: Partial<Category>) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id: number, data: Partial<Category>) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // ── Menus ─────────────────────────────────────────────────────────────────
  getMenus: async (categoryId?: number, search?: string): Promise<Menu[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId.toString());
    if (search) params.append('search', search);
    const response = await api.get('/menus', { params });
    return response.data;
  },

  getMenu: async (id: number): Promise<Menu> => {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  createMenu: async (formData: FormData) => {
    const response = await api.post('/menus', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update menu data + gambar (dari MenuForm) — pakai multipart/form-data
   * PENTING: FormData harus sudah include is_available sebagai string "true"/"false"
   */
  updateMenuForm: async (id: number, formData: FormData) => {
    const response = await api.put(`/menus/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Toggle available/habis — pakai JSON, endpoint terpisah supaya tidak
   * tertimpa saat edit form
   */
  setAvailability: async (id: number, isAvailable: boolean) => {
    const response = await api.patch(`/menus/${id}/availability`, {
      is_available: isAvailable,
    });
    return response.data;
  },

  deleteMenu: async (id: number) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },

  // ── Images ────────────────────────────────────────────────────────────────
  uploadImage: async (menuId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/menus/${menuId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteImage: async (menuId: number, imageId: number) => {
    const response = await api.delete(`/menus/${menuId}/images/${imageId}`);
    return response.data;
  },

  // ── Best seller ───────────────────────────────────────────────────────────
  getBestSeller: async (limit = 10, days = 30): Promise<Menu[]> => {
    const response = await api.get('/menus/bestseller', { params: { limit, days } });
    return response.data;
  },

  // ── Variations ────────────────────────────────────────────────────────────
  updateVariationStock: async (variationId: number, stock: number) => {
    const response = await api.patch(`/variations/${variationId}/stock`, { stock });
    return response.data;
  },
};
export const promoApi = {
  getAll: async () => {
    const response = await api.get('/promos');
    return response.data;
  },
  // Hanya promo aktif & belum expired — untuk halaman kasir
  getActive: async () => {
    const response = await api.get('/promos');
    const all: any[] = Array.isArray(response.data) ? response.data : [];
    const now = new Date();
    return all.filter(p =>
      p.is_active &&
      new Date(p.start_at) <= now &&
      (p.end_at === null || new Date(p.end_at) > now)
    );
  },
  create: async (data: any) => {
    const response = await api.post('/promos', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/promos/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/promos/${id}`);
    return response.data;
  },
};