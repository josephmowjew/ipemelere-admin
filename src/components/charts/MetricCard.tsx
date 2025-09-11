/**
 * MetricCard Component - Reusable metric display card
 * Following component composition patterns from design document
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { MetricCardProps } from '@/types/dashboard';

// Skeleton loading component
const MetricCardSkeleton: React.FC = () => (
  <Card className="p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
      <div className="ml-4 flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-8 bg-muted rounded w-16 animate-pulse" />
        <div className="h-4 bg-muted rounded w-20 animate-pulse" />
      </div>
    </div>
  </Card>
);

// Error state component
const MetricCardError: React.FC<{ error: string }> = ({ error }) => (
  <Card className="p-6 border-destructive/50">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive text-sm">!</span>
        </div>
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-destructive">Error loading metric</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    </div>
  </Card>
);

// Main MetricCard component
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  isLoading = false,
}) => {
  // Show loading skeleton
  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground'
  };

  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : null;

  // Format value for display
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with K, M suffixes
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatValue(value)}
          </p>
          {TrendIcon && change !== 0 && (
            <div className={cn('flex items-center text-sm mt-2', trendColors[trend])}>
              <TrendIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              <span className="font-medium">
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
          {change === 0 && (
            <div className="flex items-center text-sm mt-2 text-muted-foreground">
              <span className="font-medium">No change {changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Enhanced version with error state
export const MetricCardWithError: React.FC<MetricCardProps & { error?: string }> = ({
  error,
  ...props
}) => {
  if (error) {
    return <MetricCardError error={error} />;
  }
  return <MetricCard {...props} />;
};

// Collection of metric cards for grid layout
interface MetricCardsGridProps {
  metrics: MetricCardProps[];
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  metrics,
  isLoading = false,
  error,
  className
}) => {
  if (error) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardError key={index} error={error} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))
        : metrics.map((metric, index) => (
            <MetricCard key={`${metric.title}-${index}`} {...metric} />
          ))
      }
    </div>
  );
};

// Export additional components for flexibility
export { MetricCardSkeleton, MetricCardError };

// Default export for main component
export default MetricCard;