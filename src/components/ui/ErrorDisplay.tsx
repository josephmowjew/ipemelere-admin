/**
 * ErrorDisplay Components - Consistent error states for passenger management
 * Following design document patterns for error handling
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  WifiIcon,
  ServerIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error?: Error | string | null;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'card' | 'inline' | 'page';
  className?: string;
}

// Get appropriate icon based on error type
function getErrorIcon(error?: Error | string | null) {
  if (!error) return ExclamationTriangleIcon;
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return WifiIcon;
  }
  
  if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
    return ServerIcon;
  }
  
  return XCircleIcon;
}

// Get user-friendly error message
function getErrorMessage(error?: Error | string | null) {
  if (!error) return 'An unexpected error occurred';
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Common error patterns and user-friendly messages
  const errorMap: Record<string, string> = {
    'network error': 'Network connection failed. Please check your internet connection.',
    'fetch failed': 'Unable to connect to the server. Please try again.',
    'timeout': 'The request timed out. Please try again.',
    '404': 'The requested resource was not found.',
    '401': 'You are not authorized to view this resource.',
    '403': 'Access denied. You do not have permission to view this resource.',
    '500': 'Server error. Please try again later or contact support.',
    'validation': 'There was a problem with the data provided. Please check your input.',
  };
  
  const lowerMessage = errorMessage.toLowerCase();
  
  for (const [pattern, message] of Object.entries(errorMap)) {
    if (lowerMessage.includes(pattern)) {
      return message;
    }
  }
  
  // Return original message if no pattern matches
  return errorMessage;
}

// Basic error display component
export function ErrorDisplay({ 
  error,
  title = 'Error',
  description,
  action,
  onRetry,
  showRetry = true,
  variant = 'card',
  className
}: ErrorDisplayProps) {
  const Icon = getErrorIcon(error);
  const errorMessage = description || getErrorMessage(error);

  const content = (
    <div className="text-center">
      <Icon className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{errorMessage}</p>
      
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="default" size="sm" className="gap-2">
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {action}
      </div>
    </div>
  );

  if (variant === 'page') {
    return (
      <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
        <Card className="w-full max-w-md p-8">
          {content}
        </Card>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('py-8', className)}>
        {content}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn('p-8', className)}>
      {content}
    </Card>
  );
}

// Specialized error components for common scenarios

// Network error component
export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error="Network connection failed"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="card"
      className={className}
    />
  );
}

// Not found error component
export function NotFoundError({ 
  resource = 'resource',
  onGoHome,
  className 
}: { 
  resource?: string;
  onGoHome?: () => void;
  className?: string;
}) {
  return (
    <ErrorDisplay
      error="404"
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
      description={`The ${resource} you're looking for could not be found. It may have been moved or deleted.`}
      action={
        <Button 
          onClick={onGoHome || (() => window.location.href = '/dashboard')} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <HomeIcon className="h-4 w-4" />
          Go to Dashboard
        </Button>
      }
      showRetry={false}
      variant="card"
      className={className}
    />
  );
}

// Unauthorized error component
export function UnauthorizedError({ onLogin, className }: { onLogin?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error="401"
      title="Access Denied"
      description="You are not authorized to view this resource. Please log in or contact an administrator."
      action={
        <Button 
          onClick={onLogin || (() => window.location.href = '/login')} 
          variant="default" 
          size="sm"
        >
          Log In
        </Button>
      }
      showRetry={false}
      variant="card"
      className={className}
    />
  );
}

// Server error component
export function ServerError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error="500"
      title="Server Error"
      description="Something went wrong on our end. Our team has been notified and is working to fix the issue."
      onRetry={onRetry}
      variant="card"
      className={className}
    />
  );
}

// Form validation error component
export function ValidationError({ 
  errors,
  title = 'Please fix the following errors:',
  className 
}: { 
  errors: string[];
  title?: string;
  className?: string;
}) {
  if (errors.length === 0) return null;

  return (
    <div className={cn('rounded-lg bg-destructive/10 border border-destructive/20 p-4', className)}>
      <div className="flex items-center gap-2 mb-2">
        <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">{title}</span>
      </div>
      <div className="text-sm text-destructive/80 space-y-1">
        {errors.map((error, index) => (
          <p key={index}>• {error}</p>
        ))}
      </div>
    </div>
  );
}

// Inline error message for form fields
export function FieldError({ 
  error, 
  className 
}: { 
  error?: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p className={cn('text-xs text-destructive flex items-center gap-1 mt-1', className)}>
      <ExclamationTriangleIcon className="h-3 w-3 flex-shrink-0" />
      {error}
    </p>
  );
}

// API error component with retry logic
export function ApiError({ 
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  className 
}: {
  error?: Error | string | null;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}) {
  const isMaxRetriesReached = retryCount >= maxRetries;
  
  return (
    <ErrorDisplay
      error={error}
      title="Failed to Load Data"
      onRetry={!isMaxRetriesReached ? onRetry : undefined}
      showRetry={!isMaxRetriesReached}
      action={isMaxRetriesReached ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Maximum retry attempts reached. Please refresh the page or contact support.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Refresh Page
          </Button>
        </div>
      ) : undefined}
      variant="card"
      className={className}
    />
  );
}

export default ErrorDisplay;