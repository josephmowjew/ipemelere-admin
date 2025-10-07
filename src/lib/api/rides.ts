/**
 * Rides API Client - Admin endpoints for ride management
 * Following established patterns from drivers/passengers
 */

import { api } from './client';
import type {
  RideDetail,
  RideListParams,
  RideListResponse,
  RideStats,
  PendingRidesOverview,
  CancellationAnalysis,
  RevenueSummary,
  RideTimeline,
  RideUpdateData,
  RideCancelData,
} from '@/types/ride';

export const ridesAPI = {
  /**
   * Get paginated list of rides with filters
   * GET /admin/rides
   */
  async getRides(params: RideListParams = {}): Promise<RideListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.passengerId) searchParams.set('passengerId', params.passengerId.toString());
    if (params.driverId) searchParams.set('driverId', params.driverId.toString());
    if (params.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params.toDate) searchParams.set('toDate', params.toDate);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.includeCancelled !== undefined) searchParams.set('includeCancelled', params.includeCancelled.toString());
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.order) searchParams.set('order', params.order);

    const response = await api.get<RideListResponse>(`/admin/rides?${searchParams.toString()}`);
    return response.data;
  },

  /**
   * Get ride statistics
   * GET /admin/rides/stats
   */
  async getStats(): Promise<RideStats> {
    const response = await api.get<RideStats>('/admin/rides/stats');
    return response.data;
  },

  /**
   * Export rides data
   * GET /admin/rides/export
   */
  async exportRides(params: Omit<RideListParams, 'page' | 'limit'> & { format?: 'csv' | 'excel' } = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();

    if (params.format) searchParams.set('format', params.format);
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.fromDate) searchParams.set('fromDate', params.fromDate);
    if (params.toDate) searchParams.set('toDate', params.toDate);
    if (params.passengerId) searchParams.set('passengerId', params.passengerId.toString());
    if (params.driverId) searchParams.set('driverId', params.driverId.toString());

    const response = await api.get(`/admin/rides/export?${searchParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get single ride details
   * GET /admin/rides/:id
   */
  async getRide(id: number): Promise<RideDetail> {
    const response = await api.get<RideDetail>(`/admin/rides/${id}`);
    return response.data;
  },

  /**
   * Update ride information
   * PUT /admin/rides/:id
   */
  async updateRide(id: number, data: RideUpdateData): Promise<RideDetail> {
    const response = await api.put<RideDetail>(`/admin/rides/${id}`, data);
    return response.data;
  },

  /**
   * Get ride timeline
   * GET /admin/rides/:id/timeline
   */
  async getRideTimeline(id: number): Promise<RideTimeline> {
    const response = await api.get<RideTimeline>(`/admin/rides/${id}/timeline`);
    return response.data;
  },

  /**
   * Get pending rides overview
   * GET /admin/rides/pending/overview
   */
  async getPendingOverview(): Promise<PendingRidesOverview> {
    const response = await api.get<PendingRidesOverview>('/admin/rides/pending/overview');
    return response.data;
  },

  /**
   * Get cancellation analysis
   * GET /admin/rides/cancellations/analysis
   */
  async getCancellationAnalysis(days: number = 30): Promise<CancellationAnalysis> {
    const response = await api.get<CancellationAnalysis>(`/admin/rides/cancellations/analysis?days=${days}`);
    return response.data;
  },

  /**
   * Get revenue summary
   * GET /admin/rides/revenue/summary
   */
  async getRevenueSummary(fromDate?: string, toDate?: string): Promise<RevenueSummary> {
    const searchParams = new URLSearchParams();
    if (fromDate) searchParams.set('fromDate', fromDate);
    if (toDate) searchParams.set('toDate', toDate);

    const response = await api.get<RevenueSummary>(`/admin/rides/revenue/summary?${searchParams.toString()}`);
    return response.data;
  },

  /**
   * Cancel ride (admin)
   * PATCH /admin/rides/:id/cancel
   */
  async cancelRide(id: number, data: RideCancelData): Promise<{ success: boolean; rideId: number; status: string; cancelledBy: string; reason: string; timestamp: string }> {
    const response = await api.patch(`/admin/rides/${id}/cancel`, data);
    return response.data;
  },
};
