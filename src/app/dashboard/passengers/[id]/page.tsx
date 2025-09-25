/**
 * Passenger Detail Page - Individual passenger management interface
 * Following DetailPageLayout pattern from design document
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DetailPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PassengerEditForm } from '@/components/forms/PassengerEditForm';
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
  ChatBubbleLeftEllipsisIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { usePassengerDetails, useUpdatePassengerStatus, useUpdatePassenger } from '@/hooks/api/usePassengerData';
import { usePassengerDocumentManagement, useUploadNationalId } from '@/hooks/api/useDocumentData';
import { documentApi, type Document, type DocumentStatus } from '@/lib/api/documents';

// Type for document overall status including no_documents
type DocumentOverallStatus = DocumentStatus | 'no_documents';
import type { Passenger, PassengerFormData } from '@/types/passenger';
import { useNotificationActions } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { DocumentUploadArea } from '@/components/ui/DocumentUploadArea';
import { DocumentRejectDialog } from '@/components/dialogs/DocumentRejectDialog';

export default function PassengerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passengerId = parseInt(params.id as string);

  // Local state for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rejectDialogDocument, setRejectDialogDocument] = useState<Document | null>(null);

  // Notification actions
  const { success, error } = useNotificationActions();

  // React Query hooks
  const {
    passenger,
    activity,
    rides,
    isLoading,
    hasError,
    passengerError,
    refetchAll
  } = usePassengerDetails(passengerId);

  // Document management hooks
  const {
    latestDocuments,
    isLoading: documentsLoading,
    verifyDocument,
    rejectDocument,
    downloadDocument,
    viewDocument,
    overallStatus: documentOverallStatus,
    isVerifying,
    isRejecting,
    isDownloading,
    isViewing,
  } = usePassengerDocumentManagement(passengerId);

  // Separate upload mutation with proper error handling
  const uploadMutation = useUploadNationalId();

  const updateStatusMutation = useUpdatePassengerStatus();
  const updatePassengerMutation = useUpdatePassenger();

  // Status change handler using mutation
  const handleStatusChange = (newStatus: Passenger['status'], reason?: string) => {
    if (!passenger) return;

    updateStatusMutation.mutate({
      id: passenger.id,
      data: {
        status: newStatus,
        reason,
        adminNotes: reason
      }
    }, {
      onSuccess: () => {
        success(
          'Status Updated',
          `Passenger status changed to ${newStatus}`,
        );
      },
      onError: (err) => {
        error(
          'Status Update Failed',
          err instanceof Error ? err.message : 'Failed to update passenger status',
        );
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

  const handleEditSubmit = async (formData: PassengerFormData) => {
    if (!passenger) return;

    try {
      await updatePassengerMutation.mutateAsync({
        id: passenger.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          district: formData.district,
          city: formData.city,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
        }
      });

      setIsEditModalOpen(false);
      refetchAll(); // Refresh all data

      success(
        'Passenger Updated',
        `Successfully updated ${formData.firstName} ${formData.lastName}`,
      );
    } catch (err) {
      error(
        'Update Failed',
        err instanceof Error ? err.message : 'Failed to update passenger details',
      );
      console.error('Error updating passenger:', err);
    }
  };

  // Document verification handlers
  const handleDocumentVerify = (document: Document, notes?: string) => {
    verifyDocument(document.id, notes);
    success(
      'Document Verified',
      `${documentApi.getDocumentTypeDisplayName(document.documentType)} has been approved`,
    );
  };

  const handleDocumentReject = async (reason: string, notes?: string) => {
    if (!rejectDialogDocument) return;

    rejectDocument(rejectDialogDocument.id, reason, notes);
    success(
      'Document Rejected',
      `${documentApi.getDocumentTypeDisplayName(rejectDialogDocument.documentType)} has been rejected`,
    );
  };

  const openRejectDialog = (document: Document) => {
    setRejectDialogDocument(document);
  };

  const closeRejectDialog = () => {
    setRejectDialogDocument(null);
  };

  const handleDocumentDownload = (document: Document) => {
    downloadDocument(document.id);
    success(
      'Download Started',
      `Downloading ${documentApi.getDocumentTypeDisplayName(document.documentType)}`,
    );
  };

  const handleDocumentView = (document: Document) => {
    viewDocument(document.id);
    success(
      'Document Opened',
      `Opening ${documentApi.getDocumentTypeDisplayName(document.documentType)} in new tab`,
    );
  };

  // Document upload handler
  const handleDocumentUpload = async (file: File, notes?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      uploadMutation.mutate(
        { passengerId, data: { file, notes } },
        {
          onSuccess: () => {
            success(
              'Document Uploaded',
              `National ID document uploaded successfully for ${passenger?.firstName} ${passenger?.lastName}`,
            );
            resolve();
          },
          onError: (err) => {
            console.error('Upload error:', err);
            let errorMessage = 'Failed to upload document';

            // Handle different types of errors
            if (err instanceof Error) {
              errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
              // Handle API error response
              const apiError = err as { response?: { data?: { message?: string } }; message?: string };
              if (apiError.response?.data?.message) {
                errorMessage = apiError.response.data.message;
              } else if (apiError.message) {
                errorMessage = apiError.message;
              }
            }

            error(
              'Upload Failed',
              errorMessage,
            );
            reject(new Error(errorMessage));
          }
        }
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError || !passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasError ? 'Error Loading Passenger' : 'Passenger Not Found'}
        </h1>
        <p className="text-muted-foreground mb-4">
          {passengerError || 'The requested passenger could not be found.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/passengers')}>
            Back to Passengers
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Passengers', href: '/dashboard/passengers' },
    { label: `${passenger.firstName} ${passenger.lastName}`, href: '', current: true }
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
      {passenger.status === 'active' ? (
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
      ) : (
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
      )}
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
              passenger.status === 'active' && 'bg-green-100 text-green-800',
              passenger.status === 'suspended' && 'bg-yellow-100 text-yellow-800',
              passenger.status === 'banned' && 'bg-red-100 text-red-800',
              passenger.status === 'pending' && 'bg-gray-100 text-gray-800'
            )}>
              {passenger.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verification</span>
            {passenger.emailVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Phone Verification</span>
            {passenger.phoneVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Document Verification</span>
            {passenger.documentVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : passenger.documentVerificationStatus === 'rejected' ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </Card>

      {/* Verification Status */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Verification Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Status</span>
            {documentsLoading ? (
              <ClockIcon className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                documentApi.getStatusColorClass(documentOverallStatus as DocumentOverallStatus)
              )}>
                {documentOverallStatus.charAt(0).toUpperCase() + documentOverallStatus.slice(1).replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Email Verified</span>
            {passenger.emailVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClockIcon className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Phone Verified</span>
            {passenger.phoneVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClockIcon className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Documents</span>
            {documentsLoading ? (
              <ClockIcon className="h-4 w-4 text-gray-400 animate-spin" />
            ) : documentOverallStatus === 'verified' ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : documentOverallStatus === 'rejected' ? (
              <XCircleIcon className="h-4 w-4 text-red-500" />
            ) : documentOverallStatus === 'pending' ? (
              <ClockIcon className="h-4 w-4 text-yellow-500" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
            )}
          </div>
          {!documentsLoading && latestDocuments && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {latestDocuments.length} document{latestDocuments.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Rides</span>
            <span className="font-medium">{passenger.totalRides || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <span className="font-medium">MWK {(passenger.totalSpent || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {new Date(passenger.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Activity</span>
            <span className="font-medium">
              {passenger.lastActivity
                ? new Date(passenger.lastActivity).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={`${passenger.firstName} ${passenger.lastName}`}
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
                  <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{passenger.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{passenger.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {passenger.city !== 'Not specified' && passenger.district !== 'Not specified' 
                      ? `${passenger.city}, ${passenger.district}`
                      : 'Location not provided'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {passenger.address !== 'Not provided' ? passenger.address : 'Address not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="font-medium">
                  {passenger.nationalId !== 'Not provided' ? passenger.nationalId : 'National ID not provided'}
                </p>
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
                {passenger.emergencyContact.name !== 'Not provided' 
                  ? passenger.emergencyContact.name 
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">
                {passenger.emergencyContact.phone !== 'Not provided' 
                  ? passenger.emergencyContact.phone 
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium capitalize">
                {passenger.emergencyContact.relationship !== 'Not specified' 
                  ? passenger.emergencyContact.relationship 
                  : 'Not specified'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Document Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DocumentCheckIcon className="h-5 w-5" />
              Document Verification
            </h3>
            <div className="flex items-center gap-2">
              {documentsLoading ? (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <ClockIcon className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : (
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  documentApi.getStatusColorClass(documentOverallStatus as DocumentOverallStatus)
                )}>
                  {documentOverallStatus === 'verified' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                  {documentOverallStatus === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                  {documentOverallStatus === 'rejected' && <XCircleIcon className="h-3 w-3 mr-1" />}
                  {documentOverallStatus === 'no_documents' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                  {documentOverallStatus.charAt(0).toUpperCase() + documentOverallStatus.slice(1).replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Document Types */}
          <div className="space-y-4">
            {documentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : latestDocuments && latestDocuments.length > 0 ? (
              latestDocuments.map((document) => (
                <div key={document.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {documentApi.getDocumentTypeDisplayName(document.documentType)}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>File: {document.originalFileName}</span>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          documentApi.getStatusColorClass(document.status)
                        )}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      {document.documentType === 'national_id' && passenger.nationalId !== 'Not provided' && (
                        <p className="text-sm text-muted-foreground">
                          ID Number: {passenger.nationalId}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentView(document)}
                        disabled={isViewing || isDownloading}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        {isViewing ? 'Opening...' : 'View'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentDownload(document)}
                        disabled={isDownloading}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  {documentApi.canManageDocument(document.status) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleDocumentVerify(document, 'Document approved by admin')}
                        disabled={isVerifying || isRejecting}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        {isVerifying ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => openRejectDialog(document)}
                        disabled={isVerifying || isRejecting}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  )}

                  {/* Document Status Messages */}
                  {document.status === 'rejected' && document.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="font-medium text-red-800 text-sm">Rejection Reason</h5>
                      <p className="text-sm text-red-700 mt-1">{document.rejectionReason}</p>
                      {document.adminNotes && (
                        <p className="text-xs text-red-600 mt-2">Admin Notes: {document.adminNotes}</p>
                      )}
                      <p className="text-xs text-red-600 mt-1">
                        Reviewed on: {document.verifiedAt ? new Date(document.verifiedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  )}

                  {document.status === 'verified' && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="font-medium text-green-800 text-sm">Document Verified</h5>
                      <p className="text-sm text-green-700">This document has been approved.</p>
                      {document.adminNotes && (
                        <p className="text-xs text-green-600 mt-2">Admin Notes: {document.adminNotes}</p>
                      )}
                      <p className="text-xs text-green-600 mt-1">
                        Verified on: {document.verifiedAt ? new Date(document.verifiedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Uploaded</h4>
                <p className="text-sm text-gray-500 mb-4">
                  This passenger has not uploaded any documents yet.
                </p>
              </div>
            )}

            {/* Admin Upload Section */}
            <div className="border-t border-border pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Upload Document (Admin)
                </h4>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Upload a National ID document on behalf of this passenger. This will help verify their identity.
                </div>

                {/* File Upload Area */}
                <DocumentUploadArea
                  onFileSelect={handleDocumentUpload}
                  isUploading={uploadMutation.isPending}
                  uploadError={uploadMutation.error}
                  acceptedTypes="image/*,.pdf"
                  maxSizeInMB={10}
                />
              </div>
            </div>
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
                      {ride.pickupLocation.address} → {ride.dropoffLocation.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {ride.fare.currency} {ride.fare.totalFare.toLocaleString()}
                    </p>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      ride.status === 'ride_completed' && 'bg-green-100 text-green-800',
                      ride.status === 'ride_cancelled' && 'bg-red-100 text-red-800',
                      ride.status === 'pending' && 'bg-gray-100 text-gray-800',
                      (ride.status === 'driver_assigned' || ride.status === 'driver_en_route' || ride.status === 'driver_arrived' || ride.status === 'ride_started') && 'bg-blue-100 text-blue-800'
                    )}>
                      {ride.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                      {item.type.replace('_', ' ')}
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleEditCancel}
          />

          {/* Modal Content */}
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl mx-4 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-background border-b border-border p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Passenger Details</h2>
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
            <div className="p-4">
              <PassengerEditForm
                passenger={passenger}
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                loading={updatePassengerMutation.isPending}
                mode="edit"
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Reject Dialog */}
      {rejectDialogDocument && (
        <DocumentRejectDialog
          document={rejectDialogDocument}
          isOpen={!!rejectDialogDocument}
          onClose={closeRejectDialog}
          onReject={handleDocumentReject}
          isRejecting={isRejecting}
        />
      )}
    </DetailPageLayout>
  );
}