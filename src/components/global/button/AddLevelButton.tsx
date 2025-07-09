"use client";

import React, { useState } from "react";
import { generateId } from "@/utils/generateId";
import AddLevelModal from "./AddLevelModal";
import { useHierarchy } from "../context/HierarchyProvider";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { logEvent } from "@/utils/logger";

interface AddLevelButtonProps {
  onAdd?: (title: string) => void; // Keep for backward compatibility
  className?: string;
  order: number;
  groupId: string; // Required for service.addLevel(groupId, ...)
}

const AddLevelButton: React.FC<AddLevelButtonProps> = ({
  onAdd,
  className = "",
  order,
  groupId,
}) => {
  const { service } = useHierarchy();
  const { appId } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (title: string) => {
    try {
      // Plan.md 11.2.3 Service çağrısı specifications
      service.addLevel(groupId, {
        id: generateId(),
        title: title.trim(),
        order,
        icon_key: null,
        icon_family: null,
        xp_reward: 0,
        components: [],
      });

      // Backward compatibility - call onAdd if provided
      onAdd?.(title);

      console.log("Seviye Başarıyla Eklendi:", { title, order, groupId });

      logEvent({
        timestamp: Date.now(),
        appId,
        user: user?.username,
        event: "content_add",
        meta: { type: "level", title, groupId },
      });
    } catch (error) {
      console.error("Seviye eklenirken hata:", error);
    }
  };

  return (
    <div className={`add-level-button group ${className} relative h-0`}>
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-2 h-2 bg-blue-300 rounded-full opacity-60 group-hover:opacity-0 transition-all duration-300"></div>

        <button
          onClick={handleButtonClick}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
                     w-8 h-8 rounded-full border-2 border-dashed border-blue-300 
                     hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center 
                     text-blue-500 hover:text-blue-700 hover:scale-110 hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
                     transform active:scale-95 bg-white/90 backdrop-blur-sm"
          title="Yeni Seviye Ekle"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200"
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

      <AddLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        order={order}
      />
    </div>
  );
};

export default AddLevelButton;
