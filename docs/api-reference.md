# 📚 API Referansı

Auth sisteminin tüm API'lerinin detaylı referansı.

## 🎯 AuthService

Ana auth service sınıfı.

### Methods

#### `login(credentials: LoginCredentials): Promise<{success: boolean; error?: string}>`

Kullanıcı giriş işlemi.

**Parameters:**

```typescript
interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
```

**Returns:**

```typescript
{
  success: boolean;
  error?: string;
}
```

**Example:**

```typescript
import { authService } from "@/services/auth";

const result = await authService.login({
  username: "admin",
  password: "admin123",
  rememberMe: true,
});

if (result.success) {
  console.log("Login successful");
} else {
  console.error("Login failed:", result.error);
}
```

#### `logout(): Promise<void>`

Kullanıcı çıkış işlemi.

**Example:**

```typescript
await authService.logout();
```

#### `validateAndRefreshToken(): Promise<boolean>`

Token doğrulama ve yenileme.

**Returns:** `boolean` - Token geçerli mi?

**Example:**

```typescript
const isValid = await authService.validateAndRefreshToken();
if (!isValid) {
  // Token expired, redirect to login
}
```

#### `getState(): Readonly<AuthState>`

Mevcut auth state'ini al.

**Returns:**

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    username: string;
    name: string;
  } | null;
  error: string | null;
  csrfToken: string | null;
}
```

#### `subscribe(listener: AuthStateListener): () => void`

Auth state değişikliklerini dinle.

**Parameters:**

```typescript
type AuthStateListener = (state: AuthState) => void;
```

**Returns:** Unsubscribe function

**Example:**

```typescript
const unsubscribe = authService.subscribe((newState) => {
  console.log("Auth state changed:", newState);
});

// Cleanup
unsubscribe();
```

#### `onEvent(listener: AuthEventListener): () => void`

Auth event'lerini dinle.

**Parameters:**

```typescript
type AuthEventListener = (event: AuthEvent) => void;

interface AuthEvent {
  type: "login" | "logout" | "token_expired" | "error";
  data?: any;
  timestamp: number;
}
```

**Example:**

```typescript
const unsubscribe = authService.onEvent((event) => {
  switch (event.type) {
    case "login":
      console.log("User logged in:", event.data);
      break;
    case "token_expired":
      console.log("Token expired");
      break;
  }
});
```

#### `getCSRFToken(): string | null`

CSRF token'ı al.

**Example:**

```typescript
const csrfToken = authService.getCSRFToken();
```

#### `getTokenRemainingTime(): number`

Token'ın kalan süresini al (milliseconds).

**Example:**

```typescript
const remaining = authService.getTokenRemainingTime();
const hours = Math.floor(remaining / (1000 * 60 * 60));
console.log(`Token expires in ${hours} hours`);
```

#### `getDebugInfo(): object`

Debug bilgilerini al.

**Returns:**

```typescript
{
  state: AuthState;
  tokenRemainingTime: number;
  availableUsers: Omit < User, "password" > [];
  securityConfig: AuthConfig;
}
```

## 🔐 TokenManager

Token yönetim sınıfı.

### Methods

#### `createToken(userId: string, username: string, name: string, rememberMe?: boolean): string`

Yeni auth token oluştur.

**Example:**

```typescript
import { tokenManager } from "@/services/auth";

const token = tokenManager.createToken("1", "admin", "Admin Kullanıcı", true);
```

#### `decodeToken(token: string): AuthToken | null`

Token'ı decode et.

**Example:**

```typescript
const tokenData = tokenManager.decodeToken(token);
if (tokenData) {
  console.log("User:", tokenData.username);
  console.log("Expires:", new Date(tokenData.expiresAt));
}
```

#### `validateToken(token: string): ValidationResult`

Token'ı doğrula.

**Returns:**

```typescript
interface ValidationResult {
  isValid: boolean;
  reason?: "expired" | "malformed" | "invalid_csrf" | "not_found";
  error?: string;
}
```

#### `storeToken(token: string): void`

Token'ı storage'a kaydet.

#### `getStoredToken(): string | null`

Storage'dan token'ı al.

#### `clearToken(): void`

Token'ı storage'dan sil.

## 👥 UserStore

Kullanıcı yönetim sınıfı.

### Methods

#### `findUser(username: string, password: string): User | null`

Kullanıcı adı ve şifre ile kullanıcı bul.

**Example:**

```typescript
import { userStore } from "@/services/auth";

