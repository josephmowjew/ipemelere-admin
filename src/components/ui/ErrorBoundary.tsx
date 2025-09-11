/**
 * ErrorBoundary Component - React error boundary for passenger management
 * Following error handling patterns from design document
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state to show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Passenger Management Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${this.props.className || ''}`}>
          <Card className="w-full max-w-lg p-8 text-center">
            <div className="mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred in the passenger management system.
                Please try again or contact support if the problem persists.
              </p>
            </div>

            {/* Error Details (Development/Debug Mode) */}
            {this.props.showDetails && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-muted p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm text-muted-foreground mb-2">
                    Error Details (Debug Info)
                  </summary>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} className="gap-2">
                <ArrowPathIcon className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                <HomeIcon className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                If this error persists, please contact support with the error details above.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Specialized error boundaries for different contexts
export function PassengerErrorBoundary({ children, ...props }: Omit<Props, 'onError'>) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Passenger Management Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error tracking service
    // trackError('passenger-management', error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError} {...props}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;