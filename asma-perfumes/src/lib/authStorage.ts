// export interface AuthSessionPayload {
//   user: {
//     id: number;
//     email: string;
//     first_name: string;
//     last_name: string;
//     role: "user" | "admin";
//   };
//   lastVerifiedAt?: string;
// }

// const STORAGE_KEY = "asma-auth-session";

// export const readAuthSession = (): AuthSessionPayload | null => {
//   if (typeof window === "undefined") return null;

//   try {
//     const raw = sessionStorage.getItem(STORAGE_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw) as AuthSessionPayload;
//   } catch {
//     return null;
//   }
// };

// export const writeAuthSession = (payload: AuthSessionPayload) => {
//   if (typeof window === "undefined") return;

//   try {
//     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
//   } catch {
//     // ignore storage failures
//   }
// };

// export const clearAuthSession = () => {
//   if (typeof window === "undefined") return;
//   try {
//     sessionStorage.removeItem(STORAGE_KEY);
//   } catch {
//     // ignore
//   }
// };


export interface AuthSessionPayload {
  user: {
    id: number;
    first_name: string;
  };
  lastVerifiedAt?: string;
}

const STORAGE_KEY = "asma-auth-session";

/**
 * Read cached user data from sessionStorage.
 * Returns null if nothing exists or parsing fails.
 */
export const readAuthSession = (): AuthSessionPayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthSessionPayload;
  } catch (error) {
    error("Failed to read auth session:", error);
    return null;
  }
};

/**
 * Store only minimal UI data.
 * Never store access tokens or refresh tokens.
 */
export const writeAuthSession = (payload: AuthSessionPayload): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch (error) {
    error("Failed to write auth session:", error);
  }
};

/**
 * Remove cached session data.
 */
export const clearAuthSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    error("Failed to clear auth session:", error);
  }
};