# 💡 Örnekler

Auth sisteminin farklı senaryolarda kullanım örnekleri.

## 🔧 Basic Examples

### 1. Simple Login Component

```tsx
// SimpleLogin.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kullanıcı Adı:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
```

### 2. Protected Dashboard

```tsx
// Dashboard.tsx
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, logout, getTokenRemainingTime } = useAuth();
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getTokenRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}s ${minutes}d`;
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Hoşgeldin, {user?.name}</span>
          <span>Kalan süre: {formatTime(remainingTime)}</span>
          <button onClick={logout}>Çıkış</button>
        </div>
      </header>
      <main>
        <p>Bu sayfa sadece giriş yapmış kullanıcılar için görünür.</p>
      </main>
    </div>
  );
}
```

### 3. API Data Fetcher

```tsx
// DataManager.tsx
import { useState, useEffect } from "react";
import { api } from "@/services/auth";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function DataManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (err) {
      setError("Kullanıcılar yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, "id">) => {
    try {
      await api.post("/api/users", userData);
      await fetchUsers(); // Refresh list
    } catch (err) {
      setError("Kullanıcı oluşturulamadı");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Kullanıcı Yönetimi</h2>

      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={fetchUsers}>Yenile</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎨 Advanced Examples

### 1. Auth Guard Higher-Order Component

```tsx
// withAuthGuard.tsx
import { useAuth } from "@/hooks/useAuth";
import AuthLoading from "@/components/auth/AuthLoading";

interface AuthGuardOptions {
  redirectTo?: string;
  loadingComponent?: React.ComponentType;
  fallbackComponent?: React.ComponentType;
}

export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthGuardOptions = {}
) {
  return function AuthGuardedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    const LoadingComponent = options.loadingComponent || AuthLoading;
    const FallbackComponent =
      options.fallbackComponent ||
      (() => <div>Bu sayfaya erişim için giriş yapmalısınız.</div>);

    if (isLoading) {
      return <LoadingComponent />;
    }

    if (!isAuthenticated) {
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
        return null;
      }
      return <FallbackComponent />;
    }

    return <Component {...props} />;
  };
}

// Kullanım
const ProtectedPage = withAuthGuard(Dashboard, {
  redirectTo: "/auth/login",
});
```

### 2. Multi-step Login with Remember Me

```tsx
// AdvancedLogin.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdvancedLogin() {
  const [step, setStep] = useState<"credentials" | "options">("credentials");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const { login, isLoading, error } = useAuth();

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      setStep("options");
    }
  };

  const handleFinalSubmit = async () => {
    const success = await login(
      credentials.username,
      credentials.password,
      credentials.rememberMe
    );

    if (!success) {
      setStep("credentials"); // Geri dön
    }
  };

  const renderCredentialsStep = () => (
    <form onSubmit={handleCredentialsSubmit}>
      <h2>Giriş Bilgileri</h2>
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
        required
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
        required
      />
      <button type="submit">Devam Et</button>
    </form>
  );

  const renderOptionsStep = () => (
    <div>
      <h2>Giriş Seçenekleri</h2>
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
        Beni Hatırla ({credentials.rememberMe ? "7 gün" : "24 saat"})
      </label>

      <div>
        <button onClick={() => setStep("credentials")}>Geri</button>
        <button onClick={handleFinalSubmit} disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );

  return (
    <div className="advanced-login">
      {step === "credentials" ? renderCredentialsStep() : renderOptionsStep()}
    </div>
  );
}
```

### 3. Real-time Auth Status Monitor

```tsx
// AuthMonitor.tsx
import { useState, useEffect } from "react";
import { authService } from "@/services/auth";

export default function AuthMonitor() {
  const [events, setEvents] = useState<any[]>([]);
  const [authState, setAuthState] = useState(authService.getState());

  useEffect(() => {
    // Auth state değişikliklerini dinle
    const unsubscribeState = authService.subscribe((newState) => {
      setAuthState(newState);
    });

    // Auth event'lerini dinle
    const unsubscribeEvents = authService.onEvent((event) => {
      setEvents((prev) => [
        { ...event, id: Date.now() },
        ...prev.slice(0, 9), // Son 10 event
      ]);
    });

    return () => {
      unsubscribeState();
      unsubscribeEvents();
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return "🔓";
      case "logout":
        return "🔒";
      case "token_expired":
        return "⏰";
      case "error":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div className="auth-monitor">
      <h3>Auth Status Monitor</h3>

      {/* Current State */}
      <div className="current-state">
        <h4>Mevcut Durum</h4>
        <p>Authenticated: {authState.isAuthenticated ? "✅" : "❌"}</p>
        <p>Loading: {authState.isLoading ? "⏳" : "✅"}</p>
        <p>User: {authState.user?.name || "Yok"}</p>
        <p>Error: {authState.error || "Yok"}</p>
      </div>

      {/* Recent Events */}
      <div className="recent-events">
        <h4>Son Olaylar</h4>
        {events.length === 0 ? (
          <p>Henüz olay yok</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <span>{getEventIcon(event.type)}</span>
                <span>{event.type}</span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### 4. Custom CSRF Form Hook

```tsx
// useCSRFForm.ts
import { useState } from "react";
import { useCSRFToken } from "@/hooks/useAuth";

export function useCSRFForm<T>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getHeaders } = useCSRFToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const makeRequest = async (url: string, data: any) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  };

  return {
    values,
    isSubmitting,
    error,
    handleSubmit,
    handleChange,
    makeRequest,
    setError,
  };
}

