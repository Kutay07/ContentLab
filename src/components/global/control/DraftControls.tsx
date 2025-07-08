"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHierarchy } from "../context/HierarchyProvider";

interface DraftControlsProps {
  className?: string;
  onToast?: (message: string, type: "success" | "error") => void;
}

interface SavedDraft {
  name: string;
  timestamp: number;
  data: string;
}

export default function DraftControls({
  className = "",
  onToast,
}: DraftControlsProps) {
  const { service } = useHierarchy();
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);

  // Dropdown referansı
  const loadDropdownRef = useRef<HTMLDivElement>(null);

  // Kaydedilmiş taslakları yükle
  useEffect(() => {
    loadSavedDrafts();
  }, []);

  // Dropdown dışına tıklamayı dinle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loadDropdownRef.current &&
        !loadDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLoadDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSavedDrafts = () => {
    const drafts: SavedDraft[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("draft*")) {
        try {
          const draftData = JSON.parse(localStorage.getItem(key) || "{}");
          drafts.push({
            name: key.replace("draft*", ""),
            timestamp: draftData.timestamp || 0,
            data: draftData.data || "",
          });
        } catch (error) {
          console.error("Taslak yüklenemedi:", key, error);
        }
      }
    }
    // En yeni önce sırala
    drafts.sort((a, b) => b.timestamp - a.timestamp);
    setSavedDrafts(drafts);
  };

  const handleSaveDraft = () => {
    try {
      const finalName =
        draftName.trim() ||
        `taslak-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`;
      const draftData = {
        timestamp: Date.now(),
        data: service.exportDraft(),
      };

      localStorage.setItem(`draft*${finalName}`, JSON.stringify(draftData));
      loadSavedDrafts();
      setDraftName("");
      onToast?.("Taslak başarıyla kaydedildi!", "success");
    } catch (error) {
      console.error("Taslak kaydedilemedi:", error);
      onToast?.("Taslak kaydedilirken hata oluştu!", "error");
    }
  };

  const handleLoadDraft = (draftName: string) => {
    try {
      const draftData = localStorage.getItem(`draft*${draftName}`);
      if (draftData) {
        const parsed = JSON.parse(draftData);
        service.importDraft(parsed.data);
        setShowLoadDropdown(false);
        onToast?.("Taslak başarıyla yüklendi!", "success");
      }
    } catch (error) {
      console.error("Taslak yüklenemedi:", error);
      onToast?.("Taslak yüklenirken hata oluştu!", "error");
    }
  };

  const handleDeleteDraft = (draftName: string) => {
    try {
      localStorage.removeItem(`draft*${draftName}`);
      loadSavedDrafts();
      onToast?.("Taslak silindi!", "success");
    } catch (error) {
      console.error("Taslak silinemedi:", error);
      onToast?.("Taslak silinirken hata oluştu!", "error");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enter tuşuyla kaydetme
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSaveDraft();
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Draft Name Input */}
      <input
        type="text"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Taslak adı..."
        className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        title="Enter ile kaydet"
      />

      {/* Save Draft Button */}
      <button
        onClick={handleSaveDraft}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        title="Taslak Kaydet (Enter)"
      >
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
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        Kaydet
      </button>

      {/* Load Draft Dropdown */}
      <div className="relative" ref={loadDropdownRef}>
        <button
          onClick={() => setShowLoadDropdown(!showLoadDropdown)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          title="Taslak Yükle"
        >
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Yükle
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {savedDrafts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
              {savedDrafts.length}
            </span>
          )}
        </button>

        {/* Load Dropdown */}
        {showLoadDropdown && (
          <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Kaydedilmiş Taslaklar
                </span>
                {savedDrafts.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {savedDrafts.length} taslak
                  </span>
                )}
              </div>
            </div>

            <div className="py-1 max-h-64 overflow-y-auto">
              {savedDrafts.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    Henüz kaydedilmiş taslak yok
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    İlk taslağınızı kaydedin
                  </p>
                </div>
              ) : (
                savedDrafts.map((draft) => (
                  <div
                    key={draft.name}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
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
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {draft.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(draft.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => handleLoadDraft(draft.name)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Yükle"
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.name)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Sil"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
