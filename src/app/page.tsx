"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { AppConfig } from "@/config/apps";
import AppCard from "@/components/apps/AppCard";
import { useEffect, useState } from "react";
import {
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
  PauseIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await fetch("/api/apps");
        if (!res.ok) throw new Error("Uygulama listesi alınamadı");
        const data = (await res.json()) as AppConfig[];
        setApps(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const handleAppSelect = (app: AppConfig) => {
    console.log("Seçilen uygulama:", app);
    router.push(`/app/${app.id}`);
  };

  const activeApps = apps.filter((app) => app.status === "active");
  const developmentApps = apps.filter((app) => app.status === "development");
  const inactiveApps = apps.filter((app) => app.status === "inactive");

  if (loading) {
    return <div className="p-6 text-center">Yükleniyor...</div>;
  }

  return (
    <>
      {/* Tam ekran arka plan - header'ın arkasını da kaplar */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"></div>

      {/* İçerik alanı */}
      <div className="relative min-h-screen">
        <div className="pt-20 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              {/* Welcome Section */}
              <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  Hoş Geldiniz, {user?.name}!
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Yönettiğiniz uygulamaların listesi aşağıda yer almaktadır.
                </p>
              </div>

              {/* Modern Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Toplam Uygulama */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CubeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {apps.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-white/80">
                    Toplam Uygulama
                  </div>
                </div>

                {/* Aktif Uygulamalar */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <RocketLaunchIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {activeApps.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-white/80">Aktif</div>
                </div>

                {/* Geliştirme Aşamasında */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <WrenchScrewdriverIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {developmentApps.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-white/80">
                    Geliştirme
                  </div>
                </div>

                {/* Pasif Uygulamalar */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PauseIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {inactiveApps.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-white/80">Pasif</div>
                </div>
              </div>
            </div>

            {/* Active Apps */}
            {activeApps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  Aktif Uygulamalar
                </h2>
                <div className="space-y-4">
                  {activeApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onSelect={handleAppSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Development Apps */}
            {developmentApps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                  Geliştirme Aşamasında
                </h2>
                <div className="space-y-4">
                  {developmentApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onSelect={handleAppSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Apps */}
            {inactiveApps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-slate-400 rounded-full mr-2"></div>
                  Pasif Uygulamalar
                </h2>
                <div className="space-y-4">
                  {inactiveApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onSelect={handleAppSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {apps.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-white/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Henüz uygulama yok
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Yeni uygulama eklemek için config dosyasını düzenleyin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
