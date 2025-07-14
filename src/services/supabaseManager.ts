import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AppConfig } from "@/config/apps";
import { logEvent } from "@/utils/logger";
import { LogEntry } from "@/types/log";

export interface ConnectionInfo {
  client: SupabaseClient;
  connectedAt: number;
}

/**
 * Çoklu Supabase proje bağlantılarını yöneten singleton sınıf.
 * @remarks
 * Uygulamalar arası eş zamanlı veri yönetimi için her proje ayrı bir SupabaseClient
 * örneği ile temsil edilir. Bu sınıf; bağlantıları oluşturur, açık bağlantıları izler
 * ve gerektiğinde kapatır.
 */
class SupabaseManager {
  private connections = new Map<string, ConnectionInfo>();

  /**
   * Verilen uygulama konfigürasyonu ile Supabase'e bağlanır.
   * @param app Uygulama konfigürasyonu
   * @param testConnection true ise bağlantı öncesi basit bir sorgu ile test yapılır
   * @returns SupabaseClient nesnesi
   * @throws Bağlantı testi başarısız olursa hata fırlatır
   */
  async connect(
    app: AppConfig,
    testConnection: boolean = false
  ): Promise<SupabaseClient> {
    // Zaten bağlıysa mevcut client'ı döndür
    const existing = this.connections.get(app.id);
    if (existing) return existing.client;

    const client = createClient(app.supabase.url, app.supabase.anonKey);

    // Opsiyonel bağlantı testi
    if (testConnection) {
      try {
        /*
         * Tabloya bağımlı olmayan hafif bir istek yapabilmek için
         * Supabase Auth servisine session sorgusu gönderiyoruz. Bu uç nokta
         * tüm projelerde varsayılan olarak aktiftir ve herhangi bir tabloya
         * ihtiyaç duymaz.
         */
        const { error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
      } catch (err) {
        throw new Error(
          "Supabase bağlantı testi başarısız: " + (err as Error).message
        );
      }
    }

    this.connections.set(app.id, { client, connectedAt: Date.now() });

    // Fire-and-forget log isteği
    logEvent({ timestamp: Date.now(), appId: app.id, event: "connect" });
    return client;
  }

  /** Bağlantıyı sonlandır. */
  disconnect(appId: string) {
    const info = this.connections.get(appId);
    if (info) {
      try {
        // Realtime aboneliklerini kapat
        // Supabase JS v2
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof info.client.removeAllChannels === "function") {
          // v2 API
          // @ts-ignore
          info.client.removeAllChannels();
        } else if (
          // @ts-ignore
          typeof info.client.removeAllSubscriptions === "function"
        ) {
          // v1 API
          // @ts-ignore
          info.client.removeAllSubscriptions();
        }
      } catch (err) {
        console.warn("Realtime cleanup error:", err);
      }

      this.connections.delete(appId);
      logEvent({ timestamp: Date.now(), appId, event: "disconnect" });
    }
  }

  /** Tüm bağlantıları kapat. */
  disconnectAll() {
    for (const key of this.connections.keys()) {
      this.disconnect(key);
    }
  }

  /** Belirli app için client döndür. */
  getClient(appId: string): SupabaseClient {
    const info = this.connections.get(appId);
    if (!info) throw new Error("Supabase bağlantısı bulunamadı: " + appId);
    return info.client;
  }

  /** Bağlantı durumu. */
  isConnected(appId: string) {
    return this.connections.has(appId);
  }

  /** Bağlı uygulama ID’leri. */
  getConnectedApps() {
    return Array.from(this.connections.keys());
  }

  /**
   * Tarayıcı yenilendikten sonra hızlı yeniden bağlanma.
   * @param appConfigs Yeniden bağlanılacak uygulamaların config dizisi
   * @param silent true ise bağlantı testi yapma
   */
  async rehydrate(appConfigs: AppConfig[], silent: boolean = false) {
    for (const cfg of appConfigs) {
      try {
        await this.connect(cfg, !silent);
      } catch (err) {
        console.warn("Rehydrate bağlantı hatası:", cfg.id, err);
      }
    }
  }
}

export const supabaseManager = new SupabaseManager();
