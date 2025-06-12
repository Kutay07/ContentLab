"use client";

import React, { useState } from "react";
import { Json } from "@/types/supabase";
import ComponentEditJsonTab from "./ComponentEditJsonTab";
import ComponentEditFormTab from "./ComponentEditFormTab";
import ComponentEditLLMTab from "./ComponentEditLLMTab";

interface ComponentEditTabsProps {
  content: Json;
  onContentChange: (newContent: Json, error?: string) => void;
  jsonError: string | null;
}

type TabType = "json" | "form" | "llm";

const ComponentEditTabs: React.FC<ComponentEditTabsProps> = ({
  content,
  onContentChange,
  jsonError,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("json");

  const tabs = [
    { id: "json" as TabType, label: "JSON Editor", icon: "code" },
    { id: "form" as TabType, label: "Form Editor", icon: "form" },
    { id: "llm" as TabType, label: "LLM Tools", icon: "robot" },
  ];

  const renderTabIcon = (iconType: string) => {
    switch (iconType) {
      case "code":
        return (
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
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
      case "form":
        return (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "robot":
        return (
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
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {renderTabIcon(tab.icon)}
            {tab.label}
            {tab.id === "json" && jsonError && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "json" && (
          <ComponentEditJsonTab
            content={content}
            onContentChange={onContentChange}
            error={jsonError}
          />
        )}
        {activeTab === "form" && (
          <ComponentEditFormTab
            content={content}
            onContentChange={onContentChange}
          />
        )}
        {activeTab === "llm" && <ComponentEditLLMTab />}
      </div>
    </div>
  );
};

export default ComponentEditTabs;
