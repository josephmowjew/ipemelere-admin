/**
 * UserGrowthChart Component - User growth visualization using Recharts
 * Following performance optimization patterns from design document
 */

'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UserGrowthData } from '@/types/dashboard';

// Reuse loading and error components from RevenueChart
const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="w-full" style={{ height }}>
    <div className="animate-pulse bg-muted rounded h-full flex items-center justify-center">
      <div className="text-muted-foreground">Loading chart...</div>
    </div>
  </div>
);

const ChartError: React.FC<{ error: string; height?: number }> = ({ error, height = 300 }) => (
  <div className="w-full flex items-center justify-center" style={{ height }}>
    <div className="text-center">
      <div className="text-destructive text-sm font-medium">Failed to load chart</div>
      <div className="text-muted-foreground text-xs mt-1">{error}</div>
    </div>
  </div>
);

// Custom tooltip for user growth data
const UserGrowthTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.name}:</span>
          <span className="text-sm font-medium text-foreground">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// Line chart showing user growth trends
interface UserGrowthLineChartProps {
  data: UserGrowthData[];
  height?: number;
  className?: string;
}

export const UserGrowthLineChart: React.FC<UserGrowthLineChartProps> = ({
  data,
  height = 300,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      totalUsers: item.totalUsers,
      drivers: item.drivers,
      passengers: item.passengers,
      newUsers: item.newUsers,
    }));
  }, [data]);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<UserGrowthTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalUsers"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Users"
          />
          <Line
            type="monotone"
            dataKey="drivers"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
            name="Drivers"
          />
          <Line
            type="monotone"
            dataKey="passengers"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 3 }}
            name="Passengers"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area chart showing user composition
interface UserGrowthAreaChartProps {
  data: UserGrowthData[];
  height?: number;
  className?: string;
}

export const UserGrowthAreaChart: React.FC<UserGrowthAreaChartProps> = ({
  data,
  height = 300,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      drivers: item.drivers,
      passengers: item.passengers,
    }));
  }, [data]);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="driversGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="passengersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<UserGrowthTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="passengers"
            stackId="1"
            stroke="hsl(var(--chart-3))"
            fill="url(#passengersGradient)"
            name="Passengers"
          />
          <Area
            type="monotone"
            dataKey="drivers"
            stackId="1"
            stroke="hsl(var(--chart-2))"
            fill="url(#driversGradient)"
            name="Drivers"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar chart showing new user registrations
interface NewUsersBarChartProps {
  data: UserGrowthData[];
  height?: number;
  className?: string;
}

export const NewUsersBarChart: React.FC<NewUsersBarChartProps> = ({
  data,
  height = 300,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      newUsers: item.newUsers,
    }));
  }, [data]);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<UserGrowthTooltip />} />
          <Bar
            dataKey="newUsers"
            fill="hsl(var(--primary))"
            name="New Users"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main User Growth Chart component with card wrapper
interface UserGrowthChartProps {
  data: UserGrowthData[];
  isLoading?: boolean;
  error?: string;
  title?: string;
  type?: 'line' | 'area' | 'bar';
  height?: number;
  className?: string;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  isLoading = false,
  error,
  title = 'User Growth',
  type = 'line',
  height = 300,
  className
}) => {
  // Calculate growth statistics
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { totalUsers: 0, totalGrowth: 0, avgNewUsers: 0 };
    }

    const latest = data[data.length - 1];
    const earliest = data[0];
    const totalGrowth = latest.totalUsers - earliest.totalUsers;
    const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
    const avgNewUsers = totalNewUsers / data.length;

    return {
      totalUsers: latest.totalUsers,
      totalGrowth,
      avgNewUsers: Math.round(avgNewUsers),
    };
  }, [data]);

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {!isLoading && !error && data.length > 0 && (
            <div className="flex items-center space-x-4 mt-1">
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">
                  {stats.totalUsers.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Growth: <span className="font-medium text-green-600">
                  +{stats.totalGrowth.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg New: <span className="font-medium text-foreground">
                  {stats.avgNewUsers}/period
                </span>
              </div>
            </div>
          )}
        </div>
        {!isLoading && !error && data.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {data.length} periods
          </div>
        )}
      </div>

      {/* Chart */}
      {error ? (
        <ChartError error={error} height={height} />
      ) : isLoading ? (
        <ChartSkeleton height={height} />
      ) : data.length === 0 ? (
        <div className="w-full flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-muted-foreground">No user growth data available</div>
          </div>
        </div>
      ) : type === 'area' ? (
        <UserGrowthAreaChart data={data} height={height} />
      ) : type === 'bar' ? (
        <NewUsersBarChart data={data} height={height} />
      ) : (
        <UserGrowthLineChart data={data} height={height} />
      )}
    </Card>
  );
};

// Individual chart components are already exported above

// Default export
export default UserGrowthChart;