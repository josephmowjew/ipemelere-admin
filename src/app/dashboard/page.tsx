/**
 * Dashboard Overview Page - Main dashboard with real data integration
 * Following clean architecture patterns from design document
 */

'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UsersIcon, 
  TruckIcon, 
  MapIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCardsGrid } from '@/components/charts/MetricCard';
import { ActivityFeed } from '@/components/charts/ActivityFeed';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { UserGrowthChart } from '@/components/charts/UserGrowthChart';
import { useDashboardSummary, useRevenueChart, useUserGrowthChart } from '@/hooks/api/useDashboardData';
import { cn } from '@/lib/utils';
import type { MetricCardProps, SystemStatus } from '@/types/dashboard';

// System status component with real data
const SystemStatusCard: React.FC<{ 
  systemStatus: SystemStatus | undefined; 
  isLoading: boolean; 
}> = ({ systemStatus, isLoading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
      case 'connected':
        return 'bg-green-100 text-green-600';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'down':
      case 'error':
      case 'disconnected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'healthy': return 'Healthy';
      case 'connected': return 'Connected';
      case 'degraded': return 'Degraded';
      case 'warning': return 'Warning';
      case 'down': return 'Down';
      case 'error': return 'Error';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!systemStatus) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="text-center py-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Unable to load system status</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">System Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">API Status</span>
          <span className={cn('px-2 py-1 rounded-full text-xs', getStatusColor(systemStatus.apiStatus))}>
            {getStatusText(systemStatus.apiStatus)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Database</span>
          <span className={cn('px-2 py-1 rounded-full text-xs', getStatusColor(systemStatus.database))}>
            {getStatusText(systemStatus.database)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Payment Gateway</span>
          <span className={cn('px-2 py-1 rounded-full text-xs', getStatusColor(systemStatus.paymentGateway))}>
            {getStatusText(systemStatus.paymentGateway)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">WebSocket</span>
          <span className={cn('px-2 py-1 rounded-full text-xs', getStatusColor(systemStatus.webSocket))}>
            {getStatusText(systemStatus.webSocket)}
          </span>
        </div>
      </div>
      {systemStatus.lastUpdated && (
        <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          Last updated: {new Date(systemStatus.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </Card>
  );
};

// Quick actions component
const QuickActionsCard: React.FC = () => {
  const quickActions = [
    {
      title: 'Manage Drivers',
      description: 'Review applications',
      icon: TruckIcon,
      href: '/dashboard/drivers',
      count: 12,
    },
    {
      title: 'View Active Rides',
      description: 'Monitor live rides',
      icon: MapIcon,
      href: '/dashboard/rides/active',
    },
    {
      title: 'Manage Passengers',
      description: 'User management',
      icon: UsersIcon,
      href: '/dashboard/passengers',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.title} className="justify-start h-auto p-4" variant="outline">
              <div className="relative">
                <Icon className="h-5 w-5 mr-3" />
                {action.count && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.count}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

// Main dashboard page component
export default function DashboardPage() {
  // Fetch dashboard data using React Query hooks
  const {
    metrics,
    recentActivity,
    systemStatus,
    isLoading,
    hasError,
    metricsError,
    activityError,
    statusError,
  } = useDashboardSummary();

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueChart({ period: 'month' });
  const { data: userGrowthData, isLoading: growthLoading, error: growthError } = useUserGrowthChart({ period: 'month' });

  // Transform metrics data to MetricCard props
  const metricCards: MetricCardProps[] = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Drivers',
        value: metrics.totalDrivers?.count || 0,
        change: metrics.totalDrivers?.changePercent || 0,
        changeLabel: metrics.totalDrivers?.changeLabel || 'from last month',
        icon: TruckIcon,
        trend: metrics.totalDrivers?.trend || 'neutral',
      },
      {
        title: 'Active Passengers',
        value: metrics.activePassengers?.count || 0,
        change: metrics.activePassengers?.changePercent || 0,
        changeLabel: metrics.activePassengers?.changeLabel || 'from last month',
        icon: UsersIcon,
        trend: metrics.activePassengers?.trend || 'neutral',
      },
      {
        title: 'Completed Rides',
        value: metrics.completedRides?.count || 0,
        change: metrics.completedRides?.changePercent || 0,
        changeLabel: metrics.completedRides?.changeLabel || 'from last month',
        icon: MapIcon,
        trend: metrics.completedRides?.trend || 'neutral',
      },
      {
        title: 'Monthly Revenue',
        value: `${metrics.monthlyRevenue?.currency || 'MWK'} ${(metrics.monthlyRevenue?.amount || 0).toLocaleString()}`,
        change: metrics.monthlyRevenue?.changePercent || 0,
        changeLabel: metrics.monthlyRevenue?.changeLabel || 'from last month',
        icon: CurrencyDollarIcon,
        trend: metrics.monthlyRevenue?.trend || 'neutral',
      },
    ];
  }, [metrics]);

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
          {hasError && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">
                  Some dashboard data failed to load. Using cached or fallback data.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metrics grid */}
        <MetricCardsGrid 
          metrics={metricCards}
          isLoading={isLoading}
          error={metricsError}
        />

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart
            data={revenueData || []}
            isLoading={revenueLoading}
            error={revenueError?.message}
            title="Revenue Overview"
            type="area"
          />
          <UserGrowthChart
            data={userGrowthData || []}
            isLoading={growthLoading}
            error={growthError?.message}
            title="User Growth"
            type="line"
          />
        </div>

        {/* Activity and system status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <QuickActionsCard />
              <ActivityFeed
                activities={recentActivity || []}
                isLoading={isLoading}
                error={activityError}
                title="Recent Activity"
                maxItems={8}
              />
            </div>
          </div>
          <div>
            <SystemStatusCard 
              systemStatus={systemStatus} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}