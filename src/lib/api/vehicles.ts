/**
 * Vehicle API Client - Admin endpoints for vehicle management
 * Based on Vehicle Management API Documentation
 */

import { api } from './client';
import { ApiResponse } from './types';

// Vehicle types based on API documentation
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  type: 'sedan' | 'hatchback' | 'suv' | 'minibus';
  color?: string;
  driverId?: number;
  createdAt: string;
  updatedAt: string;
  documentsVerified?: boolean;
  insuranceExpiryDate?: string;
  registrationExpiryDate?: string;
  inspectionExpiryDate?: string;
}

export interface VehicleStatusUpdate {
  status: 'active' | 'inactive' | 'maintenance';
  reason?: string;
}

export interface VehicleStatusCheckResponse {
  message: string;
  previousStatus: string;
  newStatus: string;
  vehicle: Vehicle;
  reason: string;
}

export interface VehiclesByDriverResponse {
  vehicles: Vehicle[];
  total: number;
  active: number;
  inactive: number;
}

// Vehicle API functions
export const vehicleAPI = {
  /**
   * Update vehicle status manually
   * PUT /api/v1/vehicles/:id/status
   */
  async updateVehicleStatus(vehicleId: number, data: VehicleStatusUpdate): Promise<ApiResponse<{ vehicle: Vehicle }>> {
    const response = await api.put(`/vehicles/${vehicleId}/status`, data);
    // Handle different response formats - some APIs return response.data.vehicle, others return response.data directly
    const responseData = response.data;

    if (responseData.data?.vehicle) {
      return { success: true, message: 'Vehicle status updated successfully', data: { vehicle: responseData.data.vehicle } };
    } else if (responseData.vehicle) {
      return { success: true, message: 'Vehicle status updated successfully', data: { vehicle: responseData.vehicle } };
    } else if (responseData.data) {
      // If the entire response.data is the vehicle
      return { success: true, message: 'Vehicle status updated successfully', data: { vehicle: responseData.data as Vehicle } };
    } else {
      // Fallback - create a minimal vehicle object
      return {
        success: true,
        message: 'Vehicle status updated successfully',
        data: {
          vehicle: {
            id: vehicleId,
            status: data.status,
            // Keep other properties from the vehicle if available
            ...(responseData as Partial<Vehicle>)
          } as Vehicle
        }
      };
    }
  },

  /**
   * Automatic vehicle status check
   * POST /api/v1/vehicles/:id/check-status
   */
  async checkVehicleStatus(vehicleId: number): Promise<VehicleStatusCheckResponse> {
    const response = await api.post(`/vehicles/${vehicleId}/check-status`);
    return response.data;
  },

  /**
   * Get vehicles by driver
   * GET /api/v1/vehicles/driver/:driverId
   */
  async getVehiclesByDriver(driverId: number): Promise<VehiclesByDriverResponse> {
    const response = await api.get(`/vehicles/driver/${driverId}`);
    return response.data;
  },

  /**
   * Get vehicle details by ID
   * GET /api/v1/vehicles/:id
   */
  async getVehicle(vehicleId: number): Promise<ApiResponse<Vehicle>> {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  /**
   * Get all vehicles with optional filtering
   * GET /api/v1/vehicles
   */
  async getVehicles(params: {
    page?: number;
    limit?: number;
    status?: Vehicle['status'];
    type?: Vehicle['type'];
    driverId?: number;
  } = {}): Promise<ApiResponse<{ vehicles: Vehicle[]; total: number }>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.type) searchParams.set('type', params.type);
    if (params.driverId) searchParams.set('driverId', params.driverId.toString());

    const response = await api.get(`/vehicles?${searchParams.toString()}`);
    return response.data;
  }
};

// Vehicle status utility functions
export const vehicleStatusUtils = {
  /**
   * Get color class for vehicle status
   */
  getStatusColorClass(status: Vehicle['status']): string {
    const colorClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800'
    };
    return colorClasses[status] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Get icon for vehicle status
   */
  getStatusIcon(status: Vehicle['status']): string {
    const icons = {
      active: '🟢',
      inactive: '🟡',
      maintenance: '🔧'
    };
    return icons[status] || '⚪';
  },

  /**
   * Get status description
   */
  getStatusDescription(status: Vehicle['status']): string {
    const descriptions = {
      active: 'Vehicle is approved and available for rides',
      inactive: 'Vehicle is temporarily unavailable',
      maintenance: 'Vehicle is under maintenance'
    };
    return descriptions[status] || 'Unknown status';
  },

  /**
   * Check if status can be changed to target status
   */
  canChangeStatus(): boolean {
    // Can always change between these statuses
    return true;
  },

  /**
   * Get available status transitions
   */
  getAvailableStatusTransitions(currentStatus: Vehicle['status']): Vehicle['status'][] {
    // All statuses can transition to any other status
    const allStatuses: Vehicle['status'][] = ['active', 'inactive', 'maintenance'];
    return allStatuses.filter(status => status !== currentStatus);
  }
};