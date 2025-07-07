"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/test-service"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/auth/login");
    }

    // Redirect to home if authenticated and trying to access login page
    if (isAuthenticated && pathname === "/auth/login") {
      router.push("/");
    }
  }, [isAuthenticated, isPublicRoute, pathname, router]);

  // Show loading or content based on auth state
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
