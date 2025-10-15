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
  driverName?: string;
  driverPhone?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documentsVerified?: boolean;
  insuranceExpiryDate?: string;
  registrationExpiryDate?: string;
  inspectionExpiryDate?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documents?: {
    registrationDocument?: { status: string; url?: string; expiresAt?: string };
    insuranceDocument?: { status: string; url?: string; expiresAt?: string };
    inspectionDocument?: { status: string; url?: string; expiresAt?: string };
  };
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

// Pending vehicles interfaces
export interface PendingVehicle extends Omit<Vehicle, 'status'> {
  status: 'pending_approval';
  submissionDate: string;
  documentsComplete: boolean;
  driverEmail?: string;
  daysPending: number;
}

export interface PendingVehiclesResponse {
  vehicles: PendingVehicle[];
  total: number;
  summary: {
    totalPending: number;
    urgent: number;
    submittedToday: number;
    pendingThisWeek: number;
    averageDaysPending: number;
  };
}

export interface VehicleApprovalRequest {
  vehicleId: number;
  approved: boolean;
  reason?: string;
  notes?: string;
}

export interface VehicleApprovalResponse {
  success: boolean;
  message: string;
  vehicle: Vehicle;
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
  },

  /**
   * Get pending vehicles awaiting approval
   * GET /admin/vehicles/pending
   */
  async getPendingVehicles(params: {
    page?: number;
    limit?: number;
    priority?: PendingVehicle['priority'];
    sortBy?: 'submissionDate' | 'priority' | 'driverName';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<PendingVehiclesResponse>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await api.get(`/admin/vehicles/pending?${searchParams.toString()}`);
    return response.data;
  },

  /**
   * Get pending vehicles summary for dashboard
   * GET /admin/vehicles/pending/summary
   */
  async getPendingVehiclesSummary(): Promise<ApiResponse<PendingVehiclesResponse['summary']>> {
    const response = await api.get('/admin/vehicles/pending/summary');
    return response.data;
  },

  /**
   * Approve a vehicle
   * POST /admin/vehicles/:id/approve
   */
  async approveVehicle(vehicleId: number, data: Omit<VehicleApprovalRequest, 'vehicleId' | 'approved'>): Promise<ApiResponse<VehicleApprovalResponse>> {
    const response = await api.post(`/admin/vehicles/${vehicleId}/approve`, data);
    return response.data;
  },

  /**
   * Reject a vehicle
   * POST /admin/vehicles/:id/reject
   */
  async rejectVehicle(vehicleId: number, data: Omit<VehicleApprovalRequest, 'vehicleId' | 'approved'> & { reason: string }): Promise<ApiResponse<VehicleApprovalResponse>> {
    const response = await api.post(`/admin/vehicles/${vehicleId}/reject`, data);
    return response.data;
  },

  /**
   * Bulk approve multiple vehicles
   * POST /admin/vehicles/bulk-approve
   */
  async bulkApproveVehicles(vehicleIds: number[], notes?: string): Promise<ApiResponse<{ success: number; failed: number; errors?: string[] }>> {
    const response = await api.post('/admin/vehicles/bulk-approve', {
      vehicleIds,
      notes
    });
    return response.data;
  },

  /**
   * Bulk reject multiple vehicles
   * POST /admin/vehicles/bulk-reject
   */
  async bulkRejectVehicles(vehicleIds: number[], reason: string, notes?: string): Promise<ApiResponse<{ success: number; failed: number; errors?: string[] }>> {
    const response = await api.post('/admin/vehicles/bulk-reject', {
      vehicleIds,
      reason,
      notes
    });
    return response.data;
  }
};

// Vehicle status utility functions
export const vehicleStatusUtils = {
  /**
   * Get color class for vehicle status
   */
  getStatusColorClass(status: Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason?: boolean): string {
    const colorClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      pending_approval: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: hasRejectionReason ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
    };
    return colorClasses[status] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Get icon for vehicle status
   */
  getStatusIcon(status: Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason?: boolean): string {
    const icons: Record<string, string> = {
      active: '🟢',
      inactive: '🟡',
      maintenance: '🔧',
      pending_approval: '⏳',
      approved: '✅',
      rejected: hasRejectionReason ? '❌' : '⚠️'
    };
    return icons[status] || '⚪';
  },

  /**
   * Get status description
   */
  getStatusDescription(status: Vehicle['status'] | 'pending_approval' | 'rejected', hasRejectionReason?: boolean): string {
    const descriptions: Record<string, string> = {
      active: 'Vehicle is approved and available for rides',
      inactive: 'Vehicle is temporarily unavailable',
      maintenance: 'Vehicle is under maintenance',
      pending_approval: 'Vehicle is pending admin approval',
      approved: 'Vehicle has been approved for service',
      rejected: hasRejectionReason ? 'Vehicle registration was rejected' : 'Vehicle registration requires attention'
    };
    return descriptions[status] || 'Unknown status';
  },

  /**
   * Map status for display (converts backend status to frontend display status)
   */
  mapStatusForDisplay(status: Vehicle['status'], hasRejectionReason?: boolean): string {
    // For pending vehicles, backend sends 'inactive' but we want to show 'pending_approval'
    if (status === 'inactive' && !hasRejectionReason) {
      return 'pending_approval';
    }
    return status;
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
  },

  /**
   * Get priority color class for pending vehicles
   */
  getPriorityColorClass(priority: PendingVehicle['priority']): string {
    const colorClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colorClasses[priority] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Check if vehicle documents are complete
   */
  areDocumentsComplete(vehicle: Vehicle | PendingVehicle): boolean {
    if (!vehicle.documents) return false;

    const requiredDocs = ['registrationDocument', 'insuranceDocument', 'inspectionDocument'] as const;
    return requiredDocs.every(doc =>
      vehicle.documents?.[doc as keyof typeof vehicle.documents]?.status === 'verified'
    );
  },

  /**
   * Calculate days pending for a vehicle
   */
  calculateDaysPending(submissionDate: string): number {
    const submitted = new Date(submissionDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Determine vehicle priority based on days pending and other factors
   */
  determinePriority(vehicle: Vehicle | PendingVehicle): PendingVehicle['priority'] {
    const daysPending = ('daysPending' in vehicle) ? vehicle.daysPending : this.calculateDaysPending(vehicle.submittedAt || vehicle.createdAt);
    const documentsComplete = this.areDocumentsComplete(vehicle);

    if (daysPending > 14 || !documentsComplete) return 'urgent';
    if (daysPending > 7) return 'high';
    if (daysPending > 3) return 'medium';
    return 'low';
  }
};