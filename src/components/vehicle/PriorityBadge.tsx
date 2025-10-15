/**
 * Priority Badge Component
 * Displays priority level with appropriate styling
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { vehicleStatusUtils } from '@/lib/api/vehicles';
import type { PendingVehicle } from '@/lib/api/vehicles';

interface PriorityBadgeProps {
  priority: PendingVehicle['priority'];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
  size = 'md',
  variant = 'default',
}) => {
  const colorClass = vehicleStatusUtils.getPriorityColorClass(priority);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: colorClass,
    outline: `border-2 ${colorClass.replace('bg-', 'border-')} bg-transparent ${colorClass.replace('bg-', 'text-')}`,
  };

  const priorityIcons = {
    low: '🔵',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴',
  };

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <div className={baseClasses}>
      <span className="shrink-0">{priorityIcons[priority]}</span>
      <span className="capitalize">{priority}</span>
    </div>
  );
};