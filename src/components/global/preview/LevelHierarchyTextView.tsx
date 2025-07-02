"use client";

import React, { useState } from "react";
import { LevelHierarchy } from "@/types/LevelHierarchy";

interface LevelHierarchyTextViewProps {
  data: LevelHierarchy;
  className?: string;
  title?: string;
  maxHeight?: string;
}

const LevelHierarchyTextView: React.FC<LevelHierarchyTextViewProps> = ({
  data,
  className = "",
  title = "LevelHierarchy JSON Görünümü",
  maxHeight = "3500px",
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // JSON'u güzel formatlayalım
  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleExpand}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title={isExpanded ? "Küçült" : "Genişlet"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
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
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="JSON'u Kopyala"
          >
            {isCopied ? (
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Stats */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Seviye Grupları: <strong className="ml-1">{data.length}</strong>
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Toplam Seviye:{" "}
              <strong className="ml-1">
                {data.reduce((total, group) => total + group.levels.length, 0)}
              </strong>
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Toplam Bileşen:{" "}
              <strong className="ml-1">
                {data.reduce(
                  (total, group) =>
                    total +
                    group.levels.reduce(
                      (levelTotal, level) =>
                        levelTotal + level.components.length,
                      0
                    ),
                  0
                )}
              </strong>
            </span>
          </div>

          {/* JSON Content */}
          <div
            className="bg-gray-50 border border-gray-200 rounded-md overflow-auto"
            style={{ maxHeight }}
          >
            <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              <code>{formattedJson}</code>
            </pre>
          </div>

          {/* Copy feedback */}
          {isCopied && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              JSON panoya kopyalandı!
            </div>
          )}
        </div>
      )}

      {/* Collapsed preview */}
      {!isExpanded && (
        <div className="p-4 text-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {data.length} seviye grubu,{" "}
              {data.reduce((total, group) => total + group.levels.length, 0)}{" "}
              seviye içeriği
            </div>
            <button
              onClick={handleToggleExpand}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              JSON'u Görüntüle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelHierarchyTextView;
