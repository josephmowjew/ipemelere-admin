/**
 * RevenueChart Component - Revenue data visualization using Recharts
 * Following performance optimization patterns from design document
 */

'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RevenueData } from '@/types/dashboard';

// Chart loading skeleton
const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="w-full" style={{ height }}>
    <div className="animate-pulse bg-muted rounded h-full flex items-center justify-center">
      <div className="text-muted-foreground">Loading chart...</div>
    </div>
  </div>
);

// Chart error state
const ChartError: React.FC<{ error: string; height?: number }> = ({ error, height = 300 }) => (
  <div className="w-full flex items-center justify-center" style={{ height }}>
    <div className="text-center">
      <div className="text-destructive text-sm font-medium">Failed to load chart</div>
      <div className="text-muted-foreground text-xs mt-1">{error}</div>
    </div>
  </div>
);

// Custom tooltip component
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
            {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// Revenue area chart component
interface RevenueAreaChartProps {
  data: RevenueData[];
  height?: number;
  showRides?: boolean;
  className?: string;
}

export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({
  data,
  height = 300,
  showRides = false,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      revenue: item.revenue,
      rides: showRides ? item.rides : undefined,
      avgValue: item.averageRideValue,
    }));
  }, [data, showRides]);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenue bar chart component with rides comparison
interface RevenueBarChartProps {
  data: RevenueData[];
  height?: number;
  className?: string;
}

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({
  data,
  height = 300,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      revenue: item.revenue,
      rides: item.rides,
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
            yAxisId="revenue"
            orientation="left"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="rides"
            orientation="right"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill="hsl(var(--primary))"
            name="Revenue"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            yAxisId="rides"
            dataKey="rides"
            fill="hsl(var(--muted))"
            name="Rides"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Revenue Chart component with card wrapper
interface RevenueChartProps {
  data: RevenueData[];
  isLoading?: boolean;
  error?: string;
  title?: string;
  type?: 'area' | 'bar';
  height?: number;
  showRides?: boolean;
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  isLoading = false,
  error,
  title = 'Revenue Overview',
  type = 'area',
  height = 300,
  showRides = false,
  className
}) => {
  // Calculate total and average revenue for header
  const { totalRevenue, avgRevenue } = useMemo(() => {
    if (data.length === 0) return { totalRevenue: 0, avgRevenue: 0 };
    
    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    const avg = total / data.length;
    
    return { totalRevenue: total, avgRevenue: avg };
  }, [data]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `MWK ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `MWK ${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg: <span className="font-medium text-foreground">
                  {formatCurrency(avgRevenue)}
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
            <div className="text-muted-foreground">No revenue data available</div>
          </div>
        </div>
      ) : type === 'bar' ? (
        <RevenueBarChart data={data} height={height} />
      ) : (
        <RevenueAreaChart data={data} height={height} showRides={showRides} />
      )}
    </Card>
  );
};

// Individual chart components are already exported above

// Default export
export default RevenueChart;