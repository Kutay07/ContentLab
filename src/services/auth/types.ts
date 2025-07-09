// Auth servis için type definitions

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface AuthToken {
  userId: string;
  username: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
  rememberMe: boolean;
  csrfToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
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

export interface StorageProvider {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
  isAvailable(): boolean;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: "expired" | "malformed" | "invalid_csrf" | "not_found";
  error?: string;
}

export interface AuthConfig {
  defaultTokenExpiry: number; // milliseconds
  rememberMeExpiry: number; // milliseconds
  secretKey: string;
}

// Auth servis events
export type AuthEventType = "login" | "logout" | "token_expired" | "error";

export interface AuthEvent {
  type: AuthEventType;
  data?: any;
  timestamp: number;
}

// Error types
export interface AuthError {
  type: "network" | "auth" | "validation" | "storage";
  message: string;
  details?: any;
}
