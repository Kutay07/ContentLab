import { create } from "zustand";

interface PanelVisibilityState {
  leftVisible: boolean;
  centerVisible: boolean;
  rightVisible: boolean;
  // Gizlenmeden önceki genişlikleri hatırla
  rememberedSizes: [number, number, number];
  toggleLeft: () => void;
  toggleCenter: () => void;
  toggleRight: () => void;
  setLeftVisible: (visible: boolean) => void;
  setCenterVisible: (visible: boolean) => void;
  setRightVisible: (visible: boolean) => void;
  setRememberedSizes: (sizes: [number, number, number]) => void;
}

export const usePanelVisibilityStore = create<PanelVisibilityState>()((set) => ({
  leftVisible: true,
  centerVisible: true,
  rightVisible: true,
  rememberedSizes: [50, 20, 30], // Varsayılan genişlikler
  toggleLeft: () => set((state) => ({ leftVisible: !state.leftVisible })),
  toggleCenter: () => set((state) => ({ centerVisible: !state.centerVisible })),
  toggleRight: () => set((state) => ({ rightVisible: !state.rightVisible })),
  setLeftVisible: (visible) => set({ leftVisible: visible }),
  setCenterVisible: (visible) => set({ centerVisible: visible }),
  setRightVisible: (visible) => set({ rightVisible: visible }),
  setRememberedSizes: (sizes) => set({ rememberedSizes: sizes }),
}));
