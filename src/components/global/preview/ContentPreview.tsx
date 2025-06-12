import React, { useState } from "react";
import { LevelHierarchy } from "@/types/LevelHierarchy";
import LevelGroupDropdown from "./LevelGroupDropdown";
import AddLevelGroupButton from "../button/AddLevelGroupButton";

interface ContentPreviewProps {
  data: LevelHierarchy;
  className?: string;
  title?: string;
  allowMultipleOpen?: boolean;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  data,
  className = "",
  title = "İçerik Önizlemesi",
  allowMultipleOpen = true,
}) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Sort level groups by order
  const sortedLevelGroups = [...data].sort((a, b) => a.order - b.order);

  // Calculate total statistics
  const totalLevels = sortedLevelGroups.reduce(
    (total, group) => total + group.levels.length,
    0
  );
  const totalComponents = sortedLevelGroups.reduce(
    (total, group) =>
      total +
      group.levels.reduce(
        (levelTotal, level) => levelTotal + level.components.length,
        0
      ),
    0
  );

  const handleGroupToggle = (groupId: string) => {
    if (allowMultipleOpen) {
      const newOpenGroups = new Set(openGroups);
      if (newOpenGroups.has(groupId)) {
        newOpenGroups.delete(groupId);
      } else {
        newOpenGroups.add(groupId);
      }
      setOpenGroups(newOpenGroups);
    } else {
      // Only allow one group to be open at a time
      setOpenGroups(openGroups.has(groupId) ? new Set() : new Set([groupId]));
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className={`content-preview ${className}`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            <p className="text-gray-600 mb-2">
              Görüntülenecek içerik bulunamadı.
            </p>
            <p className="text-sm text-gray-500">
              Henüz herhangi bir seviye grubu oluşturulmamış.
            </p>
            {/* İçerik yoksa da hover alanı */}
            <div className="group relative h-8 mt-6">
              <AddLevelGroupButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`content-preview ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Seviye Grupları: {sortedLevelGroups.length}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Toplam Seviye: {totalLevels}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Toplam Bileşen: {totalComponents}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOpenGroups(new Set())}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 
                       rounded-lg transition-colors duration-200"
            >
              Tümünü Kapat
            </button>
            <button
              onClick={() =>
                setOpenGroups(new Set(sortedLevelGroups.map((g) => g.id)))
              }
              className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 
                       rounded-lg transition-colors duration-200"
            >
              Tümünü Aç
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-0">
        {sortedLevelGroups.map((levelGroup, index) => (
          <React.Fragment key={levelGroup.id}>
            {/* Level group öncesi hover alanı */}
            <div className="group relative h-4">
              <AddLevelGroupButton />
            </div>

            <LevelGroupDropdown
              levelGroup={levelGroup}
              isOpen={openGroups.has(levelGroup.id)}
              onToggle={() => handleGroupToggle(levelGroup.id)}
            />

            {/* Son grup değilse sonrası hover alanı */}
            {index === sortedLevelGroups.length - 1 && (
              <div className="group relative h-4">
                <AddLevelGroupButton />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Grup yoksa da hover alanı */}
        {sortedLevelGroups.length === 0 && (
          <div className="group relative h-4">
            <AddLevelGroupButton />
          </div>
        )}
      </div>

      {/* Footer Statistics */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <span className="font-medium">Özet:</span> Bu önizlemede{" "}
          <span className="font-semibold text-purple-600">
            {sortedLevelGroups.length}
          </span>{" "}
          seviye grubu,{" "}
          <span className="font-semibold text-blue-600">{totalLevels}</span>{" "}
          seviye ve{" "}
          <span className="font-semibold text-green-600">
            {totalComponents}
          </span>{" "}
          bileşen bulunmaktadır.
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
