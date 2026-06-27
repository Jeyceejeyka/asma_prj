import { create } from "zustand";
import { api } from "@/lib/api";

export interface Order {
  id: number;z
  status: string;
  total: number;
  created_at?: string;
  items?: Array<{
    id?: number;
    product?: any;
    product_id?: number;
    name?: string;
    size?: string;
    quantity: number;
    price: number | string;
  }>;
  customer?: any;
  phone?: string;
  address?: string;
  payment_ref?: string;
  [k: string]: any;
}

interface OrdersState {
  myOrders: Order[];
  adminOrders: Order[];
  loading: boolean;
  error: string | null;

  createOrder: (payload: any) => Promise<Order>;
  fetchMine: () => Promise<void>;
  fetchOne: (id: number) => Promise<Order>;
  cancel: (id: number) => Promise<void>;

  fetchAdminOrders: () => Promise<void>;
  fetchAdminOrder: (id: number) => Promise<Order>;
  updateAdminStatus: (id: number, status: string) => Promise<Order>;
}

const unwrap = <T,>(d: any): T[] =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export const useOrdersStore = create<OrdersState>((set, get) => ({
  myOrders: [],
  adminOrders: [],
  loading: false,
  error: null,

  createOrder: async (payload) => {
    return await api<Order>("/orders/create/", { method: "POST", body: payload });
  },

  fetchMine: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api<any>("/orders/my-orders/");
      set({ myOrders: unwrap<Order>(data), loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load orders", loading: false });
    }
  },

  fetchOne: async (id) => api<Order>(`/orders/${id}/`),

  cancel: async (id) => {
    await api(`/orders/${id}/cancel/`, { method: "POST" });
    set({ myOrders: get().myOrders.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o)) });
  },

  fetchAdminOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api<any>("/orders/admin/orders/");
      set({ adminOrders: unwrap<Order>(data), loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load orders", loading: false });
    }
  },

  fetchAdminOrder: async (id) => api<Order>(`/orders/admin/orders/${id}/`),

  updateAdminStatus: async (id, status) => {
    const updated = await api<Order>(`/orders/admin/orders/${id}/update-status/`, {
      method: "POST",
      body: { status },
    });
    set({
      adminOrders: get().adminOrders.map((o) => (o.id === id ? { ...o, ...updated } : o)),
    });
    return updated;
  },
}));
