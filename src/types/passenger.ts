/**
 * Passenger Types - TypeScript interfaces for passenger management
 * Following clean architecture patterns from design document
 */

// Core passenger data structure
export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'passenger';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  
  // Location information
  district: string;
  city: string;
  address: string;
  nationalId: string;
  
  // Emergency contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Verification status
  registrationStatus: 'pending' | 'completed';
  emailVerificationStatus: 'pending' | 'verified';
  phoneVerificationStatus: 'pending' | 'verified';
  documentVerificationStatus: 'pending' | 'verified' | 'rejected';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  
  // Aggregate data
  totalRides?: number;
  totalSpent?: number;
  averageRating?: number;
}

// API Query parameters
export interface PassengerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Passenger['status'];
  district?: string;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  sortBy?: 'createdAt' | 'lastActivity' | 'totalRides' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

// Update data structures
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
  adminNotes?: string;
}

// Activity and ride history
export interface PassengerActivity {
  id: string;
  type: 'account_created' | 'profile_updated' | 'verification_completed' | 'ride_booked' | 'ride_completed' | 'payment_made' | 'status_changed';
  description: string;
  timestamp: string;
  userId?: number;
  adminId?: number;
  metadata?: Record<string, any>;
}

export interface PassengerRide {
  id: number;
  status: 'pending' | 'driver_assigned' | 'driver_en_route' | 'driver_arrived' | 'ride_started' | 'ride_completed' | 'ride_cancelled';
  driverId?: number;
  driverName?: string;
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
  fare: {
    baseFare: number;
    distance: number;
    duration: number;
    totalFare: number;
    currency: string;
  };
  paymentMethod: 'cash' | 'mobile_money' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: {
    passengerRating: number;
    driverRating: number;
    passengerReview?: string;
    driverReview?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Filter and search types
export interface PassengerFilters {
  search: string;
  status: Passenger['status'][];
  district: string[];
  verificationStatus: ('verified' | 'pending' | 'rejected')[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Statistics and summaries
export interface PassengerStats {
  totalPassengers: number;
  activePassengers: number;
  suspendedPassengers: number;
  bannedPassengers: number;
  pendingVerification: number;
  verifiedPassengers: number;
  totalRides: number;
  totalRevenue: number;
  averageRidesPerPassenger: number;
}

// Export and reporting types
export interface PassengerExportParams {
  search?: string;
  status?: Passenger['status'];
  district?: string;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  format?: 'csv' | 'xlsx' | 'pdf';
  fields?: (keyof Passenger)[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

// Form validation schemas (for Zod)
export interface PassengerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  district: string;
  city: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

// Component prop types
export interface PassengerTableProps {
  passengers: Passenger[];
  loading?: boolean;
  error?: string;
  onEdit?: (passenger: Passenger) => void;
  onStatusChange?: (passengerId: number, status: Passenger['status']) => void;
  onView?: (passengerId: number) => void;
}

export interface PassengerCardProps {
  passenger: Passenger;
  onEdit?: (passenger: Passenger) => void;
  onStatusChange?: (passengerId: number, status: Passenger['status']) => void;
  onView?: (passengerId: number) => void;
  showActions?: boolean;
}

export interface PassengerFormProps {
  passenger?: Passenger;
  onSubmit: (data: PassengerFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

// Pagination types (reused from existing types)
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PassengerListResponse {
  data: Passenger[];
  pagination: PaginationMeta;
}

// Error types
export interface PassengerError {
  code: string;
  message: string;
  field?: keyof Passenger;
  details?: Record<string, any>;
}

// API response types
export interface PassengerApiResponse<T = Passenger> {
  success: boolean;
  data: T;
  message?: string;
  errors?: PassengerError[];
}

export interface PassengerListApiResponse {
  success: boolean;
  data: Passenger[];
  pagination: PaginationMeta;
  message?: string;
}

// Real-time update types
export interface PassengerUpdateEvent {
  type: 'passenger_created' | 'passenger_updated' | 'passenger_status_changed' | 'passenger_verified';
  passengerId: number;
  data: Partial<Passenger>;
  timestamp: string;
  adminId?: number;
}