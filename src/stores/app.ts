import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig } from '@/config/apps';

interface AppState {
  selectedApp: AppConfig | null;
  isConnected: boolean;
  setSelectedApp: (app: AppConfig | null) => void;
  setIsConnected: (connected: boolean) => void;
  clearApp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedApp: null,
      isConnected: false,
      
      setSelectedApp: (app: AppConfig | null) => {
        set({
          selectedApp: app,
          isConnected: false // Yeni uygulama seçildiğinde bağlantı durumunu sıfırla
        });
      },
      
      setIsConnected: (connected: boolean) => {
        set({ isConnected: connected });
      },
      
      clearApp: () => {
        set({
          selectedApp: null,
          isConnected: false
        });
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        selectedApp: state.selectedApp
      }),
    }
  )
); 