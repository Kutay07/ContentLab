"use client";

import React from "react";

const ComponentEditLLMTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        {/* LLM Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-purple-600"
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
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          LLM Araçları
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Bu bölümde gelecekte yapay zeka destekli bileşen oluşturma ve
          düzenleme araçları bulunacak. LLM ile otomatik içerik üretimi, bileşen
          önerileri ve akıllı düzenleme özellikleri eklenecek.
        </p>

        {/* Feature List */}
        <div className="text-left space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span>Otomatik içerik üretimi</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span>Bileşen yapısı önerileri</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span>Akıllı düzenleme asistanı</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
            <span>İçerik optimizasyonu</span>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Yakında gelecek
        </div>
      </div>
    </div>
  );
};

export default ComponentEditLLMTab;
