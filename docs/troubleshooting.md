# 🐛 Sorun Giderme

Auth sistemi ile karşılaşabileceğiniz yaygın sorunlar ve çözümleri.

## 🚨 Yaygın Hatalar

### 1. "String contains an invalid character"

**Sorun**: Unicode karakterler (Türkçe) token'da hata veriyor.

**Sebep**: `btoa()` fonksiyonu Türkçe karakterleri desteklemiyor.

**Çözüm**: Unicode-safe base64 encoding kullanın.

```typescript
// ❌ Hatalı
const encoded = btoa(JSON.stringify(payload));

// ✅ Doğru
function unicodeBase64Encode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...data));
}
```

**Test**:

```typescript
// Türkçe karakterli kullanıcı ile test edin
const user = { name: "Müge Öz" };
const token = tokenManager.createToken("1", "test", user.name);
console.log("Token oluşturuldu:", !!token);
```

### 2. "AUTH_USERS environment variable not found"

**Sorun**: Environment variables yüklenmemiş.

**Sebep**: `.env.local` dosyası eksik veya format hatalı.

**Çözüm**:

1. `.env.local` dosyasının proje root'unda olduğunu kontrol edin
2. JSON format'ının doğru olduğunu kontrol edin
3. Next.js server'ını restart edin

```bash
# .env.local dosya yolu kontrolü
ls -la .env.local

# JSON format kontrolü
echo $NEXT_PUBLIC_AUTH_USERS | jq .

# Server restart
npm run dev
```

### 3. "Token signature validation failed"

**Sorun**: Token imzası doğrulanamıyor.

**Sebep**: Secret key değişmiş veya cache sorunu.

**Çözüm**:

```typescript
// 1. Secret key kontrolü
console.log("Secret key:", process.env.NEXT_PUBLIC_AUTH_SECRET_KEY);

// 2. Token'ı manuel decode edin
const parts = token.split(".");
console.log("Header:", JSON.parse(atob(parts[0])));
console.log("Payload:", JSON.parse(atob(parts[1])));

// 3. Cache temizle
localStorage.clear();
sessionStorage.clear();
```

### 4. Login sonrası redirect çalışmıyor

**Sorun**: Başarılı login'den sonra sayfa değişmiyor.

**Sebep**: Router configuration veya state sync sorunu.

**Çözüm**:

```typescript
// AuthProvider'da router'ı kontrol edin
const router = useRouter();

useEffect(() => {
  if (isAuthenticated && router.pathname === "/auth/login") {
    router.push("/");
  }
}, [isAuthenticated, router]);
```

### 5. "CSRF token mismatch"

**Sorun**: CSRF token doğrulanamıyor.

**Sebep**: Token sync sorunu veya multiple tab.

**Çözüm**:

```typescript
// CSRF token'ı refresh edin
const refreshCSRF = async () => {
  await authService.logout();
  await authService.login(username, password);
};

// Headers kontrolü
const headers = api.getHeaders();
console.log("CSRF Token:", headers["X-CSRF-Token"]);
```

## 🔍 Debug Araçları

### 1. Console Debug

```typescript
// Global debug fonksiyonu
if (typeof window !== "undefined") {
  window.__AUTH_DEBUG__ = {
    getState: () => authService.getState(),
    getToken: () => tokenManager.getStoredToken(),
    getUsers: () => userStore.getAllUsers(),
    validateToken: () => authService.validateAndRefreshToken(),
    clearAll: () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    },
  };
}

// Kullanım (Browser Console'da)
__AUTH_DEBUG__.getState();
__AUTH_DEBUG__.validateToken();
__AUTH_DEBUG__.clearAll();
```

### 2. Network İnceleme

Developer Tools > Network tab'da kontrol edilmesi gerekenler:

```bash
# API istekleri için headers
Authorization: Bearer <token>
X-CSRF-Token: <csrf-token>
Content-Type: application/json

# Response status codes
200 - Success
401 - Unauthorized (token geçersiz)
403 - Forbidden (CSRF hatası)
500 - Server error
```

### 3. LocalStorage İnceleme

```javascript
// Browser Console'da
localStorage.getItem("lab907-auth-token");
localStorage.getItem("lab907-csrf-token");

// Token decode
const token = localStorage.getItem("lab907-auth-token");
if (token) {
  const parts = token.split(".");
  console.log("Payload:", JSON.parse(atob(parts[1])));
}
```

## 🔧 Sistem Kontrolleri

### 1. Environment Check

```typescript
const checkEnvironment = () => {
  const checks = {
    users: !!process.env.NEXT_PUBLIC_AUTH_USERS,
    secretKey: !!process.env.NEXT_PUBLIC_AUTH_SECRET_KEY,
    defaultExpiry: !!process.env.NEXT_PUBLIC_AUTH_DEFAULT_EXPIRY,
    rememberMeExpiry: !!process.env.NEXT_PUBLIC_AUTH_REMEMBER_ME_EXPIRY,
  };

  console.table(checks);

  if (!checks.users) {
    console.error("❌ NEXT_PUBLIC_AUTH_USERS eksik");
  }
  if (!checks.secretKey) {
    console.error("❌ NEXT_PUBLIC_AUTH_SECRET_KEY eksik");
  }

  return Object.values(checks).every(Boolean);
};
```

