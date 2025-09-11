/**
 * Driver API Client - Admin endpoints for driver management
 * Following established patterns and design document principles
 */

import { api } from './client';
import { ApiResponse, PaginationParams, PaginationResponse, DocumentStatus, VerificationStatus, RideRecord, ActivityRecord, DriverAnalytics } from './types';

// Types for Driver Management
export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'driver';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  district: string;
  city: string;
  address: string;
  nationalId: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  registrationStatus: 'pending' | 'completed';
  emailVerificationStatus: VerificationStatus;
  phoneVerificationStatus: VerificationStatus;
  documentVerificationStatus: VerificationStatus;
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseVerificationStatus: DocumentStatus;
  vehicle: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color: string;
    type: 'sedan' | 'hatchback' | 'suv' | 'minibus';
    insuranceExpiryDate: string;
    registrationExpiryDate: string;
    inspectionExpiryDate: string;
  };
  documents: DriverDocument[];
  performance: {
    totalRides: number;
    totalEarnings: number;
    averageRating: number;
    totalRatings: number;
    completionRate: number;
    acceptanceRate: number;
    cancellationRate: number;
  };
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  currentShift?: {
    id: number;
    startTime: string;
    status: 'active' | 'break' | 'offline';
    ridesCompleted: number;
    earnings: number;
  };
}

export interface DriverDocument {
  id: number;
  type: 'national_id' | 'driver_license' | 'vehicle_registration' | 'insurance' | 'inspection';
  filename: string;
  originalName: string;
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DriverListParams extends PaginationParams {
  search?: string;
  status?: Driver['status'];
  district?: string;
  licenseStatus?: DocumentStatus;
  vehicleType?: Driver['vehicle']['type'];
  verificationStatus?: VerificationStatus;
}

export interface DriverUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  district?: string;
  city?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  vehicle?: Partial<Driver['vehicle']>;
}

export interface DocumentReviewData {
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface DriverStatusChangeData {
  status: Driver['status'];
  reason?: string;
}

// Admin API functions for driver management
export const driverAPI = {
  /**
   * Get list of drivers with filtering and pagination
   */
  async getDrivers(params: DriverListParams = {}): Promise<PaginationResponse<Driver>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.district) searchParams.set('district', params.district);
    if (params.licenseStatus) searchParams.set('licenseStatus', params.licenseStatus);
    if (params.vehicleType) searchParams.set('vehicleType', params.vehicleType);
    if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);

    const response = await api.get<PaginationResponse<Driver>>(
      `/admin/drivers?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get individual driver by ID with full details
   */
  async getDriver(id: number): Promise<Driver> {
    const response = await api.get<ApiResponse<Driver>>(`/admin/drivers/${id}`);
    return response.data.data;
  },

  /**
   * Update driver information (admin)
   */
  async updateDriver(id: number, data: DriverUpdateData): Promise<Driver> {
    const response = await api.put<ApiResponse<Driver>>(
      `/admin/drivers/${id}`, 
      data
    );
    return response.data.data;
  },

  /**
   * Change driver account status
   */
  async updateDriverStatus(id: number, data: DriverStatusChangeData): Promise<Driver> {
    const response = await api.put<ApiResponse<Driver>>(
      `/admin/drivers/${id}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * Review driver document (approve/reject)
   */
  async reviewDocument(driverId: number, documentId: number, data: DocumentReviewData): Promise<DriverDocument> {
    const response = await api.put<ApiResponse<DriverDocument>>(
      `/admin/drivers/${driverId}/documents/${documentId}/review`,
      data
    );
    return response.data.data;
  },

  /**
   * Get driver documents
   */
  async getDriverDocuments(id: number): Promise<DriverDocument[]> {
    const response = await api.get<ApiResponse<DriverDocument[]>>(`/admin/drivers/${id}/documents`);
    return response.data.data;
  },

  /**
   * Get driver activity history
   */
  async getDriverActivity(id: number): Promise<ActivityRecord[]> {
    const response = await api.get<ApiResponse<ActivityRecord[]>>(`/admin/drivers/${id}/activity`);
    return response.data.data;
  },

  /**
   * Get driver ride history
   */
  async getDriverRides(id: number, params: PaginationParams = {}): Promise<PaginationResponse<RideRecord>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await api.get<PaginationResponse<RideRecord>>(
      `/admin/drivers/${id}/rides?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get driver performance analytics
   */
  async getDriverAnalytics(id: number): Promise<DriverAnalytics> {
    const response = await api.get<ApiResponse<DriverAnalytics>>(`/admin/drivers/${id}/analytics`);
    return response.data.data;
  },

  /**
   * Get pending document reviews
   */
  async getPendingDocuments(params: PaginationParams = {}): Promise<PaginationResponse<{driver: Driver, document: DriverDocument}>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await api.get<PaginationResponse<{driver: Driver, document: DriverDocument}>>(
      `/admin/drivers/documents/pending?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Export drivers data
   */
  async exportDrivers(params: Omit<DriverListParams, 'page' | 'limit'> = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.district) searchParams.set('district', params.district);
    if (params.licenseStatus) searchParams.set('licenseStatus', params.licenseStatus);
    if (params.vehicleType) searchParams.set('vehicleType', params.vehicleType);
    if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);

    const response = await api.get(
      `/admin/drivers/export?${searchParams.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};