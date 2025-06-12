"use client";

import React, { useEffect, useRef } from "react";
import { Database } from "@/types/supabase";
type ComponentType = Database["public"]["Tables"]["component_types"]["Row"];

interface ComponentTypeMenuProps {
  componentTypes: ComponentType[];
  onSelect?: (componentType: ComponentType) => void;
  onClose?: () => void;
  isOpen?: boolean;
  triggerRef?: React.RefObject<HTMLElement | HTMLButtonElement | null>;
}

const ComponentTypeMenu: React.FC<ComponentTypeMenuProps> = ({
  componentTypes,
  onSelect,
  onClose,
  isOpen = false,
  triggerRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    // Escape tuşu ile menüyü kapat
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  // Menü pozisyonunu hesapla
  const getMenuPosition = () => {
    if (!triggerRef?.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuHeight = Math.min(componentTypes.length * 60 + 16, 300); // Maksimum yükseklik 300px

    // Ekran altında kalıp kalmayacağını kontrol et
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    let top = triggerRect.bottom + 8;

    // Eğer aşağıda yeterli yer yoksa yukarıda göster
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      top = triggerRect.top - menuHeight - 8;
    }

    return {
      position: "fixed" as const,
      top: `${top}px`,
      left: `${triggerRect.left}px`,
      zIndex: 1000,
    };
  };

  const handleItemClick = (componentType: ComponentType) => {
    onSelect?.(componentType);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Arka plan overlay'i */}
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Menü */}
      <div
        ref={menuRef}
        className="bg-white border-2 border-blue-300 rounded-lg shadow-xl py-2 min-w-64 max-w-80 max-h-80 overflow-y-auto ring-1 ring-blue-200"
        style={{
          ...getMenuPosition(),
          zIndex: 1001, // Overlay'in üstünde olması için z-index artırıldı
        }}
      >
        {componentTypes.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-sm">
            Henüz bileşen türü bulunmuyor
          </div>
        ) : (
          componentTypes
            .filter((type) => type.is_active !== false)
            .map((componentType) => (
              <div
                key={componentType.id}
                onClick={() => handleItemClick(componentType)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:shadow-sm"
              >
                {/* İkon alanı - şimdilik placeholder */}
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center mt-0.5">
                  {componentType.icon_key ? (
                    <span className="text-xs text-gray-600 font-medium">
                      {componentType.icon_key.slice(0, 2).toUpperCase()}
                    </span>
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  )}
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {componentType.display_name}
                  </div>
                  {componentType.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {componentType.description}
                    </div>
                  )}
                  {componentType.estimated_duration_minutes && (
                    <div className="text-xs text-gray-400 mt-1">
                      ~{componentType.estimated_duration_minutes} dakika
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
};

export default ComponentTypeMenu;
