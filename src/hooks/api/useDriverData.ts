/**
 * Driver Data Hooks - React Query hooks for driver management
 * Following the same patterns as passenger data hooks
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryResult,
  type UseMutationResult,
  type InfiniteData
} from '@tanstack/react-query';
import { driverAPI, type Driver, type DriverListParams, type DriverUpdateData, type DriverStatusChangeData, type DocumentReviewData, type DriverDocument } from '@/lib/api/drivers';
import type { PaginationResponse, ActivityRecord, RideRecord, DriverAnalytics } from '@/lib/api/types';

// Query keys for consistent caching
export const driverQueryKeys = {
  all: ['drivers'] as const,
  lists: () => [...driverQueryKeys.all, 'list'] as const,
  list: (params?: DriverListParams) => [...driverQueryKeys.lists(), params] as const,
  details: () => [...driverQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...driverQueryKeys.details(), id] as const,
  activity: (id: number) => [...driverQueryKeys.detail(id), 'activity'] as const,
  rides: (id: number, params?: { page?: number; limit?: number }) => [...driverQueryKeys.detail(id), 'rides', params] as const,
  analytics: (id: number) => [...driverQueryKeys.detail(id), 'analytics'] as const,
  documents: (id: number) => [...driverQueryKeys.detail(id), 'documents'] as const,
  pendingDocuments: () => [...driverQueryKeys.all, 'pendingDocuments'] as const,
  export: (params?: Omit<DriverListParams, 'page' | 'limit'>) => [...driverQueryKeys.all, 'export', params] as const,
};

// Hook for paginated driver list
export const useDrivers = (params: DriverListParams = {}) => {
  return useQuery({
    queryKey: driverQueryKeys.list(params),
    queryFn: () => driverAPI.getDrivers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep previous data during refetch for smooth pagination
    placeholderData: (previousData) => previousData,
  });
};

// Hook for infinite scroll driver list
export const useInfiniteDrivers = (params: Omit<DriverListParams, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...driverQueryKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) => driverAPI.getDrivers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 3,
    initialPageParam: 1,
  });
};

// Hook for individual driver details
export const useDriver = (id: number) => {
  return useQuery({
    queryKey: driverQueryKeys.detail(id),
    queryFn: () => driverAPI.getDriver(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!id && id > 0,
  });
};

// Hook for driver activity history
export const useDriverActivity = (id: number) => {
  return useQuery({
    queryKey: driverQueryKeys.activity(id),
    queryFn: async () => {
      try {
        return await driverAPI.getDriverActivity(id);
      } catch (error: any) {
        // Return empty array for 404 or other errors
        console.warn(`Driver activity not found for ID ${id}:`, error?.message);
        return [];
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute (activity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry since we're handling errors gracefully
    enabled: !!id && id > 0,
    refetchOnWindowFocus: true,
  });
};

// Hook for driver ride history
export const useDriverRides = (id: number, params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: driverQueryKeys.rides(id, params),
    queryFn: () => driverAPI.getDriverRides(id, params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!id && id > 0,
    placeholderData: (previousData) => previousData,
  });
};

// Hook for driver analytics
export const useDriverAnalytics = (id: number) => {
  return useQuery({
    queryKey: driverQueryKeys.analytics(id),
    queryFn: () => driverAPI.getDriverAnalytics(id),
    staleTime: 10 * 60 * 1000, // 10 minutes (analytics change less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: false, // Don't retry since we're handling errors gracefully
    enabled: !!id && id > 0,
  });
};

// Hook for driver documents
export const useDriverDocuments = (id: number) => {
  return useQuery({
    queryKey: driverQueryKeys.documents(id),
    queryFn: async () => {
      try {
        return await driverAPI.getDriverDocuments(id);
      } catch (error: any) {
        // Return empty array for 404 or other errors
        console.warn(`Driver documents not found for ID ${id}:`, error?.message);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry since we're handling errors gracefully
    enabled: !!id && id > 0,
  });
};

// Hook for pending documents
export const usePendingDriverDocuments = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [...driverQueryKeys.pendingDocuments(), params],
    queryFn: () => driverAPI.getPendingDocuments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (pending items change frequently)
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
  });
};

// Hook for driver statistics
export const useDriverStats = () => {
  return useQuery({
    queryKey: [...driverQueryKeys.all, 'stats'],
    queryFn: () => driverAPI.getDriverStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes (stats change less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

// Mutation hook for updating driver information
export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DriverUpdateData }): Promise<Driver> => {
      return driverAPI.updateDriver(id, data);
    },
    onSuccess: (updatedDriver, { id }) => {
      // Update the driver in the cache
      queryClient.setQueryData(
        driverQueryKeys.detail(id),
        updatedDriver
      );

      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: driverQueryKeys.lists() });

      // Add activity entry for the update
      queryClient.invalidateQueries({
        queryKey: driverQueryKeys.activity(id)
      });
    },
    onError: (error) => {
      console.error('Failed to update driver:', error);
    },
  });
};

// Mutation hook for updating driver status
export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DriverStatusChangeData }): Promise<Driver> => {
      return driverAPI.updateDriverStatus(id, data);
    },
    onSuccess: (updatedDriver, { id }) => {
      // Update the driver in the cache
      queryClient.setQueryData(
        driverQueryKeys.detail(id),
        updatedDriver
      );

      // Invalidate lists to refetch with updated status
      queryClient.invalidateQueries({ queryKey: driverQueryKeys.lists() });

      // Add activity entry for the status change
      queryClient.invalidateQueries({
        queryKey: driverQueryKeys.activity(id)
      });
    },
    onError: (error) => {
      console.error('Failed to update driver status:', error);
    },
  });
};

// Mutation hook for reviewing driver documents
export const useReviewDriverDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      documentId,
      data
    }: {
      driverId: number;
      documentId: number;
      data: DocumentReviewData
    }): Promise<DriverDocument> => {
      return driverAPI.reviewDocument(driverId, documentId, data);
    },
    onSuccess: (_, { driverId }) => {
      // Invalidate driver details to refetch with updated document
      queryClient.invalidateQueries({
        queryKey: driverQueryKeys.detail(driverId)
      });

      // Invalidate driver documents
      queryClient.invalidateQueries({
        queryKey: driverQueryKeys.documents(driverId)
      });

      // Invalidate pending documents list
      queryClient.invalidateQueries({
        queryKey: driverQueryKeys.pendingDocuments()
      });

      // Invalidate driver lists (status might change)
      queryClient.invalidateQueries({ queryKey: driverQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to review document:', error);
    },
  });
};

// Hook for exporting driver data
export const useExportDrivers = () => {
  return useMutation({
    mutationFn: (params: Omit<DriverListParams, 'page' | 'limit'> = {}): Promise<Blob> => {
      return driverAPI.exportDrivers(params);
    },
    onSuccess: (blob, _params) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drivers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Failed to export drivers:', error);
    },
  });
};

// Combined hook for driver details page (fetches driver + activity + rides + analytics)
export const useDriverDetails = (id: number) => {
  const driver = useDriver(id);
  const activity = useDriverActivity(id);
  const rides = useDriverRides(id, { page: 1, limit: 10 });
  const analytics = useDriverAnalytics(id);
  const documents = useDriverDocuments(id);


  return {
    // Data
    driver: driver.data,
    activity: activity.data,
    rides: rides.data,
    analytics: analytics.data,
    documents: documents.data,

    // Loading states
    isLoading: driver.isLoading || activity.isLoading || rides.isLoading || analytics.isLoading || documents.isLoading,
    isDriverLoading: driver.isLoading,
    isActivityLoading: activity.isLoading,
    isRidesLoading: rides.isLoading,
    isAnalyticsLoading: analytics.isLoading,
    isDocumentsLoading: documents.isLoading,

    // Error states - only consider driver fetch as critical error
    hasError: Boolean(driver.error),
    driverError: driver.error?.message,
    activityError: activity.error?.message,
    ridesError: rides.error?.message,
    analyticsError: analytics.error?.message,
    documentsError: documents.error?.message,

    // Utility flags
    isReady: !!(driver.data && !driver.isLoading),
    isEmpty: !driver.data && !driver.isLoading,

    // Refetch functions
    refetchDriver: driver.refetch,
    refetchActivity: activity.refetch,
    refetchRides: rides.refetch,
    refetchAnalytics: analytics.refetch,
    refetchDocuments: documents.refetch,
    refetchAll: () => {
      driver.refetch();
      activity.refetch();
      rides.refetch();
      analytics.refetch();
      documents.refetch();
    },
  };
};

// Hook for driver search with debouncing
export const useDriverSearch = (searchTerm: string, filters: Omit<DriverListParams, 'search'> = {}) => {
  return useQuery({
    queryKey: [...driverQueryKeys.lists(), 'search', { search: searchTerm, ...filters }],
    queryFn: () => driverAPI.getDrivers({ search: searchTerm, ...filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: searchTerm.length >= 2, // Only search if search term is at least 2 characters
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};

// Hook for managing filter state with URL persistence
export const useDriverFilterState = (initialFilters: DriverListParams = {}) => {
  const [filters, setFilters] = useState<DriverListParams>(initialFilters);

  const updateFilter = useCallback((key: keyof DriverListParams, value: DriverListParams[keyof DriverListParams]) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 50 });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof DriverListParams];
      return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    setFilters,
  };
};

// Prefetch utilities
export const useDriverPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchDriver = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: driverQueryKeys.detail(id),
      queryFn: () => driverAPI.getDriver(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchDriverActivity = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: driverQueryKeys.activity(id),
      queryFn: () => driverAPI.getDriverActivity(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchDriver,
    prefetchDriverActivity,
  };
};

// Export types for better TypeScript support
export type DriverQuery = UseQueryResult<Driver>;
export type DriverListQuery = UseQueryResult<PaginationResponse<Driver>>;
export type DriverActivityQuery = UseQueryResult<ActivityRecord[]>;
export type DriverRidesQuery = UseQueryResult<PaginationResponse<RideRecord>>;
export type DriverAnalyticsQuery = UseQueryResult<DriverAnalytics>;
export type DriverMutation = UseMutationResult<Driver, Error, { id: number; data: DriverUpdateData }>;
export type DriverStatusMutation = UseMutationResult<Driver, Error, { id: number; data: DriverStatusChangeData }>;
export type DriverExportMutation = UseMutationResult<Blob, Error, Omit<DriverListParams, 'page' | 'limit'>>;
export type InfiniteDriverQuery = UseQueryResult<InfiniteData<PaginationResponse<Driver>, unknown>, Error>;