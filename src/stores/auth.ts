import { create } from "zustand";
import {
  authService,
  AuthState as NewAuthState,
  LoginCredentials,
} from "@/services/auth";

// Zustand store interface (eski interface'i koruyoruz)
interface AuthStore {
  // State properties
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    username: string;
    name: string;
  } | null;
  error: string | null;

  // Actions
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;

  // Internal state sync
  _syncFromAuthService: (newState: NewAuthState) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => {
  // Auth service'den state değişikliklerini dinle
  const unsubscribe = authService.subscribe((newState) => {
    get()._syncFromAuthService(newState);
  });

  return {
    // Initial state
    isAuthenticated: false,
    isLoading: true, // Başlangıçta loading true
    user: null,
    error: null,

    login: async (
      username: string,
      password: string,
      rememberMe: boolean = false
    ): Promise<boolean> => {
      const credentials: LoginCredentials = {
        username,
        password,
        rememberMe,
      };

      const result = await authService.login(credentials);
      return result.success;
    },

    logout: async (): Promise<void> => {
      await authService.logout();
    },

    initializeAuth: () => {
      // Auth service kendi kendine initialize olur, sadece current state'i sync edelim
      const currentState = authService.getState();
      get()._syncFromAuthService(currentState);
    },

    clearError: () => {
      set({ error: null });
    },

    // Auth service'den gelen state'i Zustand store'a sync et
    _syncFromAuthService: (newState: NewAuthState) => {
      set({
        isAuthenticated: newState.isAuthenticated,
        isLoading: newState.isLoading,
        user: newState.user,
        error: newState.error,
      });
    },
  };
});
