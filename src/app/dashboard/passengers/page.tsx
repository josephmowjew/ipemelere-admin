/**
 * Passengers Page - Admin interface for passenger management
 * Following ListPageLayout pattern from design document
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ListPageLayout } from '@/components/layout/DashboardLayout';
import { PassengerSearchBar } from '@/components/ui/SearchBar';
import { StatusFilter, DistrictFilter } from '@/components/ui/FilterDropdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  UsersIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  UserMinusIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { passengerAPI, type Passenger, type PassengerListParams } from '@/lib/api/passengers';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface PassengerFilters {
  search: string;
  status: string[];
  district: string[];
  verificationStatus: string[];
}

export default function PassengersPage() {
  const router = useRouter();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PassengerFilters>({
    search: '',
    status: [],
    district: [],
    verificationStatus: []
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false
  });

  // Fetch passengers data
  const fetchPassengers = useCallback(async (params: PassengerListParams = {}) => {
    try {
      setLoading(true);
      const response = await passengerAPI.getPassengers({
        page: pagination.current_page,
        limit: 50,
        ...params,
        status: params.status || filters.status[0] as Passenger['status'],
        district: params.district || filters.district[0],
        verificationStatus: params.verificationStatus || filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected'
      });
      
      setPassengers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch passengers:', error);
      // In a real app, show error toast/notification
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, filters.status, filters.district, filters.verificationStatus]);

  // Load passengers on mount and filter changes
  useEffect(() => {
    fetchPassengers({
      search: filters.search || undefined
    });
  }, [filters, fetchPassengers]);

  // Filter handlers
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleStatusChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, status: statuses }));
  };

  const handleDistrictChange = (districts: string[]) => {
    setFilters(prev => ({ ...prev, district: districts }));
  };

  const handleVerificationChange = (statuses: string[]) => {
    setFilters(prev => ({ ...prev, verificationStatus: statuses }));
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
    fetchPassengers({ page: newPage });
  };

  // Export handler
  const handleExport = async () => {
    try {
      const blob = await passengerAPI.exportPassengers({
        search: filters.search || undefined,
        status: filters.status[0] as Passenger['status'],
        district: filters.district[0],
        verificationStatus: filters.verificationStatus[0] as 'verified' | 'pending' | 'rejected'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passengers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
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
        label="Verification"
      />
      
      <Button variant="outline" size="sm" onClick={handleExport}>
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Export
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
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Passengers', href: '/dashboard/passengers', current: true }
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
              <p className="text-2xl font-bold">{pagination.total.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {passengers.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-bold">
                {passengers.filter(p => p.documentVerificationStatus === 'pending').length}
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
                {passengers.filter(p => p.status === 'suspended').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Passengers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Verification</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-accent rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : passengers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No passengers found matching your criteria.
                  </td>
                </tr>
              ) : (
                passengers.map((passenger) => (
                  <tr key={passenger.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                        <p className="text-sm text-muted-foreground">ID: {passenger.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p>{passenger.email}</p>
                      {passenger.emailVerificationStatus === 'verified' ? (
                        <span className="text-xs text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-xs text-yellow-600">⚠ Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p>{passenger.phoneNumber}</p>
                      {passenger.phoneVerificationStatus === 'verified' ? (
                        <span className="text-xs text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-xs text-yellow-600">⚠ Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p>{passenger.city}, {passenger.district}</p>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        passenger.status === 'active' && 'bg-green-100 text-green-800',
                        passenger.status === 'suspended' && 'bg-yellow-100 text-yellow-800',
                        passenger.status === 'banned' && 'bg-red-100 text-red-800',
                        passenger.status === 'pending' && 'bg-gray-100 text-gray-800'
                      )}>
                        {passenger.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        passenger.documentVerificationStatus === 'verified' && 'bg-green-100 text-green-800',
                        passenger.documentVerificationStatus === 'pending' && 'bg-yellow-100 text-yellow-800',
                        passenger.documentVerificationStatus === 'rejected' && 'bg-red-100 text-red-800'
                      )}>
                        {passenger.documentVerificationStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/passengers/${passenger.id}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
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
              {pagination.total} passengers
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