### 2. Service Health Check

```typescript
const healthCheck = async () => {
  const results = {
    userStore: false,
    tokenManager: false,
    securityManager: false,
    authService: false,
  };

  try {
    // UserStore test
    const users = userStore.getAllUsers();
    results.userStore = users.length > 0;

    // TokenManager test
    const testToken = tokenManager.createToken("test", "test", "test");
    results.tokenManager = !!testToken;

    // SecurityManager test
    const csrfToken = securityManager.generateCSRFToken();
    results.securityManager = !!csrfToken;

    // AuthService test
    const state = authService.getState();
    results.authService = state !== null;
  } catch (error) {
    console.error("Health check error:", error);
  }

  console.table(results);
  return results;
};
```

## 📊 Performance Issues

### 1. Yavaş Login

**Sorun**: Login işlemi uzun sürüyor.

**Çözüm**:

```typescript
// Performance measurement
const measureLoginTime = async (username, password) => {
  const start = performance.now();

  const result = await authService.login({ username, password });

  const end = performance.now();
  console.log(`Login time: ${end - start}ms`);

  return result;
};
```

### 2. Memory Leaks

**Sorun**: Auth service memory kullanımı artıyor.

**Çözüm**:

```typescript
// Event listener cleanup
useEffect(() => {
  const unsubscribe = authService.subscribe(handleStateChange);

  return () => {
    unsubscribe(); // Cleanup
  };
}, []);

// Timer cleanup
useEffect(() => {
  const interval = setInterval(validateToken, 60000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

### 3. Bundle Size

**Sorun**: Auth modülleri bundle'ı büyütüyor.

**Çözüm**:

```typescript
// Dynamic imports
const authService = await import("@/services/auth").then((m) => m.authService);

// Tree shaking
export { authService, tokenManager } from "./services";
export type { AuthState, User } from "./types";
```

## 🚀 Deployment Issues

### 1. Vercel Deployment

**Sorun**: Production'da environment variables çalışmıyor.

**Çözüm**:

```bash
# Vercel CLI ile env set
vercel env add NEXT_PUBLIC_AUTH_USERS production
vercel env add NEXT_PUBLIC_AUTH_SECRET_KEY production

# Deployment trigger
vercel --prod
```

### 2. Netlify Deployment

**Sorun**: Build sırasında env variables yüklenmiyor.

**Çözüm**:

```bash
# netlify.toml
[build.environment]
  NEXT_PUBLIC_AUTH_USERS = '[{"id":"1","username":"admin",...}]'
  NEXT_PUBLIC_AUTH_SECRET_KEY = "prod-key"
```

### 3. Docker Deployment

**Sorun**: Container'da localStorage erişilemez.

**Çözüm**:

```dockerfile
# Dockerfile
FROM node:18-alpine
ENV NODE_ENV=production
ENV NEXT_PUBLIC_AUTH_USERS='[...]'
ENV NEXT_PUBLIC_AUTH_SECRET_KEY='prod-key'

# SSR için memory storage fallback
RUN npm run build
CMD ["npm", "start"]
```

## 🔒 Security Issues

### 1. HTTPS Gereksinimleri

**Sorun**: HTTP'de güvenlik uyarıları.

**Çözüm**:

```typescript
// Development'da HTTP'e izin ver
const isSecureContext = () => {
  return (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost"
  );
};

if (!isSecureContext() && process.env.NODE_ENV === "production") {
  window.location.href = window.location.href.replace("http:", "https:");
}
```

### 2. CORS Issues

**Sorun**: Cross-origin isteklerde auth headers blocked.

**Çözüm**:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, X-CSRF-Token",
          },
        ],
      },
    ];
  },
};
```

## 📞 Support Workflow

### 1. Issue Template

```markdown
**Auth System Issue Report**

**Environment:**

- OS:
- Browser:
- Node.js version:
- Next.js version:

**Error Message:**
```

[Error message here]

```

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Additional Context:**
- Environment variables set: Yes/No
- Production/Development:
- First time or recurring:
```

### 2. Diagnostic Script

```bash
#!/bin/bash
# auth-diagnostics.sh

echo "=== Auth System Diagnostics ==="
echo "Date: $(date)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""

echo "=== Environment Check ==="
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ .env.local missing"
echo ""

echo "=== Dependencies ==="
npm list zustand js-cookie
echo ""

echo "=== Build Check ==="
npm run build --dry-run
echo ""

echo "=== Auth Service Health ==="
node -e "
const { healthCheck } = require('./src/services/auth');
healthCheck().then(console.log);
"
```

---

**Sonraki**: [Örnekler](./examples.md)
