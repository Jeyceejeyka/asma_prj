// Payment endpoints: M-Pesa Daraja callback (public) + admin payment management.
import { create } from "zustand";
import { api } from "@/lib/api";

export interface Payment {
  id: number;
  order?: number;
  user?: number;
  amount: number | string;
  status?: string;
  reference?: string;
  phone?: string;
  created_at?: string;
  [k: string]: any;
}

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchAdmin: () => Promise<void>;
  fetchAdminOne: (id: number) => Promise<Payment>;
  removeAdmin: (id: number) => Promise<void>;
  fetchByOrder: (orderId: number) => Promise<Payment[]>;
  fetchByUser: (userId: number) => Promise<Payment[]>;
  fetchMine: () => Promise<Payment[]>;
  darajaCallback: (payload: any) => Promise<any>;
}

const unwrap = <T,>(d: any): T[] =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  loading: false,
  error: null,

  fetchAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api<any>("/payments/admin/payments/");
      set({ payments: unwrap<Payment>(data), loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load payments", loading: false });
    }
  },

  fetchAdminOne: (id) => api<Payment>(`/payments/admin/payments/${id}/`),

  removeAdmin: async (id) => {
    await api(`/payments/admin/payments/${id}/delete/`, { method: "DELETE" });
    set({ payments: get().payments.filter((p) => p.id !== id) });
  },

  fetchByOrder: async (orderId) => {
    const data = await api<any>(`/payments/admin/orders/${orderId}/payments/`);
    return unwrap<Payment>(data);
  },

  fetchByUser: async (userId) => {
    const data = await api<any>(`/payments/admin/users/${userId}/payments/`);
    return unwrap<Payment>(data);
  },

  fetchMine: async () => {
    const data = await api<any>("/payments/history/");
    const list = unwrap<Payment>(data);
    set({ payments: list, loading: false, error: null });
    return list;
  },

  darajaCallback: (payload) =>
    api("/payments/daraja/callback/", { method: "POST", auth: false, body: payload }),
}));
