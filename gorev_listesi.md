# Lab907 – Çoklu Supabase Bağlantı Revizyonu

## Proje Özeti ve Teknoloji Yığını

**Projenin Amacı:**
Mevcut uygulamayı birden fazla Supabase projesine aynı anda bağlanabilir hâle getirmek. Bağlantılar tarayıcı oturumu boyunca kalıcı olacak, kullanıcı statik (custom) kimlik doğrulama sistemi değişmeden korunacak. Uygulama yapılandırmaları dosya-tabanlı JSON formatında saklanacak, yeni uygulama ekleme ve bağlantı/çıkış olayları da JSON log dosyasında izlenecek.

**Dosya Yapısı (hedef):**

```
src/
  config/
    apps/                ← {id}.json dosyaları
    apps.ts              ← JSON loader & tipler
  pages/api/
    apps/index.ts        ← GET + POST (yeni uygulama ekleme)
    log-connection.ts    ← Bağlantı log API’si
  services/
    supabaseManager.ts   ← Çoklu bağlantı yöneticisi
  stores/
    appConnections.ts    ← Bağlantı durum store’u (zustand)
  components/
    apps/AppCard.tsx     ← Bağlan/Çık butonları & yönet linki
logs/
  connection-events.json ← Bağlantı olayları (append-only)
```

**Teknoloji Yığını:**

- Next.js (App Router)
- React 18 + TypeScript
- Zustand (state yönetimi + persist)
- Supabase JS v2
- TailwindCSS (UI)
- Node.js (fs) – dosya okuma/yazma

---

## Proje Durumu Takibi

Bu dosya, projenin yapılacaklar listesini ve ilerleme durumunu takip etmek için kullanılır.

**AI Asistanı İçin Talimatlar:**

- Aşağıdaki görevleri tamamladıkça `- [ ]` → `- [x]` olarak güncelle.
- Önemli değişiklikleri `## Geliştirme Günlüğü (AI Tarafından)` bölümüne tarih vererek ekle.
- Kodda türkçe JSDoc açıklamaları ekle.
- Kod modüler ve genişletilebilir olmalı.

---

## Yapılacaklar Listesi

### Faz 1 – Dosya-Tabanlı Uygulama Yapılandırması

- [x] `src/config/apps/` klasörünü oluştur ve mevcut 3 uygulama için `{id}.json` dosyaları oluştur.
- [x] `src/config/apps.ts` dosyasını, JSON dosyalarını **sunucu tarafında** okuyacak şekilde refaktör et.
- [x] `pages/api/apps/index.ts` API route’u:
  - [x] **GET** → tüm uygulama JSON’larını dizi olarak döndür.
  - [x] **POST** → body’den gelen AppConfig’i `{id}.json` olarak kaydet.
- [x] `pages/api/apps/index.ts` içinde **Zod** ile AppConfig şema validasyonu ekle, geçersiz veri için `400` döndür.
- [x] UI tarafında App listesini API route üzerinden fetch edecek hale getir (`fetch + Zustand`).
- [x] Uygulama listesini doğrudan `import { APPS_CONFIG }` yapan tüm dosyalarda yeni fetch tabanlı mekanizmaya geçir.

### Faz 2 – Çoklu Supabase Bağlantı Yönetimi

- [x] `src/services/supabaseManager.ts`:
  - [x] `connect(appConfig)` → SupabaseClient oluştur, tablo testi yap, Map’e ekle.
  - [x] `disconnect(appId)` & `disconnectAll()` fonksiyonları.
  - [x] `getClient(appId)`, `isConnected(appId)`, `getConnectedApps()` yardımcıları.
- [x] `src/stores/appConnections.ts` zustand store’u:
  - [x] `{ [appId]: { connected: boolean; error?: string } }` durum yapısı.
  - [x] persist middleware ile localStorage’a yaz.
- [x] `connect()` / `disconnect()` işlemlerinde `logs/connection-events.json`’a append eden fetch çağrısı ekle.
- [x] `supabaseManager.rehydrate(silent?: boolean)` parametresi ekle; `silent=true` iken tablo testi atlanarak hızlı yeniden bağlantı sağlanır.

### Faz 3 – Servis ve UI Güncellemeleri

- [x] `LearningService`, `ContentHierarchyService`, vb. servislere `appId` parametresi ekle ve `supabaseManager.getClient(appId)` kullan.
- [x] `PublishButton` & diğer bileşenler: aktif appId’yi prop veya context’ten alarak servis çağrılarını güncelle.
- [x] `components/apps/AppCard.tsx`:
  - [x] “Bağlan / Bağlantıyı Kes” toggle butonu eklendi.
  - [x] Bağlıysa “Yönet” butonu aktif; değilse devre dışı.
- [x] Navigasyon guard eklendi (bağlı değilse mesaj & link).
- [x] Bağlı değilse `/app/[id]` sayfasında “Önce bağlan” uyarısı gösterildi.
- [x] UI: AppCard’da bağlantı durumu gösteren Bağlan/Kes butonu.

### Faz 4 – Statik Auth & Oturum Yönetimi

- [x] `authService.logout()` içinde `supabaseManager.disconnectAll()` çağır.
- [x] İlk girişte (login) persist edilmiş bağlantıları `supabaseManager.rehydrate()` ile yeniden aç.
- [x] Token süresi dolduğunda da bağlantıları kapat.

### Faz 5 – JSON Loglama Sistemi

- [x] `pages/api/log-connection.ts` API route’u:
  - [x] Body: `{ user, appId, event }` → `logs/connection-events.json` dosyasına satır ekle.
- [x] Basit util: `appendConnectionLog(data)` sunucu tarafı ortak kullanılacak.
- [x] Opsiyonel yönetim sayfası: bağlantı geçmişini tablo olarak göster.

### Faz 6 – Dokümantasyon & Testler

- [x] README güncelle: çoklu Supabase desteği, yeni API endpoint’leri.
- [x] Jest veya Playwright ile temel bağlantı akış testi ekle.
- [x] Kod genelinde türkçe JSDoc açıklamaları.
- [x] `supabase gen types typescript` çıktısını `src/types/supabase.ts` dosyasıyla güncelle.
- [x] `pages/api/apps` ve `pages/api/log-connection` rotaları için dosya okuma/yazma unit testleri (`memfs`).

---

## Geliştirme Günlüğü (AI Tarafından)

- 2025-07-09: Faz 1 tamamlandı – JSON konfigürasyon klasörü, yükleyici, API route, Zod validasyon ve UI refaktörü (APPS_CONFIG kaldırıldı) uygulandı.
- 2025-07-09: Faz 2 ana servis ve store katmanı eklendi: supabaseManager, appConnections store, log-connection API ve fetch tabanlı logging.
- 2025-07-09: Faz 3 UI entegrasyonu – Bağlan/Kes butonu, guardlar ve appId context ile servis güncellemesi tamamlandı.
- 2025-07-09: Faz 4 statik auth entegrasyonu – logout ve otomatik rehydrate/disconnect mekanizmaları eklendi.