// Kullanım örneği
function ContactForm() {
  const form = useCSRFForm(
    { name: "", email: "", message: "" },
    async (values) => {
      await form.makeRequest("/api/contact", values);
      alert("Mesaj gönderildi!");
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        type="text"
        placeholder="Adınız"
        value={form.values.name}
        onChange={(e) => form.handleChange("name", e.target.value)}
      />
      <input
        type="email"
        placeholder="E-posta"
        value={form.values.email}
        onChange={(e) => form.handleChange("email", e.target.value)}
      />
      <textarea
        placeholder="Mesajınız"
        value={form.values.message}
        onChange={(e) => form.handleChange("message", e.target.value)}
      />
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Gönderiliyor..." : "Gönder"}
      </button>
      {form.error && <p style={{ color: "red" }}>{form.error}</p>}
    </form>
  );
}
```

## 📱 Mobile Examples

### 1. Touch-Optimized Login

```tsx
// MobileLogin.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  return (
    <div className="mobile-login">
      <style jsx>{`
        .mobile-login {
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
        }

        .mobile-input {
          width: 100%;
          padding: 16px;
          font-size: 16px; /* Prevent zoom on iOS */
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 16px;
          -webkit-appearance: none; /* Remove iOS default styles */
        }

        .mobile-button {
          width: 100%;
          padding: 16px;
          font-size: 18px;
          min-height: 44px; /* iOS touch target minimum */
          border-radius: 8px;
          background: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
        }

        .mobile-button:disabled {
          opacity: 0.6;
        }

        .password-toggle {
          position: relative;
        }

        .toggle-button {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      `}</style>

      <h2>Mobil Giriş</h2>

      <input
        type="text"
        placeholder="Kullanıcı Adı"
        className="mobile-input"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="username"
      />

      <div className="password-toggle">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Şifre"
          className="mobile-input"
          autoComplete="current-password"
        />
        <button
          type="button"
          className="toggle-button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <label className="remember-me">
        <input type="checkbox" />
        <span>Beni Hatırla</span>
      </label>

      <button type="submit" className="mobile-button" disabled={isLoading}>
        {isLoading ? "⏳ Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </div>
  );
}
```

### 2. Biometric Login Preparation

```tsx
// BiometricLogin.tsx (Future Feature)
import { useState, useEffect } from "react";

export default function BiometricLogin() {
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    // WebAuthn desteği kontrolü
    const checkBiometricSupport = async () => {
      if ("credentials" in navigator && "create" in navigator.credentials) {
        setBiometricSupported(true);

        // Kullanıcının kayıtlı credential'ı var mı kontrol et
        try {
          const credentials = await navigator.credentials.get({
            publicKey: {
              challenge: new Uint8Array(32),
              allowCredentials: [],
              userVerification: "preferred",
            },
          });
          setEnrolled(!!credentials);
        } catch (error) {
          // Henüz kayıt yok
          setEnrolled(false);
        }
      }
    };

    checkBiometricSupport();
  }, []);

  const enrollBiometric = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Lab907 Auth" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "Lab907 User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        },
      });

      if (credential) {
        setEnrolled(true);
        alert("Biyometrik doğrulama başarıyla ayarlandı!");
      }
    } catch (error) {
      alert("Biyometrik doğrulama ayarlanamadı");
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required",
        },
      });

      if (credential) {
        // Auth service ile login yap
        alert("Biyometrik doğrulama başarılı!");
      }
    } catch (error) {
      alert("Biyometrik doğrulama başarısız");
    }
  };

  if (!biometricSupported) {
    return (
      <div>
        <p>Bu cihaz biyometrik doğrulamayı desteklemiyor.</p>
      </div>
    );
  }

  return (
    <div className="biometric-login">
      <h3>🔐 Biyometrik Doğrulama</h3>

      {!enrolled ? (
        <div>
          <p>Hızlı giriş için biyometrik doğrulamayı ayarlayın.</p>
          <button onClick={enrollBiometric}>
            Biyometrik Doğrulamayı Ayarla
          </button>
        </div>
      ) : (
        <div>
          <p>Biyometrik doğrulama ile giriş yapabilirsiniz.</p>
          <button onClick={authenticateWithBiometric}>
            👆 Parmak İzi ile Giriş
          </button>
        </div>
      )}
    </div>
  );
}
```

---

**Bu örnekler**, auth sisteminin çeşitli senaryolarda nasıl kullanılacağını göstermektedir. Her örnek, gerçek dünya uygulamalarında karşılaşabileceğiniz durumları ele alır ve best practices'leri gösterir.
