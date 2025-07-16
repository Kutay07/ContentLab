"use client";

import { LoadingSpinner } from "@/components/global/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/global/ui/ErrorMessage";
import { useAppManager } from "@/hooks/useAppManager";
import { useLevelData } from "@/hooks/useLevelData";
import {
  ContentPreview,
  LevelHierarchyTextView,
  HierarchyProvider,
  ControlBar,
} from "@/components/global";

import ManagementLayout from "@/components/layout/ManagementLayout";
import MobileScreenContainer from "@/components/global/preview/MobileScreenContainer"; // isteğe bağlı sarmalayıcı
import LiveMobilePreview from "@/components/global/preview/LiveMobilePreview";
import EditorPanel from "@/components/global/edit/EditorPanel";
import { AppProvider } from "@/contexts/AppContext";
import { AppConfig } from "@/config/apps";
import { useSelectedAppStore } from "@/stores/app";
import { useEffect } from "react";

import Particles from "@/components/layout/backgrounds/Particles";

interface Props {
  appId: string;
  initialApp?: AppConfig | null;
}

export default function AppManagementClient({ appId, initialApp }: Props) {
  const { setSelectedApp, clearApp } = useSelectedAppStore();

  const {
    app,
    loadingApp,
    appError,
    isConnected,
    connect,
    loadingConnect,
    connectError,
    handleBackToApps,
  } = useAppManager(appId, initialApp);

  const {
    levelData,
    loading: loadingLevel,
    error: levelError,
    refresh: refreshLevel,
  } = useLevelData(app?.id ?? null);

  // App bilgisini header'da göstermek için store'a set et
  useEffect(() => {
    if (app && isConnected) {
      setSelectedApp(app);
    } else {
      clearApp();
    }

    // Component unmount olurken temizle
    return () => {
      clearApp();
    };
  }, [app, isConnected, setSelectedApp, clearApp]);

  const isLoading = loadingApp || loadingConnect;
  const errorMessage = appError || connectError;

  if (isLoading) {
    return (
      <>
        {/* Tam ekran arka plan */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"></div>

        <div className="relative min-h-screen flex items-center justify-center pt-20 px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            <LoadingSpinner message="Uygulamaya bağlanılıyor..." />
          </div>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        {/* Tam ekran arka plan */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"></div>

        <div className="relative min-h-screen flex items-center justify-center pt-20 px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <ErrorMessage
              title="Bağlantı Hatası"
              message={errorMessage}
              onRetry={connect}
              actions={
                <button
                  onClick={handleBackToApps}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Uygulamalar Listesine Dön
                </button>
              }
            />
          </div>
        </div>
      </>
    );
  }

  if (!app) {
    return (
      <>
        {/* Tam ekran arka plan */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"></div>

        <div className="relative min-h-screen flex items-center justify-center pt-20 px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <ErrorMessage
              title="Uygulama Bulunamadı"
              message="Belirtilen ID ile bir uygulama bulunamadı."
              actions={
                <button
                  onClick={handleBackToApps}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Ana Sayfaya Dön
                </button>
              }
            />
          </div>
        </div>
      </>
    );
  }

  if (!isConnected) {
    return (
      <>
        {/* Tam ekran arka plan */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"></div>

        <div className="relative min-h-screen flex items-center justify-center pt-20 px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full">
            <ErrorMessage
              title="Bağlantı Yok"
              message="Bağlantı henüz kurulamadı. Lütfen tekrar deneyin."
              onRetry={connect}
              actions={
                <button
                  onClick={handleBackToApps}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  Uygulamalar Listesine Dön
                </button>
              }
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Tam ekran arka plan - header'ın arkasını da kaplar */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#060010] to-slate-950 -z-10">
      {/* <div className="fixed inset-0 bg-gradient-to-br from-[#060010] via-[#140036] to-slate-950 -z-10"> */}

        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={300}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      {/* İçerik alanı */}
      <div className="relative min-h-screen">
        <AppProvider appId={app.id}>
          <div className="pt-0">
            {isConnected && levelData && (
              <HierarchyProvider initialData={levelData}>
                <div className="w-full">
                  {/* Yönetim Çubuğu */}
                  <ControlBar />

                  {/* Yeni 3 sütunlu düzen */}
                  <ManagementLayout
                    left={<ContentPreview data={levelData} />}
                    center={
                      <MobileScreenContainer className="justify-center">
                        <LiveMobilePreview />
                      </MobileScreenContainer>
                    }
                    right={<EditorPanel />}
                  />
                </div>
              </HierarchyProvider>
            )}

            {isConnected && loadingLevel && (
              <div className="flex items-center justify-center py-16">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
                  <LoadingSpinner message="Seviye verileri yükleniyor..." />
                </div>
              </div>
            )}

            {isConnected && levelError && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 m-6">
                <ErrorMessage
                  title="Veri Hatası"
                  message={levelError}
                  onRetry={refreshLevel}
                />
              </div>
            )}
          </div>
        </AppProvider>
      </div>
    </>
  );
}
