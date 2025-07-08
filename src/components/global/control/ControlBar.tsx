"use client";

import React, { useState } from "react";
import UndoRedoControls from "./UndoRedoControls";
import DraftControls from "./DraftControls";

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
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6 ${className}`}
      >
        <div className="flex items-center justify-between">
          {/* Sol taraf - Undo/Redo Kontrolleri */}
          <div className="flex items-center">
            <UndoRedoControls />
          </div>

          {/* Sağ taraf - Draft Kontrolleri */}
          <div className="flex items-center">
            <DraftControls onToast={showToastMessage} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-md shadow-md ${
              showToast.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {showToast.type === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-400"
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
                    className="w-5 h-5 text-red-400"
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
