import { AuthToken, ValidationResult, StorageProvider } from "./types";
import { securityManager } from "./SecurityManager";

/**
 * Unicode-safe base64 encoding
 */
function unicodeBase64Encode(str: string): string {
  // Unicode karakterleri encode et
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = "";
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/**
 * Unicode-safe base64 decoding
 */
function unicodeBase64Decode(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * localStorage tabanlı storage provider
 */
class LocalStorageProvider implements StorageProvider {
  private readonly TOKEN_KEY = "lab907-auth-token";

  setToken(token: string): void {
    if (this.isAvailable()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isAvailable()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (this.isAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  isAvailable(): boolean {
    try {
      return typeof window !== "undefined" && !!window.localStorage;
    } catch {
      return false;
    }
  }
}

/**
 * Memory tabanlı fallback storage
 */
class MemoryStorageProvider implements StorageProvider {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  removeToken(): void {
    this.token = null;
  }

  isAvailable(): boolean {
    return true;
  }
}

class TokenManager {
  // İki provider'ı da hazırla
  private localProvider: StorageProvider = new LocalStorageProvider();
  private memoryProvider: StorageProvider = new MemoryStorageProvider();

  /**
   * Geçerli ortama göre (browser vs SSR) uygun provider döner.
   *  - Browser + localStorage varsa => localProvider
   *  - Diğer durumlarda            => memoryProvider
   */
  private get provider(): StorageProvider {
    return typeof window !== "undefined" && this.localProvider.isAvailable()
      ? this.localProvider
      : this.memoryProvider;
  }

  // Artık constructor'da provider seçimi yapmaya gerek yok
  constructor() {}

  /**
   * Auth token oluştur
   */
  createToken(
    userId: string,
    username: string,
    name: string,
    rememberMe: boolean = false
  ): string {
    const now = Date.now();
    const expiresAt = securityManager.calculateExpiry(rememberMe);
    const csrfToken = securityManager.generateCSRFToken();

    const tokenData: AuthToken = {
      userId,
      username,
      name,
      issuedAt: now,
      expiresAt,
      rememberMe,
      csrfToken,
    };

    // Token'ı JSON string'e çevir
    const payload = JSON.stringify(tokenData);

    // İmza oluştur
    const signature = securityManager.signToken(payload);

    // Base64 encode et (header.payload.signature formatında)
    const header = unicodeBase64Encode(
      JSON.stringify({ alg: "HMAC", typ: "LAB907" })
    );
    const encodedPayload = unicodeBase64Encode(payload);

    return `${header}.${encodedPayload}.${signature}`;
  }

  /**
   * Token'ı decode et
   */
  decodeToken(token: string): AuthToken | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const [header, payload, signature] = parts;

      // Payload'ı decode et
      const decodedPayload = unicodeBase64Decode(payload);

      // İmza doğrula
      if (!securityManager.verifyTokenSignature(decodedPayload, signature)) {
        console.warn("Token signature validation failed");
        return null;
      }

      return JSON.parse(decodedPayload) as AuthToken;
    } catch (error) {
      console.error("Token decode failed:", error);
      return null;
    }
  }

  /**
   * Token'ı doğrula
   */
  validateToken(token: string): ValidationResult {
    if (!token) {
      return { isValid: false, reason: "not_found" };
    }

    const decodedToken = this.decodeToken(token);

    if (!decodedToken) {
      return { isValid: false, reason: "malformed" };
    }

    // Expiry kontrolü
    const now = Date.now();
    if (now > decodedToken.expiresAt) {
      return { isValid: false, reason: "expired" };
    }

    // CSRF token kontrolü
    if (!securityManager.validateCSRFToken(decodedToken.csrfToken)) {
      return { isValid: false, reason: "invalid_csrf" };
    }

    return { isValid: true };
  }

  /**
   * Token'ı storage'a kaydet
   */
  storeToken(token: string): void {
    this.provider.setToken(token);
  }

  /**
   * Storage'dan token al
   */
  getStoredToken(): string | null {
    return this.provider.getToken();
  }

  /**
   * Token'ı storage'dan sil
   */
  clearToken(): void {
    this.provider.removeToken();
  }

  /**
   * Stored token'ı doğrula ve döndür
   */
  getValidStoredToken(): AuthToken | null {
    const token = this.getStoredToken();

    if (!token) {
      return null;
    }

    const validation = this.validateToken(token);

    if (!validation.isValid) {
      // Geçersiz token'ı temizle
      this.clearToken();
      return null;
    }

    return this.decodeToken(token);
  }

  /**
   * Token kalan süresini al (milliseconds)
   */
  getTokenRemainingTime(): number {
    const tokenData = this.getValidStoredToken();

    if (!tokenData) {
      return 0;
    }

    return Math.max(0, tokenData.expiresAt - Date.now());
  }

  /**
   * Storage provider'ı değiştir (testing için)
   */
  // Test senaryoları için storage provider'ı manuel olarak geçersiz kılabilmek amacıyla
  // her iki provider'ı da aynı mock ile değiştiriyoruz.
  setStorageProvider(provider: StorageProvider): void {
    this.localProvider = provider;
    this.memoryProvider = provider;
  }
}

// Singleton instance
export const tokenManager = new TokenManager();
