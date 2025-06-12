"use client";

import React, { useState, useCallback } from "react";
import { Json } from "@/types/supabase";

interface ComponentEditJsonTabProps {
  content: Json;
  onContentChange: (newContent: Json, error?: string) => void;
  error: string | null;
}

const ComponentEditJsonTab: React.FC<ComponentEditJsonTabProps> = ({
  content,
  onContentChange,
  error,
}) => {
  const [jsonString, setJsonString] = useState(() =>
    JSON.stringify(content, null, 2)
  );

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonString(value);

      try {
        const parsed = JSON.parse(value);
        onContentChange(parsed);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Geçersiz JSON formatı";
        onContentChange(content, errorMessage);
      }
    },
    [content, onContentChange]
  );

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">JSON Editor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try {
                const formatted = JSON.stringify(
                  JSON.parse(jsonString),
                  null,
                  2
                );
                setJsonString(formatted);
                handleJsonChange(formatted);
              } catch (err) {
                // JSON geçersizse formatlamaya çalışma
              }
            }}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
          >
            Formatla
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">JSON Hatası</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 border border-gray-300 rounded-md overflow-hidden">
        <textarea
          value={jsonString}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none focus:ring-0"
          placeholder="JSON içeriğinizi buraya yazın..."
          spellCheck={false}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>İpucu:</strong> JSON formatında content nesnesini düzenleyin.
          Geçerli JSON formatında olduğundan emin olun.
        </p>
      </div>
    </div>
  );
};

export default ComponentEditJsonTab;
