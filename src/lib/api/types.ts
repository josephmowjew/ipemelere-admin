/**
 * API Types - Common types for API responses and requests
 * Following TypeScript-first approach from design document
 */

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// Error Response Structure
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  timestamp: string;
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Paginated Response
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

// Search and Filter Parameters
export interface SearchParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
}

// Status Update Parameters
export interface StatusUpdateParams {
  status: string;
  reason?: string;
}

// File Upload Response
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// Ride and Activity Types
export interface RideRecord {
  id: number;
  passengerId?: number;
  driverId?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  fare: number;
  distance: number;
  duration: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
}

export interface ActivityRecord {
  id: string;
  userId: number;
  type: 'login' | 'profile_update' | 'ride_request' | 'ride_complete' | 'status_change' | 'document_upload';
  description: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
  ipAddress?: string;
}

export interface DriverAnalytics {
  overview: {
    totalRides: number;
    totalEarnings: number;
    averageRating: number;
    hoursOnline: number;
  };
  performance: {
    acceptanceRate: number;
    completionRate: number;
    cancellationRate: number;
    averageResponseTime: number;
  };
  earnings: {
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    breakdown: Array<{
      date: string;
      rides: number;
      earnings: number;
    }>;
  };
  ratings: {
    distribution: Record<string, number>;
    recent: Array<{
      rating: number;
      comment?: string;
      date: string;
    }>;
  };
}

// Malawi-specific types (based on API documentation)
export interface MalawiLocation {
  district: string;
  city: string;
  area?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Verification Statuses
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

// Common enums based on API documentation
export const MALAWI_DISTRICTS = [
  'Blantyre', 'Lilongwe', 'Mzuzu', 'Zomba', 'Kasungu', 
  'Mangochi', 'Salima', 'Machinga', 'Balaka', 'Chiradzulu',
  'Nsanje', 'Thyolo', 'Chikwawa', 'Mwanza', 'Neno'
] as const;

export type MalawiDistrict = typeof MALAWI_DISTRICTS[number];