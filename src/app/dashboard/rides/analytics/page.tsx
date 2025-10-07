/**
 * Rides Analytics Page - Comprehensive ride analytics and insights
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useRideStats, useCancellationAnalysis, useRevenueSummary } from '@/hooks/api/useRideData';
import { cn } from '@/lib/utils';

export default function RidesAnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const [cancellationDays, setCancellationDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = useRideStats();
  const { data: cancellations, isLoading: cancellationsLoading } = useCancellationAnalysis(cancellationDays);
  const { data: revenue, isLoading: revenueLoading } = useRevenueSummary(dateRange.from, dateRange.to);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Rides', href: '/dashboard/rides' },
    { label: 'Analytics', href: '/dashboard/rides/analytics', current: true },
  ];

  const actions = (
    <Button variant="outline" onClick={() => router.push('/dashboard/rides')}>
      <ArrowLeftIcon className="h-4 w-4 mr-2" />
      Back to Rides
    </Button>
  );

  return (
    <DashboardLayout title="Ride Analytics" breadcrumbs={breadcrumbs} actions={actions}>
      <div className="space-y-6">
        {/* Overall Statistics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Rides</p>
                  <p className="text-3xl font-bold">
                    {statsLoading ? '...' : stats?.totalRides.toLocaleString() || 0}
                  </p>
                </div>
                <ChartBarIcon className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? '...' : stats?.completedRides.toLocaleString() || 0}
                  </p>
                </div>
                <TruckIcon className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Now</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statsLoading ? '...' : stats?.activeRides.toLocaleString() || 0}
                  </p>
                </div>
                <ClockIcon className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">
                    {statsLoading ? '...' : stats?.cancelledRides.toLocaleString() || 0}
                  </p>
                </div>
                <XCircleIcon className="h-12 w-12 text-red-500 opacity-20" />
              </div>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 bg-accent rounded animate-pulse" />
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Ride Price</span>
                  <span className="font-semibold">MWK {stats.averageRidePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Distance</span>
                  <span className="font-semibold">{stats.averageDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Duration</span>
                  <span className="font-semibold">{stats.averageDuration} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold">⭐ {stats.averageRating}/5</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 bg-accent rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.recentActivity ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{stats.recentActivity.today} rides</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Yesterday</span>
                  <span className="font-semibold">{stats.recentActivity.yesterday} rides</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold">{stats.recentActivity.thisWeek} rides</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold">{stats.recentActivity.thisMonth} rides</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">No data available</p>
            )}
          </Card>
        </div>

        {/* Rides by Status */}
        {stats?.ridesByStatus && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rides by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.ridesByStatus).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  requested: 'bg-blue-500 text-white',
                  pending_driver_acceptance: 'bg-yellow-500 text-white',
                  accepted: 'bg-green-500 text-white',
                  driver_arriving: 'bg-cyan-500 text-white',
                  in_progress: 'bg-purple-500 text-white',
                  completed: 'bg-green-600 text-white',
                  cancelled: 'bg-red-500 text-white',
                  cancelled_by_passenger: 'bg-orange-500 text-white',
                  cancelled_by_driver: 'bg-amber-600 text-white',
                  expired: 'bg-gray-500 text-white',
                };
                return (
                  <div key={status} className={cn('text-center p-6 rounded-lg shadow-sm', statusColors[status] || 'bg-gray-500 text-white')}>
                    <p className="text-3xl font-bold mb-1">{count}</p>
                    <p className="text-xs opacity-90 capitalize">{status.replace(/_/g, ' ')}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Cancellation Analysis */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cancellation Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last</span>
              <Input
                type="number"
                value={cancellationDays}
                onChange={(e) => setCancellationDays(parseInt(e.target.value) || 30)}
                className="w-20"
                min="1"
                max="365"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          {cancellationsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 bg-accent rounded animate-pulse" />
              ))}
            </div>
          ) : cancellations ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-md">
                  <p className="text-4xl font-bold mb-1">{cancellations.totalCancellations}</p>
                  <p className="text-sm opacity-90">Total</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md">
                  <p className="text-4xl font-bold mb-1">{cancellations.cancelledByPassenger}</p>
                  <p className="text-sm opacity-90">By Passengers</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-md">
                  <p className="text-4xl font-bold mb-1">{cancellations.cancelledByDriver}</p>
                  <p className="text-sm opacity-90">By Drivers</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md">
                  <p className="text-4xl font-bold mb-1">{cancellations.cancellationRate.toFixed(1)}%</p>
                  <p className="text-sm opacity-90">Rate</p>
                </div>
              </div>

              {cancellations.topReasons && cancellations.topReasons.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Top Cancellation Reasons</h4>
                  <div className="space-y-2">
                    {cancellations.topReasons.map((reason, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{reason.reason}</span>
                        </div>
                        <span className="font-bold text-orange-600">{reason.count} times</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Penalties Collected</span>
                  <span className="font-semibold text-lg">MWK {cancellations.penaltiesCollected.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No cancellation data available</p>
          )}
        </Card>

        {/* Revenue Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Summary</h3>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-40"
                placeholder="From"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-40"
                placeholder="To"
              />
            </div>
          </div>

          {revenueLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-accent rounded animate-pulse" />
              ))}
            </div>
          ) : revenue ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md">
                  <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold mb-1">MWK {revenue.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm opacity-90">Total Revenue</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md">
                  <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold mb-1">{revenue.completedRides.toLocaleString()}</p>
                  <p className="text-sm opacity-90">Completed Rides</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md">
                  <ChartBarIcon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-3xl font-bold mb-1">MWK {revenue.averageRideValue.toLocaleString()}</p>
                  <p className="text-sm opacity-90">Avg Ride Value</p>
                </div>
              </div>

              {revenue.revenueByVehicleType && Object.keys(revenue.revenueByVehicleType).length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Revenue by Vehicle Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(revenue.revenueByVehicleType).map(([type, amount]) => (
                      <div key={type} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="font-bold text-green-600">MWK {amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {revenue.period && (
                <div className="pt-4 border-t text-sm text-muted-foreground text-center">
                  Period: {revenue.period.from} to {revenue.period.to}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No revenue data available</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
