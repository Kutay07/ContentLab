import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelectedAppStore } from "@/stores/app";
import { useAppConnections } from "@/stores/appConnections";
import { AppConfig } from "@/config/apps";

interface UseAppManagerReturn {
  app: AppConfig | null;
  loadingApp: boolean;
  appError: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loadingConnect: boolean;
  connectError: string | null;
  handleBackToApps: () => void;
}

/**
 * Merkezî uygulama yönetim kancası.
 * 1. Uygulama listesinden `appId` ile uygulamayı getirir.
 * 2. Store üzerinden bağlanma/bağlantı koparma işlemlerini yönetir.
 * 3. Bağlantı denemesini yalnızca bir kez yapar (attemptedRef).
 */
export function useAppManager(
  appId: string,
  initialApp?: AppConfig | null
): UseAppManagerReturn {
  const router = useRouter();
  const { selectedApp, setSelectedApp } = useSelectedAppStore();
  const connections = useAppConnections((s) => s.connections);
  const connectApp = useAppConnections((s) => s.connectApp);
  const disconnectApp = useAppConnections((s) => s.disconnectApp);

  const [app, setApp] = useState<AppConfig | null>(initialApp ?? null);
  const [loadingApp, setLoadingApp] = useState(initialApp ? false : true);
  const [appError, setAppError] = useState<string | null>(null);

  const [loadingConnect, setLoadingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  const isConnected = app ? connections[app.id]?.connected === true : false;

  // Uygulama verisini getir
  useEffect(() => {
    // Eğer seçim zaten store'da ve yerel state ile aynı ise tekrar set etme
    if (selectedApp?.id === appId) {
      setApp((prev) => {
        // Aynı referans veya aynı id'ye sahip bir nesne ise güncelleme
        if (prev?.id === selectedApp.id) return prev;
        return selectedApp;
      });
      setLoadingApp(false);
      return;
    }
    if (initialApp) {
      // initialApp sağlandıysa fetch yapma
      setApp(initialApp);
      setLoadingApp(false);
      return;
    }

    async function fetchApp() {
      try {
        const res = await fetch("/api/apps");
        if (!res.ok) throw new Error("Uygulama verisi alınamadı");
        const data = (await res.json()) as AppConfig[];
        const found = data.find((a) => a.id === appId) || null;
        if (!found) throw new Error("Uygulama bulunamadı");
        setApp(found);
      } catch (err) {
        setAppError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoadingApp(false);
      }
    }

    fetchApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, initialApp]);

  // Bağlantı kurma fonksiyonu
  const connect = useCallback(async () => {
    if (!app) return;
    setLoadingConnect(true);
    setConnectError(null);
    try {
      await connectApp(app);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoadingConnect(false);
    }
  }, [app, connectApp]);

  // İlk kez app geldiğinde otomatik bağlan
  useEffect(() => {
    if (!app) return;

    // Store'daki seçili uygulama farklıysa (id bazlı) güncelle
    if (selectedApp?.id !== app.id) {
      setSelectedApp(app);
    }

    if (!connections[app.id]?.connected && !attemptedRef.current) {
      attemptedRef.current = true;
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const disconnect = useCallback(() => {
    if (app) disconnectApp(app.id);
    setSelectedApp(null);
  }, [app, disconnectApp, setSelectedApp]);

  // Sayfa unmount olduğunda bağlantıyı kes
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const handleBackToApps = useCallback(() => {
    disconnect();
    router.push("/");
  }, [disconnect, router]);

  return {
    app,
    loadingApp,
    appError,
    isConnected,
    connect,
    disconnect,
    loadingConnect,
    connectError,
    handleBackToApps,
  };
}