const user = userStore.findUser("admin", "admin123");
if (user) {
  console.log("User found:", user.name);
}
```

#### `findUserById(id: string): User | null`

ID ile kullanıcı bul.

#### `findUserByUsername(username: string): User | null`

Username ile kullanıcı bul.

#### `getAllUsers(): Omit<User, 'password'>[]`

Tüm kullanıcıları listele (şifreler hariç).

## 🛡️ SecurityManager

Güvenlik yönetim sınıfı.

### Methods

#### `generateCSRFToken(): string`

CSRF token oluştur.

#### `validateCSRFToken(token: string): boolean`

CSRF token doğrula.

#### `calculateExpiry(rememberMe: boolean): number`

Token expiry zamanını hesapla.

#### `signToken(payload: string): string`

Token'ı imzala.

#### `verifyTokenSignature(payload: string, signature: string): boolean`

Token imzasını doğrula.

## 🌐 API Middleware

HTTP istekleri için middleware.

### Functions

#### `authFetch(url: string, config?: RequestConfig): Promise<Response>`

Auth korumalı HTTP isteği.

**Parameters:**

```typescript
interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
  includeCSRF?: boolean;
}
```

**Example:**

```typescript
import { authFetch } from "@/services/auth";

const response = await authFetch("/api/protected", {
  method: "POST",
  body: JSON.stringify({ data: "test" }),
  requireAuth: true,
  includeCSRF: true,
});
```

### API Object

Hazır API wrapper'ı.

```typescript
import { api } from "@/services/auth";

// GET request
const data = await api.get("/api/users");

// POST request
const result = await api.post("/api/users", {
  name: "New User",
});

// PUT request
await api.put("/api/users/1", { name: "Updated" });

// DELETE request
await api.delete("/api/users/1");

// Public endpoints
const publicData = await api.public.get("/api/public");
```

## 🎣 Custom Hooks

React hook'ları.

### `useAuth()`

Ana auth hook'u.

**Returns:**

```typescript
{
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  // Actions
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;

  // Helpers
  getCSRFToken: () => string | null;
  getTokenRemainingTime: () => number;
  getDebugInfo: () => object;
  validateToken: () => Promise<boolean>;
}
```

**Example:**

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      Welcome, {user?.name}!<button onClick={logout}>Logout</button>
    </div>
  );
}
```

### `useRequireAuth()`

Protected route için hook.

**Returns:**

```typescript
{
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
}
```

**Example:**

```typescript
import { useRequireAuth } from "@/hooks/useAuth";

function ProtectedComponent() {
  const { canAccess, isLoading } = useRequireAuth();

  if (isLoading) return <Loading />;
  if (!canAccess) return <Redirect to="/login" />;

  return <ProtectedContent />;
}
```

### `useCSRFToken()`

CSRF token hook'u.

**Returns:**

```typescript
{
  csrfToken: string | null;
  getHeaders: () => Record<string, string>;
}
```

**Example:**

```typescript
import { useCSRFToken } from "@/hooks/useAuth";

function ApiComponent() {
  const { getHeaders } = useCSRFToken();

  const makeRequest = async () => {
    const response = await fetch("/api/protected", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  };
}
```

## 🎨 Components

Auth UI component'ları.

### `<AuthProvider>`

Ana auth provider component'i.

**Props:**

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

**Example:**

```tsx
import AuthProvider from "@/components/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  );
}
```

### `<AuthLoading>`

Loading state component'i.

**Props:**

```typescript
interface AuthLoadingProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}
```

**Example:**

```tsx
import AuthLoading from "@/components/auth/AuthLoading";

<AuthLoading message="Kimlik doğrulanıyor..." showSpinner={true} />;
```

### `<AuthErrorDisplay>`

Error display component'i.

**Props:**

```typescript
interface AuthErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}
```

### `<AuthErrorBoundary>`

Error boundary component'i.

**Props:**

```typescript
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
}
```

## 📁 Type Definitions

### Core Types

```typescript
interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

interface AuthToken {
  userId: string;
  username: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
  rememberMe: boolean;
  csrfToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    username: string;
    name: string;
  } | null;
  error: string | null;
  csrfToken: string | null;
}

interface AuthConfig {
  defaultTokenExpiry: number;
  rememberMeExpiry: number;
  secretKey: string;
}
```

### Event Types

```typescript
type AuthEventType = "login" | "logout" | "token_expired" | "error";

interface AuthEvent {
  type: AuthEventType;
  data?: any;
  timestamp: number;
}
```

### Error Types

```typescript
interface AuthError {
  type: "network" | "auth" | "validation" | "storage";
  message: string;
  details?: any;
}
```

---

**Sonraki**: [Güvenlik](./security.md)
