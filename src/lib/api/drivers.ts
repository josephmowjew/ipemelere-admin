/**
 * Driver API Client - Admin endpoints for driver management
 * Following established patterns and design document principles
 */

import { api } from './client';
import { ApiResponse, PaginationParams, PaginationResponse, VerificationStatus, RideRecord, ActivityRecord, DriverAnalytics } from './types';
import { type DocumentStatus } from './documents';
import type {
  DriverRegistrationRequest,
  DriverRegistrationResponse,
  RegistrationApplicationStatus,
  RegistrationApplicationListItem,
  PhoneVerificationResponse,
  PhoneVerificationCodeResponse,
  DocumentUploadResponse,
  VehicleDocumentUploadResponse,
  ApplicationReviewResponse,
  VerificationStatusResponse,
  ComprehensiveRegistrationStatus,
} from '@/types/registration';

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
  licenseVerificationStatus?: VerificationStatus;
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
const transformDriverResponse = (rawDriver: Record<string, unknown>): Driver => {
  // Type assertion to access properties safely
  const driver = rawDriver as {
    phone?: string;
    phoneNumber?: string;
    rating?: string;
    totalRides?: number;
    verificationStatus?: VerificationStatus;
    documentVerificationStatus?: VerificationStatus;
    city?: string;
    address?: string;
    nationalId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    lastActivity?: string;
    updatedAt?: string;
    vehicleDetails?: {
      make?: string;
      model?: string;
      year?: number;
      plateNumber?: string;
      color?: string;
      type?: string;
      insuranceExpiryDate?: string;
      registrationExpiryDate?: string;
      inspectionExpiryDate?: string;
    };
    vehicle?: unknown;
    [key: string]: unknown;
  };
  return {
    ...rawDriver,
    phone: driver.phone || driver.phoneNumber || '',
    // Map backend field names to frontend expectations
    phoneNumber: driver.phone || driver.phoneNumber,
    vehicle: driver.vehicleDetails ? {
      make: driver.vehicleDetails.make || '',
      model: driver.vehicleDetails.model || '',
      year: driver.vehicleDetails.year || 0,
      plateNumber: driver.vehicleDetails.plateNumber || '',
      color: driver.vehicleDetails.color || '',
      type: (driver.vehicleDetails.type as 'sedan' | 'hatchback' | 'suv' | 'minibus') || 'sedan',
      insuranceExpiryDate: driver.vehicleDetails.insuranceExpiryDate || '',
      registrationExpiryDate: driver.vehicleDetails.registrationExpiryDate || '',
      inspectionExpiryDate: driver.vehicleDetails.inspectionExpiryDate || '',
    } : undefined,
    // Create performance object from individual fields (these are basic metrics available in driver response)
    performance: {
      totalRides: driver.totalRides || 0,
      totalEarnings: 0, // Not provided by backend at driver level
      averageRating: parseFloat(String(driver.rating || '0')),
      totalRatings: 0, // Not provided by backend
      // These require separate analytics call - will be populated by UI from analytics data
      completionRate: 0,
      acceptanceRate: 0,
      cancellationRate: 0,
    },
    // Map verification status fields (use backend values directly)
    emailVerificationStatus: driver.verificationStatus,
    phoneVerificationStatus: driver.verificationStatus,
    licenseVerificationStatus: driver.documentVerificationStatus,
    // Provide default values for missing fields
    city: driver.city || '',
    address: driver.address || '',
    nationalId: driver.nationalId || '',
    emergencyContact: {
      name: driver.emergencyContactName || '',
      phone: driver.emergencyContactPhone || '',
      relationship: driver.emergencyContactRelationship || '',
    },
    lastActivity: driver.lastActivity || driver.updatedAt,
  } as Driver;
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

    const response = await api.get<PaginationResponse<unknown>>(
      `/admin/drivers?${searchParams.toString()}`
    );

    // Transform each driver in the response
    const transformedData = {
      ...response.data,
      data: response.data.data.map((driver: unknown) => transformDriverResponse(driver as Record<string, unknown>))
    };

    return transformedData;
  },

  /**
   * Get individual driver by ID with full details
   */
  async getDriver(id: number): Promise<Driver> {
    const response = await api.get(`/admin/drivers/${id}`);
    // Handle both wrapped and direct response formats
    const driver = response.data.data || response.data;

    // Transform backend response to frontend format
    return transformDriverResponse(driver);
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
    const driver = response.data.data || response.data;
    return transformDriverResponse(driver);
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
    const driver = response.data.data || response.data;
    return transformDriverResponse(driver);
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
    return (rawActivity as unknown as Record<string, unknown>[]).map((activity: Record<string, unknown>) => {
      const act = activity as {
        id?: string;
        activityType?: string;
        type?: string;
        userId?: number;
        description?: string;
        timestamp?: string;
        metadata?: Record<string, unknown>;
        [key: string]: unknown;
      };
      return {
        id: act.id || `activity-${Date.now()}-${Math.random()}`,
        userId: act.userId || id,
        type: (act.activityType || act.type || 'status_change') as ActivityRecord['type'],
        description: act.description || 'Driver activity',
        timestamp: act.timestamp || new Date().toISOString(),
        metadata: act.metadata as Record<string, string | number | boolean> | undefined,
      };
    });
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
    const response = await api.get<ApiResponse<unknown>>(`/admin/drivers/${id}/analytics`);
    // Handle both wrapped and direct response formats
    const rawAnalytics = (response.data.data || response.data) as {
      totalRides?: number;
      totalEarnings?: number;
      averageRating?: string | number;
      totalHours?: string | number;
      completionRate?: number;
      cancellationRate?: string | number;
      performanceMetrics?: {
        onTime?: number;
        customerSatisfaction?: number;
        efficiency?: number;
        courteous?: number;
        vehicleCondition?: number;
      };
      averageRideDistance?: number;
      averageRideDuration?: number;
      [key: string]: unknown;
    };

    // Transform backend analytics format to frontend format
    return {
      overview: {
        totalRides: rawAnalytics.totalRides || 0,
        totalEarnings: rawAnalytics.totalEarnings || 0,
        averageRating: parseFloat(String(rawAnalytics.averageRating || '0')) || 0,
        hoursOnline: parseFloat(String(rawAnalytics.totalHours || '0')) || 0,
      },
      performance: {
        acceptanceRate: 0, // Not provided by backend
        completionRate: rawAnalytics.completionRate || 0,
        cancellationRate: parseFloat(String(rawAnalytics.cancellationRate || '0')) || 0,
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
        totalHours: parseFloat(String(rawAnalytics.totalHours || '0')) || 0,
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

// Driver Registration API (public endpoints for new driver registration)
export const driverRegistrationAPI = {
  /**
   * Register a new driver (admin-initiated or public)
   * POST /auth/register/driver
   */
  async registerDriver(data: DriverRegistrationRequest): Promise<DriverRegistrationResponse> {
    const response = await api.post<DriverRegistrationResponse>(
      '/auth/register/driver',
      data
    );
    return response.data;
  },

  /**
   * Upload driver license document during registration
   * POST /auth/register/driver/:driverId/upload-license
   */
  async uploadLicense(
    driverId: number,
    file: File,
    notes?: string
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    const response = await api.post<DocumentUploadResponse>(
      `/auth/register/driver/${driverId}/upload-license`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload vehicle documents during registration
   * POST /auth/register/driver/:driverId/upload-vehicle-documents
   */
  async uploadVehicleDocuments(
    driverId: number,
    files: File[],
    notes?: string
  ): Promise<VehicleDocumentUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (notes) formData.append('notes', notes);

    const response = await api.post<VehicleDocumentUploadResponse>(
      `/auth/register/driver/${driverId}/upload-vehicle-documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get registration application status
   * GET /auth/register/driver/:driverId/status
   */
  async getApplicationStatus(driverId: number): Promise<RegistrationApplicationStatus> {
    const response = await api.get<RegistrationApplicationStatus>(
      `/auth/register/driver/${driverId}/status`
    );
    return response.data;
  },

  /**
   * Send phone verification code
   * POST /auth/send-phone-verification
   */
  async sendPhoneVerification(userId: number): Promise<PhoneVerificationResponse> {
    const response = await api.post<PhoneVerificationResponse>(
      '/auth/send-phone-verification',
      { userId }
    );
    return response.data;
  },

  /**
   * Verify phone number with code
   * POST /auth/verify-phone
   */
  async verifyPhone(userId: number, code: string): Promise<PhoneVerificationCodeResponse> {
    const response = await api.post<PhoneVerificationCodeResponse>(
      '/auth/verify-phone',
      { userId, code }
    );
    return response.data;
  },

  /**
   * Get verification status (email, phone, documents)
   * GET /auth/verification-status/:userId
   */
  async getVerificationStatus(userId: number): Promise<VerificationStatusResponse> {
    const response = await api.get<VerificationStatusResponse>(
      `/auth/verification-status/${userId}`
    );
    return response.data;
  },

  /**
   * Get comprehensive registration status
   * GET /auth/registration-status/:userId
   */
  async getComprehensiveStatus(userId: number): Promise<ComprehensiveRegistrationStatus> {
    const response = await api.get<ComprehensiveRegistrationStatus>(
      `/auth/registration-status/${userId}`
    );
    return response.data;
  },
};

// Admin Registration Management API (admin-only endpoints)
export const adminRegistrationAPI = {
  /**
   * Get list of registration applications (admin)
   * GET /admin/drivers?applicationStatus=...
   */
  async getApplications(params: PaginationParams & {
    status?: string;
    search?: string;
  } = {}): Promise<PaginationResponse<RegistrationApplicationListItem>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    // Use applicationStatus query parameter instead of status
    if (params.status) searchParams.set('applicationStatus', params.status);
    if (params.search) searchParams.set('search', params.search);

    const response = await api.get<PaginationResponse<RegistrationApplicationListItem>>(
      `/admin/drivers?${searchParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get detailed driver information (admin)
   * GET /admin/drivers/:driverId
   */
  async getApplicationDetail(driverId: number): Promise<Driver> {
    const response = await api.get<ApiResponse<Driver>>(
      `/admin/drivers/${driverId}`
    );
    return response.data.data || response.data;
  },

  /**
   * Approve registration application (admin)
   * PATCH /admin/drivers/:driverId/application-status
   */
  async approveApplication(
    driverId: number,
    notes?: string
  ): Promise<ApplicationReviewResponse> {
    const response = await api.patch<ApplicationReviewResponse>(
      `/admin/drivers/${driverId}/application-status`,
      {
        applicationStatus: 'approved',
        notes
      }
    );
    return response.data;
  },

  /**
   * Reject registration application (admin)
   * PATCH /admin/drivers/:driverId/application-status
   */
  async rejectApplication(
    driverId: number,
    reason: string,
    notes?: string
  ): Promise<ApplicationReviewResponse> {
    const response = await api.patch<ApplicationReviewResponse>(
      `/admin/drivers/${driverId}/application-status`,
      {
        applicationStatus: 'rejected',
        reason,
        notes
      }
    );
    return response.data;
  },

  /**
   * Request changes to application (admin)
   * PATCH /admin/drivers/:driverId/application-status
   */
  async requestChanges(
    driverId: number,
    changes: string,
    notes?: string
  ): Promise<ApplicationReviewResponse> {
    const response = await api.patch<ApplicationReviewResponse>(
      `/admin/drivers/${driverId}/application-status`,
      {
        applicationStatus: 'documents_rejected',
        changes,
        notes
      }
    );
    return response.data;
  },

  /**
   * Get registration statistics (admin)
   * This aggregates counts from /admin/drivers with different applicationStatus filters
   */
  async getRegistrationStats(): Promise<{
    totalApplications: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    pendingDocuments: number;
  }> {
    // Since there's no dedicated stats endpoint, we'll make parallel requests
    // to get counts for different application statuses
    const [pending, underReview, approved, rejected] = await Promise.all([
      api.get('/admin/drivers?applicationStatus=pending_documents&limit=1'),
      api.get('/admin/drivers?applicationStatus=under_review&limit=1'),
      api.get('/admin/drivers?applicationStatus=approved&limit=1'),
      api.get('/admin/drivers?applicationStatus=rejected&limit=1'),
    ]);

    const pendingData = pending.data?.data || pending.data;
    const reviewData = underReview.data?.data || underReview.data;
    const approvedData = approved.data?.data || approved.data;
    const rejectedData = rejected.data?.data || rejected.data;

    const pendingCount = pendingData?.pagination?.total || 0;
    const reviewCount = reviewData?.pagination?.total || 0;
    const approvedCount = approvedData?.pagination?.total || 0;
    const rejectedCount = rejectedData?.pagination?.total || 0;

    return {
      totalApplications: pendingCount + reviewCount + approvedCount + rejectedCount,
      pendingReview: reviewCount,
      approved: approvedCount,
      rejected: rejectedCount,
      pendingDocuments: pendingCount,
    };
  },
};