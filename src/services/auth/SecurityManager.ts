import { AuthConfig } from "./types";

class SecurityManager {
  private config: AuthConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Environment'tan auth config yükle
   */
  private loadConfig(): AuthConfig {
    return {
      defaultTokenExpiry: parseInt(
        process.env.AUTH_DEFAULT_EXPIRY ||
          process.env.NEXT_PUBLIC_AUTH_DEFAULT_EXPIRY ||
          "86400000"
      ),
      rememberMeExpiry: parseInt(
        process.env.AUTH_REMEMBER_ME_EXPIRY ||
          process.env.NEXT_PUBLIC_AUTH_REMEMBER_ME_EXPIRY ||
          "604800000"
      ),
      secretKey:
        process.env.AUTH_SECRET_KEY ||
        process.env.NEXT_PUBLIC_AUTH_SECRET_KEY ||
        "default-secret-key",
    };
  }

  /**
   * CSRF token oluştur
   */
  generateCSRFToken(): string {
    const payload = {
      t: Date.now(),
      r: Math.random().toString(36).substr(2, 9),
      s: this.config.secretKey,
    };

    return btoa(JSON.stringify(payload));
  }

  /**
   * CSRF token doğrula
   */
  validateCSRFToken(token: string): boolean {
    try {
      const decoded = atob(token);
      const payload = JSON.parse(decoded) as {
        t: number;
        r: string;
        s: string;
      };

      // Secret key kontrolü
      if (payload.s !== this.config.secretKey) {
        return false;
      }

      // Timestamp kontrolü (token 24 saat geçerli)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 saat

      return now - payload.t < maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Token expiry hesapla
   */
  calculateExpiry(rememberMe: boolean = false): number {
    const now = Date.now();
    const expiry = rememberMe
      ? this.config.rememberMeExpiry
      : this.config.defaultTokenExpiry;
    return now + expiry;
  }

  /**
   * Token imza oluştur (basit hash)
   */
  signToken(payload: string): string {
    const secret = this.config.secretKey;
    let hash = 0;

    for (let i = 0; i < payload.length + secret.length; i++) {
      const char = (payload + secret).charCodeAt(
        i % (payload.length + secret.length)
      );
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit integer'a çevir
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Token imza doğrula
   */
  verifyTokenSignature(payload: string, signature: string): boolean {
    const expectedSignature = this.signToken(payload);
    return expectedSignature === signature;
  }

  /**
   * Config'i yenile
   */
  refreshConfig(): void {
    this.config = this.loadConfig();
  }

  /**
   * Current config'i al
   */
  getConfig(): Readonly<AuthConfig> {
    return { ...this.config };
  }
}

// Singleton instance
export const securityManager = new SecurityManager();
