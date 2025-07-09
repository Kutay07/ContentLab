# 🎯 Kullanım Kılavuzu

Auth sisteminin pratik kullanım örnekleri ve senaryoları.

## 🚀 Hızlı Başlangıç

### 1. Temel Login

```tsx
import { useAuth } from "@/hooks/useAuth";

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(
      credentials.username,
      credentials.password,
      credentials.rememberMe
    );

    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Kullanıcı Adı"
        value={credentials.username}
        onChange={(e) =>
          setCredentials((prev) => ({
            ...prev,
            username: e.target.value,
          }))
        }
      />
      <input
        type="password"
        placeholder="Şifre"
        value={credentials.password}
        onChange={(e) =>
          setCredentials((prev) => ({
            ...prev,
            password: e.target.value,
          }))
        }
      />
      <label>
        <input
          type="checkbox"
          checked={credentials.rememberMe}
          onChange={(e) =>
            setCredentials((prev) => ({
              ...prev,
              rememberMe: e.target.checked,
            }))
          }
        />
        Beni Hatırla (7 gün)
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 2. Protected Routes

```tsx
import { useRequireAuth } from "@/hooks/useAuth";

function ProtectedPage() {
  const { canAccess, isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Kimlik doğrulanıyor...</div>;
  }

  if (!canAccess) {
    return <div>Bu sayfaya erişim yetkiniz yok.</div>;
  }

  return (
    <div>
      <h1>Korumalı İçerik</h1>
      <p>Bu içeriği sadece giriş yapmış kullanıcılar görebilir.</p>
    </div>
  );
}
```

### 3. API Calls

```tsx
import { api } from "@/services/auth";

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Auth korumalı endpoint
      const response = await api.get("/api/protected-data");
      setData(response.data);
    } catch (error) {
      console.error("Veri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (newData) => {
    try {
      // CSRF korumalı POST
      await api.post("/api/data", newData);
      await fetchData(); // Refresh
    } catch (error) {
      console.error("Veri oluşturulamadı:", error);
    }
  };

  return (
    <div>
      {loading ? "Yükleniyor..." : JSON.stringify(data)}
      <button onClick={fetchData}>Verileri Yükle</button>
    </div>
  );
}
```

## 🎨 UI Bileşenleri

### 1. Auth Status Indicator

```tsx
function AuthStatus() {
  const { isAuthenticated, user, logout, getTokenRemainingTime } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setTimeLeft(getTokenRemainingTime());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <span>Giriş yapmamış</span>;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="auth-status">
      <span>Hoşgeldin, {user?.name}</span>
      <span>
        Kalan süre: {hours}s {minutes}d
      </span>
      <button onClick={logout}>Çıkış</button>
    </div>
  );
}
```

### 2. Error Boundary

```tsx
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";

function App() {
  return (
    <AuthErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-boundary">
          <h2>Auth Hatası</h2>
          <p>{error.message}</p>
          <button onClick={resetError}>Tekrar Dene</button>
        </div>
      )}
    >
      <YourApp />
    </AuthErrorBoundary>
  );
}
```

### 3. Loading States

```tsx
import AuthLoading from "@/components/auth/AuthLoading";

function MyComponent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <AuthLoading
        message="Kullanıcı bilgileri kontrol ediliyor..."
        showSpinner={true}
        className="custom-loading"
      />
    );
  }

  return <ActualContent />;
}
```

## 🔄 Advanced Usage

### 1. Manual Token Management

```tsx
function AdvancedAuthComponent() {
  const { validateToken, getDebugInfo } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);

  const checkTokenManually = async () => {
    const isValid = await validateToken();
    console.log("Token geçerli:", isValid);

    setDebugInfo(getDebugInfo());
  };

  return (
    <div>
      <button onClick={checkTokenManually}>Token Durumu Kontrol Et</button>
      {debugInfo && <pre>{JSON.stringify(debugInfo, null, 2)}</pre>}
    </div>
  );
}
```

### 2. Custom CSRF Handling

```tsx
import { useCSRFToken } from "@/hooks/useAuth";

