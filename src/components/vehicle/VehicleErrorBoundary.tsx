/**
 * Vehicle Error Boundary Component
 * Handles errors in vehicle-related operations gracefully
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface VehicleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface VehicleErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class VehicleErrorBoundary extends React.Component<
  VehicleErrorBoundaryProps,
  VehicleErrorBoundaryState
> {
  constructor(props: VehicleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VehicleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Vehicle Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultVehicleErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
function DefaultVehicleErrorFallback({ error, retry }: {
  error?: Error;
  retry?: () => void;
}) {
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="flex items-center gap-3 mb-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
        <h3 className="text-lg font-semibold text-red-800">
          Vehicle Management Error
        </h3>
      </div>

      <p className="text-red-700 mb-4">
        {error?.message || 'An error occurred while managing vehicle information. Please try again.'}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="border-red-200 text-red-700 hover:bg-red-100"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </Card>
  );
}

// Hook for handling vehicle operation errors
export function useVehicleErrorHandler() {
  const handleError = (error: unknown, operation: string) => {
    console.error(`Vehicle operation "${operation}" failed:`, error);

    let errorMessage = 'An unexpected error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }

    // Log to error monitoring service in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Vehicle ${operation}: ${errorMessage}`,
        fatal: false
      });
    }

    return errorMessage;
  };

  const isNetworkError = (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('Network Error') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      );
    }
    return false;
  };

  const isAuthError = (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('unauthorized') ||
        error.message.includes('forbidden')
      );
    }
    return false;
  };

  const isValidationError = (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('400') ||
        error.message.includes('422') ||
        error.message.includes('validation') ||
        error.message.includes('invalid')
      );
    }
    return false;
  };

  return {
    handleError,
    isNetworkError,
    isAuthError,
    isValidationError
  };
}