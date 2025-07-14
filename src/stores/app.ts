import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppConfig } from "@/config/apps";

interface AppState {
  selectedApp: AppConfig | null;
  setSelectedApp: (app: AppConfig | null) => void;
  clearApp: () => void;
}

export const useSelectedAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedApp: null,

      setSelectedApp: (app: AppConfig | null) => {
        set({
          selectedApp: app,
        });
      },

      clearApp: () => {
        set({
          selectedApp: null,
        });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        selectedApp: state.selectedApp,
      }),
    }
  )
);
