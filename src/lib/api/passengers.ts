/**
 * Passenger API Client - Admin endpoints for passenger management
 * Following repository pattern from design document
 */

import { api } from '@/lib/api/client';
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
  PassengerApiResponse,
  PaginationMeta
} from '@/types/passenger';

// API response interfaces (what the backend actually returns)
interface PassengerAPIResponse {
  id: number;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  phoneNumber?: string;
  phone_number?: string;
  status: string;
  district?: string;
  city?: string;
  address?: string;
  nationalId?: string;
  national_id?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  registrationStatus?: string;
  registration_status?: string;
  emailVerificationStatus?: string;
  email_verification_status?: string;
  phoneVerificationStatus?: string;
  phone_verification_status?: string;
  documentVerificationStatus?: string;
  document_verification_status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  lastActivity?: string;
  last_activity?: string;
  totalRides?: number;
  total_rides?: number;
  totalSpent?: number;
  total_spent?: number;
  averageRating?: number;
  average_rating?: number;
  [key: string]: string | number | boolean | object | null | undefined;
}

interface PassengerAPIUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  district?: string;
  city?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  [key: string]: string | number | boolean | object | null | undefined; // For flexibility with backend expectations
}

// Data transformers (API response -> App format)
class PassengerTransformer {
  static fromAPI(apiData: PassengerAPIResponse): Passenger {
    return {
      id: apiData.id,
      firstName: apiData.firstName || apiData.first_name || '',
      lastName: apiData.lastName || apiData.last_name || '',
      email: apiData.email || '',
      phoneNumber: apiData.phoneNumber || apiData.phone_number || '',
      role: 'passenger',
      status: (apiData.status as Passenger['status']) || 'pending',
      
      // Location information (with fallbacks for missing data)
      district: apiData.district || 'Not specified',
      city: apiData.city || 'Not specified',
      address: apiData.address || 'Not provided',
      nationalId: apiData.nationalId || apiData.national_id || 'Not provided',
      
      // Emergency contact (with fallbacks)
      emergencyContact: {
        name: apiData.emergencyContact?.name || apiData.emergency_contact_name || 'Not provided',
        phone: apiData.emergencyContact?.phone || apiData.emergency_contact_phone || 'Not provided',
        relationship: apiData.emergencyContact?.relationship || apiData.emergency_contact_relationship || 'Not specified',
      },
      
      // Registration and verification status
      registrationStatus: (apiData.registrationStatus || apiData.registration_status || 'pending') as Passenger['registrationStatus'],
      emailVerificationStatus: (apiData.emailVerificationStatus || apiData.email_verification_status || 'pending') as Passenger['emailVerificationStatus'],
      phoneVerificationStatus: (apiData.phoneVerificationStatus || apiData.phone_verification_status || 'pending') as Passenger['phoneVerificationStatus'],
      documentVerificationStatus: (apiData.documentVerificationStatus || apiData.document_verification_status || 'pending') as Passenger['documentVerificationStatus'],
      
      // Timestamps
      createdAt: apiData.createdAt || apiData.created_at || new Date().toISOString(),
      updatedAt: apiData.updatedAt || apiData.updated_at || apiData.createdAt || apiData.created_at || new Date().toISOString(),
      lastActivity: apiData.lastActivity || apiData.last_activity || apiData.updatedAt || apiData.updated_at || undefined,
      
      // Aggregate data (with defaults)
      totalRides: Number(apiData.totalRides || apiData.total_rides || 0),
      totalSpent: Number(apiData.totalSpent || apiData.total_spent || 0),
      averageRating: Number(apiData.averageRating || apiData.average_rating || 0),
    };
  }

  static toAPI(passenger: PassengerUpdateData): PassengerAPIUpdateData {
    return {
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      phoneNumber: passenger.phoneNumber,
      district: passenger.district,
      city: passenger.city,
      address: passenger.address,
      emergencyContactName: passenger.emergencyContactName,
      emergencyContactPhone: passenger.emergencyContactPhone,
      emergencyContactRelationship: passenger.emergencyContactRelationship,
    };
  }

  static transformList(apiData: PassengerAPIResponse[]): Passenger[] {
    return apiData.map(this.fromAPI);
  }
}

