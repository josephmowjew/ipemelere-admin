/**
 * React Query hooks for vehicle data management
 * Following the established patterns from useDriverData
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehicleAPI, type Vehicle, type VehicleStatusUpdate, type VehicleStatusCheckResponse } from '@/lib/api/vehicles';
import { toast } from 'sonner';

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...vehicleKeys.lists(), params] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: number) => [...vehicleKeys.details(), id] as const,
  byDriver: (driverId: number) => [...vehicleKeys.all, 'driver', driverId] as const,
};

// Hook for getting vehicles by driver
export function useVehiclesByDriver(driverId: number) {
  return useQuery({
    queryKey: vehicleKeys.byDriver(driverId),
    queryFn: () => vehicleAPI.getVehiclesByDriver(driverId),
    enabled: !!driverId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Add driverId to each vehicle since the API doesn't include it
      return {
        ...data,
        vehicles: data.vehicles.map(vehicle => ({
          ...vehicle,
          driverId: driverId
        }))
      };
    }
  });
}

// Hook for getting vehicle details
export function useVehicle(vehicleId: number) {
  return useQuery({
    queryKey: vehicleKeys.detail(vehicleId),
    queryFn: () => vehicleAPI.getVehicle(vehicleId),
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for updating vehicle status
export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: number; data: VehicleStatusUpdate }) =>
      vehicleAPI.updateVehicleStatus(vehicleId, data),
    onSuccess: (response, variables) => {
      const { vehicleId, data } = variables;
      const vehicle = response.data?.vehicle;

      // Invalidate vehicle queries
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });

      // If we have driver information, invalidate driver vehicle queries
      if (vehicle?.driverId) {
        queryClient.invalidateQueries({ queryKey: vehicleKeys.byDriver(vehicle.driverId) });
      }

      // Show success toast
      const statusMessages = {
        active: 'Vehicle activated successfully',
        inactive: 'Vehicle deactivated successfully',
        maintenance: 'Vehicle set to maintenance mode'
      };

      toast.success('Vehicle Status Updated', {
        description: statusMessages[data.status] || 'Vehicle status has been updated',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update vehicle status:', error);
      toast.error('Status Update Failed', {
        description: error.message || 'Failed to update vehicle status. Please try again.',
      });
    },
  });
}

// Hook for checking vehicle status automatically
export function useCheckVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: number) => vehicleAPI.checkVehicleStatus(vehicleId),
    onSuccess: (response: VehicleStatusCheckResponse) => {
      const { vehicle } = response;

      // Invalidate vehicle queries
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicle.id) });

      // If we have driver information, invalidate driver vehicle queries
      if (vehicle.driverId) {
        queryClient.invalidateQueries({ queryKey: vehicleKeys.byDriver(vehicle.driverId) });
      }

      // Show success toast
      toast.success('Vehicle Status Checked', {
        description: response.reason || 'Vehicle status has been checked and updated',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to check vehicle status:', error);
      toast.error('Status Check Failed', {
        description: error.message || 'Failed to check vehicle status. Please try again.',
      });
    },
  });
}

// Hook for getting all vehicles (for admin vehicle management)
export function useVehicles(params: {
  page?: number;
  limit?: number;
  status?: Vehicle['status'];
  type?: Vehicle['type'];
  driverId?: number;
} = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleAPI.getVehicles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for bulk vehicle status operations
export function useBulkVehicleStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleIds,
      status,
      reason
    }: {
      vehicleIds: number[];
      status: VehicleStatusUpdate['status'];
      reason?: string;
    }) => {
      const promises = vehicleIds.map(vehicleId =>
        vehicleAPI.updateVehicleStatus(vehicleId, { status, reason })
      );

      const results = await Promise.allSettled(promises);

      // Check if any operations failed
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`${failures.length} out of ${vehicleIds.length} operations failed`);
      }

      return { successCount: results.length, failureCount: failures.length };
    },
    onSuccess: (result, variables) => {
      const { status } = variables;

      // Invalidate all vehicle queries
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });

      // Show success toast
      const statusMessages = {
        active: 'vehicles activated',
        inactive: 'vehicles deactivated',
        maintenance: 'vehicles set to maintenance'
      };

      toast.success('Bulk Status Update Completed', {
        description: `${result.successCount} ${statusMessages[status]} successfully`,
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update vehicle status in bulk:', error);
      toast.error('Bulk Status Update Failed', {
        description: error.message || 'Failed to update vehicle statuses. Please try again.',
      });
    },
  });
}