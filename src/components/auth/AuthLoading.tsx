"use client";

interface AuthLoadingProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export default function AuthLoading({
  message = "Yükleniyor...",
  showSpinner = true,
  className = "",
}: AuthLoadingProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
    >
      <div className="text-center">
        {showSpinner && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}

        <p className="text-gray-600 text-lg font-medium mb-2">{message}</p>

        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>

        <p className="text-gray-400 text-sm mt-4">Kimlik doğrulanıyor...</p>
      </div>
    </div>
  );
}

// Skeleton loader component for protected content
export function AuthContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
      <div className="mt-6">
        <div className="h-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

// Auth error display component
export function AuthErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Kimlik Doğrulama Hatası
        </h3>

        <p className="text-gray-600 mb-6">{error}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  );
}
