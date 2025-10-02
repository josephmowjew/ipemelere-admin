/**
 * Registration Status Tracker Component
 * Visual timeline showing registration progress through various stages
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  XCircleIcon as XCircleIconSolid,
} from '@heroicons/react/24/solid';
import type { ApplicationStatus, VerificationStatusResponse } from '@/types/registration';

interface StatusStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  icon: React.ComponentType<{ className?: string }>;
}

interface RegistrationStatusTrackerProps {
  applicationStatus?: ApplicationStatus;
  verificationStatus?: VerificationStatusResponse;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  documentsVerified?: boolean;
  className?: string;
}

export function RegistrationStatusTracker({
  applicationStatus,
  verificationStatus,
  emailVerified = false,
  phoneVerified = false,
  documentsVerified = false,
  className,
}: RegistrationStatusTrackerProps) {
  // Build status steps based on current state
  const steps: StatusStep[] = [
    {
      id: 'registration',
      label: 'Registration',
      description: 'Basic information submitted',
      status: 'completed',
      icon: UserIcon,
    },
    {
      id: 'email',
      label: 'Email Verification',
      description: verificationStatus?.emailVerified || emailVerified ? 'Email verified' : 'Verify your email address',
      status: verificationStatus?.emailVerified || emailVerified ? 'completed' : 'current',
      icon: EnvelopeIcon,
    },
    {
      id: 'phone',
      label: 'Phone Verification',
      description: verificationStatus?.phoneVerified || phoneVerified ? 'Phone verified' : 'Verify your phone number',
      status: verificationStatus?.phoneVerified || phoneVerified ? 'completed' :
             (verificationStatus?.emailVerified || emailVerified) ? 'current' : 'pending',
      icon: PhoneIcon,
    },
    {
      id: 'documents',
      label: 'Document Upload',
      description: verificationStatus?.documentsVerified || documentsVerified
        ? 'Documents verified'
        : 'Upload required documents',
      status: verificationStatus?.documentsVerified || documentsVerified ? 'completed' :
             ((verificationStatus?.phoneVerified || phoneVerified) && (verificationStatus?.emailVerified || emailVerified))
             ? 'current' : 'pending',
      icon: DocumentCheckIcon,
    },
    {
      id: 'review',
      label: 'Admin Review',
      description: getReviewDescription(applicationStatus),
      status: getReviewStatus(applicationStatus, verificationStatus?.documentsVerified || documentsVerified),
      icon: ClockIcon,
    },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-5 top-12 bottom-0 w-0.5 -mb-4',
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                )}
              />
            )}

            {/* Step content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  {
                    'bg-green-100 border-green-600 text-green-600': step.status === 'completed',
                    'bg-blue-100 border-blue-600 text-blue-600': step.status === 'current',
                    'bg-gray-100 border-gray-300 text-gray-400': step.status === 'pending',
                    'bg-red-100 border-red-600 text-red-600': step.status === 'rejected',
                  }
                )}
              >
                {step.status === 'completed' ? (
                  <CheckCircleIconSolid className="h-6 w-6" />
                ) : step.status === 'current' ? (
                  <ClockIconSolid className="h-6 w-6" />
                ) : step.status === 'rejected' ? (
                  <XCircleIconSolid className="h-6 w-6" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h4
                  className={cn('text-sm font-semibold', {
                    'text-foreground': step.status === 'completed' || step.status === 'current',
                    'text-muted-foreground': step.status === 'pending',
                    'text-red-600': step.status === 'rejected',
                  })}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>

                {/* Status badge */}
                <div className="mt-2">
                  {step.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                  {step.status === 'current' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <ClockIcon className="h-3 w-3" />
                      In Progress
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Pending
                    </span>
                  )}
                  {step.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-3 w-3" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next steps */}
      {verificationStatus?.nextSteps && verificationStatus.nextSteps.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Next Steps</h4>
          <ul className="space-y-1">
            {verificationStatus.nextSteps.map((step, index) => (
              <li key={index} className="text-xs text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getReviewDescription(status?: ApplicationStatus): string {
  if (!status) return 'Waiting for document verification';

  switch (status) {
    case 'pending_documents':
      return 'Waiting for documents';
    case 'documents_rejected':
      return 'Documents need revision';
    case 'under_review':
      return 'Admin is reviewing your application';
    case 'pending_approval':
      return 'Final approval pending';
    case 'approved':
      return 'Application approved!';
    case 'rejected':
      return 'Application rejected';
    default:
      return 'Waiting for review';
  }
}

function getReviewStatus(
  status?: ApplicationStatus,
  documentsVerified?: boolean
): StatusStep['status'] {
  if (!status) {
    return documentsVerified ? 'current' : 'pending';
  }

  switch (status) {
    case 'approved':
      return 'completed';
    case 'rejected':
    case 'documents_rejected':
      return 'rejected';
    case 'under_review':
    case 'pending_approval':
      return 'current';
    default:
      return 'pending';
  }
}

interface CompactStatusTrackerProps {
  completedSteps: string[];
  pendingSteps: string[];
  className?: string;
}

export function CompactStatusTracker({
  completedSteps,
  pendingSteps,
  className,
}: CompactStatusTrackerProps) {
  const totalSteps = completedSteps.length + pendingSteps.length;
  const progress = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{completedSteps.length} completed</span>
        <span>{pendingSteps.length} remaining</span>
      </div>

      {/* Completed steps */}
      {completedSteps.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-semibold text-green-700">Completed</h5>
          {completedSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircleIcon className="h-3 w-3 flex-shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending steps */}
      {pendingSteps.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-semibold text-muted-foreground">Pending</h5>
          {pendingSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ClockIcon className="h-3 w-3 flex-shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
