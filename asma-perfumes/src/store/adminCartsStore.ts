// Admin cart inspection / management endpoints.
import { create } from "zustand";
import { api } from "@/lib/api";

export interface AdminCart {
  id: number;
  user?: any;
  items?: any[];
  total?: number | string;
  [k: string]: any;
}

interface AdminCartsState {
  carts: AdminCart[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchOne: (cartId: number) => Promise<AdminCart>;
  removeCart: (cartId: number) => Promise<void>;
  fetchItems: (cartId: number) => Promise<any[]>;
  fetchItem: (cartId: number, itemId: number) => Promise<any>;
  removeItem: (cartId: number, itemId: number) => Promise<void>;
  fetchUserCarts: (userId: number) => Promise<AdminCart[]>;
}

const unwrap = <T,>(d: any): T[] =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export const useAdminCartsStore = create<AdminCartsState>((set, get) => ({
  carts: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api<any>("/cart/admin/carts/");
      set({ carts: unwrap<AdminCart>(data), loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load carts", loading: false });
    }
  },

  fetchOne: (cartId) => api<AdminCart>(`/cart/admin/carts/${cartId}/`),

  removeCart: async (cartId) => {
    await api(`/cart/admin/carts/${cartId}/delete/`, { method: "DELETE" });
    set({ carts: get().carts.filter((c) => c.id !== cartId) });
  },

  fetchItems: async (cartId) => unwrap(await api<any>(`/cart/admin/carts/${cartId}/items/`)),

  fetchItem: (cartId, itemId) =>
    api(`/cart/admin/carts/${cartId}/items/${itemId}/`),

  removeItem: async (cartId, itemId) => {
    await api(`/cart/admin/carts/${cartId}/items/${itemId}/delete/`, { method: "DELETE" });
  },

  fetchUserCarts: async (userId) =>
    unwrap<AdminCart>(await api<any>(`/cart/admin/users/${userId}/carts/`)),
}));
