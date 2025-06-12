import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    name: string;
  } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
}

// Statik kullanıcı bilgileri (geçici)
// Yeni kullanıcı eklemek için bu listeye ekleme yapabilirsiniz
const STATIC_CREDENTIALS = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Admin Kullanıcı'
  },
  {
    username: 'editor',
    password: 'editor123',
    name: 'Editör Kullanıcı'
  },
  {
    username: 'manager',
    password: 'manager123',
    name: 'Manager Kullanıcı'
  },
  {
    username: 'demo',
    password: 'demo123',
    name: 'Demo Kullanıcı'
  },
  {
    username: 'test',
    password: 'test123',
    name: 'Test Kullanıcı'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (username: string, password: string): Promise<boolean> => {
        // Statik kontrol
        const foundUser = STATIC_CREDENTIALS.find(
          cred => cred.username === username && cred.password === password
        );
        
        if (foundUser) {
          const user = { 
            username: foundUser.username,
            name: foundUser.name
          };
          
          // Cookie'ye auth token kaydet
          Cookies.set('auth-token', 'static-token-' + Date.now(), { expires: 7 });
          
          set({
            isAuthenticated: true,
            user
          });
          
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        // Cookie'yi temizle
        Cookies.remove('auth-token');
        
        set({
          isAuthenticated: false,
          user: null
        });
      },
      
      initializeAuth: () => {
        const token = Cookies.get('auth-token');
        if (token) {
          // Token varsa varsayılan olarak admin kullanıcısını yükle
          // Gerçek uygulamada token'dan kullanıcı bilgisi çıkarılır
          const defaultUser = STATIC_CREDENTIALS[0];
          set({
            isAuthenticated: true,
            user: { 
              username: defaultUser.username,
              name: defaultUser.name
            }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
); 