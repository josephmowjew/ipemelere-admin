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
  phone: string; // Backend uses 'phone' not 'phoneNumber'
  district: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  applicationStatus?: 'approved' | 'pending' | 'rejected' | 'pending_documents';
  verificationStatus?: VerificationStatus;
  documentVerificationStatus?: VerificationStatus;
  profilePicture?: string | null;
  licenseNumber?: string;
  drivingExperience?: number;
  rating?: string; // Backend returns as string
  totalRides?: number;
  isOnShift?: boolean;
  adminNotes?: string | null;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color?: string;
    type?: 'sedan' | 'hatchback' | 'suv' | 'minibus';
    insuranceExpiryDate?: string;
    registrationExpiryDate?: string;
    inspectionExpiryDate?: string;
  } | null;
  createdAt: string;
  updatedAt: string;

  // Legacy fields for compatibility with existing code
  phoneNumber?: string;
  city?: string;
  address?: string;
  nationalId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  registrationStatus?: 'pending' | 'completed';
  emailVerificationStatus?: VerificationStatus;
  phoneVerificationStatus?: VerificationStatus;
  licenseExpiryDate?: string;
  licenseVerificationStatus?: DocumentStatus;
  vehicle?: {
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
  documents?: DriverDocument[];
  performance?: {
    totalRides: number;
    totalEarnings: number;
    averageRating: number;
    totalRatings: number;
    completionRate: number;
    acceptanceRate: number;
    cancellationRate: number;
  };
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
  documentType: 'national_id' | 'driver_license' | 'vehicle_registration' | 'vehicle_insurance' | 'profile_picture';
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface DriverListParams extends PaginationParams {
  search?: string;
  status?: Driver['status'];
  district?: string;
  licenseStatus?: DocumentStatus;
  vehicleType?: 'sedan' | 'hatchback' | 'suv' | 'minibus';
  verificationStatus?: VerificationStatus;
}

export interface DriverUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string; // Backend expects 'phone'
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

// Transform backend driver response to frontend format
const transformDriverResponse = (rawDriver: any): Driver => {
  return {
    ...rawDriver,
    // Map backend field names to frontend expectations
    phoneNumber: rawDriver.phone || rawDriver.phoneNumber,
    vehicle: rawDriver.vehicleDetails ? {
      make: rawDriver.vehicleDetails.make,
      model: rawDriver.vehicleDetails.model,
      year: rawDriver.vehicleDetails.year,
      plateNumber: rawDriver.vehicleDetails.plateNumber,
      color: rawDriver.vehicleDetails.color || '',
      type: rawDriver.vehicleDetails.type || 'sedan',
      insuranceExpiryDate: rawDriver.vehicleDetails.insuranceExpiryDate || '',
      registrationExpiryDate: rawDriver.vehicleDetails.registrationExpiryDate || '',
      inspectionExpiryDate: rawDriver.vehicleDetails.inspectionExpiryDate || '',
    } : undefined,
    // Create performance object from individual fields (these are basic metrics available in driver response)
    performance: {
      totalRides: rawDriver.totalRides || 0,
      totalEarnings: 0, // Not provided by backend at driver level
      averageRating: parseFloat(rawDriver.rating || '0'),
      totalRatings: 0, // Not provided by backend
      // These require separate analytics call - will be populated by UI from analytics data
      completionRate: 0,
      acceptanceRate: 0,
      cancellationRate: 0,
    },
    // Map verification status fields (use backend values directly)
    emailVerificationStatus: rawDriver.verificationStatus,
    phoneVerificationStatus: rawDriver.verificationStatus,
    licenseVerificationStatus: rawDriver.documentVerificationStatus,
    // Provide default values for missing fields
    city: rawDriver.city || '',
    address: rawDriver.address || '',
    nationalId: rawDriver.nationalId || '',
    emergencyContact: {
      name: rawDriver.emergencyContactName || '',
      phone: rawDriver.emergencyContactPhone || '',
      relationship: rawDriver.emergencyContactRelationship || '',
    },
    lastActivity: rawDriver.lastActivity || rawDriver.updatedAt,
  };
};

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

    const response = await api.get<PaginationResponse<any>>(
      `/admin/drivers?${searchParams.toString()}`
    );

    // Transform each driver in the response
    const transformedData = {
      ...response.data,
      data: response.data.data.map((driver: any) => transformDriverResponse(driver))
    };

    return transformedData;
  },

  /**
   * Get individual driver by ID with full details
   */
  async getDriver(id: number): Promise<Driver> {
    const response = await api.get(`/admin/drivers/${id}`);
    // Handle both wrapped and direct response formats
    const rawDriver = response.data.data || response.data;

    // Transform backend response to frontend format
    return transformDriverResponse(rawDriver);
  },


  /**
   * Update driver information (admin)
   */
  async updateDriver(id: number, data: DriverUpdateData): Promise<Driver> {
    const response = await api.put(
      `/admin/drivers/${id}`,
      data
    );
    // Handle both wrapped and direct response formats and transform
    const rawDriver = response.data.data || response.data;
    return transformDriverResponse(rawDriver);
  },

  /**
   * Change driver account status
   */
  async updateDriverStatus(id: number, data: DriverStatusChangeData): Promise<Driver> {
    const response = await api.patch(
      `/admin/drivers/${id}/status`,
      data
    );
    // Handle both wrapped and direct response formats and transform
    const rawDriver = response.data.data || response.data;
    return transformDriverResponse(rawDriver);
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
    // Handle both wrapped and direct response formats
    return response.data.data || response.data || [];
  },

  /**
   * Get driver activity history
   */
  async getDriverActivity(id: number): Promise<ActivityRecord[]> {
    const response = await api.get<ApiResponse<ActivityRecord[]>>(`/admin/drivers/${id}/activity`);
    // Handle both wrapped and direct response formats
    const rawActivity = response.data.data || response.data || [];

    // Transform backend activity format to frontend format
    return rawActivity.map((activity: any) => ({
      ...activity,
      type: activity.activityType || activity.type, // Map activityType to type
      userId: activity.userId || id, // Ensure userId is present
    }));
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
    const response = await api.get<ApiResponse<any>>(`/admin/drivers/${id}/analytics`);
    // Handle both wrapped and direct response formats
    const rawAnalytics = response.data.data || response.data;

    // Transform backend analytics format to frontend format
    return {
      overview: {
        totalRides: rawAnalytics.totalRides || 0,
        totalEarnings: rawAnalytics.totalEarnings || 0,
        averageRating: parseFloat(rawAnalytics.averageRating) || 0,
        hoursOnline: parseFloat(rawAnalytics.totalHours) || 0,
      },
      performance: {
        acceptanceRate: 0, // Not provided by backend
        completionRate: rawAnalytics.completionRate || 0,
        cancellationRate: parseFloat(rawAnalytics.cancellationRate) || 0,
        averageResponseTime: 0, // Not provided by backend
        // New metrics from backend
        onTimeRate: rawAnalytics.performanceMetrics?.onTime || 0,
        courteousRate: rawAnalytics.performanceMetrics?.courteous || 0,
        vehicleConditionRate: rawAnalytics.performanceMetrics?.vehicleCondition || 0,
      },
      // New ride metrics section
      rideMetrics: {
        averageDistance: rawAnalytics.averageRideDistance || 0,
        averageDuration: rawAnalytics.averageRideDuration || 0,
        totalHours: parseFloat(rawAnalytics.totalHours) || 0,
      },
      earnings: {
        thisWeek: 0, // Not provided by backend
        thisMonth: rawAnalytics.totalEarnings || 0, // Use total earnings as fallback
        lastMonth: 0, // Not provided by backend
        breakdown: [], // Not provided by backend
      },
      ratings: {
        distribution: {}, // Not provided by backend
        recent: [], // Not provided by backend
      }
    };
  },

  /**
   * Upload document for driver
   */
  async uploadDocument(
    driverId: number,
    documentType: 'national-id' | 'driver-license' | 'profile-picture' | 'vehicle-registration' | 'vehicle-insurance',
    file: File,
    notes?: string
  ): Promise<DriverDocument> {
    const formData = new FormData();

    // Map document type to correct field name
    const fieldNames: Record<string, string> = {
      'national-id': 'nationalId',
      'driver-license': 'driverLicense',
      'profile-picture': 'profilePicture',
      'vehicle-registration': 'vehicleRegistration',
      'vehicle-insurance': 'vehicleInsurance'
    };

    formData.append(fieldNames[documentType], file);
    if (notes) formData.append('notes', notes);

    const response = await api.post(
      `/admin/drivers/${driverId}/documents/upload/${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.document;
  },

  /**
   * Approve/verify driver document
   */
  async approveDriverDocument(
    driverId: number,
    documentId: number,
    notes?: string
  ): Promise<DriverDocument> {
    const response = await api.put(
      `/admin/drivers/${driverId}/documents/${documentId}/verify`,
      {
        notes: notes || ''
      }
    );
    return response.data.document || response.data;
  },

  /**
   * Reject/deny driver document
   */
  async rejectDriverDocument(
    driverId: number,
    documentId: number,
    reason: string,
    notes?: string
  ): Promise<DriverDocument> {
    const response = await api.put(
      `/admin/drivers/${driverId}/documents/${documentId}/reject`,
      {
        reason,
        notes: notes || ''
      }
    );
    return response.data.document || response.data;
  },

  /**
   * Download driver document
   */
  async downloadDriverDocument(driverId: number, documentId: number): Promise<Blob> {
    const response = await api.get(
      `/admin/drivers/${driverId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Delete driver document
   */
  async deleteDriverDocument(driverId: number, documentId: number): Promise<void> {
    await api.delete(`/admin/drivers/${driverId}/documents/${documentId}`);
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
  },

  /**
   * Get driver statistics for dashboard
   */
  async getDriverStats(): Promise<{
    totalDrivers: number;
    activeDrivers: number;
    pendingApproval: number;
    suspendedDrivers: number;
    pendingVerification: number;
  }> {
    const response = await api.get('/admin/drivers/stats');

    // Handle different possible response formats
    const data = response.data?.data || response.data;

    // Ensure we return a valid object with all required properties
    return {
      totalDrivers: data?.totalDrivers || 0,
      activeDrivers: data?.activeDrivers || 0,
      pendingApproval: data?.pendingApproval || 0,
      suspendedDrivers: data?.suspendedDrivers || 0,
      pendingVerification: data?.pendingVerification || 0,
    };
  }
};