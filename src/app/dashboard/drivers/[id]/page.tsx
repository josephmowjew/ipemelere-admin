/**
 * Driver Detail Page - Individual driver management interface
 * Following DetailPageLayout pattern from design document
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DetailPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DriverEditForm } from '@/components/forms/DriverEditForm';
import { DocumentUploadForm } from '@/components/forms/DocumentUploadForm';
import { DriverDocumentRejectDialog } from '@/components/dialogs/DriverDocumentRejectDialog';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
  DocumentCheckIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useDriverDetails, useUpdateDriverStatus, useUpdateDriver, useApproveDriverDocument, useRejectDriverDocument, useDownloadDriverDocument } from '@/hooks/api/useDriverData';
import { driverAPI, type Driver, type DriverDocument, DriverUpdateData, DriverStatusChangeData } from '@/lib/api/drivers';
import { useVehiclesByDriver } from '@/hooks/api/useVehicleData';
import { VehicleStatusManager } from '@/components/vehicle/VehicleStatusManager';
import { VehicleErrorBoundary } from '@/components/vehicle/VehicleErrorBoundary';
import { type Vehicle } from '@/lib/api/vehicles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = parseInt(params.id as string);

  // Local state for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [rejectDialogDocument, setRejectDialogDocument] = useState<DriverDocument | null>(null);

  // React Query hooks
  const {
    driver,
    activity,
    rides,
    documents,
    analytics,
    isLoading,
    hasError,
    driverError,
    refetchAll
  } = useDriverDetails(driverId);

  // Get vehicles for this driver
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    refetch: refetchVehicles
  } = useVehiclesByDriver(driverId);

  // Create vehicle object from driver's vehicleDetails if available
  const vehicleFromDriverDetails = driver?.vehicleDetails && driver.vehicleDetails.id ? {
    id: Number(driver.vehicleDetails.id),
    make: String(driver.vehicleDetails.make || 'Unknown'),
    model: String(driver.vehicleDetails.model || 'Unknown'),
    year: Number(driver.vehicleDetails.year || new Date().getFullYear()),
    plateNumber: String(driver.vehicleDetails.plateNumber || 'Unknown'),
    status: (driver.vehicleDetails.status as 'active' | 'inactive' | 'maintenance') || 'inactive',
    capacity: Number(driver.vehicleDetails.capacity || 4),
    type: (driver.vehicleDetails.type as 'sedan' | 'hatchback' | 'suv' | 'minibus') || 'sedan',
    color: String(driver.vehicle?.color || 'Not specified'),
    driverId: Number(driver.id), // Ensure this is a number
    createdAt: String(driver.createdAt || new Date().toISOString()),
    updatedAt: String(driver.updatedAt || new Date().toISOString()),
    documentsVerified: Boolean(driver.documentVerificationStatus === 'verified'),
    insuranceExpiryDate: driver.vehicle?.insuranceExpiryDate ? String(driver.vehicle.insuranceExpiryDate) : undefined,
    registrationExpiryDate: driver.vehicle?.registrationExpiryDate ? String(driver.vehicle.registrationExpiryDate) : undefined,
    inspectionExpiryDate: driver.vehicle?.inspectionExpiryDate ? String(driver.vehicle.inspectionExpiryDate) : undefined,
    priority: 'medium' as const, // Add default priority
  } : null;



  const updateStatusMutation = useUpdateDriverStatus();
  const updateDriverMutation = useUpdateDriver();
  const approveDocumentMutation = useApproveDriverDocument();
  const rejectDocumentMutation = useRejectDriverDocument();
  const downloadDocumentMutation = useDownloadDriverDocument();

  // Status change handler
  const handleStatusChange = (newStatus: Driver['status'], reason?: string) => {
    if (!driver) return;

    const data: DriverStatusChangeData = {
      status: newStatus,
      reason: reason || undefined,
    };

    updateStatusMutation.mutate({
      id: driver.id,
      data
    }, {
      onSuccess: () => {
        // Show success toast based on status change
        if (newStatus === 'active') {
          toast.success('Account Activated', {
            description: `${driver.firstName} ${driver.lastName}'s account has been activated successfully.`,
          });
        } else if (newStatus === 'suspended') {
          toast.success('Account Suspended', {
            description: `${driver.firstName} ${driver.lastName}'s account has been suspended.`,
          });
        } else if (newStatus === 'inactive') {
          toast.success('Account Deactivated', {
            description: `${driver.firstName} ${driver.lastName}'s account has been deactivated.`,
          });
        } else {
          toast.success('Status Updated', {
            description: `Driver status changed to ${newStatus}`,
          });
        }
        refetchAll();
      },
      onError: (err) => {
        console.error('Failed to update driver status:', err);
        toast.error('Status Update Failed', {
          description: 'Failed to update driver status. Please try again.',
        });
      }
    });
  };

  // Edit handlers
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (formData: DriverUpdateData) => {
    if (!driver) return;

    try {
      // Map frontend field names to backend expectations
      const updateData: DriverUpdateData = {
        ...formData,
        phone: formData.phoneNumber, // Backend expects 'phone'
      };

      await updateDriverMutation.mutateAsync({
        id: driver.id,
        data: updateData
      });

      setIsEditModalOpen(false);
      refetchAll();
      console.log('Driver updated successfully');
    } catch (err) {
      console.error('Error updating driver:', err);
    }
  };

  // Document action handlers
  const handleDocumentApprove = async (documentId: number, notes?: string) => {
    if (!driver) return;

    try {
      await approveDocumentMutation.mutateAsync({
        driverId: driver.id,
        documentId,
        notes
      });
      console.log('Document approved successfully');
    } catch (err) {
      console.error('Error approving document:', err);
    }
  };

  const handleDocumentReject = async (reason: string, notes?: string) => {
    if (!driver || !rejectDialogDocument) return;

    try {
      await rejectDocumentMutation.mutateAsync({
        driverId: driver.id,
        documentId: rejectDialogDocument.id,
        reason,
        notes
      });
      console.log('Document rejected successfully');
      setRejectDialogDocument(null); // Close dialog
    } catch (err) {
      console.error('Error rejecting document:', err);
      throw err; // Re-throw so dialog can handle error display
    }
  };

  const handleDocumentDownload = async (documentId: number, fileName: string) => {
    if (!driver) return;

    try {
      await downloadDocumentMutation.mutateAsync({
        driverId: driver.id,
        documentId,
        fileName
      });
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDocumentView = async (documentId: number) => {
    if (!driver) return;

    try {
      const blob = await driverAPI.downloadDriverDocument(driver.id, documentId);

      // Create blob URL for viewing
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for viewing
      const newWindow = window.open(url, '_blank');

      // Clean up the URL after a delay to allow the new window to load
      if (newWindow) {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // If popup was blocked, clean up immediately
        window.URL.revokeObjectURL(url);
        console.warn('Popup blocked. Unable to view document.');
      }
    } catch (err) {
      console.error('Error viewing document:', err);
    }
  };

  // Vehicle status update handler
  const handleVehicleStatusUpdate = async (updatedVehicle: Vehicle) => {
    console.log('Vehicle status updated:', updatedVehicle);
    // Refetch vehicles to show updated status
    refetchVehicles();
    // Also refetch driver data to ensure consistency
    refetchAll();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError || !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasError ? 'Error Loading Driver' : 'Driver Not Found'}
        </h1>
        <p className="text-muted-foreground mb-4">
          {driverError || 'The requested driver could not be found.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/drivers')}>
            Back to Drivers
          </Button>
          {hasError && (
            <Button variant="outline" onClick={refetchAll}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Compute verification statuses based on actual document statuses
  const requiredDocumentTypes = ['national_id', 'driver_license', 'profile_picture', 'vehicle_registration', 'vehicle_insurance'];
  const documentStatusMap = new Map<string, string>();

  documents?.forEach(doc => {
    documentStatusMap.set(doc.documentType, doc.status);
  });

  // Document verification: all required documents must be verified
  const documentVerificationStatus = requiredDocumentTypes.every(type =>
    documentStatusMap.get(type) === 'verified'
  ) ? 'verified' : requiredDocumentTypes.some(type =>
    documentStatusMap.get(type) === 'rejected'
  ) ? 'rejected' : 'pending';

  // License verification: specifically check driver_license document
  const licenseVerificationStatus = documentStatusMap.get('driver_license') === 'verified'
    ? 'approved'
    : documentStatusMap.get('driver_license') === 'rejected'
      ? 'rejected'
      : 'pending';

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Drivers', href: '/dashboard/drivers' },
    { label: `${driver.firstName} ${driver.lastName}`, href: '', current: true }
  ];

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditClick}
        disabled={isLoading || hasError}
      >
        <PencilIcon className="h-4 w-4 mr-2" />
        Edit Details
      </Button>
      {driver.status === 'active' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('suspended', 'Administrative action')}
          className="text-yellow-600 hover:text-yellow-700"
          disabled={updateStatusMutation.isPending}
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
          {updateStatusMutation.isPending ? 'Suspending...' : 'Suspend'}
        </Button>
      ) : driver.status === 'suspended' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('active')}
          className="text-green-600 hover:text-green-700"
          disabled={updateStatusMutation.isPending}
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          {updateStatusMutation.isPending ? 'Activating...' : 'Activate'}
        </Button>
      ) : driver.status === 'pending_verification' ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange('active', 'Driver account activated')}
            className="bg-green-600 hover:bg-green-700"
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {updateStatusMutation.isPending ? 'Activating...' : 'Activate Account'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('suspended', 'Driver application rejected')}
            className="text-red-600 hover:text-red-700"
            disabled={updateStatusMutation.isPending}
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  );

  // Sidebar content
  const sidebar = (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Account Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Account Status</span>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              driver.status === 'active' && 'bg-green-100 text-green-800',
              driver.status === 'suspended' && 'bg-yellow-100 text-yellow-800',
              driver.status === 'inactive' && 'bg-gray-100 text-gray-800',
              driver.status === 'pending_verification' && 'bg-yellow-100 text-yellow-800'
            )}>
              {driver.status === 'pending_verification' ? 'Pending Verification' :
               driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verification</span>
            {driver.emailVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Phone Verification</span>
            {driver.phoneVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Document Verification</span>
            {documentVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : documentVerificationStatus === 'rejected' ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">License Status</span>
            {licenseVerificationStatus === 'approved' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : licenseVerificationStatus === 'rejected' ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </Card>

      {/* Performance Stats */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rating</span>
            <span className="font-medium flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
              {driver.performance?.averageRating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Rides</span>
            <span className="font-medium">{driver.performance?.totalRides?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Earnings</span>
            <span className="font-medium">MWK {(analytics?.overview?.totalEarnings || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{analytics?.performance?.completionRate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Acceptance Rate</span>
            <span className="font-medium">{analytics?.performance?.acceptanceRate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">On-Time Rate</span>
            <span className="font-medium">{analytics?.performance?.onTimeRate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Courteous Rating</span>
            <span className="font-medium">{analytics?.performance?.courteousRate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Vehicle Condition</span>
            <span className="font-medium">{analytics?.performance?.vehicleConditionRate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Hours Online</span>
            <span className="font-medium">{analytics?.overview?.hoursOnline || 0} hrs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Avg Ride Distance</span>
            <span className="font-medium">{analytics?.rideMetrics?.averageDistance || 0} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Avg Ride Duration</span>
            <span className="font-medium">{analytics?.rideMetrics?.averageDuration || 0} min</span>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {new Date(driver.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Activity</span>
            <span className="font-medium">
              {driver.lastActivity
                ? new Date(driver.lastActivity).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
          {driver.currentShift && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Shift</span>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                driver.currentShift.status === 'active' && 'bg-green-100 text-green-800',
                driver.currentShift.status === 'break' && 'bg-yellow-100 text-yellow-800',
                driver.currentShift.status === 'offline' && 'bg-gray-100 text-gray-800'
              )}>
                {driver.currentShift.status}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={`${driver.firstName} ${driver.lastName}`}
      breadcrumbs={breadcrumbs}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{driver.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{driver.phoneNumber || driver.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <IdentificationIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">National ID</p>
                  <p className="font-medium">{driver.nationalId || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {driver.city && driver.district
                      ? `${driver.city}, ${driver.district}`
                      : 'Location not provided'
                    }
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {driver.address || 'Address not provided'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{driver.licenseNumber || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">License Expiry</p>
                  <p className="font-medium">
                    {driver.licenseExpiryDate
                      ? new Date(driver.licenseExpiryDate).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {driver.emergencyContact?.name || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">
                {driver.emergencyContact?.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium capitalize">
                {driver.emergencyContact?.relationship || 'Not specified'}
              </p>
            </div>
          </div>
        </Card>

        {/* Vehicle Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Vehicle Information
          </h3>

          <VehicleErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Vehicle section error:', error, errorInfo);
              toast.error('Vehicle Management Error', {
                description: 'There was an error loading vehicle information. Please try refreshing the page.',
              });
            }}
          >
            {vehiclesData?.vehicles && vehiclesData.vehicles.length > 0 ? (
            // Use vehicles from separate API call if available
            <div className="space-y-6">
              {vehiclesData.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-border rounded-lg p-4">
                  {/* Vehicle Header with Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Plate: {vehicle.plateNumber} • Type: {vehicle.type} • Capacity: {vehicle.capacity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <VehicleStatusManager
                        vehicle={vehicle}
                        onStatusUpdate={handleVehicleStatusUpdate}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Vehicle Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle ID</p>
                        <p className="font-medium">#{vehicle.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-medium capitalize">{vehicle.color || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Documents Verified</p>
                        <p className="font-medium">
                          {vehicle.documentsVerified ? (
                            <span className="text-green-600">✓ Verified</span>
                          ) : (
                            <span className="text-yellow-600">⚠ Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                        <p className="font-medium">
                          {vehicle.insuranceExpiryDate
                            ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString()
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Expiry</p>
                        <p className="font-medium">
                          {vehicle.registrationExpiryDate
                            ? new Date(vehicle.registrationExpiryDate).toLocaleDateString()
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inspection Expiry</p>
                        <p className="font-medium">
                          {vehicle.inspectionExpiryDate
                            ? new Date(vehicle.inspectionExpiryDate).toLocaleDateString()
                            : 'Not specified'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Status Management */}
                  <div className="border-t border-border pt-4">
                    <VehicleStatusManager
                      vehicle={vehicle}
                      onStatusUpdate={handleVehicleStatusUpdate}
                      showFullControls={true}
                    />
                  </div>
                </div>
              ))}

              {/* Vehicle Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Vehicles: {vehiclesData.total} •
                    Active: {vehiclesData.active} •
                    Inactive: {vehiclesData.inactive}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchVehicles()}
                    disabled={vehiclesLoading}
                  >
                    {vehiclesLoading ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          ) : vehicleFromDriverDetails ? (
            // Use vehicle from driver's vehicleDetails if available
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-4">
                {/* Vehicle Header with Status */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {vehicleFromDriverDetails.make} {vehicleFromDriverDetails.model} ({vehicleFromDriverDetails.year})
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Plate: {vehicleFromDriverDetails.plateNumber} • Type: {vehicleFromDriverDetails.type} • Capacity: {vehicleFromDriverDetails.capacity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VehicleStatusManager
                      vehicle={vehicleFromDriverDetails}
                      onStatusUpdate={handleVehicleStatusUpdate}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Vehicle Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle ID</p>
                      <p className="font-medium">#{vehicleFromDriverDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium capitalize">{vehicleFromDriverDetails.color || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Documents Verified</p>
                      <p className="font-medium">
                        {vehicleFromDriverDetails.documentsVerified ? (
                          <span className="text-green-600">✓ Verified</span>
                        ) : (
                          <span className="text-yellow-600">⚠ Pending</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                      <p className="font-medium">
                        {vehicleFromDriverDetails.insuranceExpiryDate
                          ? new Date(vehicleFromDriverDetails.insuranceExpiryDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Expiry</p>
                      <p className="font-medium">
                        {vehicleFromDriverDetails.registrationExpiryDate
                          ? new Date(vehicleFromDriverDetails.registrationExpiryDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inspection Expiry</p>
                      <p className="font-medium">
                        {vehicleFromDriverDetails.inspectionExpiryDate
                          ? new Date(vehicleFromDriverDetails.inspectionExpiryDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Status Management */}
                <div className="border-t border-border pt-4">
                  <VehicleStatusManager
                    vehicle={vehicleFromDriverDetails}
                    onStatusUpdate={handleVehicleStatusUpdate}
                    showFullControls={true}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Information</h4>
              <p className="text-sm text-gray-500">
                This driver has not registered a vehicle yet.
              </p>
            </div>
          )}
          </VehicleErrorBoundary>
        </Card>

        {/* Document Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DocumentCheckIcon className="h-5 w-5" />
              Document Verification
            </h3>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          <div className="space-y-4">
            {documents && documents.length > 0 ? (
              documents.map((document) => (
                <div key={document.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {document.documentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Document'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>File: {document.originalFileName}</span>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          document.status === 'verified' && 'bg-green-100 text-green-800',
                          document.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                          document.status === 'rejected' && 'bg-red-100 text-red-800'
                        )}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentView(document.id)}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentDownload(document.id, document.originalFileName)}
                        disabled={downloadDocumentMutation.isPending}
                        className="min-w-[110px]"
                      >
                        {downloadDocumentMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {document.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                        onClick={() => handleDocumentApprove(document.id, 'Document approved by admin')}
                        disabled={approveDocumentMutation.isPending || rejectDocumentMutation.isPending}
                      >
                        {approveDocumentMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectDialogDocument(document)}
                        disabled={approveDocumentMutation.isPending || rejectDocumentMutation.isPending}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {document.status === 'rejected' && document.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="font-medium text-red-800 text-sm">Rejection Reason</h5>
                      <p className="text-sm text-red-700 mt-1">{document.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h4>
                <p className="text-sm text-gray-500">
                  This driver has not uploaded any documents yet.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Rides */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Rides</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>

          {!rides?.data || rides.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rides found</p>
          ) : (
            <div className="space-y-4">
              {rides.data.slice(0, 5).map((ride) => (
                <div key={ride.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Ride #{ride.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {ride.pickupLocation?.address || 'Unknown pickup'} → {ride.dropoffLocation?.address || 'Unknown destination'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      MWK {(ride.fare || 0).toLocaleString()}
                    </p>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      ride.status === 'completed' && 'bg-green-100 text-green-800',
                      ride.status === 'cancelled' && 'bg-red-100 text-red-800',
                      ride.status === 'pending' && 'bg-gray-100 text-gray-800',
                      ride.status === 'accepted' && 'bg-blue-100 text-blue-800',
                      ride.status === 'in_progress' && 'bg-blue-100 text-blue-800'
                    )}>
                      {ride.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {!activity || activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border-l-4 border-blue-200 bg-blue-50/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.type?.replace('_', ' ') || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleEditCancel}
          />

          {/* Modal Content */}
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl mx-4 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Driver Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditCancel}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 bg-white dark:bg-gray-900">
              <DriverEditForm
                driver={driver}
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                loading={updateDriverMutation.isPending}
                mode="edit"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsUploadModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl mx-4 overflow-y-auto">
            <DocumentUploadForm
              driverId={driverId}
              existingDocuments={documents || []}
              onUploadSuccess={(document) => {
                console.log('Document uploaded:', document);
                setIsUploadModalOpen(false);
                refetchAll(); // Refresh the driver data to show new document
              }}
              onCancel={() => setIsUploadModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Document Reject Dialog */}
      <DriverDocumentRejectDialog
        document={rejectDialogDocument}
        isOpen={!!rejectDialogDocument}
        onClose={() => setRejectDialogDocument(null)}
        onReject={handleDocumentReject}
        isRejecting={rejectDocumentMutation.isPending}
      />
    </DetailPageLayout>
  );
}