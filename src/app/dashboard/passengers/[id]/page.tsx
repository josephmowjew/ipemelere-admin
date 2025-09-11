/**
 * Passenger Detail Page - Individual passenger management interface
 * Following DetailPageLayout pattern from design document
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DetailPageLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { usePassengerDetails, useUpdatePassengerStatus } from '@/hooks/api/usePassengerData';
import type { Passenger, PassengerRide, PassengerActivity } from '@/types/passenger';
import { cn } from '@/lib/utils';

export default function PassengerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passengerId = parseInt(params.id as string);
  
  // React Query hooks
  const {
    passenger,
    activity,
    rides,
    isLoading,
    hasError,
    passengerError,
    activityError,
    ridesError,
    refetchAll
  } = usePassengerDetails(passengerId);
  
  const updateStatusMutation = useUpdatePassengerStatus();

  // Status change handler using mutation
  const handleStatusChange = (newStatus: Passenger['status'], reason?: string) => {
    if (!passenger) return;

    updateStatusMutation.mutate({
      id: passenger.id,
      data: {
        status: newStatus,
        reason,
        adminNotes: reason
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError || !passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasError ? 'Error Loading Passenger' : 'Passenger Not Found'}
        </h1>
        <p className="text-muted-foreground mb-4">
          {passengerError || 'The requested passenger could not be found.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/passengers')}>
            Back to Passengers
          </Button>
          {hasError && (
            <Button variant="outline" onClick={refetchAll}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Passengers', href: '/dashboard/passengers' },
    { name: `${passenger.firstName} ${passenger.lastName}`, href: '', current: true }
  ];

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <PencilIcon className="h-4 w-4 mr-2" />
        Edit Details
      </Button>
      {passenger.status === 'active' ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleStatusChange('suspended', 'Administrative action')}
          className="text-yellow-600 hover:text-yellow-700"
          disabled={updateStatusMutation.isPending}
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
          {updateStatusMutation.isPending ? 'Suspending...' : 'Suspend'}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleStatusChange('active')}
          className="text-green-600 hover:text-green-700"
          disabled={updateStatusMutation.isPending}
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          {updateStatusMutation.isPending ? 'Activating...' : 'Activate'}
        </Button>
      )}
    </div>
  );

  // Sidebar content
  const sidebar = (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Account Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Account Status</span>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              passenger.status === 'active' && 'bg-green-100 text-green-800',
              passenger.status === 'suspended' && 'bg-yellow-100 text-yellow-800',
              passenger.status === 'banned' && 'bg-red-100 text-red-800',
              passenger.status === 'pending' && 'bg-gray-100 text-gray-800'
            )}>
              {passenger.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verification</span>
            {passenger.emailVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Phone Verification</span>
            {passenger.phoneVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Document Verification</span>
            {passenger.documentVerificationStatus === 'verified' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : passenger.documentVerificationStatus === 'rejected' ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Rides</span>
            <span className="font-medium">{passenger.totalRides || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <span className="font-medium">MWK {(passenger.totalSpent || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {new Date(passenger.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Activity</span>
            <span className="font-medium">
              {passenger.lastActivity 
                ? new Date(passenger.lastActivity).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <DetailPageLayout
      title={`${passenger.firstName} ${passenger.lastName}`}
      breadcrumbs={breadcrumbs}
      actions={actions}
      sidebar={sidebar}
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{passenger.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{passenger.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {passenger.city !== 'Not specified' && passenger.district !== 'Not specified' 
                      ? `${passenger.city}, ${passenger.district}`
                      : 'Location not provided'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {passenger.address !== 'Not provided' ? passenger.address : 'Address not provided'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="font-medium">
                  {passenger.nationalId !== 'Not provided' ? passenger.nationalId : 'National ID not provided'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {passenger.emergencyContact.name !== 'Not provided' 
                  ? passenger.emergencyContact.name 
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">
                {passenger.emergencyContact.phone !== 'Not provided' 
                  ? passenger.emergencyContact.phone 
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium capitalize">
                {passenger.emergencyContact.relationship !== 'Not specified' 
                  ? passenger.emergencyContact.relationship 
                  : 'Not specified'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Rides */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Rides</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          {!rides?.data || rides.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rides found</p>
          ) : (
            <div className="space-y-4">
              {rides.data.slice(0, 5).map((ride) => (
                <div key={ride.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Ride #{ride.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {ride.pickupLocation.address} → {ride.dropoffLocation.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {ride.fare.currency} {ride.fare.totalFare.toLocaleString()}
                    </p>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      ride.status === 'ride_completed' && 'bg-green-100 text-green-800',
                      ride.status === 'ride_cancelled' && 'bg-red-100 text-red-800',
                      ride.status === 'pending' && 'bg-gray-100 text-gray-800',
                      (ride.status === 'driver_assigned' || ride.status === 'driver_en_route' || ride.status === 'driver_arrived' || ride.status === 'ride_started') && 'bg-blue-100 text-blue-800'
                    )}>
                      {ride.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {!activity || activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border-l-4 border-blue-200 bg-blue-50/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DetailPageLayout>
  );
}