// Passenger API service class
export class PassengerService {
  /**
   * Get list of passengers with filtering and pagination
   */
  static async getPassengers(params: PassengerListParams = {}): Promise<PassengerListResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.status) searchParams.set('status', params.status);
      if (params.district) searchParams.set('district', params.district);
      if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);
      if (params.emailVerified !== undefined) searchParams.set('emailVerified', params.emailVerified.toString());
      if (params.phoneVerified !== undefined) searchParams.set('phoneVerified', params.phoneVerified.toString());
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const response = await api.get<{
        passengers: PassengerAPIResponse[];
        total: number;
        limit: number;
        offset: number;
      }>(`/admin/passengers?${searchParams.toString()}`);

      // Transform the real API response to our expected format
      const currentPage = params.page || 1;
      const perPage = params.limit || 50;
      const totalPages = Math.ceil(response.data.total / perPage);

      return {
        data: PassengerTransformer.transformList(response.data.passengers),
        pagination: {
          current_page: currentPage,
          per_page: perPage,
          total: response.data.total,
          total_pages: totalPages,
          has_next_page: currentPage < totalPages,
          has_prev_page: currentPage > 1,
        },
      };
    } catch (error) {
      console.error('Failed to fetch passengers:', error);
      return this.getMockPassengers(params);
    }
  }

  /**
   * Get individual passenger by ID
   */
  static async getPassenger(id: number): Promise<Passenger> {
    try {
      const response = await api.get<PassengerAPIResponse>(`/admin/passengers/${id}`);
      return PassengerTransformer.fromAPI(response.data);
    } catch (error) {
      console.error('Failed to fetch passenger:', error);
      return this.getMockPassenger(id);
    }
  }

  /**
   * Update passenger information (admin)
   */
  static async updatePassenger(id: number, data: PassengerUpdateData): Promise<Passenger> {
    try {
      const response = await api.put<PassengerAPIResponse>(
        `/admin/passengers/${id}`,
        PassengerTransformer.toAPI(data)
      );
      return PassengerTransformer.fromAPI(response.data);
    } catch (error) {
      console.error('Failed to update passenger:', error);
      throw error;
    }
  }

  /**
   * Change passenger account status
   */
  static async updatePassengerStatus(id: number, data: PassengerStatusChangeData): Promise<Passenger> {
    try {
      const response = await api.put<PassengerAPIResponse>(
        `/admin/passengers/${id}/status`,
        data
      );
      return PassengerTransformer.fromAPI(response.data);
    } catch (error) {
      console.error('Failed to update passenger status:', error);
      throw error;
    }
  }

  /**
   * Get passenger activity history
   */
  static async getPassengerActivity(id: number): Promise<PassengerActivity[]> {
    try {
      const response = await api.get<PassengerActivity[]>(`/admin/passengers/${id}/activity`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch passenger activity:', error);
      return this.getMockActivity();
    }
  }

  /**
   * Get passenger ride history
   */
  static async getPassengerRides(id: number, params: { page?: number; limit?: number } = {}): Promise<{ data: PassengerRide[]; pagination: PaginationMeta }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const response = await api.get<{ data: PassengerRide[]; pagination: PaginationMeta }>(
        `/admin/passengers/${id}/rides?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch passenger rides:', error);
      return this.getMockRides();
    }
  }

  /**
   * Get passenger statistics
   */
  static async getPassengerStats(): Promise<PassengerStats> {
    try {
      const response = await api.get<{
        totalPassengers: number;
        activePassengers: number;
        pendingVerification: number;
        suspended: number;
      }>('/admin/passengers/statistics');

      // Transform your backend response to match the expected PassengerStats interface
      return {
        totalPassengers: response.data.totalPassengers,
        activePassengers: response.data.activePassengers,
        suspendedPassengers: response.data.suspended,
        bannedPassengers: 0, // Not provided by your endpoint, using default
        pendingVerification: response.data.pendingVerification,
        verifiedPassengers: response.data.activePassengers, // Assuming active means verified
        totalRides: 0, // Not provided by your endpoint, using default
        totalRevenue: 0, // Not provided by your endpoint, using default
        averageRidesPerPassenger: 0, // Not provided by your endpoint, using default
      };
    } catch (error) {
      console.error('Failed to fetch passenger stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Export passengers data
   */
  static async exportPassengers(params: PassengerExportParams = {}): Promise<Blob> {
    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.status) searchParams.set('status', params.status);
      if (params.district) searchParams.set('district', params.district);
      if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);
      if (params.format) searchParams.set('format', params.format);
      if (params.fields) searchParams.set('fields', params.fields.join(','));

      const response = await api.get(
        `/admin/passengers/export?${searchParams.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export passengers:', error);
      return this.getMockExport();
    }
  }

  // Mock data methods (fallback when API is unavailable)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static getMockPassengers(_params: PassengerListParams): PassengerListResponse {
    const mockData: Passenger[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Banda',
        email: 'john.banda@example.com',
        phoneNumber: '+265991234567',
        role: 'passenger',
        status: 'active',
        district: 'Lilongwe',
        city: 'Lilongwe',
        address: 'Area 10, Lilongwe',
        nationalId: '123456789',
        emergencyContact: {
          name: 'Mary Banda',
          phone: '+265998765432',
          relationship: 'Sister'
        },
        registrationStatus: 'completed',
        emailVerificationStatus: 'verified',
        phoneVerificationStatus: 'verified',
        documentVerificationStatus: 'verified',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        lastActivity: '2024-01-20T09:15:00Z',
        totalRides: 15,
        totalSpent: 45000,
        averageRating: 4.8,
      },
      {
        id: 2,
        firstName: 'Grace',
        lastName: 'Phiri',
        email: 'grace.phiri@example.com',
        phoneNumber: '+265992345678',
        role: 'passenger',
        status: 'pending',
        district: 'Blantyre',
        city: 'Blantyre',
        address: 'Limbe, Blantyre',
        nationalId: '987654321',
        emergencyContact: {
          name: 'James Phiri',
          phone: '+265999876543',
          relationship: 'Husband'
        },
        registrationStatus: 'completed',
        emailVerificationStatus: 'verified',
        phoneVerificationStatus: 'pending',
        documentVerificationStatus: 'pending',
        createdAt: '2024-01-18T08:00:00Z',
        updatedAt: '2024-01-18T08:00:00Z',
        totalRides: 3,
        totalSpent: 8500,
        averageRating: 4.5,
      },
    ];

    return {
      data: mockData,
      pagination: {
        current_page: 1,
        per_page: 50,
        total: mockData.length,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false,
      },
    };
  }

  private static getMockPassenger(id: number): Passenger {
    return {
      id,
      firstName: 'John',
      lastName: 'Banda',
      email: 'john.banda@example.com',
      phoneNumber: '+265991234567',
      role: 'passenger',
      status: 'active',
      district: 'Lilongwe',
      city: 'Lilongwe',
      address: 'Area 10, Lilongwe',
      nationalId: '123456789',
      emergencyContact: {
        name: 'Mary Banda',
        phone: '+265998765432',
        relationship: 'Sister'
      },
      registrationStatus: 'completed',
      emailVerificationStatus: 'verified',
      phoneVerificationStatus: 'verified',
      documentVerificationStatus: 'verified',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      lastActivity: '2024-01-20T09:15:00Z',
      totalRides: 15,
      totalSpent: 45000,
      averageRating: 4.8,
    };
  }

  private static getMockActivity(): PassengerActivity[] {
    return [
      {
        id: '1',
        type: 'account_created',
        description: 'Account created successfully',
        timestamp: '2024-01-15T10:30:00Z',
        userId: 1,
      },
      {
        id: '2',
        type: 'verification_completed',
        description: 'Email verification completed',
        timestamp: '2024-01-15T11:00:00Z',
        userId: 1,
      },
      {
        id: '3',
        type: 'ride_completed',
        description: 'Completed ride to City Centre',
        timestamp: '2024-01-20T09:15:00Z',
        userId: 1,
      },
    ];
  }

  private static getMockRides(): { data: PassengerRide[]; pagination: PaginationMeta } {
    return {
      data: [
        {
          id: 1,
          status: 'ride_completed',
          driverId: 1,
          driverName: 'James Phiri',
          pickupLocation: {
            latitude: -13.9626,
            longitude: 33.7741,
            address: 'Area 10, Lilongwe'
          },
          dropoffLocation: {
            latitude: -13.9833,
            longitude: 33.7833,
            address: 'City Centre, Lilongwe'
          },
          fare: {
            baseFare: 2000,
            distance: 8.5,
            duration: 25,
            totalFare: 3500,
            currency: 'MWK'
          },
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          startedAt: '2024-01-20T09:00:00Z',
          completedAt: '2024-01-20T09:25:00Z',
          rating: {
            passengerRating: 5,
            driverRating: 5,
            passengerReview: 'Great service!',
          },
          createdAt: '2024-01-20T08:55:00Z',
          updatedAt: '2024-01-20T09:25:00Z',
        },
      ],
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 1,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false,
      },
    };
  }

  private static getMockStats(): PassengerStats {
    return {
      totalPassengers: 847,
      activePassengers: 720,
      suspendedPassengers: 15,
      bannedPassengers: 0,
      pendingVerification: 110,
      verifiedPassengers: 720,
      totalRides: 0,
      totalRevenue: 0,
      averageRidesPerPassenger: 0,
    };
  }

  private static getMockExport(): Blob {
    const csvData = 'Name,Email,Phone,Status,District,Total Rides\nJohn Banda,john.banda@example.com,+265991234567,active,Lilongwe,15';
    return new Blob([csvData], { type: 'text/csv' });
  }
}

// Export the service functions for easy use
export const passengerApi = {
  getPassengers: PassengerService.getPassengers.bind(PassengerService),
  getPassenger: PassengerService.getPassenger.bind(PassengerService),
  updatePassenger: PassengerService.updatePassenger.bind(PassengerService),
  updatePassengerStatus: PassengerService.updatePassengerStatus.bind(PassengerService),
  getPassengerActivity: PassengerService.getPassengerActivity.bind(PassengerService),
  getPassengerRides: PassengerService.getPassengerRides.bind(PassengerService),
  getPassengerStats: PassengerService.getPassengerStats.bind(PassengerService),
  exportPassengers: PassengerService.exportPassengers.bind(PassengerService),
};

// Backward compatibility - keep the existing API structure
export const passengerAPI = passengerApi;
export type { Passenger, PassengerListParams } from '@/types/passenger';