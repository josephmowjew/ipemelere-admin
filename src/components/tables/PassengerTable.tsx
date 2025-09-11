/**
 * PassengerTable Component - Reusable passenger data table
 * Following component composition patterns from design document
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeIcon } from '@heroicons/react/24/outline';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { PassengerTableSkeleton, EmptyState } from '@/components/ui/LoadingState';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { 
  Passenger, 
  PassengerTableProps, 
  PaginationMeta 
} from '@/types/passenger';

// Individual passenger row component
interface PassengerRowProps {
  passenger: Passenger;
  onView?: (passengerId: number) => void;
  onEdit?: (passenger: Passenger) => void;
  onStatusChange?: (passengerId: number, status: Passenger['status']) => void;
}

const PassengerRow: React.FC<PassengerRowProps> = ({ 
  passenger, 
  onView, 
  onEdit, 
  onStatusChange 
}) => {
  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="text-xs text-green-600">✓ Verified</span>;
      case 'pending':
        return <span className="text-xs text-yellow-600">⚠ Pending</span>;
      case 'rejected':
        return <span className="text-xs text-red-600">✗ Rejected</span>;
      default:
        return <span className="text-xs text-gray-600">-</span>;
    }
  };

  const getStatusBadge = (status: Passenger['status']) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusClasses[status]
      )}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <div>
          <p className="font-medium text-foreground">
            {passenger.firstName} {passenger.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            ID: {passenger.id}
          </p>
          {passenger.lastActivity && (
            <p className="text-xs text-muted-foreground">
              Last active {formatDistanceToNow(new Date(passenger.lastActivity), { addSuffix: true })}
            </p>
          )}
        </div>
      </td>
      <td className="p-4">
        <div>
          <p className="text-foreground">{passenger.email}</p>
          {getVerificationIcon(passenger.emailVerificationStatus)}
        </div>
      </td>
      <td className="p-4">
        <div>
          <p className="text-foreground">{passenger.phoneNumber}</p>
          {getVerificationIcon(passenger.phoneVerificationStatus)}
        </div>
      </td>
      <td className="p-4">
        <p className="text-foreground">
          {passenger.city !== 'Not specified' ? passenger.city : 'Not provided'}
        </p>
        <p className="text-sm text-muted-foreground">
          {passenger.district !== 'Not specified' ? passenger.district : 'Not provided'}
        </p>
      </td>
      <td className="p-4">
        {getStatusBadge(passenger.status)}
      </td>
      <td className="p-4">
        {getStatusBadge(passenger.documentVerificationStatus as Passenger['status'])}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(passenger.id)}
              className="h-8 w-8 p-0"
            >
              <EyeIcon className="h-4 w-4" />
              <span className="sr-only">View passenger details</span>
            </Button>
          )}
          {passenger.totalRides !== undefined && (
            <div className="text-right">
              <p className="text-sm font-medium">{passenger.totalRides}</p>
              <p className="text-xs text-muted-foreground">rides</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// Pagination component
interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  if (pagination.total_pages <= 1) return null;

  return (
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
          onClick={() => onPageChange(pagination.current_page - 1)}
        >
          Previous
        </Button>
        
        <span className="text-sm px-2">
          Page {pagination.current_page} of {pagination.total_pages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.has_next_page}
          onClick={() => onPageChange(pagination.current_page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Main PassengerTable component
interface PassengerTableComponentProps extends PassengerTableProps {
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  className?: string;
}

export const PassengerTable: React.FC<PassengerTableComponentProps> = ({
  passengers,
  loading = false,
  error,
  onView,
  onEdit,
  onStatusChange,
  pagination,
  onPageChange,
  className
}) => {
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load passengers"
        onRetry={() => window.location.reload()}
        variant="card"
        className={className}
      />
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <PassengerTableSkeleton />
      </Card>
    );
  }

  if (passengers.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          title="No passengers found"
          description="No passengers match your current search and filter criteria. Try adjusting your filters or search terms."
          icon={EyeIcon}
        />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">
                Passenger
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Phone
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Location
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Verification
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger) => (
              <PassengerRow
                key={passenger.id}
                passenger={passenger}
                onView={onView}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </Card>
  );
};

// Export individual components for flexibility
export { PassengerRow, Pagination };

// Default export
export default PassengerTable;