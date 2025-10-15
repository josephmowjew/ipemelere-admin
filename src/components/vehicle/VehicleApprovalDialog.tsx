/**
 * Vehicle Approval Dialog Component
 * Handles vehicle approval/rejection with detailed information view
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  TruckIcon,
  UserIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useVehicleApprovalMutations } from '@/hooks/api/useDashboardData';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PendingVehicleItem } from '@/types/dashboard';

interface VehicleApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: PendingVehicleItem | null;
}

type ApprovalAction = 'approve' | 'reject' | null;

export const VehicleApprovalDialog: React.FC<VehicleApprovalDialogProps> = ({
  open,
  onOpenChange,
  vehicle,
}) => {
  const [action, setAction] = useState<ApprovalAction>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const { approveVehicle, rejectVehicle } = useVehicleApprovalMutations();

  const isSubmitting = approveVehicle.isPending || rejectVehicle.isPending;

  const resetForm = () => {
    setAction(null);
    setReason('');
    setNotes('');
  };

  const handleClose = useCallback(() => {
    if (!approveVehicle.isPending && !rejectVehicle.isPending) {
      resetForm();
      onOpenChange(false);
    }
  }, [approveVehicle.isPending, rejectVehicle.isPending, onOpenChange]);

  // Success effects
  useEffect(() => {
    if (approveVehicle.isSuccess) {
      toast.success('Vehicle Approved!', {
        description: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model} has been approved and is now active.`,
      });
      handleClose();
    }
  }, [approveVehicle.isSuccess, vehicle, handleClose]);

  useEffect(() => {
    if (rejectVehicle.isSuccess) {
      toast.success('Vehicle Rejected', {
        description: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model} registration has been rejected.`,
      });
      handleClose();
    }
  }, [rejectVehicle.isSuccess, vehicle, handleClose]);

  // Error effects
  useEffect(() => {
    if (approveVehicle.isError) {
      toast.error('Approval Failed', {
        description: approveVehicle.error?.message || 'Failed to approve vehicle. Please try again.',
      });
    }
  }, [approveVehicle.isError, approveVehicle.error]);

  useEffect(() => {
    if (rejectVehicle.isError) {
      toast.error('Rejection Failed', {
        description: rejectVehicle.error?.message || 'Failed to reject vehicle. Please try again.',
      });
    }
  }, [rejectVehicle.isError, rejectVehicle.error]);

  const handleApprove = () => {
    if (!vehicle) return;

    approveVehicle.mutate({
      vehicleId: vehicle.id,
      notes: notes || undefined,
    });
  };

  const handleReject = () => {
    if (!vehicle || !reason.trim()) {
      toast.error('Reason Required', {
        description: 'Please provide a reason for rejection.',
      });
      return;
    }

    rejectVehicle.mutate({
      vehicleId: vehicle.id,
      reason: reason.trim(),
      notes: notes || undefined,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Vehicle Review: {vehicle.year} {vehicle.make} {vehicle.model}
          </DialogTitle>
          <DialogDescription>
            Review vehicle details and documents to approve or reject this vehicle registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TruckIcon className="h-5 w-5" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600">Vehicle Details</Label>
                <p className="mt-1">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600 font-mono">{vehicle.plateNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status & Priority</Label>
                <div className="flex items-center gap-2 mt-1">
                  <VehicleStatusBadge
                    status="inactive" // Backend status for pending vehicles
                    size="sm"
                    hasRejectionReason={false}
                  />
                  <PriorityBadge priority={vehicle.priority} size="sm" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Submission Date</Label>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(vehicle.submissionDate)}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Days Pending</Label>
                <div className="flex items-center gap-1 mt-1">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className={cn(
                    vehicle.daysPending > 7 ? 'text-red-600 font-semibold' : 'text-gray-900'
                  )}>
                    {vehicle.daysPending} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {vehicle.driverName && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Driver Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="mt-1">{vehicle.driverName}</p>
                </div>
                {vehicle.driverPhone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="mt-1">{vehicle.driverPhone}</p>
                  </div>
                )}
                {vehicle.driverEmail && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="mt-1">{vehicle.driverEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DocumentIcon className="h-5 w-5" />
              Documents Status
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {vehicle.documentsComplete ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">All Documents Complete</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-600">Documents Missing</span>
                  </>
                )}
              </div>

              {vehicle.documents && (
                <div className="space-y-2">
                  {Object.entries(vehicle.documents).map(([docType, doc]) => {
                    if (!doc) return null;
                    const isVerified = doc.status === 'verified';
                    return (
                      <div key={docType} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium capitalize">
                          {docType.replace('Document', '')}
                        </span>
                        <Badge variant={isVerified ? 'default' : 'destructive'} className="text-xs">
                          {doc.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Approval Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Review Action</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant={action === 'approve' ? 'default' : 'outline'}
                className={cn(
                  'h-auto p-4 flex flex-col items-center gap-2',
                  action === 'approve' && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={() => setAction('approve')}
                disabled={isSubmitting}
              >
                <CheckCircleIcon className="h-6 w-6" />
                <span className="font-semibold">Approve</span>
                <span className="text-xs opacity-80">Vehicle is ready for service</span>
              </Button>

              <Button
                variant={action === 'reject' ? 'destructive' : 'outline'}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setAction('reject')}
                disabled={isSubmitting}
              >
                <XCircleIcon className="h-6 w-6" />
                <span className="font-semibold">Reject</span>
                <span className="text-xs opacity-80">Vehicle does not meet requirements</span>
              </Button>
            </div>

            {action === 'reject' && (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Label htmlFor="rejection-reason" className="text-sm font-medium text-red-800">
                  Rejection Reason <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="border-red-200 focus:border-red-400 focus:ring-red-400"
                />
              </div>
            )}

            {action && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes for the driver or internal records..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={approveVehicle.isPending || rejectVehicle.isPending}>
            Cancel
          </Button>
          {action === 'approve' && (
            <Button
              onClick={handleApprove}
              disabled={approveVehicle.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveVehicle.isPending ? 'Approving...' : 'Approve Vehicle'}
            </Button>
          )}
          {action === 'reject' && (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectVehicle.isPending || !reason.trim()}
            >
              {rejectVehicle.isPending ? 'Rejecting...' : 'Reject Vehicle'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};