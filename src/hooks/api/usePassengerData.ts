/**
 * Passenger Data Hooks - React Query hooks for passenger management
 * Following state management strategy from design document
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
import { passengerApi } from '@/lib/api/passengers';
import type { FilterOption } from '@/components/ui/FilterDropdown';
import type {
  Passenger,
  PassengerListParams,
  PassengerListResponse,
  PassengerUpdateData,
  PassengerStatusChangeData,
  PassengerActivity,
  PassengerRide,
  PassengerStats,
  PassengerExportParams,
  PaginationMeta,
  PassengerFormData
} from '@/types/passenger';

// Query keys for consistent caching
export const passengerQueryKeys = {
  all: ['passengers'] as const,
  lists: () => [...passengerQueryKeys.all, 'list'] as const,
  list: (params?: PassengerListParams) => [...passengerQueryKeys.lists(), params] as const,
  details: () => [...passengerQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...passengerQueryKeys.details(), id] as const,
  activity: (id: number) => [...passengerQueryKeys.detail(id), 'activity'] as const,
  rides: (id: number, params?: { page?: number; limit?: number }) => [...passengerQueryKeys.detail(id), 'rides', params] as const,
  stats: () => [...passengerQueryKeys.all, 'stats'] as const,
  export: (params?: PassengerExportParams) => [...passengerQueryKeys.all, 'export', params] as const,
};

// Hook for paginated passenger list
export const usePassengers = (params: PassengerListParams = {}) => {
  return useQuery({
    queryKey: passengerQueryKeys.list(params),
    queryFn: () => passengerApi.getPassengers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep previous data during refetch for smooth pagination
    placeholderData: (previousData) => previousData,
  });
};

// Hook for infinite scroll passenger list
export const useInfinitePassengers = (params: Omit<PassengerListParams, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...passengerQueryKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) => passengerApi.getPassengers({ ...params, page: pageParam }),
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

// Hook for individual passenger details
export const usePassenger = (id: number) => {
  return useQuery({
    queryKey: passengerQueryKeys.detail(id),
    queryFn: () => passengerApi.getPassenger(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!id && id > 0,
  });
};

// Hook for passenger activity history
export const usePassengerActivity = (id: number) => {
  return useQuery({
    queryKey: passengerQueryKeys.activity(id),
    queryFn: () => passengerApi.getPassengerActivity(id),
    staleTime: 1 * 60 * 1000, // 1 minute (activity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!id && id > 0,
    refetchOnWindowFocus: true,
  });
};

// Hook for passenger ride history
export const usePassengerRides = (id: number, params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: passengerQueryKeys.rides(id, params),
    queryFn: () => passengerApi.getPassengerRides(id, params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!id && id > 0,
    placeholderData: (previousData) => previousData,
  });
};

// Hook for passenger statistics
export const usePassengerStats = () => {
  return useQuery({
    queryKey: passengerQueryKeys.stats(),
    queryFn: passengerApi.getPassengerStats,
    staleTime: 10 * 60 * 1000, // 10 minutes (stats change less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
};

// Mutation hook for creating passengers
export const useCreatePassenger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PassengerFormData): Promise<Passenger> => {
      // Since we don't have a create endpoint in the API service,
      // this would need to be added to the passengerApi
      throw new Error('Create passenger endpoint not implemented');
    },
    onSuccess: (newPassenger) => {
      // Invalidate passenger lists to refetch
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.stats() });
      
      // Add the new passenger to the cache
      queryClient.setQueryData(
        passengerQueryKeys.detail(newPassenger.id),
        newPassenger
      );
    },
    onError: (error) => {
      console.error('Failed to create passenger:', error);
    },
  });
};

// Mutation hook for updating passenger information
export const useUpdatePassenger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PassengerUpdateData }): Promise<Passenger> => {
      return passengerApi.updatePassenger(id, data);
    },
    onSuccess: (updatedPassenger, { id }) => {
      // Update the passenger in the cache
      queryClient.setQueryData(
        passengerQueryKeys.detail(id),
        updatedPassenger
      );
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.lists() });
      
      // Add activity entry for the update
      queryClient.invalidateQueries({ 
        queryKey: passengerQueryKeys.activity(id) 
      });
    },
    onError: (error) => {
      console.error('Failed to update passenger:', error);
    },
  });
};

// Mutation hook for updating passenger status
export const useUpdatePassengerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PassengerStatusChangeData }): Promise<Passenger> => {
      return passengerApi.updatePassengerStatus(id, data);
    },
    onSuccess: (updatedPassenger, { id }) => {
      // Update the passenger in the cache
      queryClient.setQueryData(
        passengerQueryKeys.detail(id),
        updatedPassenger
      );
      
      // Invalidate lists to refetch with updated status
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.stats() });
      
      // Add activity entry for the status change
      queryClient.invalidateQueries({ 
        queryKey: passengerQueryKeys.activity(id) 
      });
    },
    onError: (error) => {
      console.error('Failed to update passenger status:', error);
    },
  });
};

// Mutation hook for bulk passenger operations
export const useBulkPassengerAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ids, 
      action, 
      data 
    }: { 
      ids: number[]; 
      action: 'status_change' | 'export' | 'delete';
      data?: any;
    }): Promise<void> => {
      // This would be implemented when bulk operations are added to the API
      throw new Error('Bulk passenger operations not implemented');
    },
    onSuccess: (_, { ids, action }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: passengerQueryKeys.stats() });
      
      // Invalidate individual passenger details if needed
      if (action !== 'export') {
        ids.forEach(id => {
          queryClient.invalidateQueries({ 
            queryKey: passengerQueryKeys.detail(id) 
          });
          queryClient.invalidateQueries({ 
            queryKey: passengerQueryKeys.activity(id) 
          });
        });
      }
    },
  });
};

// Hook for exporting passenger data
export const useExportPassengers = () => {
  return useMutation({
    mutationFn: (params: PassengerExportParams = {}): Promise<Blob> => {
      return passengerApi.exportPassengers(params);
    },
    onSuccess: (blob, params) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passengers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Failed to export passengers:', error);
    },
  });
};

// Combined hook for passenger details page (fetches passenger + activity + rides)
export const usePassengerDetails = (id: number) => {
  const passenger = usePassenger(id);
  const activity = usePassengerActivity(id);
  const rides = usePassengerRides(id, { page: 1, limit: 10 });

  return {
    // Data
    passenger: passenger.data,
    activity: activity.data,
    rides: rides.data,
    
    // Loading states
    isLoading: passenger.isLoading || activity.isLoading || rides.isLoading,
    isPassengerLoading: passenger.isLoading,
    isActivityLoading: activity.isLoading,
    isRidesLoading: rides.isLoading,
    
    // Error states
    hasError: Boolean(passenger.error || activity.error || rides.error),
    passengerError: passenger.error?.message,
    activityError: activity.error?.message,
    ridesError: rides.error?.message,
    
    // Utility flags
    isReady: !!(passenger.data && !passenger.isLoading),
    isEmpty: !passenger.data && !passenger.isLoading,
    
    // Refetch functions
    refetchPassenger: passenger.refetch,
    refetchActivity: activity.refetch,
    refetchRides: rides.refetch,
    refetchAll: () => {
      passenger.refetch();
      activity.refetch();
      rides.refetch();
    },
  };
};

// Hook for optimistic passenger updates
export const useOptimisticPassenger = (id: number) => {
  const queryClient = useQueryClient();

  const updateOptimistically = (updates: Partial<Passenger>) => {
    queryClient.setQueryData(
      passengerQueryKeys.detail(id),
      (old: Passenger | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      }
    );
  };

  const rollbackOptimisticUpdate = () => {
    queryClient.invalidateQueries({ 
      queryKey: passengerQueryKeys.detail(id) 
    });
  };

  return {
    updateOptimistically,
    rollbackOptimisticUpdate,
  };
};

// Hook for passenger search with debouncing
export const usePassengerSearch = (searchTerm: string, filters: Omit<PassengerListParams, 'search'> = {}) => {
  return useQuery({
    queryKey: [...passengerQueryKeys.lists(), 'search', { search: searchTerm, ...filters }],
    queryFn: () => passengerApi.getPassengers({ search: searchTerm, ...filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: searchTerm.length >= 2, // Only search if search term is at least 2 characters
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};

// Advanced filter hook with better caching
export const usePassengerFilters = () => {
  const queryClient = useQueryClient();
  
  // Get unique districts from cached passenger data for filter options
  const getDistrictOptions = (): FilterOption[] => {
    const cachedData = queryClient.getQueriesData({ queryKey: passengerQueryKeys.lists() });
    const allPassengers: Passenger[] = [];
    
    cachedData.forEach(([, data]) => {
      if (data && typeof data === 'object' && 'data' in data) {
        const passengerList = data.data as Passenger[];
        allPassengers.push(...passengerList);
      }
    });
    
    const districts = Array.from(new Set(allPassengers.map(p => p.district))).sort();
    return districts.map(district => ({
      value: district,
      label: district,
      count: allPassengers.filter(p => p.district === district).length
    }));
  };

  // Get status counts for filter options
  const getStatusOptions = (): FilterOption[] => {
    const cachedData = queryClient.getQueriesData({ queryKey: passengerQueryKeys.lists() });
    const allPassengers: Passenger[] = [];
    
    cachedData.forEach(([, data]) => {
      if (data && typeof data === 'object' && 'data' in data) {
        const passengerList = data.data as Passenger[];
        allPassengers.push(...passengerList);
      }
    });
    
    const statuses: Passenger['status'][] = ['active', 'suspended', 'banned', 'pending'];
    return statuses.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: allPassengers.filter(p => p.status === status).length
    }));
  };

  // Get verification status options
  const getVerificationOptions = (): FilterOption[] => {
    const cachedData = queryClient.getQueriesData({ queryKey: passengerQueryKeys.lists() });
    const allPassengers: Passenger[] = [];
    
    cachedData.forEach(([, data]) => {
      if (data && typeof data === 'object' && 'data' in data) {
        const passengerList = data.data as Passenger[];
        allPassengers.push(...passengerList);
      }
    });
    
    const statuses = ['verified', 'pending', 'rejected'] as const;
    return statuses.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: allPassengers.filter(p => p.documentVerificationStatus === status).length
    }));
  };

  return {
    getDistrictOptions,
    getStatusOptions,
    getVerificationOptions,
  };
};

// Hook for managing filter state with URL persistence
export const usePassengerFilterState = (initialFilters: PassengerListParams = {}) => {
  const [filters, setFilters] = useState<PassengerListParams>(initialFilters);
  
  const updateFilter = useCallback((key: keyof PassengerListParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 50 });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof PassengerListParams];
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
export const usePassengerPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchPassenger = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: passengerQueryKeys.detail(id),
      queryFn: () => passengerApi.getPassenger(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchPassengerActivity = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: passengerQueryKeys.activity(id),
      queryFn: () => passengerApi.getPassengerActivity(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchPassenger,
    prefetchPassengerActivity,
  };
};

// Export types for better TypeScript support
export type PassengerQuery = UseQueryResult<Passenger>;
export type PassengerListQuery = UseQueryResult<PassengerListResponse>;
export type PassengerActivityQuery = UseQueryResult<PassengerActivity[]>;
export type PassengerRidesQuery = UseQueryResult<{ data: PassengerRide[]; pagination: PaginationMeta }>;
export type PassengerStatsQuery = UseQueryResult<PassengerStats>;
export type PassengerMutation = UseMutationResult<Passenger, Error, { id: number; data: PassengerUpdateData }>;
export type PassengerStatusMutation = UseMutationResult<Passenger, Error, { id: number; data: PassengerStatusChangeData }>;
export type PassengerExportMutation = UseMutationResult<Blob, Error, PassengerExportParams>;
export type InfinitePassengerQuery = UseQueryResult<InfiniteData<PassengerListResponse, unknown>, Error>;