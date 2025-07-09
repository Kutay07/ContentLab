# 🛡️ Güvenlik

Auth sisteminin güvenlik özellikleri ve best practices.

## 🔒 Güvenlik Mimarisi

### Çok Katmanlı Güvenlik (Defense in Depth)

```
┌─────────────────────────────────┐
│        Input Validation         │ ← Katman 5
├─────────────────────────────────┤
│         CSRF Protection         │ ← Katman 4
├─────────────────────────────────┤
│       Token Validation          │ ← Katman 3
├─────────────────────────────────┤
│        Authentication           │ ← Katman 2
├─────────────────────────────────┤
│        User Validation          │ ← Katman 1
└─────────────────────────────────┘
```

## 🔐 Token Güvenliği

### JWT-benzeri Token Yapısı

```
HEADER.PAYLOAD.SIGNATURE
```

**Header İçeriği:**

```typescript
{
  "typ": "JWT",
  "alg": "HS256"
}
```

**Payload İçeriği:**

```typescript
{
  "userId": "1",
  "username": "admin",
  "name": "Admin Kullanıcı",
  "iat": 1704067200000,
  "exp": 1704153600000,
  "rememberMe": true,
  "csrf": "generated-csrf-token"
}
```

### Token İmzalama

```typescript
const signature = HMAC_SHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
);
```

### Unicode Güvenliği

```typescript
// Türkçe karakterler için güvenli encoding
function unicodeBase64Encode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...data));
}
```

## 🛡️ CSRF Koruması

### CSRF Token Oluşturma

```typescript
const csrfToken = `${timestamp}-${randomBytes(16)}-${secretHash}`;
const encodedToken = base64Encode(csrfToken);
```

### Otomatik Header Ekleme

```typescript
// Her API isteğinde otomatik eklenir
headers["X-CSRF-Token"] = csrfToken;
headers["Authorization"] = `Bearer ${authToken}`;
```

### Server-side Validation

```typescript
const isValidCSRF = securityManager.validateCSRFToken(
  request.headers["X-CSRF-Token"]
);
```

## 🔍 Input Validation

### Kullanıcı Girişi Doğrulama

```typescript
interface LoginValidation {
  username: {
    required: true;
    minLength: 3;
    maxLength: 50;
    pattern: /^[a-zA-Z0-9_]+$/;
  };
  password: {
    required: true;
    minLength: 6;
    maxLength: 100;
  };
}
```

### Sanitization

```typescript
const sanitizeInput = (input: string) => {
  return input
    .trim()
    .replace(/[<>]/g, "") // XSS prevention
    .slice(0, 1000); // Length limit
};
```

## 🔐 Storage Güvenliği

### localStorage vs Memory

```typescript
class StorageManager {
  private useSecureStorage(): boolean {
    // Production'da localStorage kullan
    return (
      typeof localStorage !== "undefined" &&
      window.location.protocol === "https:"
    );
  }

  setToken(token: string) {
    if (this.useSecureStorage()) {
      localStorage.setItem("lab907-auth-token", token);
    } else {
      this.memoryStorage.set(token);
    }
  }
}
```

### Token Temizleme

```typescript
// Logout'ta tüm auth verileri temizlenir
const clearAllAuthData = () => {
  localStorage.removeItem("lab907-auth-token");
  sessionStorage.clear();
  memoryStorage.clear();
  document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
```

## ⏰ Token Expiry Management

### Otomatik Expiry Kontrolü

```typescript
setInterval(async () => {
  const isValid = await authService.validateAndRefreshToken();
  if (!isValid) {
    await authService.logout();
    window.location.href = "/auth/login";
  }
}, 5 * 60 * 1000); // Her 5 dakika
```

### Graceful Degradation

```typescript
const handleTokenExpiry = () => {
  // Kullanıcıyı uyar
  showNotification("Oturumunuz sona erdi, yeniden giriş yapın");

  // Pending istekleri iptal et
  cancelPendingRequests();

  // Login sayfasına yönlendir
  redirectToLogin();
};
```

## 🌐 Network Security

### HTTPS Enforcement

```typescript
if (
  process.env.NODE_ENV === "production" &&
  window.location.protocol !== "https:"
) {
  window.location.href = window.location.href.replace("http:", "https:");
}
```

### Security Headers

```typescript
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'",
};
```

## 🔒 Secret Management

### Environment Variables

```bash
# Production'da mutlaka değiştirin
NEXT_PUBLIC_AUTH_SECRET_KEY="prod-secret-key-$(date +%s)"

# Development
NEXT_PUBLIC_AUTH_SECRET_KEY="dev-secret-key-lab907"
```

### Key Rotation

