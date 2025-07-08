"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHierarchy } from "../context/HierarchyProvider";

interface UndoRedoControlsProps {
  className?: string;
}

interface HistoryItem {
  id: string;
  label: string;
  type: string;
  timestamp: number;
}

export default function UndoRedoControls({
  className = "",
}: UndoRedoControlsProps) {
  const { service } = useHierarchy();

  // State yönetimi
  const [undoStackSize, setUndoStackSize] = useState(0);
  const [redoStackSize, setRedoStackSize] = useState(0);
  const [undoHistory, setUndoHistory] = useState<HistoryItem[]>([]);
  const [redoHistory, setRedoHistory] = useState<HistoryItem[]>([]);

  // Dropdown kontrolleri
  const [showUndoDropdown, setShowUndoDropdown] = useState(false);
  const [showRedoDropdown, setShowRedoDropdown] = useState(false);

  // Çoklu seçim için
  const [selectedUndoItems, setSelectedUndoItems] = useState<Set<number>>(
    new Set()
  );
  const [selectedRedoItems, setSelectedRedoItems] = useState<Set<number>>(
    new Set()
  );

  // Dropdown referansları
  const undoDropdownRef = useRef<HTMLDivElement>(null);
  const redoDropdownRef = useRef<HTMLDivElement>(null);

  // Stack boyutlarını ve geçmişi güncelle
  useEffect(() => {
    const updateState = () => {
      setUndoStackSize(service.getUndoStackSize());
      setRedoStackSize(service.getRedoStackSize());

      // Undo history'yi al (gerçek işlemler - undo/redo olmayan)
      const undoHist = service.peekUndoHistory(20);
      setUndoHistory(undoHist);

      // Redo history'yi al
      const redoHist = service.peekRedoHistory(20);
      setRedoHistory(redoHist);

      // Seçimleri temizle
      setSelectedUndoItems(new Set());
      setSelectedRedoItems(new Set());
    };

    updateState();

    const unsubscribe = service.subscribe(() => {
      updateState();
    });

    return unsubscribe;
  }, [service]);

  // Tek undo işlemi
  const handleUndo = useCallback(() => {
    service.undo();
    setShowUndoDropdown(false);
    setSelectedUndoItems(new Set());
  }, [service]);

  // Tek redo işlemi
  const handleRedo = useCallback(() => {
    service.redo();
    setShowRedoDropdown(false);
    setSelectedRedoItems(new Set());
  }, [service]);

  // Dropdown dışına tıklamayı dinle ve klavye kısayolları
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        undoDropdownRef.current &&
        !undoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUndoDropdown(false);
        setSelectedUndoItems(new Set());
      }
      if (
        redoDropdownRef.current &&
        !redoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRedoDropdown(false);
        setSelectedRedoItems(new Set());
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z - Undo
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (undoStackSize > 0) {
          handleUndo();
        }
      }
      // Ctrl+Y veya Ctrl+Shift+Z - Redo
      else if (
        (event.ctrlKey && event.key === "y") ||
        (event.ctrlKey && event.shiftKey && event.key === "Z")
      ) {
        event.preventDefault();
        if (redoStackSize > 0) {
          handleRedo();
        }
      }
      // ESC - Dropdown'ları kapat
      else if (event.key === "Escape") {
        setShowUndoDropdown(false);
        setShowRedoDropdown(false);
        setSelectedUndoItems(new Set());
        setSelectedRedoItems(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoStackSize, redoStackSize, handleUndo, handleRedo]);

  // Çoklu undo işlemi
  const handleUndoSteps = (steps: number) => {
    if (steps > 0) {
      service.undoSteps(steps);
    }
    setShowUndoDropdown(false);
    setSelectedUndoItems(new Set());
  };

  // Çoklu redo işlemi
  const handleRedoSteps = (steps: number) => {
    if (steps > 0) {
      service.redoSteps(steps);
    }
    setShowRedoDropdown(false);
    setSelectedRedoItems(new Set());
  };

  // Undo geçmişini temizle (sadece undo)
  const handleClearUndoHistory = () => {
    service.clearUndoHistory();
    setShowUndoDropdown(false);
    setSelectedUndoItems(new Set());
  };

  // Redo geçmişini temizle (sadece redo)
  const handleClearRedoHistory = () => {
    service.clearRedoHistory();
    setShowRedoDropdown(false);
    setSelectedRedoItems(new Set());
  };

  // Undo item'lara tıklama
  const handleUndoItemClick = (index: number, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      // Çoklu seçim modu
      const newSelected = new Set(selectedUndoItems);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
        // Seçilen index'e kadar olan tüm öğeleri seç
        for (let i = 0; i <= index; i++) {
          newSelected.add(i);
        }
      }
      setSelectedUndoItems(newSelected);
    } else {
      // Tek seçim - o adıma kadar geri al
      handleUndoSteps(index + 1);
    }
  };

  // Redo item'lara tıklama
  const handleRedoItemClick = (index: number, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      // Çoklu seçim modu
      const newSelected = new Set(selectedRedoItems);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
        // Seçilen index'e kadar olan tüm öğeleri seç
        for (let i = 0; i <= index; i++) {
          newSelected.add(i);
        }
      }
      setSelectedRedoItems(newSelected);
    } else {
      // Tek seçim - o adıma kadar ileri al
      handleRedoSteps(index + 1);
    }
  };

  // Seçili undo itemlarını işle
  const handleSelectedUndoItems = () => {
    if (selectedUndoItems.size > 0) {
      const maxIndex = Math.max(...Array.from(selectedUndoItems));
      handleUndoSteps(maxIndex + 1);
    }
  };

  // Seçili redo itemlarını işle
  const handleSelectedRedoItems = () => {
    if (selectedRedoItems.size > 0) {
      const maxIndex = Math.max(...Array.from(selectedRedoItems));
      handleRedoSteps(maxIndex + 1);
    }
  };

  // Zaman formatı
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Undo Kontrolleri */}
      <div className="relative" ref={undoDropdownRef}>
        <div className="flex items-center">
          {/* Undo Butonu */}
          <button
            onClick={handleUndo}
            disabled={undoStackSize === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="Geri Al (Ctrl+Z)"
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
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="ml-1">Geri Al</span>
            {undoStackSize > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                {undoStackSize}
              </span>
            )}
          </button>

          {/* Undo Dropdown Toggle */}
          <button
            onClick={() => setShowUndoDropdown(!showUndoDropdown)}
            disabled={undoStackSize === 0}
            className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-r-md border-l-0 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="Geri Alma Geçmişi"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Undo Dropdown */}
        {showUndoDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Geri Alınabilir İşlemler
                </span>
                <div className="flex items-center space-x-2">
                  {selectedUndoItems.size > 0 && (
                    <button
                      onClick={handleSelectedUndoItems}
                      className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      {selectedUndoItems.size} Seçili Geri Al
                    </button>
                  )}
                  <button
                    onClick={handleClearUndoHistory}
                    className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded"
                    title="Geri Alma Geçmişini Temizle"
                  >
                    Temizle
                  </button>
                </div>
              </div>
              {undoHistory.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Ctrl + tıklama ile çoklu seçim yapabilirsiniz
                </p>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {undoHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Geri alınabilir işlem bulunmuyor
                </div>
              ) : (
                undoHistory.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={(e) => handleUndoItemClick(index, e.ctrlKey)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedUndoItems.has(index)
                        ? "bg-blue-100 border-blue-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(item.timestamp)} • {index + 1} adım
                        </div>
                      </div>
                      {selectedUndoItems.has(index) && (
                        <div className="ml-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Redo Kontrolleri */}
      <div className="relative" ref={redoDropdownRef}>
        <div className="flex items-center">
          {/* Redo Butonu */}
          <button
            onClick={handleRedo}
            disabled={redoStackSize === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="İleri Al (Ctrl+Y)"
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
                d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
              />
            </svg>
            <span className="ml-1">İleri Al</span>
            {redoStackSize > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded">
                {redoStackSize}
              </span>
            )}
          </button>

          {/* Redo Dropdown Toggle */}
          <button
            onClick={() => setShowRedoDropdown(!showRedoDropdown)}
            disabled={redoStackSize === 0}
            className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-r-md border-l-0 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title="İleri Alma Geçmişi"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Redo Dropdown */}
        {showRedoDropdown && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  İleri Alınabilir İşlemler
                </span>
                <div className="flex items-center space-x-2">
                  {selectedRedoItems.size > 0 && (
                    <button
                      onClick={handleSelectedRedoItems}
                      className="px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                    >
                      {selectedRedoItems.size} Seçili İleri Al
                    </button>
                  )}
                  <button
                    onClick={handleClearRedoHistory}
                    className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded"
                    title="İleri Alma Geçmişini Temizle"
                  >
                    Temizle
                  </button>
                </div>
              </div>
              {redoHistory.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Ctrl + tıklama ile çoklu seçim yapabilirsiniz
                </p>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {redoHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  İleri alınabilir işlem bulunmuyor
                </div>
              ) : (
                redoHistory.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={(e) => handleRedoItemClick(index, e.ctrlKey)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedRedoItems.has(index)
                        ? "bg-green-100 border-green-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(item.timestamp)} • {index + 1} adım
                        </div>
                      </div>
                      {selectedRedoItems.has(index) && (
                        <div className="ml-2 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
