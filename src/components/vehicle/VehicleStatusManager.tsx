/**
 * Vehicle Status Manager Component
 * Provides UI controls for managing vehicle status with confirmation dialogs
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircleIcon,
  XCircleIcon,
  WrenchIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUpdateVehicleStatus, useCheckVehicleStatus } from '@/hooks/api/useVehicleData';
import { vehicleAPI, vehicleStatusUtils, type Vehicle } from '@/lib/api/vehicles';
import { useVehicleErrorHandler } from '@/components/vehicle/VehicleErrorBoundary';
import { cn } from '@/lib/utils';

interface VehicleStatusManagerProps {
  vehicle: Vehicle;
  onStatusUpdate?: (updatedVehicle: Vehicle) => void;
  showFullControls?: boolean;
  compact?: boolean;
}

export function VehicleStatusManager({
  vehicle,
  onStatusUpdate,
  showFullControls = true,
  compact = false
}: VehicleStatusManagerProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Vehicle['status'] | null>(null);
  const [reason, setReason] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const { handleError, isNetworkError, isAuthError, isValidationError } = useVehicleErrorHandler();
  const updateStatusMutation = useUpdateVehicleStatus();
  const checkStatusMutation = useCheckVehicleStatus();

  const handleStatusChange = (status: Vehicle['status']) => {
    setSelectedStatus(status);
    setReason('');
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus) return;

    setOperationError(null);

    try {
      await updateStatusMutation.mutateAsync({
        vehicleId: vehicle.id,
        data: {
          status: selectedStatus,
          reason: reason || `Status changed to ${selectedStatus}`
        }
      });

      setStatusDialogOpen(false);
      setSelectedStatus(null);
      setReason('');

      // Call the optional callback with updated vehicle status
      if (onStatusUpdate) {
        try {
          // First try to get fresh data from API
          const updatedVehicleResponse = await vehicleAPI.getVehicle(vehicle.id);
          onStatusUpdate(updatedVehicleResponse.data);
        } catch (fetchError) {
          console.error('Failed to fetch updated vehicle data:', fetchError);
          // Create a temporary updated vehicle object with the new status
          const updatedVehicle = {
            ...vehicle,
            status: selectedStatus,
            updatedAt: new Date().toISOString()
          };
          onStatusUpdate(updatedVehicle);
        }
      }
    } catch (error) {
      const errorMessage = handleError(error, 'status update');
      setOperationError(errorMessage);
    }
  };

  const handleAutomaticStatusCheck = async () => {
    setIsCheckingStatus(true);
    setOperationError(null);

    try {
      await checkStatusMutation.mutateAsync(vehicle.id);

      // Call the optional callback after successful check
      if (onStatusUpdate) {
        try {
          const updatedVehicleResponse = await vehicleAPI.getVehicle(vehicle.id);
          onStatusUpdate(updatedVehicleResponse.data);
        } catch (fetchError) {
          console.error('Failed to fetch updated vehicle data:', fetchError);
          // For automatic status check, we don't know the new status, so just refresh the page data
          // The callback will handle refreshing the component
        }
      }
    } catch (error) {
      const errorMessage = handleError(error, 'status check');
      setOperationError(errorMessage);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    const icons = {
      active: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      inactive: <ClockIcon className="h-5 w-5 text-yellow-500" />,
      maintenance: <WrenchIcon className="h-5 w-5 text-orange-500" />
    };
    return icons[status] || <ClockIcon className="h-5 w-5 text-gray-500" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={vehicleStatusUtils.getStatusColorClass(vehicle.status)}>
          <div className="flex items-center gap-1">
            {getStatusIcon(vehicle.status)}
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </div>
        </Badge>
        {showFullControls && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('active')}
            disabled={vehicle.status === 'active' || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheckIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className={cn("p-4", compact && "p-2")}>
        {/* Error Display */}
        {operationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Operation Failed</p>
                <p className="text-sm text-red-700 mt-1">{operationError}</p>
                {isNetworkError(operationError) && (
                  <p className="text-xs text-red-600 mt-2">
                    Please check your internet connection and try again.
                  </p>
                )}
                {isAuthError(operationError) && (
                  <p className="text-xs text-red-600 mt-2">
                    You may need to refresh your session or log in again.
                  </p>
                )}
                {isValidationError(operationError) && (
                  <p className="text-xs text-red-600 mt-2">
                    Please check your input and try again.
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOperationError(null)}
                className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(vehicle.status)}
            <div>
              <h3 className="font-semibold">Vehicle Status</h3>
              <p className="text-sm text-muted-foreground">
                {vehicleStatusUtils.getStatusDescription(vehicle.status)}
              </p>
            </div>
          </div>
          <Badge className={vehicleStatusUtils.getStatusColorClass(vehicle.status)}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </Badge>
        </div>

        {showFullControls && (
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {vehicle.status !== 'active' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                  disabled={updateStatusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Activate Vehicle
                </Button>
              )}

              {vehicle.status !== 'inactive' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('inactive')}
                  disabled={updateStatusMutation.isPending}
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              )}

              {vehicle.status !== 'maintenance' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('maintenance')}
                  disabled={updateStatusMutation.isPending}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <WrenchIcon className="h-4 w-4 mr-2" />
                  Maintenance
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleAutomaticStatusCheck}
                disabled={isCheckingStatus || checkStatusMutation.isPending}
              >
                {isCheckingStatus || checkStatusMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Auto Check
                  </>
                )}
              </Button>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Vehicle ID</p>
                <p className="font-medium">#{vehicle.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(vehicle.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Documents Verified</p>
                <p className="font-medium">
                  {vehicle.documentsVerified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Driver ID</p>
                <p className="font-medium">
                  {vehicle.driverId ? `#${vehicle.driverId}` : 'Not assigned'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                Change Vehicle Status to {selectedStatus ? (selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)) : '...'}?
              </AlertDialogTitle>
            <AlertDialogDescription>
              This will change the vehicle status from <strong>{vehicle?.status}</strong> to{' '}
              <strong>{selectedStatus}</strong>. {selectedStatus === 'active' && 'The vehicle will be available for rides.'}
              {selectedStatus === 'inactive' && 'The vehicle will be temporarily unavailable for rides.'}
              {selectedStatus === 'maintenance' && 'The vehicle will be marked as under maintenance and unavailable for rides.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter a reason for this status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={updateStatusMutation.isPending || !selectedStatus}
              className={cn(
                selectedStatus === 'active' && 'bg-green-600 hover:bg-green-700',
                selectedStatus === 'inactive' && 'bg-yellow-600 hover:bg-yellow-700',
                selectedStatus === 'maintenance' && 'bg-orange-600 hover:bg-orange-700'
              )}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Confirm Status Change
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}