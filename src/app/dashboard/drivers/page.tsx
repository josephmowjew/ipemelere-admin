/**
 * Drivers Page - Admin interface for driver management with document review
 * Following ListPageLayout pattern from design document
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { DriverSearchBar } from '@/components/ui/SearchBar';
import { StatusFilter, DistrictFilter, FilterDropdown } from '@/components/ui/FilterDropdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  TruckIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { type Driver, type DriverListParams } from '@/lib/api/drivers';
import { useDrivers, useDriverStats, useExportDrivers } from '@/hooks/api/useDriverData';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface DriverFilters {
  search: string;
  status: string[];
  district: string[];
  vehicleType: string[];
  licenseStatus: string[];
  verificationStatus: string[];
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'minibus', label: 'Minibus' }
];

const DOCUMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' }
];

export default function DriversPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL parameters
  const getInitialFilters = (): DriverFilters => {
    const urlStatus = searchParams.get('status');
    const urlDistrict = searchParams.get('district');
    const urlVehicleType = searchParams.get('vehicleType');
    const urlLicenseStatus = searchParams.get('licenseStatus');
    const urlVerificationStatus = searchParams.get('verificationStatus');
    const urlSearch = searchParams.get('search');

    return {
      search: urlSearch || '',
      status: urlStatus ? [urlStatus] : [],
      district: urlDistrict ? [urlDistrict] : [],
      vehicleType: urlVehicleType ? [urlVehicleType] : [],
      licenseStatus: urlLicenseStatus ? [urlLicenseStatus] : [],
      verificationStatus: urlVerificationStatus ? [urlVerificationStatus] : []
    };
  };

  const [filters, setFilters] = useState<DriverFilters>(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(1);

  // Update filters when URL parameters change
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]);

  // Build query parameters from filters
  const queryParams: DriverListParams = {
    page: currentPage,
    limit: 50,
    search: filters.search || undefined,
    status: filters.status[0] as 'active' | 'inactive' | 'suspended' | 'pending_verification' || undefined,
    district: filters.district[0] || undefined,
    vehicleType: filters.vehicleType[0] as 'sedan' | 'hatchback' | 'suv' | 'minibus' || undefined,
    licenseStatus: filters.licenseStatus[0] as Driver['licenseVerificationStatus'] || undefined,
    verificationStatus: filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected' || undefined,
  };

  // React Query hooks
  const { data: driverData, isLoading, error } = useDrivers(queryParams);
  const { data: stats } = useDriverStats();
  const exportMutation = useExportDrivers();

  // Extract data from React Query response
  const drivers = driverData?.data || [];
  const pagination = driverData?.pagination || {
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

  const handleVehicleTypeChange = (types: string[]) => {
    setFilters(prev => ({ ...prev, vehicleType: types }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleLicenseStatusChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, licenseStatus: statuses }));
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
      status: filters.status[0] as 'active' | 'inactive' | 'suspended' | 'pending_verification' || undefined,
      district: filters.district[0] || undefined,
      vehicleType: filters.vehicleType[0] as 'sedan' | 'hatchback' | 'suv' | 'minibus' || undefined,
      licenseStatus: filters.licenseStatus[0] as Driver['licenseVerificationStatus'] || undefined,
      verificationStatus: filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected' || undefined,
    });
  };

  // Search bar component
  const searchBar = (
    <div className="flex-1 max-w-md">
      <DriverSearchBar onSearch={handleSearch} />
    </div>
  );

  // Filter bar component
  const filterBar = (
    <div className="flex items-center gap-3">
      <StatusFilter
        selectedValues={filters.status}
        onSelectionChange={handleStatusChange}
        statuses={['active', 'inactive', 'suspended', 'pending_verification']}
      />
      
      <DistrictFilter
        selectedValues={filters.district}
        onSelectionChange={handleDistrictChange}
        districts={[...MALAWI_DISTRICTS]}
      />
      
      <FilterDropdown
        label="Vehicle Type"
        options={VEHICLE_TYPES}
        selectedValues={filters.vehicleType}
        onSelectionChange={handleVehicleTypeChange}
        placeholder="All types"
        multiSelect
      />
      
      <FilterDropdown
        label="License Status"
        options={DOCUMENT_STATUSES}
        selectedValues={filters.licenseStatus}
        onSelectionChange={handleLicenseStatusChange}
        placeholder="All statuses"
        multiSelect
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
      <Button 
        variant="outline"
        onClick={() => router.push('/dashboard/drivers/documents/pending')}
      >
        <DocumentCheckIcon className="h-4 w-4 mr-2" />
        Review Documents
      </Button>
      <Button variant="outline">
        <FunnelIcon className="h-4 w-4 mr-2" />
        Advanced Filters
      </Button>
    </div>
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Drivers', href: '/dashboard/drivers', current: true }
  ];

  // Use real stats from API, with fallback to calculated values
  const summaryStats = {
    total: stats?.totalDrivers ?? pagination.total,
    active: stats?.activeDrivers ?? drivers.filter(d => d.status === 'active').length,
    pendingVerification: stats?.pendingVerification ?? drivers.filter(d => d.status === 'pending_verification').length,
    pendingDocuments: stats?.pendingVerification ?? drivers.filter(d => d.documentVerificationStatus === 'pending').length,
    suspended: stats?.suspendedDrivers ?? drivers.filter(d => d.status === 'suspended').length
  };

  return (
    <ListPageLayout
      title="Drivers"
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
              <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
              <p className="text-2xl font-bold">{summaryStats.total.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{summaryStats.active.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-bold">{summaryStats.pendingVerification.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="text-2xl font-bold">{summaryStats.suspended.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Driver</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Vehicle</th>
                <th className="text-left p-4 font-medium">License</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Documents</th>
                <th className="text-left p-4 font-medium">Performance</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
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
                    Error loading drivers: {error.message}
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No drivers found matching your criteria.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                        <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
                        <p className="text-sm text-muted-foreground">{driver.city}, {driver.district}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{driver.email}</p>
                        <p className="text-sm">{driver.phoneNumber || driver.phone}</p>
                        {driver.emailVerificationStatus === 'verified' ? (
                          <span className="text-xs text-green-600">✓ Email verified</span>
                        ) : (
                          <span className="text-xs text-yellow-600">⚠ Email pending</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {((driver.vehicle?.make || driver.vehicleDetails?.make) && (driver.vehicle?.model || driver.vehicleDetails?.model))
                            ? `${driver.vehicle?.make || driver.vehicleDetails?.make} ${driver.vehicle?.model || driver.vehicleDetails?.model}`
                            : 'Vehicle not registered'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driver.vehicle?.plateNumber || driver.vehicleDetails?.plateNumber || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {driver.vehicle?.type || driver.vehicleDetails?.type || 'Unknown'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{driver.licenseNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          driver.licenseVerificationStatus === 'approved' && 'bg-green-100 text-green-800',
                          driver.licenseVerificationStatus === 'pending' && 'bg-yellow-100 text-yellow-800',
                          driver.licenseVerificationStatus === 'rejected' && 'bg-red-100 text-red-800',
                          driver.licenseVerificationStatus === 'expired' && 'bg-gray-100 text-gray-800'
                        )}>
                          {driver.licenseVerificationStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        driver.status === 'active' && 'bg-green-100 text-green-800',
                        driver.status === 'suspended' && 'bg-red-100 text-red-800',
                        driver.status === 'inactive' && 'bg-gray-100 text-gray-800',
                        driver.status === 'pending_verification' && 'bg-yellow-100 text-yellow-800'
                      )}>
                        {driver.status === 'pending_verification' ? 'Pending Verification' : driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                      {driver.currentShift && (
                        <p className="text-xs text-green-600 mt-1">● Online</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          driver.documentVerificationStatus === 'verified' && 'bg-green-100 text-green-800',
                          driver.documentVerificationStatus === 'pending' && 'bg-yellow-100 text-yellow-800',
                          driver.documentVerificationStatus === 'rejected' && 'bg-red-100 text-red-800'
                        )}>
                          {driver.documentVerificationStatus}
                        </span>
                        {driver.documents && (
                          <p className="text-xs text-muted-foreground">
                            {driver.documents.filter(d => d.status === 'pending').length} pending
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">
                          ⭐ {driver.performance?.averageRating?.toFixed(1) || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {driver.performance?.totalRides || 0} rides
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {driver.performance?.completionRate || 0}% completion
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {driver.documentVerificationStatus === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/drivers/${driver.id}/documents`)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <DocumentCheckIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
              {pagination.total} drivers
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev_page}
                onClick={() => handlePageChange(pagination.current_page - 1)}
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
                onClick={() => handlePageChange(pagination.current_page + 1)}
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