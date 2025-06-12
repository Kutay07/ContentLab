"use client";

import React, { useState, useEffect } from "react";
import { Database, Json } from "@/types/supabase";
import { ComponentItem } from "@/types/LevelHierarchy";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";
import MobileScreenContainer from "../preview/MobileScreenContainer";
import MobileScreen from "../preview/MobileScreen";
import ComponentEditTabs from "./ComponentEditTabs";
import { v4 as uuidv4 } from "uuid";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface ComponentEditDrawerProps {
  levelId: string;
  componentType: ComponentType;
  componentId?: string;
  initialContent?: Json;
  initialOrder: number;
  onClose: () => void;
  isOpen: boolean;
}

const ComponentEditDrawer: React.FC<ComponentEditDrawerProps> = ({
  levelId,
  componentType,
  componentId,
  initialContent,
  initialOrder,
  onClose,
  isOpen,
}) => {
  const [contentJson, setContentJson] = useState<Json>(
    initialContent || componentType.content_template || {}
  );
  const [order, setOrder] = useState<number>(initialOrder);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const hierarchyService = ContentHierarchyService.getInstance();

  // Reset state when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setContentJson(initialContent || componentType.content_template || {});
      setOrder(initialOrder);
      setJsonError(null);
    }
  }, [isOpen, initialContent, componentType.content_template, initialOrder]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (componentId) {
        // Existing component update
        await hierarchyService.updateComponent(componentId, {
          content: contentJson,
          order: order,
        });
      } else {
        // New component creation
        const newComponent: ComponentItem = {
          id: uuidv4(),
          type: componentType.type_key,
          display_name: componentType.display_name,
          content: contentJson,
          order: order,
        };

        await hierarchyService.addComponent(levelId, newComponent);
      }

      onClose();
    } catch (error) {
      console.error("Bileşen kaydedilirken hata oluştu:", error);
      // TODO: Toast bildirimi göster
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleContentChange = (newContent: Json, error?: string) => {
    setContentJson(newContent);
    setJsonError(error || null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Only behind drawer */}
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-40 transition-opacity duration-300"
        onClick={handleCancel}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-7xl bg-white shadow-2xl border-l-2 border-gray-200 z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              {componentType.icon_key ? (
                <span className="text-blue-600 font-medium">
                  {componentType.icon_key.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <div className="w-6 h-6 bg-blue-300 rounded"></div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {componentType.display_name}
              </h2>
              <p className="text-sm text-gray-500">
                {componentId ? "Bileşeni Düzenle" : "Yeni Bileşen Oluştur"} •{" "}
                {componentType.type_key}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-400"
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

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Preview */}
          <div className="w-1/3 border-r border-gray-200 p-6 bg-gray-50 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Önizleme
              </h3>
              <p className="text-sm text-gray-600">
                Bileşeninizin mobil görünümü aşağıda görülmektedir.
              </p>
            </div>

            <div className="flex justify-center">
              <MobileScreen>
                <MobileScreenContainer>
                  <ComponentPreview
                    content={contentJson}
                    componentType={componentType}
                  />
                </MobileScreenContainer>
              </MobileScreen>
            </div>
          </div>

          {/* Right Panel - Tabs */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <ComponentEditTabs
                content={contentJson}
                onContentChange={handleContentChange}
                jsonError={jsonError}
              />
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Sıra:
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !!jsonError}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>

              {jsonError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <strong>JSON Hatası:</strong> {jsonError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Component Preview helper component
const ComponentPreview: React.FC<{
  content: Json;
  componentType: ComponentType;
}> = ({ content, componentType }) => {
  // Bu bileşen, content'i kullanarak gerçek bileşen önizlemesi gösterecek
  // Şimdilik basit bir JSON gösterimi yapıyoruz
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border">
      <div className="text-sm font-medium text-gray-900 mb-2">
        {componentType.display_name}
      </div>
      <div className="text-xs text-gray-600 mb-3">
        Tür: {componentType.type_key}
      </div>

      {/* Content preview */}
      <div className="text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-40">
        <pre>{JSON.stringify(content, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ComponentEditDrawer;
