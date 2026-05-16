import axios from 'axios';
import { Ingredient, MenuIngredient, MarginSummary, MenuMargin, StoreSettings } from '../types';

const MENU_URL = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';
const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';

const menuApi = axios.create({ baseURL: `${MENU_URL}/api/v1` });
const authApi = axios.create({ baseURL: `${AUTH_URL}/api/v1` });

const withAuth = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
};

menuApi.interceptors.request.use(withAuth);
authApi.interceptors.request.use(withAuth);

// ── Ingredients ───────────────────────────────────────────────────────────────
export const ingredientApi = {
  getAll: async (): Promise<Ingredient[]> => {
    const res = await menuApi.get('/ingredients');
    return res.data;
  },

  getLowStock: async (): Promise<Ingredient[]> => {
    const res = await menuApi.get('/ingredients/low-stock');
    return res.data;
  },

  create: async (data: Omit<Ingredient, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Ingredient> => {
    const res = await menuApi.post('/ingredients', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await menuApi.put(`/ingredients/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await menuApi.delete(`/ingredients/${id}`);
  },

  // ── Menu Ingredients ───────────────────────────────────────────────────────
  getMenuIngredients: async (menuId: number): Promise<MenuIngredient[]> => {
    const res = await menuApi.get(`/menus/${menuId}/ingredients`);
    return res.data;
  },

  setMenuIngredients: async (menuId: number, items: { ingredient_id: number; amount: number }[]): Promise<void> => {
    await menuApi.put(`/menus/${menuId}/ingredients`, items);
  },
};

// ── Margins ───────────────────────────────────────────────────────────────────
export const marginsApi = {
  getSummary: async (days = 30): Promise<MarginSummary> => {
    const res = await menuApi.get('/margins', { params: { days } });
    return res.data;
  },

  getMenuBreakdown: async (days = 30): Promise<MenuMargin[]> => {
    const res = await menuApi.get('/margins/menu-breakdown', { params: { days } });
    return res.data;
  },
};

// ── Store Settings (enhanced mode) ────────────────────────────────────────────
export const settingsApi = {
  get: async (): Promise<StoreSettings> => {
    const res = await authApi.get('/settings');
    return res.data;
  },

  update: async (data: Partial<StoreSettings>): Promise<StoreSettings> => {
    const res = await authApi.put('/settings', data);
    return res.data;
  },

  setMarginsPassword: async (password: string): Promise<void> => {
    await authApi.post('/settings/margins-password', { password });
  },

  verifyMarginsPassword: async (password: string): Promise<boolean> => {
    try {
      await authApi.post('/settings/verify-margins-password', { password });
      return true;
    } catch {
      return false;
    }
  },
};

// ── Variation Ingredients ─────────────────────────────────────────────────────
export const variationIngredientApi = {
  get: async (variationId: number) => {
    const res = await menuApi.get(`/variations/${variationId}/ingredients`);
    return res.data;
  },
  set: async (variationId: number, items: { ingredient_id: number; amount: number }[]) => {
    await menuApi.put(`/variations/${variationId}/ingredients`, items);
  },
};
