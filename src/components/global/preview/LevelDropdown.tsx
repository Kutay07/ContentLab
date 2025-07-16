"use client";

import React, { useState, useEffect } from "react";
import { LevelItem, ComponentItem } from "@/types/LevelHierarchy";
import ComponentPreviewCard from "./ComponentPreviewCard";
import AddComponentButton from "../button/AddComponentButton";
import { useEditorPanelStore } from "@/stores/editorPanel";
import { LearningService } from "@/services/learning-service";
import { useAppContext } from "@/contexts/AppContext";
import { Database } from "@/types/supabase";
import { useHierarchy } from "../context/HierarchyProvider";
import { logEvent } from "@/utils/logger";
import { useAuth } from "@/hooks/useAuth";

// Drag & Drop imports
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface LevelDropdownProps {
  level: LevelItem;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  addedIds?: Set<string>;
  updatedIds?: Set<string>;
}

// Sortable Component Wrapper
interface SortableComponentProps {
  component: ComponentItem;
  onEdit: (component: ComponentItem) => void;
  onDelete: (component: ComponentItem) => void;
  addedIds: Set<string>;
  updatedIds: Set<string>;
}

const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  onEdit,
  onDelete,
  addedIds,
  updatedIds,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0">
      <div className="relative">
        {/* Drag Handle - üst kısımda */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent hover:from-black/30 cursor-grab active:cursor-grabbing rounded-t-xl z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          title="Sürüklemek için tutun"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
          <svg
            className="w-4 h-4 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>

        <ComponentPreviewCard
          component={component}
          className="flex-shrink-0"
          onEdit={onEdit}
          onDelete={onDelete}
          addedIds={addedIds}
          updatedIds={updatedIds}
        />
      </div>
    </div>
  );
};

