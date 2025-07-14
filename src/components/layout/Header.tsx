"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useSelectedAppStore } from "@/stores/app";
import { useAppConnections } from "@/stores/appConnections";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Header() {
  const { user, logout, isAuthenticated, isLoading, error } = useAuthStore();
  const { selectedApp, clearApp } = useSelectedAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const disconnectAll = useAppConnections((s) => s.disconnectAll);

  // Tarayıcı kapanırken tüm bağlantıları kes
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectAll();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [disconnectAll]);

  // Auth sayfalarında header'ı gösterme
  if (pathname && pathname.startsWith("/auth")) {
    return null;
  }

  // Loading durumunda header gösterme
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleGoHome = () => {
    disconnectAll();
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

  // Uygulama detay sayfasında mı kontrol et
  const isAppDetailPage = pathname?.startsWith("/app/");

  return (
    <>
      {/* Header için space bırak */}
      <div className="h-20"></div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Sol taraf - Logo */}
            <div className="flex items-center">
              <button
                onClick={handleGoHome}
                className="relative w-38 h-16 transition-opacity duration-200 hover:opacity-80"
              >
                <Image
                  src="/contentlab-logo-gradient.png"
                  alt="ContentLab"
                  fill
                  className="object-contain"
                />
              </button>

              {/* Active App Info */}
              {selectedApp && (
                <div className="ml-6 flex items-center space-x-3">
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <span className="text-2xl">{selectedApp.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {selectedApp.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {selectedApp.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                        Bağlı
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ taraf - User Controls */}
            {!isAppDetailPage && (
              <div className="flex items-center space-x-4">
              {/* Error notification */}
              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
                  <svg
                    className="w-4 h-4"
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

              {/* User Control Box */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/25 transition-all duration-200">
                <div className="flex items-center">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      <span className="text-white font-medium text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {user?.name || user?.username}
                    </span>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-8 bg-white/20"></div>

                  {/* Arrow Button */}
                  <button className="px-3 py-2 hover:bg-white/10 transition-colors rounded-r-xl">
                    <ChevronRightIcon className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-white/15 hover:bg-white/25 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
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
                <span>Çıkış</span>
              </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
