/**
 * Pending Vehicles Card Component
 * Displays summary of pending vehicles and quick actions for dashboard
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TruckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { usePendingVehicles, usePendingVehiclesSummary } from '@/hooks/api/useDashboardData';
import { PriorityBadge } from './PriorityBadge';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { cn } from '@/lib/utils';
import type { PendingVehicleItem, PendingVehicleSummary } from '@/types/dashboard';

interface PendingVehiclesCardProps {
  className?: string;
  maxItems?: number;
}

// Summary stats component
const SummaryStats: React.FC<{ summary: PendingVehicleSummary }> = ({ summary }) => {
  const stats = [
    {
      label: 'Total Pending',
      value: summary.totalPending,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Urgent',
      value: summary.urgent,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Submitted Today',
      value: summary.submittedToday,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg. Days Pending',
      value: summary.averageDaysPending.toFixed(1),
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              stat.bgColor
            )}
          >
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <Icon className={cn('h-4 w-4', stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Vehicle list item component
const VehicleListItem: React.FC<{ vehicle: PendingVehicleItem }> = ({ vehicle }) => {
  const getDaysPendingColor = (days: number) => {
    if (days > 14) return 'text-red-600 font-semibold';
    if (days > 7) return 'text-orange-600 font-medium';
    if (days > 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <TruckIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <PriorityBadge priority={vehicle.priority} size="sm" />
            <VehicleStatusBadge
              status="inactive" // Pending vehicles are 'inactive' in backend
              size="sm"
              hasRejectionReason={false}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="font-mono">{vehicle.plateNumber}</span>
            {vehicle.driverName && (
              <span className="truncate">{vehicle.driverName}</span>
            )}
            <span className={getDaysPendingColor(vehicle.daysPending)}>
              {vehicle.daysPending} days pending
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3">
        {vehicle.documentsComplete ? (
          <Badge variant="secondary" className="text-xs">
            Documents Complete
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
            Documents Missing
          </Badge>
        )}
      </div>
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="h-5 w-5 bg-gray-200 rounded" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const EmptyState: React.FC = () => (
  <div className="text-center py-8">
    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
    <h3 className="text-lg font-medium text-gray-900 mb-1">All Caught Up!</h3>
    <p className="text-sm text-gray-600">No vehicles are currently pending approval.</p>
  </div>
);

export const PendingVehiclesCard: React.FC<PendingVehiclesCardProps> = ({
  className,
  maxItems = 5,
}) => {
  const { data: summary, isLoading: summaryLoading } = usePendingVehiclesSummary();
  const { data: pendingData, isLoading: vehiclesLoading } = usePendingVehicles({
    limit: maxItems,
    sortBy: 'submissionDate',
    sortOrder: 'desc',
  });

  const isLoading = summaryLoading || vehiclesLoading;
  const hasPending = (summary?.totalPending ?? 0) > 0;

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Pending Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Pending Vehicles
            {hasPending && (
              <Badge variant="secondary" className="ml-2">
                {summary?.totalPending}
              </Badge>
            )}
          </CardTitle>
          {hasPending && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/vehicles/pending">
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {summary && <SummaryStats summary={summary} />}

        {!hasPending ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {pendingData?.vehicles.slice(0, maxItems).map((vehicle) => (
              <VehicleListItem key={vehicle.id} vehicle={vehicle} />
            ))}

            {hasPending && (
              <div className="pt-3 mt-3 border-t">
                <Button variant="ghost" className="w-full justify-center" asChild>
                  <Link href="/dashboard/vehicles/pending">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Manage All Pending Vehicles ({summary?.totalPending})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};