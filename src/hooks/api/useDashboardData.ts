/**
 * Dashboard Data Hooks - React Query hooks for dashboard data
 * Following state management strategy from design document
 */

'use client';

import { useQuery, useQueries, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { vehicleAPI, type PendingVehicle } from '@/lib/api/vehicles';
import {
  DashboardMetrics,
  ActivityItem,
  SystemStatus,
  RevenueData,
  UserGrowthData,
  DashboardData,
  DashboardQueryParams,
} from '@/types/dashboard';

// Query keys for consistent caching
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardQueryKeys.all, 'metrics'] as const,
  activity: (limit?: number) => [...dashboardQueryKeys.all, 'activity', { limit }] as const,
  systemStatus: () => [...dashboardQueryKeys.all, 'systemStatus'] as const,
  revenueChart: (params?: DashboardQueryParams) => [...dashboardQueryKeys.all, 'revenueChart', params] as const,
  userGrowthChart: (params?: DashboardQueryParams) => [...dashboardQueryKeys.all, 'userGrowthChart', params] as const,
  pendingVehicles: () => [...dashboardQueryKeys.all, 'pendingVehicles'] as const,
  pendingVehiclesSummary: () => [...dashboardQueryKeys.all, 'pendingVehiclesSummary'] as const,
  allData: () => [...dashboardQueryKeys.all, 'allData'] as const,
};

// Hook for dashboard metrics (drivers, passengers, rides, revenue)
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.metrics(),
    queryFn: dashboardApi.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for recent activity feed
export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: dashboardQueryKeys.activity(limit),
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (activity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for system status
export const useSystemStatus = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.systemStatus(),
    queryFn: dashboardApi.getSystemStatus,
    staleTime: 30 * 1000, // 30 seconds (system status should be fresh)
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Check every minute
    retry: 1, // Don't retry too much for status checks
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for revenue chart data
export const useRevenueChart = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: dashboardQueryKeys.revenueChart(params),
    queryFn: () => dashboardApi.getRevenueChart(params),
    staleTime: 15 * 60 * 1000, // 15 minutes (chart data less frequent)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch charts on focus
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled, but could be conditional based on params
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for user growth chart data
export const useUserGrowthChart = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: dashboardQueryKeys.userGrowthChart(params),
    queryFn: () => dashboardApi.getUserGrowthChart(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for pending vehicles
export const usePendingVehicles = (params: {
  page?: number;
  limit?: number;
  priority?: PendingVehicle['priority'];
  sortBy?: 'submissionDate' | 'priority' | 'driverName';
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  return useQuery({
    queryKey: [...dashboardQueryKeys.pendingVehicles(), params], // Include params in query key
    queryFn: () => vehicleAPI.getPendingVehicles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (pending vehicles change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => data.data,
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for pending vehicles summary
export const usePendingVehiclesSummary = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.pendingVehiclesSummary(),
    queryFn: () => vehicleAPI.getPendingVehiclesSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data) => data.data,
    initialData: undefined, // Ensure we start with undefined, not cached data
  });
};

// Hook for all dashboard data (optimized parallel fetching)
export const useAllDashboardData = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.allData(),
    queryFn: dashboardApi.getAllDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Multiple queries hook for parallel fetching with individual control
export const useDashboardQueries = (params?: {
  revenueParams?: DashboardQueryParams;
  userGrowthParams?: DashboardQueryParams;
  activityLimit?: number;
}) => {
  return useQueries({
    queries: [
      {
        queryKey: dashboardQueryKeys.metrics(),
        queryFn: dashboardApi.getMetrics,
        staleTime: 5 * 60 * 1000,
        retry: 3,
      },
      {
        queryKey: dashboardQueryKeys.activity(params?.activityLimit),
        queryFn: () => dashboardApi.getRecentActivity(params?.activityLimit),
        staleTime: 2 * 60 * 1000,
        refetchInterval: 60 * 1000,
      },
      {
        queryKey: dashboardQueryKeys.systemStatus(),
        queryFn: dashboardApi.getSystemStatus,
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
      },
      {
        queryKey: dashboardQueryKeys.revenueChart(params?.revenueParams),
        queryFn: () => dashboardApi.getRevenueChart(params?.revenueParams),
        staleTime: 15 * 60 * 1000,
      },
      {
        queryKey: dashboardQueryKeys.userGrowthChart(params?.userGrowthParams),
        queryFn: () => dashboardApi.getUserGrowthChart(params?.userGrowthParams),
        staleTime: 15 * 60 * 1000,
      },
    ],
  });
};

// Derived state hook for dashboard summary
export const useDashboardSummary = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: activity, isLoading: activityLoading, error: activityError } = useRecentActivity(5);
  const { data: systemStatus, isLoading: statusLoading, error: statusError } = useSystemStatus();

  return {
    // Data
    metrics,
    recentActivity: activity,
    systemStatus,
    
    // Loading states
    isLoading: metricsLoading || activityLoading || statusLoading,
    isMetricsLoading: metricsLoading,
    isActivityLoading: activityLoading,
    isStatusLoading: statusLoading,
    
    // Error states
    hasError: Boolean(metricsError || activityError || statusError),
    metricsError: metricsError?.message,
    activityError: activityError?.message,
    statusError: statusError?.message,
    
    // Utility flags
    isEmpty: !metrics && !activity && !systemStatus,
    isReady: !!(metrics && activity && systemStatus),
  };
};

// Hook for real-time dashboard updates (with interval)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useRealTimeDashboard = (_interval: number = 30000) => { // 30 seconds default
  const queries = useDashboardQueries();
  
  // Extract loading states
  const isLoading = queries.some(query => query.isLoading);
  const isFetching = queries.some(query => query.isFetching);
  const hasError = queries.some(query => query.error);
  
  // Extract data
  const [metricsQuery, activityQuery, statusQuery, revenueQuery, growthQuery] = queries;
  
  return {
    // Data
    metrics: metricsQuery.data,
    activity: activityQuery.data,
    systemStatus: statusQuery.data,
    revenueChart: revenueQuery.data,
    userGrowthChart: growthQuery.data,
    
    // States
    isLoading,
    isFetching,
    hasError,
    
    // Individual query states for granular control
    queries: {
      metrics: metricsQuery,
      activity: activityQuery,
      systemStatus: statusQuery,
      revenueChart: revenueQuery,
      userGrowthChart: growthQuery,
    },
    
    // Utility
    isReady: !isLoading && !hasError,
    lastUpdated: Math.min(...queries.map(q => q.dataUpdatedAt || 0)),
  };
};

