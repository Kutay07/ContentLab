# 🏗️ Mimari ve Tasarım

Auth sisteminin detaylı mimari dokümantasyonu.

## 📐 Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Components (UI Layer)                                      │
│  ├── AuthProvider (Route Protection)                        │
│  ├── AuthLoading (Loading States)                          │
│  └── AuthErrorBoundary (Error Handling)                    │
├─────────────────────────────────────────────────────────────┤
│  Hooks (Custom React Hooks)                                │
│  ├── useAuth (Main Auth Hook)                              │
│  ├── useRequireAuth (Protected Routes)                     │
│  └── useCSRFToken (CSRF Management)                        │
├─────────────────────────────────────────────────────────────┤
│  Store (State Management)                                  │
│  └── Zustand Store (Auth State)                            │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                 │
│  ├── AuthService (Main Service)                            │
│  ├── TokenManager (Token Operations)                       │
│  ├── UserStore (User Management)                           │
│  ├── SecurityManager (Security & CSRF)                     │
│  └── Middleware (API Integration)                          │
├─────────────────────────────────────────────────────────────┤
│  Storage (Data Persistence)                                │
│  ├── localStorage (Primary)                                │
│  └── Memory Storage (Fallback)                             │
├─────────────────────────────────────────────────────────────┤
│  Environment (.env.local)                                  │
│  ├── User Credentials                                      │
│  ├── Security Keys                                         │
│  └── Configuration                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Modül Detayları

### 1. AuthService (Ana Orchestrator)

**Sorumluluklar**:

- Auth state yönetimi
- Login/logout operasyonları
- Token validation
- Event handling

**Önemli Metodlar**:

```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<{ success: boolean }>;
  async logout(): Promise<void>;
  async validateAndRefreshToken(): Promise<boolean>;
  getState(): AuthState;
  subscribe(listener: AuthStateListener): () => void;
  onEvent(listener: AuthEventListener): () => void;
}
```

### 2. TokenManager (Token İşlemleri)

**Sorumluluklar**:

- JWT-benzeri token oluşturma
- Token encoding/decoding
- Token validation
- Storage management

**Token Formatı**:

```
header.payload.signature
```

**Token İçeriği**:

```typescript
interface AuthToken {
  userId: string;
  username: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
  rememberMe: boolean;
  csrfToken: string;
}
```

### 3. UserStore (Kullanıcı Yönetimi)

**Sorumluluklar**:

- Environment'dan kullanıcı yükleme
- Kullanıcı doğrulama
- Kullanıcı arama

**Veri Kaynağı**:

```bash
NEXT_PUBLIC_AUTH_USERS='[{"id":"1","username":"admin",...}]'
```

### 4. SecurityManager (Güvenlik)

**Sorumluluklar**:

- CSRF token oluşturma
- Token imzalama
- Security config yönetimi

**CSRF Token Formatı**:

```
timestamp-random-secret (Base64 encoded)
```

### 5. Middleware (API Entegrasyonu)

**Sorumluluklar**:

- Otomatik auth headers
- CSRF protection
- Error handling
- Request/response intercepting

## 🔄 Data Flow

### Login Flow

```
1. User enters credentials
   ↓
2. AuthService.login()
   ↓
3. UserStore.findUser()
   ↓
4. TokenManager.createToken()
   ↓
5. SecurityManager.generateCSRFToken()
   ↓
6. TokenManager.storeToken()
   ↓
7. AuthService updates state
   ↓
8. Zustand store syncs
   ↓
9. UI re-renders
```

### Token Validation Flow

```
1. TokenManager.getValidStoredToken()
   ↓
2. TokenManager.validateToken()
   ↓
3. Check expiry time
   ↓
4. SecurityManager.validateCSRFToken()
   ↓
5. Return validation result
```

### API Request Flow

```
1. api.get('/endpoint')
   ↓
2. authFetch middleware
   ↓
3. Check authentication
   ↓
4. Add auth headers
   ↓
5. Add CSRF token
   ↓
6. Send request
   ↓
7. Handle response errors
```

