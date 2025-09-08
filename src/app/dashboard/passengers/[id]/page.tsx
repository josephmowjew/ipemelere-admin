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
import { passengerAPI, type Passenger } from '@/lib/api/passengers';
import { type RideRecord, type ActivityRecord } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function PassengerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passengerId = parseInt(params.id as string);
  
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);

  // Fetch passenger data
  useEffect(() => {
    if (!passengerId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [passengerData, ridesData, activityData] = await Promise.all([
          passengerAPI.getPassenger(passengerId),
          passengerAPI.getPassengerRides(passengerId, { limit: 10 }),
          passengerAPI.getPassengerActivity(passengerId)
        ]);

        setPassenger(passengerData);
        setRides(ridesData.data);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch passenger data:', error);
        // In a real app, show error notification and possibly redirect
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [passengerId]);

  // Status change handler
  const handleStatusChange = async (newStatus: Passenger['status'], reason?: string) => {
    if (!passenger) return;

    try {
      const updatedPassenger = await passengerAPI.updatePassengerStatus(passenger.id, {
        status: newStatus,
        reason
      });
      setPassenger(updatedPassenger);
      // In a real app, show success notification
    } catch (error) {
      console.error('Failed to update passenger status:', error);
      // In a real app, show error notification
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-foreground mb-2">Passenger Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested passenger could not be found.</p>
        <Button onClick={() => router.push('/dashboard/passengers')}>
          Back to Passengers
        </Button>
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
        >
          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
          Suspend
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleStatusChange('active')}
          className="text-green-600 hover:text-green-700"
        >
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Activate
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
                  <p className="font-medium">{passenger.city}, {passenger.district}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{passenger.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">National ID</p>
                <p className="font-medium">{passenger.nationalId}</p>
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
              <p className="font-medium">{passenger.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{passenger.emergencyContact.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium capitalize">{passenger.emergencyContact.relationship}</p>
            </div>
          </div>
        </Card>

        {/* Recent Rides */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Rides</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          {rides.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rides found</p>
          ) : (
            <div className="space-y-4">
              {rides.slice(0, 5).map((ride, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Ride #{index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      Date placeholder - {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">MWK 3,500</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
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
          {activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activity.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-blue-200 bg-blue-50/50">
                  <div className="flex-1">
                    <p className="text-sm">Activity item {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleString()}
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