function CustomApiComponent() {
  const { csrfToken, getHeaders } = useCSRFToken();

  const makeCustomRequest = async () => {
    const response = await fetch("/api/custom", {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: "test" }),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  };

  return (
    <div>
      <p>CSRF Token: {csrfToken}</p>
      <button onClick={makeCustomRequest}>Custom Request Gönder</button>
    </div>
  );
}
```

### 3. Event Listening

```tsx
function AuthEventListener() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = authService.onEvent((event) => {
      setEvents((prev) => [event, ...prev.slice(0, 9)]); // Son 10 event
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      <h3>Auth Events</h3>
      {events.map((event, index) => (
        <div key={index} className={`event event-${event.type}`}>
          <strong>{event.type}</strong> -{" "}
          {new Date(event.timestamp).toLocaleString()}
          {event.data && <pre>{JSON.stringify(event.data, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ Utilities

### 1. Auth Guard HOC

```tsx
function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthGuardedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <AuthLoading />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }

    return <Component {...props} />;
  };
}

// Kullanım
const ProtectedDashboard = withAuth(Dashboard);
```

### 2. Conditional Rendering Hook

```tsx
function useAuthConditional() {
  const { isAuthenticated, user } = useAuth();

  return {
    ifAuthenticated: (component: React.ReactNode) =>
      isAuthenticated ? component : null,

    ifNotAuthenticated: (component: React.ReactNode) =>
      !isAuthenticated ? component : null,

    ifUser: (username: string, component: React.ReactNode) =>
      user?.username === username ? component : null,
  };
}

// Kullanım
function ConditionalComponent() {
  const { ifAuthenticated, ifNotAuthenticated } = useAuthConditional();

  return (
    <div>
      {ifAuthenticated(<Dashboard />)}
      {ifNotAuthenticated(<LoginPrompt />)}
    </div>
  );
}
```

### 3. Auto-logout Timer

```tsx
function useAutoLogout(warningTime = 5 * 60 * 1000) {
  // 5 dakika uyarı
  const { logout, getTokenRemainingTime } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTokenRemainingTime();

      if (remaining <= warningTime && remaining > 0) {
        setShowWarning(true);
      } else if (remaining <= 0) {
        logout();
      } else {
        setShowWarning(false);
      }
    }, 30000); // Her 30 saniyede kontrol

    return () => clearInterval(interval);
  }, []);

  return { showWarning };
}

// Kullanım
function AppWithAutoLogout() {
  const { showWarning } = useAutoLogout();

  return (
    <div>
      {showWarning && (
        <div className="logout-warning">Oturumunuz yakında sona erecek!</div>
      )}
      <YourApp />
    </div>
  );
}
```

## 📱 Mobile Considerations

### 1. Touch-friendly Login

```tsx
function MobileLoginForm() {
  return (
    <form className="mobile-login">
      <input
        type="text"
        placeholder="Kullanıcı Adı"
        autoCapitalize="none"
        autoCorrect="off"
        inputMode="text"
        className="mobile-input"
      />
      <input
        type="password"
        placeholder="Şifre"
        autoComplete="current-password"
        className="mobile-input"
      />
      <button
        type="submit"
        className="mobile-button"
        style={{
          minHeight: "44px", // iOS touch target
          fontSize: "16px", // Prevent zoom on iOS
        }}
      >
        Giriş Yap
      </button>
    </form>
  );
}
```

### 2. Biometric Authentication (Future)

```tsx
// Gelecekte biometric auth için hazırlık
function BiometricAuth() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    // WebAuthn API kontrolü
    setBiometricAvailable(
      "credentials" in navigator && "create" in navigator.credentials
    );
  }, []);

  return biometricAvailable ? (
    <button onClick={handleBiometricAuth}>🔐 Biometric Giriş</button>
  ) : null;
}
```

## 🔍 Debugging

### 1. Debug Panel

```tsx
function AuthDebugPanel() {
  const { getDebugInfo } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const refreshDebugInfo = () => {
    setDebugInfo(getDebugInfo());
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="debug-panel">
      <button onClick={() => setIsOpen(!isOpen)}>🐛 Auth Debug</button>

      {isOpen && (
        <div className="debug-content">
          <button onClick={refreshDebugInfo}>Refresh</button>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### 2. Console Logging

```tsx
// Development'da auth event'leri konsola log'la
useEffect(() => {
  if (process.env.NODE_ENV === "development") {
    const unsubscribe = authService.onEvent((event) => {
      console.group(`🔐 Auth Event: ${event.type}`);
      console.log("Timestamp:", new Date(event.timestamp));
      console.log("Data:", event.data);
      console.groupEnd();
    });

    return unsubscribe;
  }
}, []);
```

---

**Sonraki**: [Sorun Giderme](./troubleshooting.md)