// Hook for vehicle approval mutations
export const useVehicleApprovalMutations = () => {
  const queryClient = useQueryClient();

  const approveVehicle = useMutation({
    mutationFn: ({ vehicleId, notes }: { vehicleId: number; notes?: string }) =>
      vehicleAPI.approveVehicle(vehicleId, { notes }),
    onSuccess: () => {
      // Invalidate pending vehicles queries
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehicles() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehiclesSummary() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.metrics() });
    },
  });

  const rejectVehicle = useMutation({
    mutationFn: ({ vehicleId, reason, notes }: { vehicleId: number; reason: string; notes?: string }) =>
      vehicleAPI.rejectVehicle(vehicleId, { reason, notes }),
    onSuccess: () => {
      // Invalidate pending vehicles queries
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehicles() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehiclesSummary() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.metrics() });
    },
  });

  const bulkApproveVehicles = useMutation({
    mutationFn: ({ vehicleIds, notes }: { vehicleIds: number[]; notes?: string }) =>
      vehicleAPI.bulkApproveVehicles(vehicleIds, notes),
    onSuccess: () => {
      // Invalidate pending vehicles queries
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehicles() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehiclesSummary() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.metrics() });
    },
  });

  const bulkRejectVehicles = useMutation({
    mutationFn: ({ vehicleIds, reason, notes }: { vehicleIds: number[]; reason: string; notes?: string }) =>
      vehicleAPI.bulkRejectVehicles(vehicleIds, reason, notes),
    onSuccess: () => {
      // Invalidate pending vehicles queries
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehicles() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.pendingVehiclesSummary() });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.metrics() });
    },
  });

  return {
    approveVehicle,
    rejectVehicle,
    bulkApproveVehicles,
    bulkRejectVehicles,
  };
};

// Hook for optimistic dashboard updates (useful for real-time features)
export const useDashboardMutations = () => {
  // This could be extended to include mutations for updating dashboard settings
  // or triggering manual refreshes with optimistic updates

  const refreshAll = () => {
    // Manually trigger refetch for all dashboard queries
    // This would typically be called after important actions
  };

  return {
    refreshAll,
  };
};

// Export types for better TypeScript support
export type DashboardMetricsQuery = UseQueryResult<DashboardMetrics>;
export type ActivityQuery = UseQueryResult<ActivityItem[]>;
export type SystemStatusQuery = UseQueryResult<SystemStatus>;
export type RevenueChartQuery = UseQueryResult<RevenueData[]>;
export type UserGrowthChartQuery = UseQueryResult<UserGrowthData[]>;
export type AllDashboardDataQuery = UseQueryResult<DashboardData>;