"use client";

import React from "react";
import { AuthErrorDisplay } from "./AuthLoading";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      // Default error display
      return (
        <AuthErrorDisplay
          error={`Kimlik doğrulama hatası: ${this.state.error.message}`}
          onRetry={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useAuthErrorHandler() {
  const handleError = (error: Error) => {
    console.error("Auth error:", error);

    // Auth service'e error bildir
    window.dispatchEvent(
      new CustomEvent("auth-error", {
        detail: { error: error.message },
      })
    );
  };

  return { handleError };
}
