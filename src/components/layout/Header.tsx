"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import { clearSupabaseClient } from "@/services/supabase";

export default function Header() {
  const { user, logout, isAuthenticated, isLoading, error } = useAuthStore();
  const { selectedApp, clearApp } = useAppStore();
  const router = useRouter();

  // Loading durumunda header gösterme
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleGoHome = () => {
    clearSupabaseClient();
    clearApp();
    router.push("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoHome}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              İçerik Yönetim Paneli
            </button>

            {/* Active App Info */}
            {selectedApp && (
              <>
                <div className="text-gray-300">•</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedApp.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedApp.name}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100">
                    Aktif
                  </span>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Error notification */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium">Hata</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
