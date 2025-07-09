"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";

/**
 * Auth state ve actions için custom hook
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Token validation interval
  useEffect(() => {
    // Her 5 dakikada bir token'ı kontrol et
    const interval = setInterval(async () => {
      if (authStore.isAuthenticated) {
        const isValid = await authService.validateAndRefreshToken();
        if (!isValid) {
          console.log("Token expired, logging out...");
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [authStore.isAuthenticated]);

  return {
    // State
    ...authStore,

    // Additional helpers
    getCSRFToken: () => authService.getCSRFToken(),
    getTokenRemainingTime: () => authService.getTokenRemainingTime(),
    getDebugInfo: () => authService.getDebugInfo(),

    // Validation
    validateToken: () => authService.validateAndRefreshToken(),
  };
}

/**
 * Protected route için hook
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading,
  };
}

/**
 * CSRF token için hook
 */
export function useCSRFToken() {
  const { getCSRFToken } = useAuth();

  return {
    csrfToken: getCSRFToken(),
    getHeaders: () => ({
      "X-CSRF-Token": getCSRFToken() || "",
      "Content-Type": "application/json",
    }),
  };
}
