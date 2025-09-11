/**
 * LoadingState Components - Consistent loading states for passenger management
 * Following design document patterns for loading states
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Basic spinner component
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

// Full loading state with optional text
export function LoadingState({ size = 'md', text = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Spinner size={size} className="mb-3" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

// Loading skeleton for table rows
export function TableRowSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            {index === 0 && <div className="h-3 bg-muted rounded animate-pulse w-24" />}
          </div>
        </td>
      ))}
    </tr>
  );
}

// Loading skeleton for cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-48" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    </Card>
  );
}

// Loading skeleton specifically for passenger table
export function PassengerTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Passenger</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Verification</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Loading skeleton for passenger details
export function PassengerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="h-6 bg-muted rounded animate-pulse w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-1">
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Emergency Contact Card */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="h-6 bg-muted rounded animate-pulse w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="h-3 bg-muted rounded animate-pulse w-16" />
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>

      {/* Rides Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-muted rounded animate-pulse w-32" />
          <div className="h-8 bg-muted rounded animate-pulse w-20" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                <div className="h-3 bg-muted rounded animate-pulse w-32" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
                <div className="h-5 bg-muted rounded animate-pulse w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Loading overlay for forms
export function FormLoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="flex flex-col items-center">
        <Spinner size="lg" className="mb-3" />
        <p className="text-sm text-muted-foreground">Processing...</p>
      </div>
    </div>
  );
}

// Inline loading state for buttons
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Spinner 
      size={size} 
      className={cn(
        size === 'sm' && 'mr-2',
        size === 'md' && 'mr-3'
      )} 
    />
  );
}

// Page-level loading state
export function PageLoadingState({ title = 'Loading...' }: { title?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">Please wait while we load your data...</p>
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  action,
  icon: Icon,
  className
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default LoadingState;