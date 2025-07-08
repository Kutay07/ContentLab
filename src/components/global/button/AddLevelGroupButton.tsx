"use client";

import React, { useState } from "react";
import { generateId } from "@/utils/generateId";
import AddLevelGroupModal from "./AddLevelGroupModal";
import { useHierarchy } from "../context/HierarchyProvider";

interface AddLevelGroupButtonProps {
  onAdd?: (title: string) => void; // Keep for backward compatibility
  className?: string;
  order: number;
}

const AddLevelGroupButton: React.FC<AddLevelGroupButtonProps> = ({
  onAdd,
  className = "",
  order,
}) => {
  const { service } = useHierarchy();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (title: string) => {
    try {
      // Plan.md 11.2.3 Service çağrısı specifications
      service.addLevelGroup({
        id: generateId(),
        title: title.trim(),
        order,
        levels: [],
      });

      // Backward compatibility - call onAdd if provided
      onAdd?.(title);

      console.log("Seviye Grubu Başarıyla Eklendi:", { title, order });
    } catch (error) {
      console.error("Seviye grubu eklenirken hata:", error);
    }
  };

  return (
    <div className={`add-level-group-button group ${className} relative h-0`}>
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-2 h-2 bg-purple-300 rounded-full opacity-60 group-hover:opacity-0 transition-all duration-300"></div>

        <button
          onClick={handleButtonClick}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
                     w-10 h-10 rounded-full border-2 border-dashed border-purple-300 
                     hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center 
                     text-purple-500 hover:text-purple-700 hover:scale-110 hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50
                     transform active:scale-95 bg-white/90 backdrop-blur-sm"
          title="Yeni Seviye Grubu Ekle"
        >
          <svg
            className="w-5 h-5 transition-transform duration-200"
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

      <AddLevelGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        order={order}
      />
    </div>
  );
};

export default AddLevelGroupButton;
