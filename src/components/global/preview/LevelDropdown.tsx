import React, { useState, useEffect } from "react";
import { LevelItem, ComponentItem } from "@/types/LevelHierarchy";
import ComponentPreviewCard from "./ComponentPreviewCard";
import AddComponentButton from "../button/AddComponentButton";
import ComponentEditDrawer from "../edit/ComponentEditDrawer";
import { LearningService } from "@/services/learning-service";
import { Database } from "@/types/supabase";

type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface LevelDropdownProps {
  level: LevelItem;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

const LevelDropdown: React.FC<LevelDropdownProps> = ({
  level,
  isOpen = false,
  onToggle,
  className = "",
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
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

  const isDropdownOpen = onToggle ? isOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  // Component types'ları yükle
  useEffect(() => {
    const loadComponentTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const { data, error } = await LearningService.getComponentTypes();
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
  const handleAddComponent = (componentType: ComponentType) => {
    const nextOrder =
      sortedComponents.length > 0
        ? Math.max(...sortedComponents.map((c) => c.order)) + 1
        : 0;

    setEditDrawerState({
      isOpen: true,
      component: null, // null means creating new component
      componentType,
      order: nextOrder,
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

        <div className="flex items-center">
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
                Bileşenler ({sortedComponents.length})
              </h4>
              <div
                className="flex items-center space-x-6 overflow-x-auto pb-4 pt-2 scrollbar-thin 
                           scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-[450px]"
                style={{ scrollbarWidth: "thin" }}
              >
                {sortedComponents.map((component, index) => (
                  <React.Fragment key={component.id}>
                    {/* Component öncesi hover alanı */}
                    <div className="group relative flex items-center h-full">
                      <AddComponentButton
                        componentTypes={componentTypes}
                        onComponentTypeSelect={handleAddComponent}
                      />
                    </div>

                    <ComponentPreviewCard
                      component={component}
                      className="flex-shrink-0"
                      onEdit={handleComponentEdit}
                    />

                    {/* Son component değilse sonrası hover alanı */}
                    {index === sortedComponents.length - 1 && (
                      <div className="group relative flex items-center h-full">
                        <AddComponentButton
                          componentTypes={componentTypes}
                          onComponentTypeSelect={handleAddComponent}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 min-h-[300px] flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">📭</div>
              <p>Bu seviyede henüz bileşen bulunmuyor</p>
              {/* Component yoksa da hover alanı */}
              <div className="group relative mt-8 flex items-center justify-center h-[100px] w-full">
                <AddComponentButton
                  componentTypes={componentTypes}
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
