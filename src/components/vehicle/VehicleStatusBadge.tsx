/**
 * Vehicle Status Badge Component
 * Displays vehicle status with consistent styling and icons
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { vehicleStatusUtils } from '@/lib/api/vehicles';
import type { Vehicle } from '@/lib/api/vehicles';

interface VehicleStatusBadgeProps {
  status: Vehicle['status'];
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  hasRejectionReason?: boolean;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md',
  variant = 'default',
  hasRejectionReason = false,
}) => {
  // Get display status for the text
  const displayStatus = vehicleStatusUtils.mapStatusForDisplay(status, hasRejectionReason);
  const colorClass = vehicleStatusUtils.getStatusColorClass(displayStatus as Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason);
  const icon = vehicleStatusUtils.getStatusIcon(displayStatus as Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason);
  const description = vehicleStatusUtils.getStatusDescription(displayStatus as Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: colorClass,
    outline: `border-2 ${colorClass.replace('bg-', 'border-')} bg-transparent ${colorClass.replace('bg-', 'text-')}`,
  };

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <div className={baseClasses} title={description}>
      {showIcon && <span className="shrink-0">{icon}</span>}
      <span className="capitalize">
        {displayStatus.replace('_', ' ')}
      </span>
    </div>
  );
};