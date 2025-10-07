/**
 * Ride Detail Page - Full ride information with timeline
 * Following detail page pattern from drivers/passengers
 */

'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DetailPageLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRide, useRideTimeline, useCancelRide } from '@/hooks/api/useRideData';
import { cn } from '@/lib/utils';
import type { RideStatus } from '@/types/ride';

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

export default function RideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rideId = parseInt(params.id as string);

  const { data: ride, isLoading: rideLoading } = useRide(rideId);
  const { data: timeline, isLoading: timelineLoading } = useRideTimeline(rideId);
  const cancelMutation = useCancelRide();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Rides', href: '/dashboard/rides' },
    { label: `Ride #${rideId}`, href: `/dashboard/rides/${rideId}`, current: true },
  ];

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this ride?')) {
      const reason = prompt('Please provide a reason for cancellation:');
      if (reason) {
        cancelMutation.mutate({ id: rideId, data: { reason } });
      }
    }
  };

  if (rideLoading) {
    return (
      <DetailPageLayout title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-32" />
          ))}
        </div>
      </DetailPageLayout>
    );
  }

  if (!ride) {
    return (
      <DetailPageLayout title="Ride Not Found" breadcrumbs={breadcrumbs}>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Ride not found</p>
          <Button onClick={() => router.push('/dashboard/rides')} className="mt-4">
            Back to Rides
          </Button>
        </Card>
      </DetailPageLayout>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => router.push('/dashboard/rides')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Rides
      </Button>
      {ride.status !== 'completed' && ride.status !== 'cancelled' && (
        <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
          <XCircleIcon className="h-4 w-4 mr-2" />
          Cancel Ride
        </Button>
      )}
    </div>
  );

  return (
    <DetailPageLayout
      title={`Ride #${ride.id}`}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ride Status</h3>
              <Badge className={cn('text-sm', getStatusColor(ride.status))}>
                {ride.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Requested</p>
              <p className="font-medium">{new Date(ride.requestedAt).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Passenger Info */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Passenger</h3>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {ride.passengerName || 'Unknown'}</p>
              <p><span className="font-medium">Phone:</span> {ride.passengerPhone || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {ride.passengerEmail || 'N/A'}</p>
              {ride.passenger && (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/dashboard/passengers/${ride.passenger.id}`)}
                >
                  View Passenger Profile →
                </Button>
              )}
            </div>
          </Card>

          {/* Driver Info */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <TruckIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Driver</h3>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {ride.driverName || 'Unassigned'}</p>
              <p><span className="font-medium">Phone:</span> {ride.driverPhone || 'N/A'}</p>
              <p><span className="font-medium">Vehicle:</span> {ride.vehicleInfo || 'N/A'}</p>
              {ride.driverDetails && (
                <p><span className="font-medium">Rating:</span> ⭐ {ride.driverDetails.rating}/5</p>
              )}
              {ride.driverDetails && (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/dashboard/drivers/${ride.driverDetails.id}`)}
                >
                  View Driver Profile →
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Route Info */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">Route</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pickup</p>
              <p className="font-medium">{ride.pickupAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Dropoff</p>
              <p className="font-medium">{ride.dropoffAddress || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-medium">{ride.distance || 0} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{ride.estimatedDuration || 0} min</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Pricing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Estimated Price:</span>
                <span className="font-medium">MWK {(ride.estimatedPrice || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Price:</span>
                <span className="font-medium text-lg">MWK {(ride.finalPrice || ride.estimatedPrice || 0).toLocaleString()}</span>
              </div>
              {ride.penaltyAmount && (
                <div className="flex justify-between text-red-600">
                  <span>Penalty:</span>
                  <span className="font-medium">MWK {ride.penaltyAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Rating */}
          {ride.ratingDetails && (
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold">Rating</h3>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">⭐ {ride.ratingDetails.rating}/5</p>
                {ride.ratingDetails.comment && (
                  <p className="text-sm text-muted-foreground italic">&ldquo;{ride.ratingDetails.comment}&rdquo;</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Rated on {new Date(ride.ratingDetails.createdAt).toLocaleString()}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Timeline</h3>
          </div>
          {timelineLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-accent rounded animate-pulse" />
              ))}
            </div>
          ) : timeline?.events && timeline.events.length > 0 ? (
            <div className="space-y-4">
              {timeline.events.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    {index < timeline.events.length - 1 && (
                      <div className="w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{event.event}</p>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No timeline data available</p>
          )}
        </Card>

        {/* Cancellation Details */}
        {ride.cancellationDetails && (
          <Card className="p-6 border-red-200">
            <div className="flex items-center mb-4">
              <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-600">Cancellation Details</h3>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Cancelled by:</span> {ride.cancellationDetails.cancelledBy}</p>
              <p><span className="font-medium">Reason:</span> {ride.cancellationDetails.reason}</p>
              <p className="text-sm text-muted-foreground">
                Cancelled at {new Date(ride.cancellationDetails.timestamp).toLocaleString()}
              </p>
            </div>
          </Card>
        )}
      </div>
    </DetailPageLayout>
  );
}
