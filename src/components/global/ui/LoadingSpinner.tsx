import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Yükleniyor...",
  className = "py-8",
}) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
    {message && <p className="text-gray-600 text-sm">{message}</p>}
  </div>
);
