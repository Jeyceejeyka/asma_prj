import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import { clearAuthSession, readAuthSession, writeAuthSession } from "@/lib/authStorage";

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapped: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  fetchMe: (force?: boolean) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    token: string,
    new_password: string
  ) => Promise<void>;
  changePassword: (old_password: string, new_password: string) => Promise<void>;
  updateProfile: (
    data: Partial<Pick<AuthUser, "first_name" | "last_name" | "email">>
  ) => Promise<void>;
}

/**
 * Normalize backend user → frontend user model
 */
const toUser = (u: any): AuthUser => ({
  id: u.id,
  email: u.email,
  first_name: u.first_name ?? "",
  last_name: u.last_name ?? "",
  role: u.is_staff || u.is_superuser || u.role === "admin" ? "admin" : "user",
});

// Clean up any legacy tokens (safe to ignore)
try {
  localStorage.removeItem("asma-access-token");
  localStorage.removeItem("asma-refresh-token");
  localStorage.removeItem("asma-user");
  sessionStorage.removeItem("asma-access-token");
  sessionStorage.removeItem("asma-refresh-token");
} catch {
  // ignore
}

// Listen for session expiration events from api.ts
if (typeof window !== "undefined") {
  window.addEventListener("auth:session-expired", () => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      store.logout();
    }
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapped: false,

  // =========================
  // BOOTSTRAP / FETCH CURRENT USER
  // =========================
  bootstrap: async () => {
    const session = readAuthSession();
    if (session?.user) {
      set({ user: session.user, isAuthenticated: true });
    }
    await get().fetchMe();
  },

  fetchMe: async (force = false) => {
    console.log("[ME] Fetching user");

    if (get().isBootstrapped && get().user && !force) {
      console.log("[ME] Already bootstrapped and user exists, skipping verification");
      return;
    }

    set({ isLoading: true });

    try {
      const data = await api<any>("/accounts/me/");
      const user = toUser(data);

      console.log("[ME] Response:", data);

      set({ user, isAuthenticated: true, isBootstrapped: true });
      writeAuthSession({
        user,
        lastVerifiedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[ME] Error:", e);

      if (e instanceof ApiError && e.status === 401) {
        clearAuthSession();
        set({ user: null, isAuthenticated: false, isBootstrapped: true });
      } else if (e instanceof ApiError && e.status === 0) {
        set({ isBootstrapped: true });
      } else {
        set({ user: null, isAuthenticated: false, isBootstrapped: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // LOGIN
  // =========================
  login: async (email, password) => {
    console.log("[LOGIN] Start", { email });

    set({ isLoading: true });

    try {
      const data = await api<any>("/accounts/login/", {
        method: "POST",
        body: { email, password },
        auth: false,
      });

      console.log("[LOGIN] Response:", data);

      const user = toUser(data.user ?? data);
      writeAuthSession({ user, lastVerifiedAt: new Date().toISOString() });

      set({ user, isAuthenticated: true, isBootstrapped: true });
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // REGISTER (Updated with username generation)
  // =========================
  register: async (data) => {
    console.log("[REGISTER] Payload:", data);

    set({ isLoading: true });

    try {
      let username = `${data.first_name}${data.last_name}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (username.length < 3) {
        username = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      }

      const randomSuffix = Math.floor(Math.random() * 1000);
      const finalUsername = `${username}${randomSuffix}`;

      const payload = {
        username: finalUsername,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password2: data.password,
      };

      console.log("[REGISTER] Generated username:", finalUsername);
      console.log("[REGISTER] Sending payload:", payload);

      const result = await api<any>("/accounts/register/", {
        method: "POST",
        body: payload,
        auth: false,
      });

      console.log("[REGISTER] Response:", result);

      const user = toUser(result.user ?? result);
      writeAuthSession({ user, lastVerifiedAt: new Date().toISOString() });

      console.log("[REGISTER] Registration successful, user:", user);

      set({ user, isAuthenticated: true, isBootstrapped: true });
    } catch (err) {
      console.error("[REGISTER] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    console.log("[LOGOUT] Start");

    set({ isLoading: true });

    try {
      await api("/accounts/logout/", {
        method: "POST",
        auth: false,
        body: {},
      });
      console.log("[LOGOUT] Success");
    } catch (err) {
      console.warn("[LOGOUT] Error ignored:", err);
    } finally {
      clearAuthSession();
      set({
        user: null,
        isAuthenticated: false,
        isBootstrapped: true,
        isLoading: false,
      });
    }
  },

  // =========================
  // PASSWORD RESET REQUEST
  // =========================
  requestPasswordReset: async (email) => {
    console.log("[RESET REQUEST]", email);

    set({ isLoading: true });

    try {
      await api("/accounts/forgot-password/", {
        method: "POST",
        body: { email },
      });
    } catch (err) {
      console.error("[RESET REQUEST] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // RESET PASSWORD
  // =========================
  resetPassword: async (email, token, new_password) => {
    console.log("[RESET PASSWORD]", { email });

    set({ isLoading: true });

    try {
      await api("/accounts/reset-password/", {
        method: "POST",
        body: { email, token, new_password },
      });
    } catch (err) {
      console.error("[RESET PASSWORD] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // CHANGE PASSWORD
  // =========================
  changePassword: async (old_password, new_password) => {
    console.log("[CHANGE PASSWORD]");

    set({ isLoading: true });

    try {
      await api("/accounts/change-password/", {
        method: "POST",
        body: { old_password, new_password },
      });
    } catch (err) {
      console.error("[CHANGE PASSWORD] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // =========================
  // UPDATE PROFILE
  // =========================
  updateProfile: async (data) => {
    console.log("[UPDATE PROFILE]", data);

    set({ isLoading: true });

    try {
      const result = await api<any>("/accounts/me/", {
        method: "PATCH",
        body: data,
      });

      console.log("[UPDATE PROFILE] Response:", result);

      set({
        user: toUser(result),
      });
    } catch (err) {
      console.error("[UPDATE PROFILE] Error:", err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));