## 🏛️ Design Patterns

### 1. Singleton Pattern

**Kullanım**: Tüm service sınıfları

```typescript
export const authService = new AuthService();
export const tokenManager = new TokenManager();
```

### 2. Observer Pattern

**Kullanım**: Auth state değişiklikleri

```typescript
authService.subscribe((newState) => {
  // State değişikliği handling
});
```

### 3. Strategy Pattern

**Kullanım**: Storage providers

```typescript
interface StorageProvider {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
}
```

### 4. Middleware Pattern

**Kullanım**: API interceptors

```typescript
const response = await authFetch(url, config);
```

### 5. Factory Pattern

**Kullanım**: Token oluşturma

```typescript
const token = tokenManager.createToken(userId, username, name, rememberMe);
```

## 🔒 Security Architecture

### 1. Defense in Depth

**Katmanlar**:

1. **Input Validation** - Kullanıcı girişleri
2. **Authentication** - Kimlik doğrulama
3. **Authorization** - Yetkilendirme (future)
4. **CSRF Protection** - Cross-site saldırılar
5. **Token Security** - Güvenli token yönetimi

### 2. Token Security

**Özellikler**:

- Digital signature ile integrity
- Expiry time ile validity
- CSRF token ile request protection
- Unicode-safe encoding

### 3. Storage Security

**İki katmanlı yaklaşım**:

```typescript
// Primary: localStorage
if (localStorage.isAvailable()) {
  store.setToken(token);
}

// Fallback: Memory storage
else {
  memoryStore.setToken(token);
}
```

## 📊 Performance Considerations

### 1. Lazy Loading

- UserStore: İlk kullanımda yüklenir
- Auth validation: On-demand
- Error boundaries: Conditional rendering

### 2. Memoization

```typescript
// State değişiklikleri sadece gerektiğinde
const state = useMemo(() => authStore.getState(), [deps]);
```

### 3. Efficient Re-renders

```typescript
// Selective state updates
const { isAuthenticated } = useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
}));
```

### 4. Background Tasks

```typescript
// Token validation her 5 dakikada
const interval = setInterval(async () => {
  await authService.validateAndRefreshToken();
}, 5 * 60 * 1000);
```

## 🧪 Testability

### 1. Dependency Injection

```typescript
// Test'de mock storage kullanma
tokenManager.setStorageProvider(mockStorageProvider);
```

### 2. Event-driven Architecture

```typescript
// Test'de event'leri dinleme
authService.onEvent((event) => {
  console.log("Auth event:", event);
});
```

### 3. Pure Functions

```typescript
// Security utils test edilebilir
const isValid = validateToken(token);
const signature = signToken(payload);
```

## 🔮 Extensibility

### 1. Service Extensions

```typescript
// Yeni auth provider ekleme
class OAuthService extends AuthService {
  async loginWithGoogle() { ... }
}
```

### 2. Storage Extensions

```typescript
// Yeni storage provider
class IndexedDBProvider implements StorageProvider {
  // Implementation
}
```

### 3. Middleware Extensions

```typescript
// Yeni middleware
export const loggingMiddleware = (req, res, next) => {
  console.log("Auth request:", req);
  next();
};
```

## 📈 Monitoring & Debugging

### 1. Debug Interface

```typescript
const debugInfo = authService.getDebugInfo();
// {
//   state: AuthState,
//   tokenRemainingTime: number,
//   availableUsers: User[],
//   securityConfig: AuthConfig
// }
```

### 2. Event Logging

```typescript
authService.onEvent((event) => {
  if (event.type === "error") {
    console.error("Auth error:", event.data);
  }
});
```

### 3. Performance Metrics

```typescript
// Token validation süresi
const start = performance.now();
const isValid = await validateToken(token);
const duration = performance.now() - start;
```

---

**Sonraki**: [API Referansı](./api-reference.md)
