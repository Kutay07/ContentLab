"use client";

import React, { useState } from "react";
import ComponentEditDrawer from "./ComponentEditDrawer";
import { Database } from "@/types/supabase";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

// Mock ComponentType verisi
const mockComponentType: ComponentType = {
  id: "ct_1",
  type_key: "text_block",
  display_name: "Metin Bloğu",
  description: "Basit metin içeriği göstermek için kullanılır",
  content_template: {
    title: "Başlık",
    content: "Lorem ipsum dolor sit amet...",
    text_color: "#000000",
    background_color: "#ffffff",
    font_size: 16,
    is_bold: false,
    is_centered: false,
  },
  icon_key: "text",
  icon_family: "heroicons",
  estimated_duration_minutes: 5,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// Başka bir mock ComponentType
const mockQuizComponentType: ComponentType = {
  id: "ct_2",
  type_key: "quiz_question",
  display_name: "Quiz Sorusu",
  description: "Çoktan seçmeli quiz sorusu",
  content_template: {
    question: "Bu bir örnek soru mu?",
    options: [
      { id: "a", text: "Evet", is_correct: true },
      { id: "b", text: "Hayır", is_correct: false },
      { id: "c", text: "Belki", is_correct: false },
    ],
    explanation: "Doğru cevap A seçeneğidir.",
    points: 10,
    time_limit_seconds: 30,
  },
  icon_key: "quiz",
  icon_family: "heroicons",
  estimated_duration_minutes: 3,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const ComponentEditDrawerExample: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedComponentType, setSelectedComponentType] =
    useState<ComponentType>(mockComponentType);
  const [editingComponentId, setEditingComponentId] = useState<
    string | undefined
  >();
  const [initialContent, setInitialContent] = useState<any>();

  // Yeni bileşen oluşturma örneği
  const handleCreateNew = (componentType: ComponentType) => {
    setSelectedComponentType(componentType);
    setEditingComponentId(undefined);
    setInitialContent(componentType.content_template);
    setIsDrawerOpen(true);
  };

  // Mevcut bileşeni düzenleme örneği
  const handleEditExisting = () => {
    setSelectedComponentType(mockComponentType);
    setEditingComponentId("comp_123");
    setInitialContent({
      title: "Düzenlenmiş Başlık",
      content: "Bu içerik daha önce düzenlenmiş...",
      text_color: "#333333",
      background_color: "#f9f9f9",
      font_size: 18,
      is_bold: true,
      is_centered: true,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    console.log("Drawer kapatıldı");
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        ComponentEditDrawer Örnek Kullanım
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yeni Bileşen Oluştur */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Yeni Bileşen Oluştur
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => handleCreateNew(mockComponentType)}
              className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
            >
              <div className="font-medium text-blue-900">
                {mockComponentType.display_name}
              </div>
              <div className="text-sm text-blue-700">
                {mockComponentType.description}
              </div>
            </button>

            <button
              onClick={() => handleCreateNew(mockQuizComponentType)}
              className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors"
            >
              <div className="font-medium text-green-900">
                {mockQuizComponentType.display_name}
              </div>
              <div className="text-sm text-green-700">
                {mockQuizComponentType.description}
              </div>
            </button>
          </div>
        </div>

        {/* Mevcut Bileşeni Düzenle */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mevcut Bileşeni Düzenle
          </h2>

          <button
            onClick={handleEditExisting}
            className="w-full px-4 py-3 text-left bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition-colors"
          >
            <div className="font-medium text-orange-900">
              Örnek Metin Bloğu (Düzenle)
            </div>
            <div className="text-sm text-orange-700">
              ID: comp_123 • Düzenlenmiş içerik
            </div>
          </button>
        </div>
      </div>

      {/* API Kullanım Örneği */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          API Kullanım Örneği
        </h2>

        <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
          {`// Yeni bileşen oluşturma
<ComponentEditDrawer
  levelId="level_123"
  componentType={componentType}
  initialOrder={0}
  onClose={() => setIsOpen(false)}
  isOpen={isOpen}
/>

// Mevcut bileşeni düzenleme
<ComponentEditDrawer
  levelId="level_123"
  componentType={componentType}
  componentId="comp_456"
  initialContent={existingContent}
  initialOrder={2}
  onClose={() => setIsOpen(false)}
  isOpen={isOpen}
/>`}
        </pre>
      </div>

      {/* ComponentEditDrawer */}
      <ComponentEditDrawer
        levelId="level_example"
        componentType={selectedComponentType}
        componentId={editingComponentId}
        initialContent={initialContent}
        initialOrder={0}
        onClose={handleCloseDrawer}
        isOpen={isDrawerOpen}
      />
    </div>
  );
};

export default ComponentEditDrawerExample;
