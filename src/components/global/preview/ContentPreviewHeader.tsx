"use client";

import React from "react";
import { LevelGroupItem } from "@/types/LevelHierarchy";

interface ContentPreviewHeaderProps {
  sortedLevelGroups: LevelGroupItem[];
  openGroups: Set<string>;
  setOpenGroups: (groups: Set<string>) => void;
  totalLevels: number;
  totalComponents: number;
  addedGroupsCount: number;
  updatedGroupsCount: number;
  addedLevelsCount: number;
  updatedLevelsCount: number;
  addedComponentsCount: number;
  updatedComponentsCount: number;
}

const ContentPreviewHeader: React.FC<ContentPreviewHeaderProps> = ({
  sortedLevelGroups,
  openGroups,
  setOpenGroups,
  totalLevels,
  totalComponents,
  addedGroupsCount,
  updatedGroupsCount,
  addedLevelsCount,
  updatedLevelsCount,
  addedComponentsCount,
  updatedComponentsCount,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg mb-4 p-3">
      <div className="flex items-center justify-between">
        <div>
          {/* Kapsül şeklinde rozetler */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              {sortedLevelGroups.length} Grup
              {(addedGroupsCount > 0 || updatedGroupsCount > 0) && (
                <span className="ml-2 text-xs">
                  {addedGroupsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                      +{addedGroupsCount}
                    </span>
                  )}
                  {updatedGroupsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white ml-1">
                      ~{updatedGroupsCount}
                    </span>
                  )}
                </span>
              )}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {totalLevels} Seviye
              {(addedLevelsCount > 0 || updatedLevelsCount > 0) && (
                <span className="ml-2 text-xs">
                  {addedLevelsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                      +{addedLevelsCount}
                    </span>
                  )}
                  {updatedLevelsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white ml-1">
                      ~{updatedLevelsCount}
                    </span>
                  )}
                </span>
              )}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {totalComponents} Bileşen
              {(addedComponentsCount > 0 || updatedComponentsCount > 0) && (
                <span className="ml-2 text-xs">
                  {addedComponentsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                      +{addedComponentsCount}
                    </span>
                  )}
                  {updatedComponentsCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white ml-1">
                      ~{updatedComponentsCount}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Tek ok butonu ile genişlet/daralt */}
        <button
          onClick={() => {
            const allOpen = sortedLevelGroups.every(g => openGroups.has(g.id));
            if (allOpen) {
              setOpenGroups(new Set());
            } else {
              setOpenGroups(new Set(sortedLevelGroups.map((g) => g.id)));
            }
          }}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
          title={sortedLevelGroups.every(g => openGroups.has(g.id)) ? "Tümünü Kapat" : "Tümünü Aç"}
        >
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              sortedLevelGroups.every(g => openGroups.has(g.id)) ? 'rotate-180' : ''
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
  );
};

export default ContentPreviewHeader;
