"use client";

import React, { useState, useEffect } from "react";
import { LevelItem, ComponentItem } from "@/types/LevelHierarchy";
import ComponentPreviewCard from "./ComponentPreviewCard";
import AddComponentButton from "../button/AddComponentButton";
import ComponentEditDrawer from "../edit/ComponentEditDrawer";
import { LearningService } from "@/services/learning-service";
import { useAppContext } from "@/contexts/AppContext";
import { Database } from "@/types/supabase";
import { useHierarchy } from "../context/HierarchyProvider";
import { logEvent } from "@/utils/logger";
import { useAuth } from "@/hooks/useAuth";
import { generateId } from "@/utils/generateId";

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
  const [editDrawerState, setEditDrawerState] = useState<{
    isOpen: boolean;
    component: ComponentItem | null;
    componentType: ComponentType | null;
    order: number;
  }>({
    isOpen: false,
    component: null,
    componentType: null,
    order: 0,
  });

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
    // Find the ComponentType for this component
    const componentType = componentTypes.find(
      (type) => type.type_key === component.type
    );
    if (componentType) {
      setEditDrawerState({
        isOpen: true,
        component,
        componentType,
        order: component.order,
      });
    } else {
      console.error("Component type not found for:", component.type);
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

  // Handle drawer close
  const handleDrawerClose = () => {
    setEditDrawerState({
      isOpen: false,
      component: null,
      componentType: null,
      order: 0,
    });
  };

  // Handle new component creation
  const handleAddComponent = (
    componentType: ComponentType,
    targetOrder: number
  ) => {
    const newComponent: ComponentItem = {
      id: generateId(),
      type: componentType.type_key,
      display_name: componentType.display_name,
      content: componentType.content_template || {},
      order: targetOrder,
    };

    hierarchyService.addComponent(level.id, newComponent);

    logEvent({
      timestamp: Date.now(),
      appId,
      user: user?.username,
      event: "content_add",
      meta: {
        type: "component",
        componentType: componentType.type_key,
        levelId: level.id,
      },
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
      {/* Level Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 
                   rounded-lg border border-blue-200 transition-colors duration-200 mb-1"
      >
        <div className="flex items-center">
          {renderIcon()}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-blue-900">
              {level.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-blue-600 mt-1">
              <span>XP: {level.xp_reward}</span>
              <span>Bileşen: {level.components.length}</span>
              <span>Sıra: {level.order}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Delete level button */}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleLevelDelete();
            }}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
          </span>

          {/* existing toggle */}

          <span className="text-sm text-blue-600 mr-2">
            {isDropdownOpen ? "Kapat" : "Aç"}
          </span>
          <svg
            className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
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
        </div>
      </button>

      {/* Level Content */}
      {isDropdownOpen && (
        <div className="level-content mb-1">
          {sortedComponents.length > 0 ? (
            <div className="components-container">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Bileşenler ({sortedComponents.length}) - Sürükleyerek sıralayın
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
      )}

      {/* ComponentEditDrawer */}
      {editDrawerState.isOpen && editDrawerState.componentType && (
        <ComponentEditDrawer
          levelId={level.id}
          componentType={editDrawerState.componentType}
          componentId={editDrawerState.component?.id}
          initialContent={editDrawerState.component?.content}
          initialOrder={
            editDrawerState.component?.order || editDrawerState.order
          }
          onClose={handleDrawerClose}
          isOpen={editDrawerState.isOpen}
        />
      )}
    </div>
  );
};

export default LevelDropdown;
