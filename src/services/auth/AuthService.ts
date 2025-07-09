import {
  AuthState,
  LoginCredentials,
  AuthError,
  AuthEvent,
  AuthEventType,
} from "./types";
import { userStore } from "./UserStore";
import { tokenManager } from "./TokenManager";
import { securityManager } from "./SecurityManager";

type AuthStateListener = (state: AuthState) => void;
type AuthEventListener = (event: AuthEvent) => void;

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    csrfToken: null,
  };

  private stateListeners: Set<AuthStateListener> = new Set();
  private eventListeners: Set<AuthEventListener> = new Set();

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Storage'dan mevcut token'ı kontrol et ve state'i başlat
   */
  private async initializeFromStorage(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      const tokenData = tokenManager.getValidStoredToken();

      if (tokenData) {
        // Geçerli token varsa user bilgilerini state'e yükle
        this.updateState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: tokenData.userId,
            username: tokenData.username,
            name: tokenData.name,
          },
          error: null,
          csrfToken: tokenData.csrfToken,
        });

        this.emitEvent("login", { fromStorage: true });
      } else {
        // Token yoksa veya geçersizse
        this.updateState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
          csrfToken: null,
        });
      }
    } catch (error) {
      this.handleError("storage", "Storage initialization failed", error);
    }
  }

  /**
   * Kullanıcı giriş işlemi
   */
  async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Kullanıcı doğrulama
      const user = userStore.findUser(
        credentials.username,
        credentials.password
      );

      if (!user) {
        const error = "Geçersiz kullanıcı adı veya şifre";
        this.updateState({
          isLoading: false,
          error,
          isAuthenticated: false,
          user: null,
        });
        return { success: false, error };
      }

      // Token oluştur
      const token = tokenManager.createToken(
        user.id,
        user.username,
        user.name,
        credentials.rememberMe || false
      );

      // Token'ı kaydet
      tokenManager.storeToken(token);

      // Token'ı decode et (CSRF token için)
      const tokenData = tokenManager.decodeToken(token);

      if (!tokenData) {
        throw new Error("Token creation failed");
      }

      // State'i güncelle
      this.updateState({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
        error: null,
        csrfToken: tokenData.csrfToken,
      });

      this.emitEvent("login", {
        username: user.username,
        rememberMe: credentials.rememberMe,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = "Giriş işlemi sırasında hata oluştu";
      this.handleError("auth", errorMessage, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Kullanıcı çıkış işlemi
   */
  async logout(): Promise<void> {
    try {
      // Token'ı temizle
      tokenManager.clearToken();

      // State'i temizle
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        csrfToken: null,
      });

      this.emitEvent("logout");
    } catch (error) {
      this.handleError("auth", "Logout failed", error);
    }
  }

  /**
   * Token'ı doğrula ve yenile
   */
  async validateAndRefreshToken(): Promise<boolean> {
    try {
      const tokenData = tokenManager.getValidStoredToken();

      if (!tokenData) {
        // Token geçersiz, logout yap
        await this.logout();
        this.emitEvent("token_expired");
        return false;
      }

      // Token geçerli, state güncel mi kontrol et
      if (this.state.user?.id !== tokenData.userId) {
        this.updateState({
          isAuthenticated: true,
          user: {
            id: tokenData.userId,
            username: tokenData.username,
            name: tokenData.name,
          },
          csrfToken: tokenData.csrfToken,
        });
      }

      return true;
    } catch (error) {
      this.handleError("validation", "Token validation failed", error);
      return false;
    }
  }

  /**
   * CSRF token al
   */
  getCSRFToken(): string | null {
    return this.state.csrfToken;
  }

  /**
   * Current auth state'i al
   */
  getState(): Readonly<AuthState> {
    return { ...this.state };
  }

  /**
   * State değişikliklerini dinle
   */
  subscribe(listener: AuthStateListener): () => void {
    this.stateListeners.add(listener);

    // Unsubscribe function
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  /**
   * Auth event'lerini dinle
   */
  onEvent(listener: AuthEventListener): () => void {
    this.eventListeners.add(listener);

    return () => {
      this.eventListeners.delete(listener);
    };
  }

  /**
   * Token kalan süresini al
   */
  getTokenRemainingTime(): number {
    return tokenManager.getTokenRemainingTime();
  }

  /**
   * Debug bilgileri al
   */
  getDebugInfo() {
    return {
      state: this.state,
      tokenRemainingTime: this.getTokenRemainingTime(),
      availableUsers: userStore.getAllUsers(),
      securityConfig: securityManager.getConfig(),
    };
  }

  /**
   * State'i güncelle ve listeners'ı bilgilendir
   */
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };

    // Tüm listeners'ı bilgilendir
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("Auth state listener error:", error);
      }
    });
  }

  /**
   * Event emit et
   */
  private emitEvent(type: AuthEventType, data?: any): void {
    const event: AuthEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Auth event listener error:", error);
      }
    });
  }

  /**
   * Error handling
   */
  private handleError(
    type: AuthError["type"],
    message: string,
    details?: any
  ): void {
    console.error(`Auth ${type} error:`, message, details);

    this.updateState({
      isLoading: false,
      error: message,
    });

    this.emitEvent("error", { type, message, details });
  }
}

// Singleton instance
export const authService = new AuthService();
