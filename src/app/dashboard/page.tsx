/**
 * Dashboard Overview Page - Main dashboard with key metrics
 * Following reusable component patterns from design document
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UsersIcon, 
  TruckIcon, 
  MapIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Types for reusable components
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
}


// Reusable MetricCard component following our design principles
function MetricCard({ title, value, change, changeLabel, icon: Icon, trend }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : null;

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {TrendIcon && (
            <div className={`flex items-center text-sm ${trendColors[trend]}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span>{Math.abs(change)}% {changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Main dashboard page component
export default function DashboardPage() {
  // Mock data - in real app, this would come from API
  const metrics = [
    {
      title: 'Total Drivers',
      value: 847,
      change: 12,
      changeLabel: 'from last month',
      icon: TruckIcon,
      trend: 'up' as const
    },
    {
      title: 'Active Passengers',
      value: '3.2K',
      change: 8,
      changeLabel: 'from last month',
      icon: UsersIcon,
      trend: 'up' as const
    },
    {
      title: 'Completed Rides',
      value: '12.8K',
      change: 15,
      changeLabel: 'from last month',
      icon: MapIcon,
      trend: 'up' as const
    },
    {
      title: 'Monthly Revenue',
      value: '$28,540',
      change: 5,
      changeLabel: 'from last month',
      icon: CurrencyDollarIcon,
      trend: 'up' as const
    }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Ipemelere Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your taxi and courier services platform
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Quick actions and system status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <TruckIcon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manage Drivers</p>
                    <p className="text-xs text-muted-foreground">Review applications</p>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <MapIcon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">View Active Rides</p>
                    <p className="text-xs text-muted-foreground">Monitor live rides</p>
                  </div>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline">
                  <UsersIcon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manage Passengers</p>
                    <p className="text-xs text-muted-foreground">User management</p>
                  </div>
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                  Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payment Gateway</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                  Connected
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

