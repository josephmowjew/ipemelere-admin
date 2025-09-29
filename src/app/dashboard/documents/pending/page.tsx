/**
 * Pending Documents Page - Shows all documents requiring review
 * Aggregates both driver and passenger documents with pending status
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  UsersIcon,
  TruckIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

function PendingDocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'drivers' or 'passengers'

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Documents', href: '/dashboard/documents' },
    { label: 'Pending Review', href: '/dashboard/documents/pending', current: true }
  ];

  // Mock pending document stats - these would come from API
  const pendingStats = {
    drivers: {
      total: 45,
      licenses: 18,
      registrations: 15,
      insurance: 12
    },
    passengers: {
      total: 44,
      identities: 32,
      verifications: 12
    }
  };

  return (
    <ListPageLayout
      title="Pending Document Reviews"
      breadcrumbs={breadcrumbs}
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingStats.drivers.total + pendingStats.passengers.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Driver Documents</p>
              <p className="text-2xl font-bold text-gray-900">{pendingStats.drivers.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Passenger Documents</p>
              <p className="text-2xl font-bold text-gray-900">{pendingStats.passengers.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter by Document Type */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Filter by Document Type</h3>
        </div>

        <div className="flex gap-4">
          <Button
            variant={!type ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents/pending')}
          >
            All Pending
          </Button>
          <Button
            variant={type === 'drivers' ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents/pending?type=drivers')}
          >
            <TruckIcon className="h-4 w-4 mr-2" />
            Driver Documents ({pendingStats.drivers.total})
          </Button>
          <Button
            variant={type === 'passengers' ? "default" : "outline"}
            onClick={() => router.push('/dashboard/documents/pending?type=passengers')}
          >
            <UsersIcon className="h-4 w-4 mr-2" />
            Passenger Documents ({pendingStats.passengers.total})
          </Button>
        </div>
      </Card>

      {/* Document Categories */}
      {(!type || type === 'drivers') && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold">Driver Documents Pending Review</h3>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/drivers/documents/pending')}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Driver Licenses</h4>
                  <p className="text-sm text-gray-600">Pending verification</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingStats.drivers.licenses}
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Vehicle Registrations</h4>
                  <p className="text-sm text-gray-600">Pending verification</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingStats.drivers.registrations}
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Insurance Documents</h4>
                  <p className="text-sm text-gray-600">Pending verification</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingStats.drivers.insurance}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {(!type || type === 'passengers') && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <UsersIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold">Passenger Documents Pending Review</h3>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/passengers?tab=documents')}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Identity Documents</h4>
                  <p className="text-sm text-gray-600">National IDs, passports</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingStats.passengers.identities}
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Account Verifications</h4>
                  <p className="text-sm text-gray-600">Profile verifications</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  {pendingStats.passengers.verifications}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {type && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing {type} documents pending review. Use the filters above to view different document types.
          </p>
        </div>
      )}
    </ListPageLayout>
  );
}

export default function PendingDocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingDocumentsContent />
    </Suspense>
  );
}