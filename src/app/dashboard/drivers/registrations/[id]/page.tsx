/**
 * Driver Registration Detail/Review Page
 * Detailed view of a single registration application for admin review
 */

'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailPageLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useRegistrationApplication,
  useApproveApplication,
  useRejectApplication,
  useRequestChanges,
} from '@/hooks/api/useDriverData';
import { RegistrationStatusTracker } from '@/components/registration/RegistrationStatusTracker';
import { APPLICATION_STATUS_CONFIG } from '@/constants/driverRegistration';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { ApplicationStatus } from '@/types/registration';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RegistrationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const applicationId = parseInt(resolvedParams.id);
  const router = useRouter();
  const [actionNotes, setActionNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);

  const { data: application, isLoading } = useRegistrationApplication(applicationId);
  const approveApplication = useApproveApplication();
  const rejectApplication = useRejectApplication();
  const requestChanges = useRequestChanges();

  const handleApprove = async (): Promise<void> => {
    try {
      await approveApplication.mutateAsync({
        applicationId,
        notes: actionNotes || undefined,
      });
      toast.success('Application Approved', {
        description: `${application?.firstName} ${application?.lastName}'s application has been approved successfully.`,
      });
      setTimeout(() => {
        router.push('/dashboard/drivers/registrations');
      }, 1000);
    } catch (error) {
      console.error('Failed to approve application:', error);
      toast.error('Approval Failed', {
        description: 'Failed to approve application. Please try again.',
      });
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!actionNotes.trim()) {
      toast.error('Rejection Reason Required', {
        description: 'Please provide a reason for rejection',
      });
      return;
    }

    try {
      await rejectApplication.mutateAsync({
        applicationId,
        reason: actionNotes,
      });
      toast.success('Application Rejected', {
        description: `${application?.firstName} ${application?.lastName}'s application has been rejected.`,
      });
      setTimeout(() => {
        router.push('/dashboard/drivers/registrations');
      }, 1000);
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast.error('Rejection Failed', {
        description: 'Failed to reject application. Please try again.',
      });
    }
  };

  const handleRequestChanges = async (): Promise<void> => {
    if (!actionNotes.trim()) {
      toast.error('Changes Required', {
        description: 'Please provide details about required changes',
      });
      return;
    }

    try {
      await requestChanges.mutateAsync({
        applicationId,
        changes: actionNotes,
      });
      toast.success('Changes Requested', {
        description: 'Driver has been notified about the required changes.',
      });
      setShowChangesDialog(false);
      setActionNotes('');
    } catch (error) {
      console.error('Failed to request changes:', error);
      toast.error('Request Failed', {
        description: 'Failed to request changes. Please try again.',
      });
    }
  };

  const getStatusBadge = (status: ApplicationStatus): React.ReactElement => {
    const config = APPLICATION_STATUS_CONFIG[status];

    // Handle undefined config (unknown status)
    if (!config) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          {status}
        </Badge>
      );
    }

    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge variant="outline" className={colorClasses[config.color]}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <DetailPageLayout
        title="Application Not Found"
        backUrl="/dashboard/drivers/registrations"
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">Application not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout
      title={`${application.firstName} ${application.lastName}`}
      subtitle={`Driver ID: ${application.id}`}
      backUrl="/dashboard/drivers/registrations"
      headerAction={
        application.applicationStatus ? getStatusBadge(application.applicationStatus as ApplicationStatus) : undefined
      }
    >
      <div className="space-y-6">

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Application Details */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Full Name" value={`${application.firstName} ${application.lastName}`} />
              <DetailRow label="Email" value={application.email} verified={application.emailVerificationStatus === 'verified'} />
              <DetailRow label="Phone" value={application.phone || application.phoneNumber || 'N/A'} verified={application.phoneVerificationStatus === 'verified'} />
              <DetailRow label="National ID" value={application.nationalId || 'N/A'} />
              <DetailRow label="District" value={application.district} />
            </CardContent>
          </Card>

          {/* Address Information */}
          {(application.city || application.address) && (
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.city && <DetailRow label="City" value={application.city} />}
                {application.address && <DetailRow label="Address" value={application.address} />}
              </CardContent>
            </Card>
          )}

          {/* Driver Information */}
          {application.licenseNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="License Number" value={application.licenseNumber} />
                {application.licenseExpiryDate && (
                  <DetailRow
                    label="License Expiry Date"
                    value={formatDate(new Date(application.licenseExpiryDate))}
                  />
                )}
                {application.drivingExperience && (
                  <DetailRow label="Driving Experience" value={`${application.drivingExperience} years`} />
                )}
                {application.licenseVerificationStatus && (
                  <DetailRow label="License Status" value={application.licenseVerificationStatus} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Vehicle Information */}
          {(application.vehicleDetails || application.vehicle) && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.vehicleDetails && (
                  <>
                    <DetailRow label="Make" value={application.vehicleDetails.make} />
                    <DetailRow label="Model" value={application.vehicleDetails.model} />
                    <DetailRow label="Year" value={application.vehicleDetails.year.toString()} />
                    <DetailRow label="Plate Number" value={application.vehicleDetails.plateNumber} />
                    {application.vehicleDetails.color && <DetailRow label="Color" value={application.vehicleDetails.color} />}
                    {application.vehicleDetails.type && <DetailRow label="Type" value={application.vehicleDetails.type} />}
                  </>
                )}
                {!application.vehicleDetails && application.vehicle && (
                  <>
                    <DetailRow label="Make" value={application.vehicle.make} />
                    <DetailRow label="Model" value={application.vehicle.model} />
                    <DetailRow label="Year" value={application.vehicle.year.toString()} />
                    <DetailRow label="Plate Number" value={application.vehicle.plateNumber} />
                    <DetailRow label="Color" value={application.vehicle.color} />
                    <DetailRow label="Type" value={application.vehicle.type} />
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {application.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Name" value={application.emergencyContact.name} />
                <DetailRow label="Phone" value={application.emergencyContact.phone} />
                <DetailRow label="Relationship" value={application.emergencyContact.relationship} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Progress</CardTitle>
              <CardDescription>Current status and next steps</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationStatusTracker
                applicationStatus={application.applicationStatus as ApplicationStatus}
                emailVerified={application.emailVerificationStatus === 'verified'}
                phoneVerified={application.phoneVerificationStatus === 'verified'}
                documentsVerified={application.documentVerificationStatus === 'verified'}
              />
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div>
                  <p className="text-sm font-medium">Application Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(application.createdAt))} •{' '}
                    {formatDate(new Date(application.createdAt))}
                  </p>
                </div>
              </div>
              {application.updatedAt !== application.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-600 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(application.updatedAt))} •{' '}
                      {formatDate(new Date(application.updatedAt))}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {application.applicationStatus !== 'approved' && application.applicationStatus !== 'rejected' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Review and take action on this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Action Buttons */}
                <div className="space-y-2">
                  {!showApproveDialog && !showRejectDialog && !showChangesDialog && (
                    <>
                      <Button
                        onClick={() => setShowApproveDialog(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={approveApplication.isPending}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        onClick={() => setShowRejectDialog(true)}
                        variant="destructive"
                        className="w-full"
                        disabled={rejectApplication.isPending}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                      <Button
                        onClick={() => setShowChangesDialog(true)}
                        variant="outline"
                        className="w-full"
                        disabled={requestChanges.isPending}
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Request Changes
                      </Button>
                    </>
                  )}

                  {/* Approve Dialog */}
                  {showApproveDialog && (
                    <div className="space-y-3 p-4 border border-green-200 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Approve Application</h4>
                      <div className="space-y-2">
                        <Label htmlFor="approve-notes">Notes (optional)</Label>
                        <Textarea
                          id="approve-notes"
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Add any notes about this approval..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={approveApplication.isPending}
                        >
                          {approveApplication.isPending ? 'Approving...' : 'Confirm Approval'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowApproveDialog(false);
                            setActionNotes('');
                          }}
                          variant="outline"
                          disabled={approveApplication.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reject Dialog */}
                  {showRejectDialog && (
                    <div className="space-y-3 p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-900">Reject Application</h4>
                      <div className="space-y-2">
                        <Label htmlFor="reject-reason">
                          Reason <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                          id="reject-reason"
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Explain why this application is being rejected..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReject}
                          variant="destructive"
                          className="flex-1"
                          disabled={rejectApplication.isPending}
                        >
                          {rejectApplication.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowRejectDialog(false);
                            setActionNotes('');
                          }}
                          variant="outline"
                          disabled={rejectApplication.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Request Changes Dialog */}
                  {showChangesDialog && (
                    <div className="space-y-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Request Changes</h4>
                      <div className="space-y-2">
                        <Label htmlFor="changes-detail">
                          Required Changes <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                          id="changes-detail"
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Describe what changes are needed..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleRequestChanges}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          disabled={requestChanges.isPending}
                        >
                          {requestChanges.isPending ? 'Sending...' : 'Send Request'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowChangesDialog(false);
                            setActionNotes('');
                          }}
                          variant="outline"
                          disabled={requestChanges.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </DetailPageLayout>
  );
}

// Helper component for displaying detail rows
function DetailRow({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-right">{value}</span>
        {verified && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            ✓ Verified
          </Badge>
        )}
      </div>
    </div>
  );
}
