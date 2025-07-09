import { authService } from "./AuthService";

export interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
  includeCSRF?: boolean;
}

/**
 * Auth middleware for fetch requests
 */
export async function authFetch(
  url: string,
  config: RequestConfig = {}
): Promise<Response> {
  const { requireAuth = true, includeCSRF = true, ...fetchConfig } = config;

  // Auth gerekli ama kullanıcı authenticated değilse
  if (requireAuth && !authService.getState().isAuthenticated) {
    throw new Error("Authentication required");
  }

  // Headers hazırla
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchConfig.headers as Record<string, string>),
  };

  // CSRF token ekle
  if (includeCSRF && requireAuth) {
    const csrfToken = authService.getCSRFToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    // 401 Unauthorized - token invalid
    if (response.status === 401 && requireAuth) {
      console.warn("Unauthorized response, logging out...");
      await authService.logout();
      throw new Error("Session expired");
    }

    // 403 Forbidden - CSRF token invalid
    if (response.status === 403 && includeCSRF) {
      console.warn("CSRF token invalid");
      throw new Error("Security token invalid");
    }

    return response;
  } catch (error) {
    // Network veya diğer hatalar
    if (error instanceof TypeError) {
      throw new Error("Network error");
    }
    throw error;
  }
}

/**
 * API wrapper with automatic auth
 */
export const api = {
  get: (url: string, config?: RequestConfig) =>
    authFetch(url, { ...config, method: "GET" }),

  post: (url: string, data?: any, config?: RequestConfig) =>
    authFetch(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (url: string, data?: any, config?: RequestConfig) =>
    authFetch(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string, config?: RequestConfig) =>
    authFetch(url, { ...config, method: "DELETE" }),

  // Public endpoints (no auth required)
  public: {
    get: (url: string, config?: Omit<RequestConfig, "requireAuth">) =>
      authFetch(url, { ...config, requireAuth: false, includeCSRF: false }),

    post: (
      url: string,
      data?: any,
      config?: Omit<RequestConfig, "requireAuth">
    ) =>
      authFetch(url, {
        ...config,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        requireAuth: false,
        includeCSRF: false,
      }),
  },
};

/**
 * Token expiry check middleware
 */
export function createTokenExpiryMiddleware(
  warningThreshold: number = 5 * 60 * 1000
) {
  return () => {
    const remainingTime = authService.getTokenRemainingTime();

    if (remainingTime > 0 && remainingTime < warningThreshold) {
      // Token yakında expire olacak, kullanıcıyı uyar
      window.dispatchEvent(
        new CustomEvent("token-expiry-warning", {
          detail: { remainingTime },
        })
      );
    }
  };
}

// Global token expiry checker
let tokenExpiryInterval: NodeJS.Timeout | null = null;

export function startTokenExpiryMonitoring() {
  if (tokenExpiryInterval) {
    clearInterval(tokenExpiryInterval);
  }

  const checkExpiry = createTokenExpiryMiddleware();

  // Her dakika kontrol et
  tokenExpiryInterval = setInterval(checkExpiry, 60 * 1000);
}

export function stopTokenExpiryMonitoring() {
  if (tokenExpiryInterval) {
    clearInterval(tokenExpiryInterval);
    tokenExpiryInterval = null;
  }
}
