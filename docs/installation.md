# 🔧 Kurulum ve Konfigürasyon

Auth sisteminin kurulum ve konfigürasyon rehberi.

## 📋 Gereksinimler

### Sistem Gereksinimleri

- **Node.js**: 18.0.0+
- **React**: 18.0.0+
- **Next.js**: 13.0.0+
- **TypeScript**: 5.0.0+

### Bağımlılıklar

```json
{
  "zustand": "^5.0.5",
  "js-cookie": "^3.0.5"
}
```

## ⚙️ Environment Konfigürasyonu

### 1. `.env.local` Dosyası Oluşturun

Proje root dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local

# Kullanıcı listesi (JSON formatında)
NEXT_PUBLIC_AUTH_USERS='[
  {"id":"1","username":"admin","password":"admin123","name":"Admin Kullanıcı"},
  {"id":"2","username":"editor","password":"editor123","name":"Editör Kullanıcı"},
  {"id":"3","username":"manager","password":"manager123","name":"Manager Kullanıcı"},
  {"id":"4","username":"demo","password":"demo123","name":"Demo Kullanıcı"},
  {"id":"5","username":"test","password":"test123","name":"Test Kullanıcı"}
]'

# Güvenlik anahtarı (değiştirin!)
NEXT_PUBLIC_AUTH_SECRET_KEY="lab907-auth-secret-key-2025"

# Token süreleri (milliseconds)
NEXT_PUBLIC_AUTH_DEFAULT_EXPIRY=86400000      # 24 saat
NEXT_PUBLIC_AUTH_REMEMBER_ME_EXPIRY=604800000 # 7 gün
```

### 2. Kullanıcı Ekleme/Çıkarma

Yeni kullanıcı eklemek için `NEXT_PUBLIC_AUTH_USERS` JSON dizisini güncelleyin:

```json
{
  "id": "unique-id",
  "username": "kullanici_adi",
  "password": "sifre123",
  "name": "Görünen İsim"
}
```

**Önemli**:

- `id` değerleri benzersiz olmalıdır
- `username` değerleri benzersiz olmalıdır
- Türkçe karakterler desteklenir

## 🏗️ Proje Entegrasyonu

### 1. AuthProvider'ı Layout'a Ekleyin

`src/app/layout.tsx`:

```tsx
import AuthProvider from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Auth Hook'ları Kullanın

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard user={user} />;
}
```

### 3. API Middleware Kullanın

```tsx
import { api } from "@/services/auth";

// Authenticated API calls
const response = await api.get("/protected-endpoint");

// Public API calls
const publicData = await api.public.get("/public-endpoint");
```

## 🛡️ Güvenlik Konfigürasyonu

### 1. Secret Key

**Production'da mutlaka değiştirin**:

```bash
NEXT_PUBLIC_AUTH_SECRET_KEY="your-production-secret-key-here"
```

### 2. Token Süreleri

İhtiyacınıza göre ayarlayın:

```bash
# Kısa süreli (1 saat)
NEXT_PUBLIC_AUTH_DEFAULT_EXPIRY=3600000

# Uzun süreli (30 gün)
NEXT_PUBLIC_AUTH_REMEMBER_ME_EXPIRY=2592000000
```

### 3. CSRF Koruması

Otomatik aktif, manuel konfigürasyon gerekmez.

## 🔄 Migration (Eski Sistemden)

### Eski Zustand Store'dan Geçiş

Eski auth store'unuzu güncelleyin:

```tsx
// Eski
const { login } = useAuthStore();
await login(username, password);

// Yeni
const { login } = useAuth();
await login(username, password, rememberMe);
```

### Cookie'den localStorage'a Geçiş

Sistem otomatik olarak localStorage kullanır, manuel migration gerekmez.

## 🧪 Test Konfigürasyonu

### 1. Test Kullanıcıları

Development için hazır test kullanıcıları:

| Username | Password   | Rol     |
| -------- | ---------- | ------- |
| admin    | admin123   | Admin   |
| editor   | editor123  | Editor  |
| manager  | manager123 | Manager |
| demo     | demo123    | Demo    |
| test     | test123    | Test    |

### 2. Debug Mode

Development'da debug bilgileri için:

```tsx
import { authService } from "@/services/auth";

// Debug bilgileri
const debugInfo = authService.getDebugInfo();
console.log("Auth Debug:", debugInfo);
```

## 🚀 Development Server

```bash
# Development server başlat
npm run dev

# Login sayfası
http://localhost:3000/auth/login

# Ana sayfa (korumalı)
http://localhost:3000/
```

## 📦 Build ve Deploy

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Production'da environment variables'ları set edin:

```bash
# Vercel
vercel env add NEXT_PUBLIC_AUTH_USERS
vercel env add NEXT_PUBLIC_AUTH_SECRET_KEY

# Netlify
netlify env:set NEXT_PUBLIC_AUTH_USERS "your-users-json"
netlify env:set NEXT_PUBLIC_AUTH_SECRET_KEY "your-secret-key"
```

## ✅ Kurulum Doğrulama

### 1. Login Testi

```bash
# 1. http://localhost:3000/auth/login adresine gidin
# 2. admin / admin123 ile giriş yapın
# 3. Ana sayfaya yönlendirilmelisiniz
```

### 2. Token Testi

Developer Console'da:

```javascript
// Token kontrolü
const token = localStorage.getItem("lab907-auth-token");
console.log("Token:", token);

// Auth state kontrolü
console.log("Auth State:", window.__AUTH_DEBUG__);
```

### 3. CSRF Testi

Network tab'da API isteklerini kontrol edin:

- `X-CSRF-Token` header'ı olmalı
- Token formatı doğru olmalı

## 🐛 Yaygın Sorunlar

### 1. "String contains an invalid character"

**Çözüm**: Unicode karakterler için güncellenmiş `TokenManager.ts` kullanın.

### 2. "AUTH_USERS environment variable not found"

**Çözüm**: `.env.local` dosyasını kontrol edin, format doğru olmalı.

### 3. "Token signature validation failed"

**Çözüm**: Secret key'i kontrol edin, cache'i temizleyin.

---

**Sonraki**: [Mimari ve Tasarım](./architecture.md)
