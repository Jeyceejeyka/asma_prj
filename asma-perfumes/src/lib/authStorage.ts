export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: "user" | "admin";
  };
  lastVerifiedAt?: string;
}

const STORAGE_KEY = "asma-auth-session";

export const readAuthSession = (): AuthSessionPayload | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSessionPayload;
  } catch {
    return null;
  }
};

export const writeAuthSession = (payload: AuthSessionPayload) => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
};

export const updateAuthSession = (partial: Partial<AuthSessionPayload>) => {
  const current = readAuthSession();
  if (!current) {
    if (partial.accessToken && partial.refreshToken) {
      writeAuthSession({
        accessToken: partial.accessToken,
        refreshToken: partial.refreshToken,
        user: partial.user,
        lastVerifiedAt: partial.lastVerifiedAt,
      });
    }
    return;
  }

  writeAuthSession({
    ...current,
    ...partial,
    user: partial.user ?? current.user,
    lastVerifiedAt: partial.lastVerifiedAt ?? current.lastVerifiedAt,
  });
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const getAccessToken = (): string | null => readAuthSession()?.accessToken ?? null;
export const getRefreshToken = (): string | null => readAuthSession()?.refreshToken ?? null;
