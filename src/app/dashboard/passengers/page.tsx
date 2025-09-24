/**
 * Passengers Page - Admin interface for passenger management
 * Following ListPageLayout pattern from design document
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { PassengerSearchBar } from '@/components/ui/SearchBar';
import { StatusFilter, DistrictFilter } from '@/components/ui/FilterDropdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  UsersIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  UserMinusIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { PassengerTable } from '@/components/tables/PassengerTable';
import { usePassengers, usePassengerStats, useExportPassengers } from '@/hooks/api/usePassengerData';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import type { Passenger, PassengerListParams } from '@/types/passenger';

interface PassengerFilters {
  search: string;
  status: string[];
  district: string[];
  verificationStatus: string[];
}

export default function PassengersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL parameters
  const getInitialFilters = (): PassengerFilters => {
    const urlStatus = searchParams.get('status');
    const urlDistrict = searchParams.get('district');
    const urlVerification = searchParams.get('verificationStatus');
    const urlSearch = searchParams.get('search');

    return {
      search: urlSearch || '',
      status: urlStatus ? [urlStatus] : [],
      district: urlDistrict ? [urlDistrict] : [],
      verificationStatus: urlVerification ? [urlVerification] : []
    };
  };

  const [filters, setFilters] = useState<PassengerFilters>(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(1);

  // Update filters when URL parameters change
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]);

  // Build query parameters from filters
  const queryParams: PassengerListParams = {
    page: currentPage,
    limit: 50,
    search: filters.search || undefined,
    status: filters.status[0] as Passenger['status'] || undefined,
    district: filters.district[0] || undefined,
    verificationStatus: filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected' || undefined,
  };

  // React Query hooks
  const { data: passengerData, isLoading, error } = usePassengers(queryParams);
  const { data: stats } = usePassengerStats();
  const exportMutation = useExportPassengers();

  // Extract data from React Query response
  const passengers = passengerData?.data || [];
  const pagination = passengerData?.pagination || {
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false
  };

  // Filter handlers
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, status: statuses }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDistrictChange = (districts: string[]) => {
    setFilters(prev => ({ ...prev, district: districts }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleVerificationChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, verificationStatus: statuses }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Export handler using mutation
  const handleExport = () => {
    exportMutation.mutate({
      search: filters.search || undefined,
      status: filters.status[0] as Passenger['status'] || undefined,
      district: filters.district[0] || undefined,
      verificationStatus: filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected' || undefined,
      format: 'csv'
    });
  };

  // Passenger action handlers
  const handleViewPassenger = (passengerId: number) => {
    router.push(`/dashboard/passengers/${passengerId}`);
  };

  // Search bar component
  const searchBar = (
    <div className="flex-1 max-w-md">
      <PassengerSearchBar onSearch={handleSearch} />
    </div>
  );

  // Filter bar component
  const filterBar = (
    <div className="flex items-center gap-3">
      <StatusFilter
        selectedValues={filters.status}
        onSelectionChange={handleStatusChange}
      />
      
      <DistrictFilter
        selectedValues={filters.district}
        onSelectionChange={handleDistrictChange}
        districts={[...MALAWI_DISTRICTS]}
      />
      
      <StatusFilter
        selectedValues={filters.verificationStatus}
        onSelectionChange={handleVerificationChange}
        statuses={['verified', 'pending', 'rejected']}
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        disabled={exportMutation.isPending}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        {exportMutation.isPending ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  );

  // Page actions
  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <FunnelIcon className="h-4 w-4 mr-2" />
        Advanced Filters
      </Button>
    </div>
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Passengers', href: '/dashboard/passengers', current: true }
  ];

  return (
    <ListPageLayout
      title="Passengers"
      breadcrumbs={breadcrumbs}
      searchBar={searchBar}
      filterBar={filterBar}
      actions={actions}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Passengers</p>
              <p className="text-2xl font-bold">
                {stats?.totalPassengers?.toLocaleString() || pagination.total.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {stats?.activePassengers?.toLocaleString() || passengers.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Document Verification</p>
              <p className="text-2xl font-bold">
                {stats?.pendingVerification?.toLocaleString() || passengers.filter(p => p.documentVerificationStatus === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <UserMinusIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="text-2xl font-bold">
                {stats?.suspendedPassengers?.toLocaleString() || passengers.filter(p => p.status === 'suspended').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Passengers Table */}
      <PassengerTable
        passengers={passengers}
        loading={isLoading}
        error={error?.message}
        onView={handleViewPassenger}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </ListPageLayout>
  );
}