"use client";

import React, { useState } from "react";
import UndoRedoControls from "./UndoRedoControls";
import DraftControls from "./DraftControls";
import PublishButton from "./PublishButton";
import PanelVisibilityControls from "./PanelVisibilityControls";

interface ControlBarProps {
  className?: string;
}

export default function ControlBar({ className = "" }: ControlBarProps) {
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToastMessage = (message: string, type: "success" | "error") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <>
      {/*
       * Dropdown menülerinin (Undo/Redo, Taslak vb.) alt taraftaki ManagementLayout
       * bileşeninin altında kalmaması için bu çubuğa yüksek bir z-index tanımlıyoruz.
       * "relative" konumu yeni bir stacking context oluşturur, "z-50" ise onu
       * ManagementLayout (z-index: auto) üzerinde konumlandırır.
       */}
      <div
        className={`relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg p-3 ${className}`}
      >
        <div className="flex items-center justify-between">
          {/* Sol taraf - Undo/Redo Kontrolleri + Panel Görünürlük Kontrolleri */}
          <div className="flex items-center gap-6">
            <UndoRedoControls />
            <PanelVisibilityControls />
          </div>

          {/* Sağ taraf - Draft + Publish Kontrolleri */}
          <div className="flex items-center space-x-4">
            <DraftControls onToast={showToastMessage} />
            <PublishButton onToast={showToastMessage} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[200]">
          <div
            className={`px-4 py-3 rounded-md shadow-lg backdrop-blur-md border ${
              showToast.type === "success"
                ? "bg-green-500/20 border-green-400/30 text-green-200"
                : "bg-red-500/20 border-red-400/30 text-red-200"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {showToast.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{showToast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
