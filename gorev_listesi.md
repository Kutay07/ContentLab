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

- [ ] `src/config/apps/` klasörünü oluştur ve mevcut 3 uygulama için `{id}.json` dosyaları oluştur.
- [ ] `src/config/apps.ts` dosyasını, JSON dosyalarını **sunucu tarafında** okuyacak şekilde refaktör et.
- [ ] `pages/api/apps/index.ts` API route’u:
  - [ ] **GET** → tüm uygulama JSON’larını dizi olarak döndür.
  - [ ] **POST** → body’den gelen AppConfig’i `{id}.json` olarak kaydet.
- [ ] UI tarafında App listesini API route üzerinden fetch edecek hale getir (`useSWR` veya fetch + Zustand).

### Faz 2 – Çoklu Supabase Bağlantı Yönetimi

- [ ] `src/services/supabaseManager.ts`:
  - [ ] `connect(appConfig)` → SupabaseClient oluştur, tablo testi yap, Map’e ekle.
  - [ ] `disconnect(appId)` & `disconnectAll()` fonksiyonları.
  - [ ] `getClient(appId)`, `isConnected(appId)`, `getConnectedApps()` yardımcıları.
- [ ] `src/stores/appConnections.ts` zustand store’u:
  - [ ] `{ [appId]: { connected: boolean; error?: string } }` durum yapısı.
  - [ ] persist middleware ile localStorage’a yaz.
- [ ] `connect()` / `disconnect()` işlemlerinde `logs/connection-events.json`’a append eden fetch çağrısı ekle.

### Faz 3 – Servis ve UI Güncellemeleri

- [ ] `LearningService`, `ContentHierarchyService`, vb. servislere `appId` parametresi ekle ve `supabaseManager.getClient(appId)` kullan.
- [ ] `PublishButton` & diğer bileşenler: aktif appId’yi prop veya context’ten alarak servis çağrılarını güncelle.
- [ ] `components/apps/AppCard.tsx`:
  - [ ] “Bağlan / Bağlantıyı Kes” toggle butonu ekle.
  - [ ] Bağlıysa “Yönet” butonu aktif; değilse devre dışı.
- [ ] Navigasyon guard: `/app/[id]` sayfası açılırken ilgili app’e bağlı olunup olunmadığını kontrol et.

### Faz 4 – Statik Auth & Oturum Yönetimi

- [ ] `authService.logout()` içinde `supabaseManager.disconnectAll()` çağır.
- [ ] İlk girişte (login) persist edilmiş bağlantıları `supabaseManager.rehydrate()` ile yeniden aç.
- [ ] Token süresi dolduğunda da bağlantıları kapat.

### Faz 5 – JSON Loglama Sistemi

- [ ] `pages/api/log-connection.ts` API route’u:
  - [ ] Body: `{ user, appId, event }` → `logs/connection-events.json` dosyasına satır ekle.
- [ ] Basit util: `appendConnectionLog(data)` sunucu tarafı ortak kullanılacak.
- [ ] Opsiyonel yönetim sayfası: bağlantı geçmişini tablo olarak göster.

### Faz 6 – Dokümantasyon & Testler

- [ ] README güncelle: çoklu Supabase desteği, yeni API endpoint’leri.
- [ ] Jest veya Playwright ile temel bağlantı akış testi ekle.
- [ ] Kod genelinde türkçe JSDoc açıklamaları.
- [ ] `supabase gen types typescript` çıktısını `src/types/supabase.ts` dosyasıyla güncelle.

---

## Geliştirme Günlüğü (AI Tarafından)

- _AI asistanı buraya yaptığı güncellemeleri ekleyecek._
