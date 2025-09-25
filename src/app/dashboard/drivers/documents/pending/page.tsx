/**
 * Pending Documents Review Page - Admin interface for reviewing driver documents
 * Allows bulk review of all pending driver documents across the platform
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DocumentCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { usePendingDriverDocuments } from '@/hooks/api/useDriverData';
import { useReviewDriverDocument } from '@/hooks/api/useDriverData';
import { DriverDocumentRejectDialog } from '@/components/dialogs/DriverDocumentRejectDialog';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'national_id': 'National ID',
  'driver_license': 'Driver License',
  'vehicle_registration': 'Vehicle Registration',
  'vehicle_insurance': 'Vehicle Insurance',
  'profile_picture': 'Profile Picture'
};

export default function PendingDocumentsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    driverId: number;
    documentId: number;
    documentType: string;
  }>({ isOpen: false, driverId: 0, documentId: 0, documentType: '' });

  // React Query hooks
  const { data, isLoading, error } = usePendingDriverDocuments({
    page: currentPage,
    limit: 20
  });
  const reviewMutation = useReviewDriverDocument();

  const pendingDocs = data?.data || [];
  const pagination = data?.pagination || {
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false
  };

  // Handle document approval
  const handleApprove = async (driverId: number, documentId: number) => {
    await reviewMutation.mutateAsync({
      driverId,
      documentId,
      data: { status: 'verified' }
    });
  };

  // Handle document rejection
  const handleReject = (driverId: number, documentId: number, documentType: string) => {
    setRejectDialog({
      isOpen: true,
      driverId,
      documentId,
      documentType
    });
  };

  // Handle document view
  const handleView = (driverId: number, documentId: number) => {
    router.push(`/dashboard/drivers/${driverId}?tab=documents&highlight=${documentId}`);
  };

  // Handle driver profile view
  const handleViewDriver = (driverId: number) => {
    router.push(`/dashboard/drivers/${driverId}`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Drivers', href: '/dashboard/drivers' },
    { label: 'Pending Documents', href: '/dashboard/drivers/documents/pending', current: true }
  ];

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => router.push('/dashboard/drivers')}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Drivers
      </Button>
    </div>
  );

  return (
    <>
      <ListPageLayout
        title="Pending Document Reviews"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        {/* Summary Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Documents Pending Review</p>
              <p className="text-2xl font-bold">{pagination.total.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Driver</th>
                  <th className="text-left p-4 font-medium">Document</th>
                  <th className="text-left p-4 font-medium">Upload Date</th>
                  <th className="text-left p-4 font-medium">File Info</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="border-b border-border">
                      {Array.from({ length: 5 }).map((_, cellIndex) => (
                        <td key={cellIndex} className="p-4">
                          <div className="h-4 bg-accent rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-red-600">
                      Error loading pending documents: {error.message}
                    </td>
                  </tr>
                ) : pendingDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No pending documents found. All documents have been reviewed!
                    </td>
                  </tr>
                ) : (
                  pendingDocs.map((item) => {
                    const { driver, document } = item;
                    return (
                      <tr key={`${driver.id}-${document.id}`} className="border-b border-border hover:bg-accent/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                              <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
                              <p className="text-sm text-muted-foreground">{driver.district}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
                            </p>
                            <p className="text-sm text-muted-foreground">{document.originalFileName}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Review
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(document.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(document.fileSize / 1024)}KB
                          </p>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">{document.mimeType}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {(document.fileSize / (1024 * 1024)).toFixed(2)}MB
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(driver.id, document.id)}
                              title="View document"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(driver.id, document.id)}
                              className="text-green-600 hover:text-green-700"
                              disabled={reviewMutation.isPending}
                              title="Approve document"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(
                                driver.id,
                                document.id,
                                DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType
                              )}
                              className="text-red-600 hover:text-red-700"
                              disabled={reviewMutation.isPending}
                              title="Reject document"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDriver(driver.id)}
                              title="View driver profile"
                            >
                              <UserIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} documents
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev_page}
                  onClick={() => setCurrentPage(pagination.current_page - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next_page}
                  onClick={() => setCurrentPage(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </ListPageLayout>

      {/* Reject Dialog */}
      <DriverDocumentRejectDialog
        document={null} // TODO: Pass actual document
        isOpen={rejectDialog.isOpen}
        onClose={() => setRejectDialog({ ...rejectDialog, isOpen: false })}
        onReject={async (reason: string) => {
          await reviewMutation.mutateAsync({
            driverId: rejectDialog.driverId,
            documentId: rejectDialog.documentId,
            data: { status: 'rejected', rejectionReason: reason }
          });
          setRejectDialog({ ...rejectDialog, isOpen: false });
        }}
        isRejecting={reviewMutation.isPending}
      />
    </>
  );
}