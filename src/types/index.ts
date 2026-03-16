// Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  tenant_id: number;
}

export interface Tenant {
  id: number;
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  logo_url: string;
  receipt_template: string;
  receipt_width: '58mm' | '80mm';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  store_name: string;
  admin_name: string;
  admin_email: string;
  password: string;
  license_key: string;

}

export interface AuthResponse {
  token: string;
  user: User;
}

// Menu Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuVariation {
  id: number;
  name: string;
  option: string;
  price: number;
  stock: number;
  is_active: boolean;
}

export interface MenuImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Menu {
  id: number;
  category_id: number;
  name: string;
  description: string;
  base_price: number;
  is_available: boolean;
  prep_time?: number;
  category?: Category;
  variations: MenuVariation[];
  images: MenuImage[];
}

export interface MenuFormData {
  category_id: number;
  name: string;
  description: string;
  base_price: number;
  prep_time?: number;
  variations: Omit<MenuVariation, 'id'>[];
}

// Order Types
export interface CartItem {
  menu_id: number;
  name: string;
  price: number;
  quantity: number;
  variation_id?: number;
  variation_name?: string;
  notes?: string;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  total_amount: number;
  payment_method: 'cash' | 'qris' | 'transfer';
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  menu_id: number;
  menu_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variation_name?: string;
  notes?: string;
}

export interface OrderRequest {
  customer_name?: string;
  payment_method: string;
  notes?: string;
  items: {
    menu_id: number;
    variation_id?: number;
    quantity: number;
    price: number;
    notes?: string;
  }[];
}

// Report Types
export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: string;
  notes?: string;
}

export interface ExpenseFormData {
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: string;
  notes?: string;
}

export interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}

export interface RevenueSummary {
  total: number;
  average: number;
  data: { date: string; revenue: number }[];
}

// Template Types
export interface ReceiptTemplate {
  id: number;
  name: string;
  description?: string;
  header: string;
  footer: string;
  show_logo: boolean;
  show_tax: boolean;
  show_discount: boolean;
  paper_width: '58mm' | '80mm';
  font_size: number;
  logo_position: 'left' | 'center' | 'right';
  margin_top: number;
  margin_bottom: number;
  show_variations: boolean;
  show_notes: boolean;
  is_default: boolean;
}

// Store Settings
export interface StoreSettings {
  printer_mac?: string;
  printer_width: '58mm' | '80mm';
  tax_rate: number;
  currency: string;
  receipt_header?: string;
  receipt_footer?: string;
}