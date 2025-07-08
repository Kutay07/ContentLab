"use client";

import React, { useState } from "react";
import { LevelHierarchy, LevelGroupItem } from "@/types/LevelHierarchy";
import LevelGroupDropdown from "./LevelGroupDropdown";
import AddLevelGroupButton from "../button/AddLevelGroupButton";
import { useHierarchy } from "../context/HierarchyProvider";

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

interface ContentPreviewProps {
  data?: LevelHierarchy; // Keep for backward compatibility, but will use context
  className?: string;
  title?: string;
  allowMultipleOpen?: boolean;
}

// Sortable Level Group Wrapper
interface SortableLevelGroupProps {
  levelGroup: LevelGroupItem;
  isOpen: boolean;
  onToggle: () => void;
  addedIds: Set<string>;
  updatedIds: Set<string>;
}

const SortableLevelGroup: React.FC<SortableLevelGroupProps> = ({
  levelGroup,
  isOpen,
  onToggle,
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
  } = useSortable({ id: levelGroup.id });

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
          title="Seviye grubunu sürüklemek için tutun"
        >
          <svg
            className="w-3 h-3 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
        </div>

        {/* Visual diff indicators - Plan.md 4.2 specs */}
        {addedIds.has(levelGroup.id) && (
          <div className="absolute top-2 right-2 z-10">
            <div
              className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm"
              title="Yeni eklendi"
              role="img"
              aria-label="Yeni eklenen seviye grubu"
            />
          </div>
        )}
        {!addedIds.has(levelGroup.id) && updatedIds.has(levelGroup.id) && (
          <div className="absolute top-2 right-2 z-10">
            <div
              className="w-2 h-2 bg-yellow-500 rounded-full border border-white shadow-sm"
              title="Güncellendi"
              role="img"
              aria-label="Güncellenen seviye grubu"
            />
          </div>
        )}

        <LevelGroupDropdown
          levelGroup={levelGroup}
          isOpen={isOpen}
          onToggle={onToggle}
          addedIds={addedIds}
          updatedIds={updatedIds}
        />
      </div>
    </div>
  );
};

const ContentPreview: React.FC<ContentPreviewProps> = ({
  data: propData, // Renamed to avoid confusion
  className = "",
  title = "İçerik Önizlemesi",
  allowMultipleOpen = true,
}) => {
  const { hierarchy, service } = useHierarchy();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Hierarchy boşsa propData'ya geri dön
  const data: LevelHierarchy =
    hierarchy && hierarchy.length > 0 ? hierarchy : propData || [];

  // Get diff information from baseline
  const baseline = service.getBaseline();
  const { addedIds, updatedIds } = service.diffWithBaseline(baseline);

  // Sort level groups by order
  const sortedLevelGroups = [...data].sort((a, b) => a.order - b.order);

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px hareket ettikten sonra aktifleşir
      },
    })
  );

  // Calculate total statistics with diff counts
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

  // Calculate diff statistics
  const addedGroupsCount = sortedLevelGroups.filter((group) =>
    addedIds.has(group.id)
  ).length;
  const updatedGroupsCount = sortedLevelGroups.filter((group) =>
    updatedIds.has(group.id)
  ).length;

  let addedLevelsCount = 0;
  let updatedLevelsCount = 0;
  let addedComponentsCount = 0;
  let updatedComponentsCount = 0;

  sortedLevelGroups.forEach((group) => {
    group.levels.forEach((level) => {
      if (addedIds.has(level.id)) addedLevelsCount++;
      if (updatedIds.has(level.id)) updatedLevelsCount++;

      level.components.forEach((component) => {
        if (addedIds.has(component.id)) addedComponentsCount++;
        if (updatedIds.has(component.id)) updatedComponentsCount++;
      });
    });
  });

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = sortedLevelGroups.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = sortedLevelGroups.findIndex(
        (item) => item.id === over?.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Service'e yeni index'i bildir
        service.moveLevelGroup(active.id as string, newIndex);
      }
    }
  };

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

  // Aktif sürüklenen level group'u bul
  const activeLevelGroup = sortedLevelGroups.find(
    (group) => group.id === activeId
  );

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
              <AddLevelGroupButton order={1} />
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
                {(addedGroupsCount > 0 || updatedGroupsCount > 0) && (
                  <span className="ml-2 text-xs">
                    {addedGroupsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{addedGroupsCount}
                      </span>
                    )}
                    {updatedGroupsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                        ~{updatedGroupsCount}
                      </span>
                    )}
                  </span>
                )}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Toplam Seviye: {totalLevels}
                {(addedLevelsCount > 0 || updatedLevelsCount > 0) && (
                  <span className="ml-2 text-xs">
                    {addedLevelsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{addedLevelsCount}
                      </span>
                    )}
                    {updatedLevelsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                        ~{updatedLevelsCount}
                      </span>
                    )}
                  </span>
                )}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Toplam Bileşen: {totalComponents}
                {(addedComponentsCount > 0 || updatedComponentsCount > 0) && (
                  <span className="ml-2 text-xs">
                    {addedComponentsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +{addedComponentsCount}
                      </span>
                    )}
                    {updatedComponentsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                        ~{updatedComponentsCount}
                      </span>
                    )}
                  </span>
                )}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLevelGroups.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedLevelGroups.map((levelGroup, index) => (
              <React.Fragment key={levelGroup.id}>
                {/* Level group öncesi hover alanı */}
                <div className="group relative h-4">
                  <AddLevelGroupButton order={levelGroup.order} />
                </div>

                {/* Sortable Level Group */}
                <SortableLevelGroup
                  levelGroup={levelGroup}
                  isOpen={openGroups.has(levelGroup.id)}
                  onToggle={() => handleGroupToggle(levelGroup.id)}
                  addedIds={addedIds}
                  updatedIds={updatedIds}
                />

                {/* Son grup değilse sonrası hover alanı */}
                {index === sortedLevelGroups.length - 1 && (
                  <div className="group relative h-4">
                    <AddLevelGroupButton order={levelGroup.order + 1} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeLevelGroup ? (
              <div className="rotate-1 scale-105">
                <LevelGroupDropdown
                  levelGroup={activeLevelGroup}
                  isOpen={openGroups.has(activeLevelGroup.id)}
                  onToggle={() => {}}
                  addedIds={addedIds}
                  updatedIds={updatedIds}
                  className="shadow-xl border-2 border-purple-300 bg-white"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Grup yoksa da hover alanı */}
        {sortedLevelGroups.length === 0 && (
          <div className="group relative h-4">
            <AddLevelGroupButton order={1} />
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
          {/* Diff summary */}
          {(addedIds.size > 0 || updatedIds.size > 0) && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <span className="font-medium">Değişiklikler:</span>
              {addedIds.size > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {addedIds.size} yeni
                </span>
              )}
              {updatedIds.size > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {updatedIds.size} güncelleme
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
