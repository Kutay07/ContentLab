"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import { clearSupabaseClient } from "@/services/supabase";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { selectedApp, clearApp } = useAppStore();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleGoHome = () => {
    clearSupabaseClient();
    clearApp();
    router.push("/");
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
                onClick={logout}
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
