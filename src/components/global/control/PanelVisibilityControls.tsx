"use client";

import React from "react";
import { usePanelVisibilityStore } from "@/stores/panelVisibility";

interface PanelVisibilityControlsProps {
  className?: string;
}

export default function PanelVisibilityControls({
  className = "",
}: PanelVisibilityControlsProps) {
  const {
    leftVisible,
    centerVisible,
    rightVisible,
    toggleLeft,
    toggleCenter,
    toggleRight,
  } = usePanelVisibilityStore();

  const buttonBaseClass = "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2";
  const activeClass = "bg-blue-500/80 text-white border border-blue-400/50 shadow-lg";
  const inactiveClass = "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-white/70 text-sm mr-2">Paneller:</span>
      
      <button
        onClick={toggleLeft}
        className={`${buttonBaseClass} ${leftVisible ? activeClass : inactiveClass}`}
        title="Hiyerarşi panelini göster/gizle"
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
            d="M4 6h16M4 12h16M4 18h7" 
          />
        </svg>
        Hiyerarşi
      </button>

      <button
        onClick={toggleCenter}
        className={`${buttonBaseClass} ${centerVisible ? activeClass : inactiveClass}`}
        title="Önizleme panelini göster/gizle"
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
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
          />
        </svg>
        Önizleme
      </button>

      <button
        onClick={toggleRight}
        className={`${buttonBaseClass} ${rightVisible ? activeClass : inactiveClass}`}
        title="Editör panelini göster/gizle"
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
        Editör
      </button>
    </div>
  );
}
