import { create } from "zustand";
import { ComponentItem } from "@/types/LevelHierarchy";
import { Database } from "@/types/supabase";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface EditorPanelState {
  isOpen: boolean;
  levelId: string | null;
  component: ComponentItem | null;
  componentType: ComponentType | null;
  order: number;
  open: (params: {
    levelId: string;
    componentType: ComponentType;
    component?: ComponentItem | null;
    order?: number;
  }) => void;
  close: () => void;
  setPreviewComponent: (
    component: ComponentItem | null,
    componentType: ComponentType | null
  ) => void;
}

export const useEditorPanelStore = create<EditorPanelState>()((set) => ({
  isOpen: false,
  levelId: null,
  component: null,
  componentType: null,
  order: 0,
  open: ({ levelId, componentType, component = null, order = 0 }) =>
    set({
      isOpen: true,
      levelId,
      componentType,
      component,
      order,
    }),
  close: () =>
    set({
      isOpen: false,
      levelId: null,
      component: null,
      componentType: null,
      order: 0,
    }),
  setPreviewComponent: (component, componentType) =>
    set({
      component,
      componentType,
    }),
}));
