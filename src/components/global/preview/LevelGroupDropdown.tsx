import React, { useState } from "react";
import { LevelGroupItem } from "@/types/LevelHierarchy";
import LevelDropdown from "./LevelDropdown";
import AddLevelButton from "../button/AddLevelButton";

interface LevelGroupDropdownProps {
  levelGroup: LevelGroupItem;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

const LevelGroupDropdown: React.FC<LevelGroupDropdownProps> = ({
  levelGroup,
  isOpen = false,
  onToggle,
  className = "",
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDropdownOpen = onToggle ? isOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  // Sort levels by order
  const sortedLevels = [...levelGroup.levels].sort((a, b) => a.order - b.order);

  // Calculate total components count
  const totalComponents = sortedLevels.reduce(
    (total, level) => total + level.components.length,
    0
  );

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
                Seviyeler ({sortedLevels.length})
              </h3>

              {sortedLevels.map((level, index) => (
                <React.Fragment key={level.id}>
                  {/* Level öncesi hover alanı */}
                  <div className="group relative h-3 -mb-1">
                    <AddLevelButton />
                  </div>

                  <LevelDropdown level={level} className="" />

                  {/* Son level değilse sonrası hover alanı */}
                  {index === sortedLevels.length - 1 && (
                    <div className="group relative h-3 -mt-1">
                      <AddLevelButton />
                    </div>
                  )}
                </React.Fragment>
              ))}
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
                <AddLevelButton />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelGroupDropdown;
