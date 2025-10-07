/**
 * Rides Page - Admin interface for ride management
 * Following ListPageLayout pattern from drivers/passengers
 */

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { StatusFilter } from '@/components/ui/FilterDropdown';
import { useRides, useRideStats, useExportRides } from '@/hooks/api/useRideData';
import { cn } from '@/lib/utils';
import type { RideListParams, RideStatus } from '@/types/ride';

const RIDE_STATUSES: { value: RideStatus; label: string }[] = [
  { value: 'requested', label: 'Requested' },
  { value: 'pending_driver_acceptance', label: 'Pending Acceptance' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'driver_arriving', label: 'Driver Arriving' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'cancelled_by_passenger', label: 'Cancelled by Passenger' },
  { value: 'cancelled_by_driver', label: 'Cancelled by Driver' },
  { value: 'expired', label: 'Expired' },
];

interface RideFilters {
  search: string;
  status: string[];
  fromDate?: string;
  toDate?: string;
  minPrice?: number;
  maxPrice?: number;
}

function RidesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = useCallback((): RideFilters => ({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') ? [searchParams.get('status')!] : [],
    fromDate: searchParams.get('fromDate') || undefined,
    toDate: searchParams.get('toDate') || undefined,
  }), [searchParams]);

  const [filters, setFilters] = useState<RideFilters>(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setFilters(getInitialFilters());
    setCurrentPage(1);
  }, [getInitialFilters]);

  const queryParams: RideListParams = {
    page: currentPage,
    limit: 50,
    search: filters.search || undefined,
    status: filters.status[0] as RideStatus || undefined,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };

  const { data: rideData, isLoading, error } = useRides(queryParams);
  const { data: stats } = useRideStats();
  const exportMutation = useExportRides();

  const rides = rideData?.data || [];
  const pagination = rideData?.pagination || {
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false,
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const handleStatusChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, status: statuses }));
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate({
      search: filters.search || undefined,
      status: filters.status[0] as RideStatus || undefined,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      format: 'csv',
    });
  };

  const searchBar = (
    <Input
      placeholder="Search by passenger, driver, or ride ID..."
      value={filters.search}
      onChange={handleSearch}
      className="max-w-md"
    />
  );

  const filterBar = (
    <div className="flex items-center gap-3">
      <StatusFilter
        selectedValues={filters.status}
        onSelectionChange={handleStatusChange}
        statuses={RIDE_STATUSES.map(s => s.value)}
      />
      <Input
        type="date"
        value={filters.fromDate || ''}
        onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
        className="w-40"
      />
      <Input
        type="date"
        value={filters.toDate || ''}
        onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
        className="w-40"
      />
      <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        {exportMutation.isPending ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );

  const actions = (
    <Button variant="outline" onClick={() => router.push('/dashboard/rides/analytics')}>
      <ChartBarIcon className="h-4 w-4 mr-2" />
      Analytics
    </Button>
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Rides', href: '/dashboard/rides', current: true },
  ];

  const summaryStats = {
    total: stats?.totalRides ?? pagination.total,
    completed: stats?.completedRides ?? 0,
    cancelled: stats?.cancelledRides ?? 0,
    active: stats?.activeRides ?? 0,
  };

  const getStatusColor = (status: RideStatus): string => {
    const colors: Record<RideStatus, string> = {
      requested: 'bg-blue-100 text-blue-800',
      pending_driver_acceptance: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      driver_arriving: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      cancelled_by_passenger: 'bg-red-100 text-red-800',
      cancelled_by_driver: 'bg-orange-100 text-orange-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ListPageLayout
      title="Rides"
      breadcrumbs={breadcrumbs}
      searchBar={searchBar}
      filterBar={filterBar}
      actions={actions}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Rides</p>
              <p className="text-2xl font-bold">{summaryStats.total.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{summaryStats.completed.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{summaryStats.active.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">{summaryStats.cancelled.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rides Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Ride ID</th>
                <th className="text-left p-4 font-medium">Passenger</th>
                <th className="text-left p-4 font-medium">Driver</th>
                <th className="text-left p-4 font-medium">Route</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="p-4">
                        <div className="h-4 bg-accent rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-red-600">
                    Error loading rides: {error.message}
                  </td>
                </tr>
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No rides found matching your criteria.
                  </td>
                </tr>
              ) : (
                rides.map((ride) => (
                  <tr key={ride.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <p className="font-medium">#{ride.id}</p>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{ride.passengerName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{ride.passengerPhone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{ride.driverName || 'Unassigned'}</p>
                        <p className="text-sm text-muted-foreground">{ride.vehicleInfo || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">From: {ride.pickupAddress || 'N/A'}</p>
                        <p className="text-sm">To: {ride.dropoffAddress || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{ride.distance || 0} km</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(ride.status))}>
                        {RIDE_STATUSES.find(s => s.value === ride.status)?.label || ride.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">MWK {(ride.finalPrice || ride.estimatedPrice || 0).toLocaleString()}</p>
                        {ride.rating && (
                          <p className="text-xs text-muted-foreground">⭐ {ride.rating}/5</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{new Date(ride.requestedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(ride.requestedAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/rides/${ride.id}`)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
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
              {pagination.total} rides
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
              <span className="text-sm">Page {pagination.current_page} of {pagination.total_pages}</span>
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
  );
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RidesPageContent />
    </Suspense>
  );
}