const LevelDropdown: React.FC<LevelDropdownProps> = ({
  level,
  isOpen = false,
  onToggle,
  className = "",
  addedIds = new Set(),
  updatedIds = new Set(),
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const openEditor = useEditorPanelStore((state) => state.open);

  const { service: hierarchyService } = useHierarchy();
  const { appId } = useAppContext();
  const { user } = useAuth();

  const isDropdownOpen = onToggle ? isOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const handleLevelDelete = () => {
    if (
      window.confirm(
        "Bu seviyeyi kalıcı olarak silmek istediğinize emin misiniz?"
      )
    ) {
      hierarchyService.deleteLevel(level.id);

      logEvent({
        timestamp: Date.now(),
        appId,
        user: user?.username,
        event: "content_delete",
        meta: { type: "level", levelId: level.id },
      });
    }
  };

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px hareket ettikten sonra aktifleşir
      },
    })
  );

  // Component types'ları yükle
  useEffect(() => {
    const loadComponentTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const { data, error } = await LearningService.getComponentTypes(appId);
        if (error) {
          console.error("Bileşen türleri yüklenirken hata:", error);
        } else if (data) {
          setComponentTypes(data);
        }
      } catch (error) {
        console.error("Bileşen türleri yüklenirken beklenmeyen hata:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadComponentTypes();
  }, []);

  // Sort components by order
  const sortedComponents = [...level.components].sort(
    (a, b) => a.order - b.order
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = sortedComponents.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = sortedComponents.findIndex(
        (item) => item.id === over?.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Service'e yeni index'i bildir
        hierarchyService.moveComponent(
          active.id as string,
          newIndex,
          level.id // Aynı level içinde taşıma
        );
      }
    }
  };

  // Handle component edit
  const handleComponentEdit = (component: ComponentItem) => {
    const componentType = componentTypes.find(
      (type) => type.type_key === component.type
    );
    if (componentType) {
      openEditor({
        levelId: level.id,
        componentType,
        component,
        order: component.order,
      });
    }
  };

  const handleComponentDelete = (component: ComponentItem) => {
    if (window.confirm("Bileşeni silmek istediğinize emin misiniz?")) {
      hierarchyService.deleteComponent(component.id);

      logEvent({
        timestamp: Date.now(),
        appId,
        user: user?.username,
        event: "content_delete",
        meta: { type: "component", componentId: component.id },
      });
    }
  };

  // Handle new component creation
  const handleAddComponent = (
    componentType: ComponentType,
    targetOrder: number
  ) => {
    // Yeni component oluşturma panelini aç
    openEditor({
      levelId: level.id,
      componentType,
      component: null,
      order: targetOrder,
    });
  };

  const renderIcon = () => {
    if (level.icon_key && level.icon_family) {
      return (
        <span
          className="text-lg mr-2"
          title={`${level.icon_family}:${level.icon_key}`}
        >
          🎯
        </span>
      );
    }
    return <span className="text-lg mr-2">📋</span>;
  };

  // Aktif sürüklenen component'i bul
  const activeComponent = sortedComponents.find(
    (component) => component.id === activeId
  );

  return (
    <div className={`level-dropdown ${className}`}>
      {/* Level Header - Transparan mavi tasarım */}
      <div
        className={`
        w-full backdrop-blur-md border-2 border-blue-300 rounded-lg 
        transition-all duration-300 shadow-sm hover:shadow-md mb-1
        ${isDropdownOpen ? "rounded-b-none border-b-blue-300" : ""}
      `}
      >
        <div
          className="w-full flex items-center justify-between p-4 hover:bg-blue-50/20 
                       transition-all duration-200 rounded-lg relative"
        >
          {/* Drag Handle - sıra kutusunun tam üzerine */}
          <div className="absolute left-3 top-4 w-8 h-8 bg-blue-200/90 hover:bg-blue-300/90 cursor-grab active:cursor-grabbing rounded-md shadow border border-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <svg
              className="w-3 h-3 text-blue-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>

          <div className="flex items-center flex-1">
            {/* Sıra numarası kutusu */}
            <div
              className="flex-shrink-0 w-8 h-8 bg-blue-100 border border-blue-300 rounded-md 
                           flex items-center justify-center mr-3"
            >
              <span className="text-sm font-semibold text-blue-800">
                {level.order}
              </span>
            </div>

            {/* İsim - %40 genişlik */}
            <div className="flex-1 max-w-[40%] text-left mr-4">
              <h3 className="text-lg font-semibold text-white break-words">
                {level.title}
              </h3>
            </div>

            {/* Bilgi kapsülleri */}
            <div className="flex items-center space-x-2 mr-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {level.xp_reward} XP
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {level.components.length} Bileşen
              </span>
            </div>

            {/* Butonlar */}
            <div className="flex items-center space-x-1">
              {/* Sil butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLevelDelete();
                }}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Seviyeyi Sil"
              >
                <svg
                  className="w-4 h-4"
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

              {/* Düzenle butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Seviye düzenleme fonksiyonu eklenecek
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                title="Seviyeyi Düzenle"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Ok butonu */}
          <button
            onClick={handleToggle}
            className="flex-shrink-0 ml-2 p-2 rounded-md bg-blue-100 border border-blue-300 
                     hover:bg-blue-200 transition-all duration-200"
            title={isDropdownOpen ? "Kapat" : "Aç"}
          >
            <svg
              className={`w-4 h-4 text-blue-600 transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Level Content - Border genişletilmiş */}
      {isDropdownOpen && (
        <div
          className="backdrop-blur-md border-2 border-t-0 border-blue-300 
                       rounded-b-lg shadow-sm mb-1"
        >
          <div className="p-4">
            {sortedComponents.length > 0 ? (
              <div className="components-container">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Bileşenler ({sortedComponents.length}) - Sürükleyerek
                  sıralayın
                </h4>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className="flex items-center space-x-6 overflow-x-auto pb-4 pt-2 scrollbar-thin 
                             scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-[450px]"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    <SortableContext
                      items={sortedComponents.map((c) => c.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {sortedComponents.map((component, index) => (
                        <React.Fragment key={component.id}>
                          {/* Component öncesi hover alanı */}
                          <div className="group relative flex items-center h-full">
                            <AddComponentButton
                              componentTypes={componentTypes}
                              order={component.order}
                              onComponentTypeSelect={handleAddComponent}
                            />
                          </div>

                          {/* Sortable Component */}
                          <SortableComponent
                            component={component}
                            onEdit={handleComponentEdit}
                            onDelete={handleComponentDelete}
                            addedIds={addedIds}
                            updatedIds={updatedIds}
                          />

                          {/* Son component değilse sonrası hover alanı */}
                          {index === sortedComponents.length - 1 && (
                            <div className="group relative flex items-center h-full">
                              <AddComponentButton
                                componentTypes={componentTypes}
                                order={component.order + 1}
                                onComponentTypeSelect={handleAddComponent}
                              />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </SortableContext>
                  </div>

                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeComponent ? (
                      <div className="rotate-2 scale-105">
                        <ComponentPreviewCard
                          component={activeComponent}
                          className="shadow-xl border-2 border-blue-300"
                          addedIds={addedIds}
                          updatedIds={updatedIds}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">📭</div>
                <p>Bu seviyede henüz bileşen bulunmuyor</p>
                {/* Component yoksa da hover alanı */}
                <div className="group relative mt-8 flex items-center justify-center h-[100px] w-full">
                  <AddComponentButton
                    componentTypes={componentTypes}
                    order={0}
                    onComponentTypeSelect={handleAddComponent}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer kaldırıldı - sağ panel editörü kullanılacak */}
    </div>
  );
};

export default LevelDropdown;
