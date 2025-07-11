"use client";

import { useState } from "react";
import { AppConfig, getStatusColor, getStatusText } from "@/config/apps";
import { useAppConnections } from "@/stores/appConnections";
import { supabaseManager } from "@/services/supabaseManager";

interface AppCardProps {
  app: AppConfig;
  onSelect: (app: AppConfig) => void;
}

export default function AppCard({ app, onSelect }: AppCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { connections, connectApp, disconnectApp } = useAppConnections();
  const isConnected = connections[app.id]?.connected;

  return (
    <div className="group relative w-full">
      {/* Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl opacity-0 group-hover:opacity-25 blur transition-all duration-300"></div>

      <div className="relative w-full bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.01]">
        {/* Gradient Top Border */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-3">
                {app.icon}
              </div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {app.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-700 transition-colors">
                  {app.description}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-all duration-300 ${getStatusColor(
                app.status
              )}`}
            >
              {getStatusText(app.status)}
            </span>
          </div>

          {/* Info Cards */}
          <div className="mb-4 grid grid-cols-1 gap-2">
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-3 border border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    Project ID
                  </span>
                </div>
                <span className="font-mono text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-md">
                  {app.supabase.projectId}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg p-3 border border-gray-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-3 h-3 text-purple-600"
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
                  <span className="text-xs font-medium text-gray-700">
                    Son Güncelleme
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {app.lastUpdated}
                </span>
              </div>
            </div>
          </div>

          {/* Supabase Details Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="group/toggle w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-purple-50 rounded-lg border border-gray-200/60 hover:border-blue-300/50 transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-md bg-gradient-to-br transition-all duration-300 ${
                    showDetails
                      ? "from-blue-500 to-purple-600 shadow-lg"
                      : "from-gray-400 to-gray-500 group-hover/toggle:from-blue-400 group-hover/toggle:to-purple-500"
                  }`}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover/toggle:text-blue-700 transition-colors">
                  {showDetails
                    ? "Detayları Gizle"
                    : "Supabase Detaylarını Göster"}
                </span>
              </div>

              <svg
                className={`w-4 h-4 text-gray-500 group-hover/toggle:text-blue-600 transform transition-all duration-300 ${
                  showDetails ? "rotate-180" : ""
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

            {/* Animated Details Panel */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showDetails ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
              }`}
            >
              <div className="bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/20 rounded-lg p-3 border border-gray-200/60 space-y-3">
                <div>
                  <label className="flex items-center space-x-2 font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-xs">Supabase URL</span>
                  </label>
                  <div className="font-mono text-xs text-gray-600 bg-white/80 p-2 rounded-md border border-gray-200 break-all hover:bg-white transition-colors">
                    {app.supabase.url}
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-2 font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-3 h-3 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    <span className="text-xs">Anon Key</span>
                  </label>
                  <div className="font-mono text-xs text-gray-600 bg-white/80 p-2 rounded-md border border-gray-200 break-all hover:bg-white transition-colors">
                    {app.supabase.anonKey}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {/* Connect / Disconnect Button */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isConnected) {
                  disconnectApp(app.id);
                } else {
                  await connectApp(app);
                }
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                isConnected
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isConnected ? "Kes" : "Bağlan"}
            </button>

            <button
              onClick={() => onSelect(app)}
              disabled={app.status === "inactive" || !isConnected}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                app.status === "inactive"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {app.status === "inactive" ? (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                      />
                    </svg>
                    <span>Pasif</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Yönet</span>
                  </>
                )}
              </div>
            </button>

            <button
              onClick={() =>
                navigator.clipboard.writeText(app.supabase.projectId)
              }
              className="group/copy px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 border border-gray-300 hover:border-blue-300 rounded-lg text-xs font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
              title="Project ID'yi Kopyala"
            >
              <svg
                className="w-3 h-3 group-hover/copy:scale-110 transition-transform duration-300"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
