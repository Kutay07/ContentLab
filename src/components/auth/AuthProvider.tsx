"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import AuthLoading, { AuthErrorDisplay } from "@/components/auth/AuthLoading";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import {
  startTokenExpiryMonitoring,
  stopTokenExpiryMonitoring,
} from "@/services/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, error, initializeAuth, clearError } =
    useAuthStore();

  const router = useRouter();
  const rawPath = usePathname();
  const pathname = rawPath || "";

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/test-service"] as const;
  // startsWith ile dinamik query/segmenter de desteklenir
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();

    // Start token expiry monitoring
    startTokenExpiryMonitoring();

    return () => {
      stopTokenExpiryMonitoring();
    };
  }, [initializeAuth]);

  useEffect(() => {
    // Yükleme bitmeden yönlendirme yapma
    if (isLoading) return;

    // 1) Girişsiz kullanıcı korumalı sayfada ise login'e yönlendir (replace ile history şişmesini ve loop'u engelle)
    if (!isAuthenticated && !isPublicRoute && pathname !== "/auth/login") {
      router.replace("/auth/login");
      return;
    }

    // 2) Girişli kullanıcı login sayfasında kalırsa ana sayfaya yönlendir
    if (isAuthenticated && pathname === "/auth/login") {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  // Error state handling
  if (error && !isPublicRoute) {
    return (
      <AuthErrorDisplay
        error={error}
        onRetry={() => {
          clearError();
          initializeAuth();
        }}
      />
    );
  }

  // Loading state - authentication durumu belirsizken
  if (isLoading) {
    return <AuthLoading message="Kimlik doğrulanıyor..." />;
  }

  // Unauthenticated user trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    return <AuthLoading message="Giriş sayfasına yönlendiriliyor..." />;
  }

  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
