"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { AppConfig } from "@/config/apps";
import AppCard from "@/components/apps/AppCard";
import { useEffect, useState } from "react";

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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-4">
            Yönettiğiniz uygulamaların listesi aşağıda yer almaktadır.
          </p>

          {/* Quick Stats */}
          <div className="flex space-x-6 text-sm text-gray-600">
            <span>
              Toplam: <strong>{apps.length}</strong> uygulama
            </span>
            <span>
              Aktif: <strong>{activeApps.length}</strong>
            </span>
            <span>
              Geliştirme: <strong>{developmentApps.length}</strong>
            </span>
            <span>
              Pasif: <strong>{inactiveApps.length}</strong>
            </span>
          </div>
        </div>

        {/* Active Apps */}
        {activeApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Aktif Uygulamalar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeApps.map((app) => (
                <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Development Apps */}
        {developmentApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Geliştirme Aşamasında
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developmentApps.map((app) => (
                <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Apps */}
        {inactiveApps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              Pasif Uygulamalar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveApps.map((app) => (
                <AppCard key={app.id} app={app} onSelect={handleAppSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {apps.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz uygulama yok
            </h3>
            <p className="text-gray-600">
              Yeni uygulama eklemek için config dosyasını düzenleyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
