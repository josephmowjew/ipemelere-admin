/**
 * Passenger API Client - Admin endpoints for passenger management
 * Following established patterns from auth.ts and design document principles
 */

import { apiClient } from './client';
import { ApiResponse, PaginationParams, PaginationResponse, RideRecord, ActivityRecord } from './types';

// Types for Passenger Management
export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'passenger';
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
  emailVerificationStatus: 'pending' | 'verified';
  phoneVerificationStatus: 'pending' | 'verified';
  documentVerificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  totalRides?: number;
  totalSpent?: number;
}

export interface PassengerListParams extends PaginationParams {
  search?: string;
  status?: Passenger['status'];
  district?: string;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
}

export interface PassengerUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  district?: string;
  city?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface PassengerStatusChangeData {
  status: Passenger['status'];
  reason?: string;
}

// Admin API functions for passenger management
export const passengerAPI = {
  /**
   * Get list of passengers with filtering and pagination
   */
  async getPassengers(params: PassengerListParams = {}): Promise<PaginationResponse<Passenger>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.district) searchParams.set('district', params.district);
    if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);

    const response = await apiClient.get<PaginationResponse<Passenger>>(
      `/admin/passengers?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get individual passenger by ID
   */
  async getPassenger(id: number): Promise<Passenger> {
    const response = await apiClient.get<ApiResponse<Passenger>>(`/admin/passengers/${id}`);
    return response.data.data;
  },

  /**
   * Update passenger information (admin)
   */
  async updatePassenger(id: number, data: PassengerUpdateData): Promise<Passenger> {
    const response = await apiClient.put<ApiResponse<Passenger>>(
      `/admin/passengers/${id}`, 
      data
    );
    return response.data.data;
  },

  /**
   * Change passenger account status
   */
  async updatePassengerStatus(id: number, data: PassengerStatusChangeData): Promise<Passenger> {
    const response = await apiClient.put<ApiResponse<Passenger>>(
      `/admin/passengers/${id}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * Get passenger activity history
   */
  async getPassengerActivity(id: number): Promise<ActivityRecord[]> {
    const response = await apiClient.get<ApiResponse<ActivityRecord[]>>(`/admin/passengers/${id}/activity`);
    return response.data.data;
  },

  /**
   * Get passenger ride history
   */
  async getPassengerRides(id: number, params: PaginationParams = {}): Promise<PaginationResponse<RideRecord>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await apiClient.get<PaginationResponse<RideRecord>>(
      `/admin/passengers/${id}/rides?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Export passengers data
   */
  async exportPassengers(params: Omit<PassengerListParams, 'page' | 'limit'> = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.district) searchParams.set('district', params.district);
    if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);

    const response = await apiClient.get(
      `/admin/passengers/export?${searchParams.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }
};