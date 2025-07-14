import React from "react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Hata",
  message,
  onRetry,
  actions,
}) => (
  <div className="flex flex-col items-center text-center max-w-md mx-auto py-10">
    <div className="text-red-500 mb-4">
      <svg
        className="w-16 h-16 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <div className="flex justify-center gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          Tekrar Dene
        </button>
      )}
      {actions}
    </div>
  </div>
);
