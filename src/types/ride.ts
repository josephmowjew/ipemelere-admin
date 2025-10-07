/**
 * Ride Types - Following API documentation and established patterns
 */

import type { PaginationParams } from '@/lib/api/types';

export type RideStatus =
  | 'requested'
  | 'pending_driver_acceptance'
  | 'accepted'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'cancelled_by_passenger'
  | 'cancelled_by_driver'
  | 'expired';

export interface Ride {
  id: number;
  passengerName: string | null;
  passengerPhone: string | null;
  passengerEmail: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehicleInfo: string | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  status: RideStatus;
  estimatedPrice: number;
  finalPrice: number | null;
  distance: number | null;
  estimatedDuration: number;
  requestedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  driverNotificationAttempts: number;
  hasCancellation: boolean;
  penaltyAmount?: number | null;
  rating?: number | null;
}

export interface RideDetail extends Ride {
  passenger: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  driverDetails: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    rating: number;
    totalRides: number;
  };
  vehicleDetails: {
    id: number;
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color: string;
  };
  cancellationDetails?: {
    cancelledBy: 'passenger' | 'driver' | 'admin';
    reason: string;
    timestamp: string;
  };
  ratingDetails?: {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
  };
  notificationHistory: Array<{
    driverId: number;
    driverName: string;
    notifiedAt: string;
    respondedAt?: string;
    response?: 'accepted' | 'rejected';
  }>;
}

export interface RideListParams extends PaginationParams {
  search?: string;
  status?: RideStatus;
  passengerId?: number;
  driverId?: number;
  fromDate?: string;
  toDate?: string;
  minPrice?: number;
  maxPrice?: number;
  includeCancelled?: boolean;
}

export interface RideStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  ridesByStatus: Record<RideStatus, number>;
  totalRevenue: number;
  averageRidePrice: number;
  averageDistance: number;
  averageDuration: number;
  cancelledByPassengers: number;
  cancellationRate: number;
  totalPenalties: number;
  averageRating: number;
  recentActivity: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface PendingRidesOverview {
  totalPending: number;
  pendingByDuration: {
    lessThan5Min: number;
    between5And10Min: number;
    moreThan10Min: number;
  };
  rides: Array<{
    id: number;
    passengerName: string;
    pickupAddress: string;
    requestedAt: string;
    minutesPending: number;
    notificationAttempts: number;
  }>;
}

export interface CancellationAnalysis {
  totalCancellations: number;
  cancelledByPassenger: number;
  cancelledByDriver: number;
  cancellationRate: number;
  topReasons: Array<{
    reason: string;
    count: number;
  }>;
  penaltiesCollected: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  completedRides: number;
  averageRideValue: number;
  revenueByVehicleType: Record<string, number>;
  period: {
    from: string;
    to: string;
  };
}

export interface RideTimelineEvent {
  timestamp: string;
  event: string;
  details: string;
}

export interface RideTimeline {
  rideId: number;
  events: RideTimelineEvent[];
}

export interface RideUpdateData {
  status?: RideStatus;
  finalPrice?: number;
  adminNotes?: string;
}

export interface RideCancelData {
  reason: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface RideListResponse {
  data: Ride[];
  pagination: PaginationMeta;
}
