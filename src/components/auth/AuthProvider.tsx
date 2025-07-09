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
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/test-service"];
  const isPublicRoute = publicRoutes.includes(pathname);

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
    // Redirect logic - sadece loading tamamlandığında çalışır
    if (!isLoading) {
      // Redirect to login if not authenticated and trying to access protected route
      if (!isAuthenticated && !isPublicRoute) {
        router.push("/auth/login");
      }

      // Redirect to home if authenticated and trying to access login page
      if (isAuthenticated && pathname === "/auth/login") {
        router.push("/");
      }
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
