"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, getStatusColor, getStatusText } from "@/config/apps";

interface AppCardProps {
  app: AppConfig;
  onSelect: (app: AppConfig) => void;
}

export default function AppCard({ app, onSelect }: AppCardProps) {
  const bgImage = app.imageUrl || (app as any).imagerUrl;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Yükleniyor");

  useEffect(() => {
    if (isLoading) {
      const texts = ["Yükleniyor", "Yükleniyor.", "Yükleniyor..", "Yükleniyor..."];
      let index = 0;
      
      const interval = setInterval(() => {
        index = (index + 1) % texts.length;
        setLoadingText(texts[index]);
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleManageClick = () => {
    setIsLoading(true);
    // Simulate some loading time
    setTimeout(() => {
      setIsLoading(false);
      onSelect(app);
    }, 1000);
  };

  return (
    <div className="relative w-80 h-96 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-[1.02]">
      {/* Arkaplan görsel */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      {/* Okunabilirlik için üst gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      
      {/* Okunabilirlik için alt gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      {/* Durum etiketi */}
      <span
        className={`absolute top-4 right-4 px-2 py-1 text-[10px] font-semibold rounded-md border whitespace-nowrap backdrop-blur-sm ${getStatusColor(
          app.status
        )}`}
      >
        {getStatusText(app.status)}
      </span>

      {/* Icon */}
      <div className="absolute top-4 left-4 w-12 h-12 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center backdrop-blur-sm">
        {app.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.iconUrl}
            alt="icon"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">{app.icon}</span>
        )}
      </div>

      {/* Metinler */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white text-xl font-bold leading-snug drop-shadow-md">
          {app.name}
        </h3>
        <p className="text-white/90 text-sm leading-tight overflow-hidden">
          {app.description}
        </p>

        {/* Yönet butonu */}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleManageClick}
            disabled={app.status === "inactive" || isLoading}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 backdrop-blur-sm shadow-md relative overflow-hidden ${
              app.status === "inactive"
                ? "bg-white/20 text-white/40 cursor-not-allowed"
                : isLoading
                ? "bg-yellow-500/80 text-white cursor-wait"
                : "bg-white/20 text-white group"
            }`}
          >
            {/* Hover efekti için yeşil gradient - aşağıdan yukarı */}
            {app.status !== "inactive" && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/80 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            )}
            
            {/* Loading efekti için sarı gradient - aşağıdan yukarı */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/60 via-yellow-500/40 to-yellow-500/20 rounded-full animate-pulse" />
            )}
            
            <span className="relative z-10">
              {isLoading ? loadingText : "Yönet"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
