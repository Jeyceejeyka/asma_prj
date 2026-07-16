// Centralized API client for the Asma Perfumes Django backend.
// Authentication uses httpOnly cookies set by the backend. The browser
// attaches them automatically via `credentials: "include"`.

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000/api/v1";

// Lightweight connectivity tracker so UI can surface a "backend unreachable" banner.
type Listener = (online: boolean) => void;
const listeners = new Set<Listener>();
let _online = true;

export const apiHealth = {
  get online() {
    return _online;
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  _set(v: boolean) {
    if (_online === v) return;
    _online = v;
    listeners.forEach((l) => l(v));
  },
};

export class ApiError extends Error {
  status: number;
  data: any;
  url: string;
  method: string;
  
  constructor(message: string, status: number, data: any, url?: string, method?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.url = url || "unknown";
    this.method = method || "unknown";
  }
}

let refreshPromise: Promise<boolean> | null = null;

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(`(^|; )${name}=([^;]*)`);
  return match ? decodeURIComponent(match[2]) : null;
};

const tryRefresh = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      console.log("🔄 [API] Attempting token refresh");

      const res = await fetch(`${API_BASE}/accounts/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(getCookieValue("csrftoken") ? { "X-CSRFToken": getCookieValue("csrftoken")! } : {}),
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        console.warn(`❌ [API] Token refresh failed: ${res.status} ${res.statusText}`);
        return false;
      }

      console.log("✅ [API] Token refresh successful");
      return true;
    } catch (error) {
      console.error("💥 [API] Token refresh error:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

interface Options extends Omit<RequestInit, "body"> {
  auth?: boolean;
  authToken?: string;
  refreshToken?: string;
  body?: any;
  raw?: boolean;
  _retried?: boolean;
}

export const api = async <T = any>(path: string, opts: Options = {}): Promise<T> => {
  const {
    body,
    raw = false,
    headers: hdrs,
    _retried,
    auth = true,
    ...rest
  } = opts;
  const method = rest.method || "GET";
  const fullUrl = `${API_BASE}${path}`;
  
  console.log(`src/lib/api.ts: 📡 [API] ${method} ${path}`);
  if (body !== undefined) {
    console.log("src/lib/api.ts: 📤 [API] Request body:", body instanceof FormData ? "[FormData]" : body);
  }

  const buildHeaders = (): HeadersInit => {
    const h: Record<string, string> = {
      Accept: "application/json",
      ...(hdrs as any),
    };

    if (body !== undefined && !(body instanceof FormData)) {
      h["Content-Type"] = "application/json";
    }

    const csrfToken = getCookieValue("csrftoken");
    if (csrfToken && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      h["X-CSRFToken"] = csrfToken;
    }

    return h;
  };

  const doFetch = async () =>
    fetch(fullUrl, {
      ...rest,
      credentials: "include",
      headers: buildHeaders(),
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
          ? body
          : JSON.stringify(body),
    });


  let res: Response;
  
  try {
    res = await doFetch();
    apiHealth._set(true);
    console.log(`📥 [API] Response: ${res.status} ${res.statusText}`);
  } catch (error: any) {
    console.error('error', error);
    apiHealth._set(false);
    throw new ApiError(
      `Network error: ${error.message}`,
      0,
      { originalError: error.message },
      path,
      method
    );
  }

  // On 401, attempt token refresh
  const isAuthRoute = path.includes("/accounts/login") ||
    path.includes("/accounts/refresh") ||
    path.includes("/accounts/logout") ||
    path.includes("/accounts/register");

  if (res.status === 401 && !_retried && !isAuthRoute) {
    console.log("🔐 [API] 401 Unauthorized, attempting refresh");

    const refreshSuccess = await tryRefresh();

    if (refreshSuccess) {
      try {
        console.log("🔄 [API] Retrying request after refresh");
        res = await doFetch();
        console.log(`📥 [API] Retry response: ${res.status} ${res.statusText}`);
      } catch (error: any) {
        console.error("💥 [API] Retry failed:", error);
        throw new ApiError(`Retry failed: ${error.message}`, 0, null, path, method);
      }
    } else {
      console.log("🚫 [API] Refresh failed, session expired");
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      throw new ApiError("Session expired. Please login again.", 401, null, path, method);
    }
  }

  // Handle error responses
  if (!res.ok) {
    let data: any = null;
    let errorText = "";
    
    try {
      errorText = await res.text();
      try {
        data = JSON.parse(errorText);
      } catch {
        data = { raw: errorText };
      }
    } catch (e) {
      console.error("💥 [API] Failed to parse error response:", e);
    }
    
    // Log detailed error
    console.error("💥 [API] Request failed:", {
      status: res.status,
      statusText: res.statusText,
      url: fullUrl,
      method: method,
      responseData: data,
      rawResponse: errorText.substring(0, 500),
    });
    
    // Extract error message
    let message = `HTTP ${res.status} ${res.statusText}`;
    if (data?.detail) message = data.detail;
    else if (data?.message) message = data.message;
    else if (data?.error) message = data.error;
    else if (typeof data === "object" && data !== null) {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) message = firstError[0];
      else if (typeof firstError === "string") message = firstError;
    } else if (errorText) {
      message = errorText.substring(0, 200);
    }
    
    throw new ApiError(message, res.status, data, path, method);
  }

  if (raw) return res as any;
  if (res.status === 204) return undefined as any;

  const ct = res.headers.get("content-type") || "";
  const responseText = await res.text();
  if (!responseText) {
    console.log(`✅ [API] Success: ${method} ${path} (empty body)`);
    return undefined as any;
  }
  if (!ct.includes("application/json")) {
    console.log(`✅ [API] Success: ${method} ${path} (non-json response)`);
    return undefined as any;
  }

  let jsonData: any;
  try {
    jsonData = JSON.parse(responseText);
  } catch (parseError) {
    console.error(`💥 [API] JSON parse error for ${method} ${path}:`, parseError, "responseText=", responseText);
    throw new ApiError(
      `Invalid JSON response from server: ${parseError.message}`,
      res.status,
      { raw: responseText },
      path,
      method
    );
  }

  console.log(`✅ [API] Success: ${method} ${path}`);
  return jsonData as T;
};