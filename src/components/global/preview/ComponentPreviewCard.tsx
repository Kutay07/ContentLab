import React from "react";
import MobileScreenContainer from "./MobileScreenContainer";
import MobileScreen from "./MobileScreen";
import { ComponentItem } from "@/types/LevelHierarchy";

interface ComponentPreviewCardProps {
  component: ComponentItem;
  className?: string;
  onEdit?: (component: ComponentItem) => void;
  addedIds?: Set<string>;
  updatedIds?: Set<string>;
}

const ComponentPreviewCard: React.FC<ComponentPreviewCardProps> = ({
  component,
  className = "",
  onEdit,
  addedIds = new Set(),
  updatedIds = new Set(),
}) => {
  return (
    <div
      className={`component-preview-card ${className} flex-shrink-0 relative`}
    >
      {/* Visual diff indicators - Plan.md 4.2 specs */}
      {addedIds.has(component.id) && (
        <div
          className="absolute top-2 right-2 z-20 w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm"
          title="Yeni eklendi"
          role="img"
          aria-label="Yeni eklenen bileşen"
        />
      )}
      {!addedIds.has(component.id) && updatedIds.has(component.id) && (
        <div
          className="absolute top-2 right-2 z-20 w-2 h-2 bg-yellow-500 rounded-full border border-white shadow-sm"
          title="Güncellendi"
          role="img"
          aria-label="Güncellenen bileşen"
        />
      )}

      <div className="w-[280px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Component Header - Integrated with MobileScreen */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">
            {component.display_name}
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Tip: {component.type}</div>
            <div className="flex items-center text-xs text-gray-400">
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                {component.order}
              </span>
              <span>Sıra: {component.order}</span>
            </div>
          </div>
        </div>

        {/* MobileScreen - Integrated Content Preview */}
        <div className="p-3">
          <MobileScreenContainer
            direction="row"
            gap={0}
            className="flex-shrink-0"
          >
            <MobileScreen width={254} height={380}>
              <div className="h-full w-full overflow-y-auto p-3 bg-gray-50">
                <pre className="text-xs text-left text-gray-800 whitespace-pre-wrap break-words">
                  <code>
                    {typeof component.content === "object"
                      ? JSON.stringify(component.content, null, 2)
                      : String(component.content)}
                  </code>
                </pre>
              </div>
            </MobileScreen>
          </MobileScreenContainer>
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              ID: {component.id.substring(0, 8)}...
            </div>
            {onEdit && (
              <button
                onClick={() => onEdit(component)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                title="Bileşeni düzenle"
              >
                <svg
                  className="w-3 h-3"
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
                Düzenle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentPreviewCard;
