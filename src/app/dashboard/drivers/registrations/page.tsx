/**
 * Pending Driver Registrations List Page
 * Admin page to view and manage pending driver registration applications
 */

'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useRegistrationApplications, useRegistrationStats } from '@/hooks/api/useDriverData';
import { ApplicationStatus, type RegistrationApplicationListItem } from '@/types/registration';
import { APPLICATION_STATUS_CONFIG } from '@/constants/driverRegistration';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

function RegistrationStatsCards(): React.ReactElement {
  const { data: stats, isLoading } = useRegistrationStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return <></>;

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      color: 'text-blue-600',
    },
    {
      title: 'Under Review',
      value: stats.pendingReview,
      color: 'text-yellow-600',
    },
    {
      title: 'Approved',
      value: stats.approved,
      color: 'text-green-600',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RegistrationsListContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    (searchParams.get('status') as ApplicationStatus) || 'all'
  );

  // Fetch applications with filters
  const { data: applicationsResponse, isLoading, refetch } = useRegistrationApplications({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const applications = applicationsResponse?.data || [];

  const handleSearch = (): void => {
    refetch();
  };

  const handleViewDetails = (applicationId: number): void => {
    router.push(`/dashboard/drivers/registrations/${applicationId}`);
  };

  const getStatusBadge = (status: ApplicationStatus): React.ReactElement => {
    const config = APPLICATION_STATUS_CONFIG[status];
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Registrations</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage pending driver registration applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <RegistrationStatsCards />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSearch} variant="secondary">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-64">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              >
                <option value="all">All Statuses</option>
                {Object.entries(APPLICATION_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Refresh Button */}
            <Button onClick={() => refetch()} variant="outline">
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {applications?.length || 0} application(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application: RegistrationApplicationListItem) => (
                <div
                  key={application.applicationId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Application Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {application.firstName} {application.lastName}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span>📧 {application.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📱 {application.phoneNumber}</span>
                      </div>
                      <div>
                        📄 {application.missingDocumentsCount === 0 ? 'Documents uploaded' : `${application.missingDocumentsCount} documents missing`}
                      </div>
                      <div className="text-xs">
                        Applied {formatRelativeTime(new Date(application.submittedAt))} •{' '}
                        {formatDate(new Date(application.submittedAt))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 sm:mt-0 sm:ml-4">
                    <Button
                      onClick={() => handleViewDetails(application.applicationId)}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No applications found matching your filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegistrationsListPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      }
    >
      <RegistrationsListContent />
    </Suspense>
  );
}
