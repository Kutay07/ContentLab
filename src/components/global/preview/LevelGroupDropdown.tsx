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
      <div className="relative group">
        {/* Drag Handle - sol tarafta */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/70 hover:bg-white cursor-grab active:cursor-grabbing rounded-md shadow border border-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Sürüklemek için tutun"
        >
          <svg
            className="w-3 h-3 text-gray-500"
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
      {/* Level Group Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 
                   hover:from-purple-100 hover:to-indigo-100 rounded-xl border border-purple-200 
                   transition-all duration-200 mb-2 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center">
          <span className="text-2xl mr-4">📚</span>
          <div className="text-left">
            <h2 className="text-xl font-bold text-purple-900">
              {levelGroup.title}
            </h2>
            <div className="flex items-center space-x-6 text-sm text-purple-700 mt-2">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Seviye: {sortedLevels.length}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Bileşen: {totalComponents}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Sıra: {levelGroup.order}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-purple-700 mr-3 font-medium">
            {isDropdownOpen ? "Daralt" : "Genişlet"}
          </span>
          <div
            className={`p-2 rounded-lg bg-white shadow-sm transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-5 h-5 text-purple-600"
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
        </div>
      </button>

      {/* Level Group Content */}
      {isDropdownOpen && (
        <div className="level-group-content mb-2">
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
                      <div className="group relative h-3 -mb-1">
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
                        <div className="group relative h-3 -mt-1">
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
                    <div className="rotate-1 scale-105">
                      <LevelDropdown
                        level={activeLevel}
                        className="shadow-xl border-2 border-blue-300 bg-white"
                        addedIds={addedIds}
                        updatedIds={updatedIds}
                      />
                    </div>
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
              <div className="group relative h-8 mt-6">
                <AddLevelButton order={1} groupId={levelGroup.id} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelGroupDropdown;
