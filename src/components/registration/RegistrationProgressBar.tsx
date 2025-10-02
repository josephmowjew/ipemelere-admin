/**
 * Registration Progress Bar Component
 * Shows visual progress indicator for driver registration
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ApplicationStatus, DocumentStatus } from '@/types/registration';
import { APPLICATION_STATUS_CONFIG } from '@/constants/driverRegistration';

interface RegistrationProgressBarProps {
  currentStep: number;
  totalSteps: number;
  status?: ApplicationStatus;
  progressPercentage?: number;
  showPercentage?: boolean;
  className?: string;
}

export function RegistrationProgressBar({
  currentStep,
  totalSteps,
  status,
  progressPercentage,
  showPercentage = true,
  className,
}: RegistrationProgressBarProps) {
  // Calculate progress based on current step or explicit percentage
  const calculatedProgress = progressPercentage ?? (currentStep / totalSteps) * 100;
  const progress = Math.min(Math.max(calculatedProgress, 0), 100);

  // Determine color based on status
  const getProgressColor = (): string => {
    if (status) {
      const statusConfig = APPLICATION_STATUS_CONFIG[status];
      if (statusConfig.color === 'green') return 'bg-green-600';
      if (statusConfig.color === 'yellow') return 'bg-yellow-600';
      if (statusConfig.color === 'blue') return 'bg-blue-600';
      if (statusConfig.color === 'red') return 'bg-red-600';
    }
    return 'bg-blue-600'; // Default color
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            getProgressColor()
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Progress text */}
      {showPercentage && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Status label */}
      {status && (
        <div className="mt-1 text-xs text-muted-foreground">
          Status: <span className="font-medium">{APPLICATION_STATUS_CONFIG[status].label}</span>
        </div>
      )}
    </div>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status?: ApplicationStatus;
  showPercentage?: boolean;
  className?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  status,
  showPercentage = true,
  className,
}: CircularProgressProps) {
  const progress = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Determine color based on status
  const getStrokeColor = (): string => {
    if (status) {
      const statusConfig = APPLICATION_STATUS_CONFIG[status];
      if (statusConfig.color === 'green') return '#16a34a'; // green-600
      if (statusConfig.color === 'yellow') return '#ca8a04'; // yellow-600
      if (statusConfig.color === 'blue') return '#2563eb'; // blue-600
      if (statusConfig.color === 'red') return '#dc2626'; // red-600
    }
    return '#2563eb'; // Default blue
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{Math.round(progress)}%</span>
          {status && (
            <span className="text-xs text-muted-foreground mt-1">
              {APPLICATION_STATUS_CONFIG[status].label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface DocumentProgressProps {
  documentsStatus: Record<string, DocumentStatus>;
  requiredDocuments: string[];
  className?: string;
}

export function DocumentProgress({
  documentsStatus,
  requiredDocuments,
  className,
}: DocumentProgressProps) {
  const verifiedCount = Object.values(documentsStatus).filter(
    (status) => status === DocumentStatus.VERIFIED
  ).length;
  const totalCount = requiredDocuments.length;
  const percentage = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Documents Verified</span>
        <span className="font-medium text-foreground">
          {verifiedCount} / {totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            percentage === 100 ? 'bg-green-600' : 'bg-blue-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Document status details */}
      <div className="grid grid-cols-2 gap-1 mt-3">
        {requiredDocuments.map((docType) => {
          const status = documentsStatus[docType] || DocumentStatus.MISSING;
          const statusColor =
            status === DocumentStatus.VERIFIED
              ? 'text-green-600'
              : status === DocumentStatus.PENDING
              ? 'text-yellow-600'
              : status === DocumentStatus.REJECTED
              ? 'text-red-600'
              : 'text-gray-400';

          return (
            <div key={docType} className="flex items-center gap-1 text-xs">
              <span
                className={cn('h-2 w-2 rounded-full flex-shrink-0', {
                  'bg-green-600': status === DocumentStatus.VERIFIED,
                  'bg-yellow-600': status === DocumentStatus.PENDING,
                  'bg-red-600': status === DocumentStatus.REJECTED,
                  'bg-gray-300': status === DocumentStatus.MISSING,
                })}
              />
              <span className={cn('truncate', statusColor)}>
                {docType.replace(/_/g, ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
