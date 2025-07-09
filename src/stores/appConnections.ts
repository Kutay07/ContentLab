import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppConfig } from "@/config/apps";
import { supabaseManager } from "@/services/supabaseManager";

interface ConnectionState {
  connections: {
    [appId: string]: {
      connected: boolean;
      error?: string;
    };
  };
  connectApp: (app: AppConfig) => Promise<void>;
  disconnectApp: (appId: string) => void;
  disconnectAll: () => void;
  _rehydrate?: () => Promise<void>;
}

export const useAppConnections = create<ConnectionState>()(
  persist(
    (set, get) => ({
      connections: {},

      /** rehydrate stored connections */
      _rehydrate: async () => {
        const ids = Object.keys(get().connections);
        if (ids.length === 0) return;
        try {
          const res = await fetch("/api/apps");
          if (!res.ok) return;
          const apps =
            (await res.json()) as import("@/config/apps").AppConfig[];
          const toConnect = apps.filter((a) => ids.includes(a.id));
          await supabaseManager.rehydrate(toConnect, true);
        } catch {}
      },

      connectApp: async (app: AppConfig) => {
        try {
          await supabaseManager.connect(app, true);
          set((state) => ({
            connections: {
              ...state.connections,
              [app.id]: { connected: true },
            },
          }));
        } catch (err) {
          set((state) => ({
            connections: {
              ...state.connections,
              [app.id]: { connected: false, error: (err as Error).message },
            },
          }));
        }
      },

      disconnectApp: (appId: string) => {
        supabaseManager.disconnect(appId);
        set((state) => {
          const { [appId]: _, ...rest } = state.connections;
          return { connections: rest };
        });
      },

      disconnectAll: () => {
        supabaseManager.disconnectAll();
        set({ connections: {} });
      },
    }),
    {
      name: "app-connections",
      onRehydrateStorage: () => (state) => {
        state?._rehydrate?.();
      },
    }
  )
);
