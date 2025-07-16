"use client";

import React from "react";
import MobileScreen from "./MobileScreen";
import { useHierarchy } from "../context/HierarchyProvider";
import { LevelHierarchy, ComponentItem } from "@/types/LevelHierarchy";
import { useEditorPanelStore } from "@/stores/editorPanel";

/**
 * LiveMobilePreview:
 * Sol hiyerarşi panelindeki veriyi okuyarak basit bir JSON önizlemesi yapar.
 * İleride gerçek component renderer ile değiştirilebilir.
 */
const LiveMobilePreview: React.FC = () => {
  const { hierarchy } = useHierarchy();
  const { component: selectedComponent } = useEditorPanelStore();

  const data: LevelHierarchy = hierarchy || [];

  let componentsToRender: ComponentItem[] = [];
  if (selectedComponent) {
    componentsToRender = [selectedComponent];
  } else {
    componentsToRender = data
      .sort((a, b) => a.order - b.order)
      .flatMap((group) =>
        group.levels
          .sort((l1, l2) => l1.order - l2.order)
          .flatMap((level) =>
            level.components.sort((c1, c2) => c1.order - c2.order)
          )
      );
  }

  return (
    <MobileScreen width={320} height={640}>
      <div className="h-full w-full overflow-y-auto text-[10px] text-gray-800 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded">
        {componentsToRender.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Önizlenecek bileşen yok
          </div>
        ) : (
          componentsToRender.map((comp) => (
            <div
              key={comp.id}
              className="mb-3 p-2 border border-gray-200 rounded bg-white shadow-sm"
            >
              <div className="text-[11px] font-bold mb-1">
                {comp.display_name} ({comp.type})
              </div>
              <pre className="text-[10px]">
                {JSON.stringify(comp.content, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </MobileScreen>
  );
};

export default LiveMobilePreview;
