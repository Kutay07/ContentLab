"use client";

import React, { useState, useEffect } from "react";
import { Database, Json } from "@/types/supabase";
import { ComponentItem } from "@/types/LevelHierarchy";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";
// MobileScreen önizleme kaldırıldı
import ComponentEditTabs from "./ComponentEditTabs";
import { generateId } from "@/utils/generateId";
import { useEditorPanelStore } from "@/stores/editorPanel";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

const EditorPanel: React.FC = () => {
  const {
    isOpen,
    levelId,
    component,
    componentType,
    order: initialOrder,
    close,
  } = useEditorPanelStore();

  const [contentJson, setContentJson] = useState<Json>(
    component?.content || componentType?.content_template || {}
  );
  const [order, setOrder] = useState<number>(initialOrder || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const hierarchyService = ContentHierarchyService.getInstance();

  // Reset form when componentType or component changes
  useEffect(() => {
    if (isOpen && componentType) {
      setContentJson(
        component?.content || componentType.content_template || {}
      );
      setOrder(component?.order ?? initialOrder ?? 0);
      setJsonError(null);
    }
  }, [isOpen, componentType, component, initialOrder]);

  if (!isOpen || !componentType || !levelId) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/60 text-sm p-4">
        Düzenlenecek bileşen seçiniz
      </div>
    );
  }

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (component) {
        // Update existing component
        await hierarchyService.updateComponent(component.id, {
          content: contentJson,
          order: order,
        });
      } else {
        // Create new component
        const newComponent: ComponentItem = {
          id: generateId(),
          type: componentType.type_key,
          display_name: componentType.display_name,
          content: contentJson,
          order: order,
        };

        await hierarchyService.addComponent(levelId, newComponent);
      }

      close();
    } catch (error) {
      console.error("Bileşen kaydedilirken hata oluştu:", error);
      // TODO: toast bildirim
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent: Json, error?: string) => {
    setContentJson(newContent);
    setJsonError(error || null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-white/5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            {componentType.icon_key ? (
              <span className="text-blue-600 font-medium text-sm">
                {componentType.icon_key.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <div className="w-4 h-4 bg-blue-300 rounded" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {componentType.display_name}
            </h2>
            <p className="text-xs text-white/70">
              {component ? "Bileşeni Düzenle" : "Yeni Bileşen Oluştur"} •{" "}
              {componentType.type_key}
            </p>
          </div>
        </div>
        <button
          onClick={close}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title="Kapat"
        >
          <svg
            className="w-5 h-5 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* İçerik */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <ComponentEditTabs
            content={contentJson}
            onContentChange={handleContentChange}
            jsonError={jsonError}
          />
        </div>

        {/* Alt bar */}
        <div className="border-t border-white/10 p-4 flex-shrink-0 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-white/80">Sıra:</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={close}
                className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !!jsonError}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>

          {jsonError && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
              <strong>JSON Hatası:</strong> {jsonError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
