/**
 * Pending Vehicles Page - Dedicated page for managing vehicle approvals
 * Full vehicle approval workflow with advanced filtering and bulk operations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { usePendingVehicles, useVehicleApprovalMutations } from '@/hooks/api/useDashboardData';
import { useQueryClient } from '@tanstack/react-query';
import { VehicleStatusBadge } from '@/components/vehicle/VehicleStatusBadge';
import { PriorityBadge } from '@/components/vehicle/PriorityBadge';
import { VehicleApprovalDialog } from '@/components/vehicle/VehicleApprovalDialog';
import { cn } from '@/lib/utils';
import type { PendingVehicleItem, PendingVehicleSummary } from '@/types/dashboard';

// Filters interface
interface VehicleFilters {
  search: string;
  priority: string;
  sortBy: string;
  sortOrder: string;
}

// Vehicle table row component
const VehicleTableRow: React.FC<{
  vehicle: PendingVehicleItem;
  onApprove: (vehicle: PendingVehicleItem) => void;
  onReject: (vehicle: PendingVehicleItem) => void;
  isApproving: boolean;
  isRejecting: boolean;
}> = ({ vehicle, onApprove, onReject, isApproving, isRejecting }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysPendingColor = (days: number) => {
    if (days > 14) return 'text-red-600 font-semibold';
    if (days > 7) return 'text-orange-600 font-medium';
    if (days > 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <TruckIcon className="h-5 w-5 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {vehicle.plateNumber}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {vehicle.driverName && (
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{vehicle.driverName}</span>
            </div>
          )}
          {vehicle.driverPhone && (
            <div className="text-sm text-gray-500">{vehicle.driverPhone}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={vehicle.priority} size="sm" />
          <VehicleStatusBadge
            status="inactive" // Backend status for pending vehicles
            size="sm"
            hasRejectionReason={false}
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{formatDate(vehicle.submissionDate)}</span>
          </div>
          <div className={cn('text-sm', getDaysPendingColor(vehicle.daysPending))}>
            {vehicle.daysPending} days pending
          </div>
        </div>
      </TableCell>
      <TableCell>
        {vehicle.documentsComplete ? (
          <Badge variant="secondary" className="text-xs">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
            <DocumentIcon className="h-3 w-3 mr-1" />
            Missing
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => onApprove(vehicle)}
            disabled={isApproving || isRejecting}
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onReject(vehicle)}
            disabled={isApproving || isRejecting}
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Summary cards component
const SummaryCards: React.FC<{ summary: PendingVehicleSummary }> = ({ summary }) => {
  const stats = [
    {
      title: 'Total Pending',
      value: summary.totalPending,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Urgent',
      value: summary.urgent,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Submitted Today',
      value: summary.submittedToday,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg. Days Pending',
      value: summary.averageDaysPending.toFixed(1),
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const EmptyState: React.FC = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
      <p className="text-gray-600 text-center max-w-md">
        No vehicles are currently pending approval. New vehicle submissions will appear here.
      </p>
    </CardContent>
  </Card>
);

export default function PendingVehiclesPage() {
  const [filters, setFilters] = useState<VehicleFilters>({
    search: '',
    priority: 'all',
    sortBy: 'submissionDate',
    sortOrder: 'desc',
  });

  const [selectedVehicle, setSelectedVehicle] = useState<PendingVehicleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: pendingData, isLoading, error } = usePendingVehicles({
    priority: filters.priority === 'all' ? undefined : filters.priority as 'urgent' | 'high' | 'medium' | 'low',
    sortBy: filters.sortBy as 'submissionDate' | 'priority' | 'driverName',
    sortOrder: filters.sortOrder as 'asc' | 'desc',
    limit: 50, // Load more for the dedicated page
  });

  const { approveVehicle, rejectVehicle } = useVehicleApprovalMutations();
  const queryClient = useQueryClient();

  const handleApprove = (vehicle: PendingVehicleItem) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleReject = (vehicle: PendingVehicleItem) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  // Force refetch on mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'pendingVehicles'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'pendingVehiclesSummary'] });
  }, [queryClient]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'pendingVehicles'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'pendingVehiclesSummary'] });
  };

  const handleDialogClose = () => {
    setSelectedVehicle(null);
    setIsDialogOpen(false);
    // Refresh data when dialog closes
    handleRefresh();
  };

  return (
    <DashboardLayout
      title="Pending Vehicles"
      actions={
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <ArrowPathIcon className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        {pendingData?.summary && <SummaryCards summary={pendingData.summary} />}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by vehicle make, model, plate number, or driver name..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Priority Filter */}
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger className="w-full lg:w-48">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submissionDate">Submission Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="driverName">Driver Name</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
                  <SelectTrigger className="w-full lg:w-24">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest</SelectItem>
                    <SelectItem value="asc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Vehicles ({pendingData?.total || 0})</span>
              {pendingData?.vehicles && pendingData.vehicles.length > 0 && (
                <div className="text-sm font-normal text-gray-600">
                  Showing {Math.min(pendingData.vehicles.length, 50)} of {pendingData.total} vehicles
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error loading pending vehicles: {error.message}</p>
              </div>
            ) : !pendingData?.vehicles || pendingData.vehicles.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingData.vehicles.map((vehicle) => (
                      <VehicleTableRow
                        key={vehicle.id}
                        vehicle={vehicle}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isApproving={approveVehicle.isPending}
                        isRejecting={rejectVehicle.isPending}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        {selectedVehicle && (
          <VehicleApprovalDialog
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
            vehicle={selectedVehicle}
          />
        )}
      </div>
    </DashboardLayout>
  );
}