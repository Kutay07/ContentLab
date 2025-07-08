"use client";

import React, { useRef, useState } from "react";
import ComponentTypeMenu from "./ComponentTypeMenu";
import { Database } from "@/types/supabase";
type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface AddComponentButtonProps {
  onAdd?: () => void;
  className?: string;
  componentTypes?: ComponentType[];
  order: number;
  onComponentTypeSelect?: (componentType: ComponentType, order: number) => void;
}

const AddComponentButton: React.FC<AddComponentButtonProps> = ({
  onAdd,
  className = "",
  componentTypes = [],
  order,
  onComponentTypeSelect,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // order prop yalnızca yeni bileşen eklerken parent callback'e iletilir.
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = () => {
    if (componentTypes.length > 0) {
      setIsMenuOpen(true);
    } else {
      onAdd?.();
    }
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleComponentTypeSelect = (componentType: ComponentType) => {
    onComponentTypeSelect?.(componentType, order);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div
        className={`add-component-button group ${className} flex-shrink-0 relative w-0`}
      >
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ marginTop: "200px" }}
        >
          <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50 group-hover:opacity-0 transition-all duration-300"></div>

          <button
            ref={buttonRef}
            onClick={handleButtonClick}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                       opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
                       w-12 h-12 rounded-full border-2 border-dashed border-gray-400 
                       hover:border-gray-600 hover:bg-white flex items-center justify-center 
                       text-gray-500 hover:text-gray-700 hover:scale-110 hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50
                       transform active:scale-95 bg-white/95 backdrop-blur-sm shadow-lg"
            title={
              componentTypes.length > 0
                ? "Bileşen Türü Seç"
                : "Yeni Bileşen Ekle"
            }
          >
            <svg
              className="w-6 h-6 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      <ComponentTypeMenu
        componentTypes={componentTypes}
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onSelect={handleComponentTypeSelect}
        triggerRef={buttonRef}
      />
    </>
  );
};

export default AddComponentButton;
