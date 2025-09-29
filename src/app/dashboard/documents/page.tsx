/**
 * Documents Overview Page - Central hub for all document management
 * Shows documents from both drivers and passengers with filtering
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DocumentCheckIcon,
  UsersIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Documents', href: '/dashboard/documents', current: true }
  ];

  // Quick stats - these would come from API in real implementation
  const stats = {
    total: 342,
    pending: 89,
    approved: 201,
    rejected: 52
  };

  return (
    <ListPageLayout
      title="Document Management"
      breadcrumbs={breadcrumbs}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Driver Documents</h3>
                <p className="text-sm text-gray-600">Review driver licenses, vehicle registrations, and insurance</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/drivers/documents/pending')}>
              Review
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Passenger Documents</h3>
                <p className="text-sm text-gray-600">Review passenger identity documents and verifications</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/passengers?tab=documents')}>
              Review
            </Button>
          </div>
        </Card>
      </div>

      {/* Filter by Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Document Status Filters</h3>
        </div>

        <div className="flex gap-4">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents')}
          >
            All Documents
          </Button>
          <Button
            variant={statusFilter === 'pending' ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents?status=pending')}
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Pending ({stats.pending})
          </Button>
          <Button
            variant={statusFilter === 'approved' ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents?status=approved')}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Approved ({stats.approved})
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents?status=rejected')}
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Rejected ({stats.rejected})
          </Button>
        </div>

        {statusFilter && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Showing {statusFilter} documents. Use the buttons above to filter by different statuses.
            </p>
          </div>
        )}
      </Card>
    </ListPageLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}