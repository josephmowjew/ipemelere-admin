/**
 * Ride Data Hooks - React Query hooks for ride management
 * Following established patterns from drivers/passengers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ridesAPI } from '@/lib/api/rides';
import type {
  RideListParams,
  RideUpdateData,
  RideCancelData,
} from '@/types/ride';

// Query keys
export const rideKeys = {
  all: ['rides'] as const,
  lists: () => [...rideKeys.all, 'list'] as const,
  list: (params: RideListParams) => [...rideKeys.lists(), params] as const,
  details: () => [...rideKeys.all, 'detail'] as const,
  detail: (id: number) => [...rideKeys.details(), id] as const,
  stats: () => [...rideKeys.all, 'stats'] as const,
  pending: () => [...rideKeys.all, 'pending'] as const,
  cancellations: (days: number) => [...rideKeys.all, 'cancellations', days] as const,
  revenue: (fromDate?: string, toDate?: string) => [...rideKeys.all, 'revenue', fromDate, toDate] as const,
  timeline: (id: number) => [...rideKeys.all, 'timeline', id] as const,
};

/**
 * Get rides list with filters
 */
export function useRides(params: RideListParams = {}) {
  return useQuery({
    queryKey: rideKeys.list(params),
    queryFn: () => ridesAPI.getRides(params),
  });
}

/**
 * Get single ride details
 */
export function useRide(id: number) {
  return useQuery({
    queryKey: rideKeys.detail(id),
    queryFn: () => ridesAPI.getRide(id),
    enabled: !!id,
  });
}

/**
 * Get ride statistics
 */
export function useRideStats() {
  return useQuery({
    queryKey: rideKeys.stats(),
    queryFn: () => ridesAPI.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get pending rides overview
 */
export function usePendingRides() {
  return useQuery({
    queryKey: rideKeys.pending(),
    queryFn: () => ridesAPI.getPendingOverview(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

/**
 * Get cancellation analysis
 */
export function useCancellationAnalysis(days: number = 30) {
  return useQuery({
    queryKey: rideKeys.cancellations(days),
    queryFn: () => ridesAPI.getCancellationAnalysis(days),
  });
}

/**
 * Get revenue summary
 */
export function useRevenueSummary(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: rideKeys.revenue(fromDate, toDate),
    queryFn: () => ridesAPI.getRevenueSummary(fromDate, toDate),
  });
}

/**
 * Get ride timeline
 */
export function useRideTimeline(id: number) {
  return useQuery({
    queryKey: rideKeys.timeline(id),
    queryFn: () => ridesAPI.getRideTimeline(id),
    enabled: !!id,
  });
}

/**
 * Update ride mutation
 */
export function useUpdateRide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RideUpdateData }) =>
      ridesAPI.updateRide(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rideKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rideKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rideKeys.stats() });
    },
  });
}

/**
 * Cancel ride mutation
 */
export function useCancelRide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RideCancelData }) =>
      ridesAPI.cancelRide(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rideKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: rideKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rideKeys.stats() });
    },
  });
}

/**
 * Export rides mutation
 */
export function useExportRides() {
  return useMutation({
    mutationFn: (params: Parameters<typeof ridesAPI.exportRides>[0]) =>
      ridesAPI.exportRides(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rides_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
