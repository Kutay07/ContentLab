"use client";

import React, { useState } from "react";

interface AddLevelGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  order: number;
}

const AddLevelGroupModal: React.FC<AddLevelGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  order,
}) => {
  const [title, setTitle] = useState("");

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle("");
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-40 transition-opacity duration-300 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 relative">
          <h2 className="text-white text-xl font-semibold">
            Yeni Seviye Grubu Ekle
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white hover:text-purple-200 
                       w-8 h-8 rounded-full hover:bg-purple-400 hover:bg-opacity-30 
                       flex items-center justify-center transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Seviye Grubu Başlığı
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Seviye grubu başlığını girin..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                         outline-none transition-all duration-200
                         placeholder-gray-400"
              autoFocus
            />
          </div>

          <div className="text-sm text-gray-500 mb-6">Sıra: {order}</div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 
                         hover:bg-gray-100 rounded-lg transition-all duration-200
                         font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 
                         text-white rounded-lg hover:from-purple-600 hover:to-purple-700 
                         disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                         transition-all duration-200 font-medium shadow-lg
                         hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLevelGroupModal;