```typescript
// Gelecekte key rotation için hazırlık
interface AuthConfig {
  currentSecretKey: string;
  previousSecretKey?: string; // Graceful key rotation
  keyGeneratedAt: number;
  keyExpiresAt: number;
}
```

## 🚨 Threat Mitigation

### 1. Brute Force Saldırıları

```typescript
class RateLimiter {
  private attempts = new Map<string, number>();

  checkAttempts(ip: string): boolean {
    const current = this.attempts.get(ip) || 0;
    return current < 5; // Max 5 deneme
  }

  recordAttempt(ip: string) {
    const current = this.attempts.get(ip) || 0;
    this.attempts.set(ip, current + 1);

    // 15 dakika sonra reset
    setTimeout(() => {
      this.attempts.delete(ip);
    }, 15 * 60 * 1000);
  }
}
```

### 2. Session Hijacking

```typescript
// Token'da client fingerprint
const generateFingerprint = () => {
  return btoa(
    JSON.stringify({
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    })
  );
};
```

### 3. XSS Saldırıları

```typescript
// Content Security Policy
const CSP_RULES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self'",
].join("; ");
```

### 4. CSRF Saldırıları

```typescript
// Double Submit Cookie Pattern
const validateCSRFToken = (headerToken: string, cookieToken: string) => {
  return (
    headerToken === cookieToken &&
    securityManager.validateCSRFToken(headerToken)
  );
};
```

## 🔍 Security Monitoring

### Event Logging

```typescript
const securityEvents = {
  LOGIN_SUCCESS: "auth.login.success",
  LOGIN_FAILURE: "auth.login.failure",
  TOKEN_EXPIRED: "auth.token.expired",
  INVALID_TOKEN: "auth.token.invalid",
  CSRF_VIOLATION: "auth.csrf.violation",
};

const logSecurityEvent = (event: string, data: any) => {
  console.warn(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ip: getClientIP(),
    ...data,
  });
};
```

### Anomaly Detection

```typescript
class SecurityMonitor {
  detectAnomalies() {
    // Çoklu cihazdan giriş
    this.checkMultipleDevices();

    // Unusual timing patterns
    this.checkTimingAnomalies();

    // Geographic inconsistencies
    this.checkLocationAnomalies();
  }
}
```

## 📋 Security Checklist

### Development

- [ ] Secret key production'da değiştirildi
- [ ] HTTPS enforcement aktif
- [ ] Input validation tüm formlarda
- [ ] XSS koruması aktif
- [ ] CSRF token'ları çalışıyor
- [ ] Token expiry ayarları doğru

### Production

- [ ] Environment variables güvenli
- [ ] Security headers ayarlandı
- [ ] Rate limiting aktif
- [ ] Logging ve monitoring çalışıyor
- [ ] Token rotation planı var
- [ ] Incident response planı hazır

### Monitoring

- [ ] Failed login attempts izleniyor
- [ ] Token validation errors loglanıyor
- [ ] CSRF violations tespit ediliyor
- [ ] Unusual patterns alertleri var

## 🚨 Emergency Procedures

### Security Breach Response

1. **Immediate Actions**:

   ```bash
   # Tüm aktif token'ları invalid et
   REVOKE_ALL_TOKENS=true npm run security:revoke-tokens

   # Secret key'i rotate et
   npm run security:rotate-keys
   ```

2. **Investigation**:

   ```typescript
   // Security log analizi
   const suspiciousActivity = await analyzeSecurityLogs();
   await generateIncidentReport(suspiciousActivity);
   ```

3. **Recovery**:
   ```typescript
   // Yeni güvenlik ayarları uygula
   await applySecurityPatches();
   await notifyAffectedUsers();
   ```

## 📚 Best Practices

### 1. Kod Güvenliği

```typescript
// ✅ Güvenli
const user = userStore.findUser(username, password);
if (user && bcrypt.compare(password, user.hashedPassword)) {
  // Continue
}

// ❌ Güvensiz
if (username === "admin" && password === "admin123") {
  // Hardcoded credentials
}
```

### 2. Error Handling

```typescript
// ✅ Güvenli - Generic error
catch (error) {
  logSecurityEvent('LOGIN_FAILURE', { username });
  throw new Error('Giriş başarısız');
}

// ❌ Güvensiz - Information disclosure
catch (error) {
  throw new Error(`Database error: ${error.message}`);
}
```

### 3. Token Management

```typescript
// ✅ Güvenli
const token = createSecureToken(user, {
  expiresIn: rememberMe ? "7d" : "24h",
  algorithm: "HS256",
});

// ❌ Güvensiz
const token = btoa(JSON.stringify({ user: user.id }));
```

---

**Sonraki**: [Kullanım Kılavuzu](./usage-guide.md)
