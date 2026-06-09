// Admin user management endpoints (/api/v1/accounts/users/...)
import { create } from "zustand";
import { api } from "@/lib/api";

export interface AdminUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  [k: string]: any;
}

interface UsersState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchOne: (id: number) => Promise<AdminUser>;
  update: (id: number, payload: Partial<AdminUser>) => Promise<AdminUser>;
  remove: (id: number) => Promise<void>;
}

const unwrap = <T,>(d: any): T[] =>
  Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : [];

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api<any>("/accounts/users/");
      set({ users: unwrap<AdminUser>(data), loading: false });
    } catch (e: any) {
      set({ error: e.message || "Failed to load users", loading: false });
    }
  },

  fetchOne: (id) => api<AdminUser>(`/accounts/users/${id}/`),

  update: async (id, payload) => {
    const updated = await api<AdminUser>(`/accounts/users/${id}/update/`, {
      method: "PATCH",
      body: payload,
    });
    set({ users: get().users.map((u) => (u.id === id ? { ...u, ...updated } : u)) });
    return updated;
  },

  remove: async (id) => {
    await api(`/accounts/users/${id}/delete/`, { method: "DELETE" });
    set({ users: get().users.filter((u) => u.id !== id) });
  },
}));
