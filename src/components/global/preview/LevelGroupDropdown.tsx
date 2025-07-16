"use client";

import React, { useState } from "react";
import { LevelGroupItem, LevelItem } from "@/types/LevelHierarchy";
import LevelDropdown from "./LevelDropdown";
import AddLevelButton from "../button/AddLevelButton";
import { ContentHierarchyService } from "@/services/ContentHierarchyService";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LevelGroupDropdownProps {
  levelGroup: LevelGroupItem;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  addedIds?: Set<string>;
  updatedIds?: Set<string>;
}

// Sortable Level Wrapper
interface SortableLevelProps {
  level: LevelItem;
  addedIds: Set<string>;
  updatedIds: Set<string>;
}

const SortableLevel: React.FC<SortableLevelProps> = ({
  level,
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
  } = useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative group/level">
        {/* Drag Handle - sıra kutusunun tam üzerine */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-3 top-4 w-8 h-8 bg-blue-200/90 hover:bg-blue-300/90 cursor-grab active:cursor-grabbing rounded-md shadow border border-blue-400 flex items-center justify-center opacity-0 group-hover/level:opacity-100 transition-opacity z-20"
          title="Seviyeyi sürüklemek için tutun"
        >
          <svg
            className="w-3 h-3 text-blue-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
        </div>

        {/* Visual diff indicators for levels - Plan.md 4.2 specs */}
        {addedIds.has(level.id) && (
          <div className="absolute top-2 right-2 z-10">
            <div
              className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm"
              title="Yeni eklendi"
              role="img"
              aria-label="Yeni eklenen seviye"
            />
          </div>
        )}
        {!addedIds.has(level.id) && updatedIds.has(level.id) && (
          <div className="absolute top-2 right-2 z-10">
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full border border-white shadow-sm"
              title="Güncellendi"
              role="img"
              aria-label="Güncellenen seviye"
            />
          </div>
        )}

        <LevelDropdown
          level={level}
          className=""
          addedIds={addedIds}
          updatedIds={updatedIds}
        />
      </div>
    </div>
  );
};

const LevelGroupDropdown: React.FC<LevelGroupDropdownProps> = ({
  levelGroup,
  isOpen = false,
  onToggle,
  className = "",
  addedIds = new Set(),
  updatedIds = new Set(),
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDropdownOpen = onToggle ? isOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const hierarchyService = ContentHierarchyService.getInstance();

  const handleGroupDelete = () => {
    if (window.confirm("Bu seviye grubunu silmek istediğinize emin misiniz?")) {
      hierarchyService.deleteLevelGroup(levelGroup.id);
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

  // Sort levels by order
  const sortedLevels = [...levelGroup.levels].sort((a, b) => a.order - b.order);

  // Calculate total components count
  const totalComponents = sortedLevels.reduce(
    (total, level) => total + level.components.length,
    0
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = sortedLevels.findIndex((item) => item.id === active.id);
      const newIndex = sortedLevels.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Service'e yeni index'i bildir
        hierarchyService.moveLevel(
          active.id as string,
          newIndex,
          levelGroup.id // Aynı grup içinde taşıma
        );
      }
    }
  };

  // Aktif sürüklenen level'i bul
  const activeLevel = sortedLevels.find((level) => level.id === activeId);

  return (
    <div className={`level-group-dropdown ${className}`}>
      {/* Level Group Header - Tamamen transparan tasarım */}
      <div
        className={`
        w-full backdrop-blur-md border-2 border-purple-300 rounded-lg 
        transition-all duration-300 shadow-sm hover:shadow-md mb-2
        ${isDropdownOpen ? "rounded-b-none border-b-purple-300" : ""}
      `}
      >
        <div
          className="w-full flex items-center justify-between p-4 hover:bg-purple-50/20 
                       transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center flex-1">
            {/* Sıra numarası kutusu */}
            <div
              className="flex-shrink-0 w-8 h-8 bg-purple-100 border border-purple-300 rounded-md 
                           flex items-center justify-center mr-3"
            >
              <span className="text-sm font-semibold text-purple-800">
                {levelGroup.order}
              </span>
            </div>

            {/* İsim - %40 genişlik */}
            <div className="flex-1 max-w-[40%] text-left mr-4">
              <h2 className="text-lg font-semibold text-white break-words">
                {levelGroup.title}
              </h2>
            </div>

            {/* Bilgi kapsülleri */}
            <div className="flex items-center space-x-2 mr-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {sortedLevels.length} Seviye
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {totalComponents} Bileşen
              </span>
            </div>

            {/* Butonlar */}
            <div className="flex items-center space-x-1">
              {/* Sil butonu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGroupDelete();
                }}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Seviye Grubunu Sil"
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
                  // TODO: Düzenleme fonksiyonu eklenecek
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                title="Seviye Grubunu Düzenle"
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
            className="flex-shrink-0 ml-2 p-2 rounded-md bg-purple-100 border border-purple-300 
                     hover:bg-purple-200 transition-all duration-200"
            title={isDropdownOpen ? "Kapat" : "Aç"}
          >
            <svg
              className={`w-4 h-4 text-purple-600 transform transition-transform duration-200 ${
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

      {/* Level Group Content - Border genişletilmiş */}
      {isDropdownOpen && (
        <div
          className="backdrop-blur-md border-2 border-t-0 border-purple-300 
                       rounded-b-lg shadow-sm mb-2"
        >
          <div className="p-4">
            {sortedLevels.length > 0 ? (
              <div className="levels-container space-y-1 mb-12">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-purple-400 rounded mr-2"></span>
                  Seviyeler ({sortedLevels.length}) - Sürükleyerek sıralayın
                </h3>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedLevels.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedLevels.map((level, index) => (
                      <React.Fragment key={level.id}>
                        {/* Level öncesi hover alanı */}
                        <div className="relative h-3 -mb-1">
                          <AddLevelButton
                            order={level.order}
                            groupId={levelGroup.id}
                          />
                        </div>

                        {/* Sortable Level */}
                        <SortableLevel
                          level={level}
                          addedIds={addedIds}
                          updatedIds={updatedIds}
                        />

                        {/* Son level değilse sonrası hover alanı */}
                        {index === sortedLevels.length - 1 && (
                          <div className="relative h-3 -mt-1">
                            <AddLevelButton
                              order={level.order + 1}
                              groupId={levelGroup.id}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </SortableContext>

                  {/* Drag Overlay */}
                  <DragOverlay>
                    {activeLevel ? (
                      <LevelDropdown
                        level={activeLevel}
                        className="shadow-xl border-2 border-blue-300 bg-white"
                        addedIds={addedIds}
                        updatedIds={updatedIds}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">🚀</div>
                <h4 className="text-lg font-medium mb-2">
                  Henüz Seviye Eklenmemiş
                </h4>
                <p className="text-sm">
                  Bu seviye grubunda henüz herhangi bir seviye bulunmuyor.
                </p>
                {/* Seviye yoksa da hover alanı */}
                <div className="relative h-8 mt-6">
                  <AddLevelButton order={1} groupId={levelGroup.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelGroupDropdown;
