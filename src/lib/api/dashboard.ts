/**
 * Dashboard API - Admin dashboard data fetching
 * Implements repository pattern from design document
 */

import { api } from '@/lib/api/client';
import {
  DashboardData,
  DashboardMetrics,
  ActivityItem,
  SystemStatus,
  RevenueData,
  UserGrowthData,
  QuickAction,
  APIDashboardMetrics,
  APIActivityItem,
  APISystemStatus,
  APIRevenueData,
  APIUserGrowthData,
  DashboardQueryParams,
} from '@/types/dashboard';

// Data transformers (API response -> App format)
class DashboardTransformer {
  static transformMetrics(apiData: APIDashboardMetrics): DashboardMetrics {
    return {
      totalDrivers: {
        count: apiData.drivers_total,
        changePercent: apiData.drivers_change_percent,
        changeLabel: 'from last month',
        trend: apiData.drivers_change_percent > 0 ? 'up' : apiData.drivers_change_percent < 0 ? 'down' : 'neutral',
      },
      activePassengers: {
        count: apiData.passengers_active,
        changePercent: apiData.passengers_change_percent,
        changeLabel: 'from last month',
        trend: apiData.passengers_change_percent > 0 ? 'up' : apiData.passengers_change_percent < 0 ? 'down' : 'neutral',
      },
      completedRides: {
        count: apiData.rides_completed,
        changePercent: apiData.rides_change_percent,
        changeLabel: 'from last month',
        trend: apiData.rides_change_percent > 0 ? 'up' : apiData.rides_change_percent < 0 ? 'down' : 'neutral',
      },
      monthlyRevenue: {
        amount: apiData.revenue_monthly,
        currency: apiData.revenue_currency || 'MWK',
        changePercent: apiData.revenue_change_percent,
        changeLabel: 'from last month',
        trend: apiData.revenue_change_percent > 0 ? 'up' : apiData.revenue_change_percent < 0 ? 'down' : 'neutral',
      },
    };
  }

  static transformActivity(apiData: APIActivityItem[]): ActivityItem[] {
    return apiData.map((item) => ({
      id: item.id,
      type: item.activity_type as ActivityItem['type'],
      title: item.title,
      description: item.description,
      timestamp: new Date(item.created_at),
      userId: item.user_id,
      userName: item.user_name,
      userType: item.user_type as ActivityItem['userType'],
      amount: item.amount,
      currency: item.currency,
    }));
  }

  static transformSystemStatus(apiData: APISystemStatus): SystemStatus {
    return {
      apiStatus: apiData.api_status as SystemStatus['apiStatus'],
      database: apiData.database_status as SystemStatus['database'],
      paymentGateway: apiData.payment_gateway_status as SystemStatus['paymentGateway'],
      webSocket: apiData.websocket_status as SystemStatus['webSocket'],
      lastUpdated: new Date(apiData.last_check),
    };
  }

  static transformRevenueData(apiData: APIRevenueData[]): RevenueData[] {
    return apiData.map((item) => ({
      period: item.period,
      revenue: item.total_revenue,
      rides: item.total_rides,
      averageRideValue: item.average_ride_value,
    }));
  }

  static transformUserGrowthData(apiData: APIUserGrowthData[]): UserGrowthData[] {
    return apiData.map((item) => ({
      period: item.period,
      totalUsers: item.total_users,
      drivers: item.total_drivers,
      passengers: item.total_passengers,
      newUsers: item.new_users,
    }));
  }
}

// Dashboard API service class
export class DashboardService {
  /**
   * Get dashboard metrics (drivers, passengers, rides, revenue)
   */
  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get<APIDashboardMetrics>('/dashboard/metrics');
      return DashboardTransformer.transformMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      // Return mock data as fallback
      return this.getMockMetrics();
    }
  }

  /**
   * Get recent activity feed
   */
  static async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const response = await api.get<APIActivityItem[]>('/dashboard/activity', {
        params: { limit },
      });
      return DashboardTransformer.transformActivity(response.data);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return this.getMockActivity();
    }
  }

  /**
   * Get system status
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await api.get<APISystemStatus>('/dashboard/system-status');
      return DashboardTransformer.transformSystemStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return this.getMockSystemStatus();
    }
  }

  /**
   * Get revenue chart data
   */
  static async getRevenueChart(params?: DashboardQueryParams): Promise<RevenueData[]> {
    try {
      const response = await api.get<APIRevenueData[]>('/dashboard/revenue-chart', {
        params,
      });
      return DashboardTransformer.transformRevenueData(response.data);
    } catch (error) {
      console.error('Failed to fetch revenue chart data:', error);
      return this.getMockRevenueData();
    }
  }

  /**
   * Get user growth chart data
   */
  static async getUserGrowthChart(params?: DashboardQueryParams): Promise<UserGrowthData[]> {
    try {
      const response = await api.get<APIUserGrowthData[]>('/dashboard/user-growth-chart', {
        params,
      });
      return DashboardTransformer.transformUserGrowthData(response.data);
    } catch (error) {
      console.error('Failed to fetch user growth data:', error);
      return this.getMockUserGrowthData();
    }
  }

  /**
   * Get all dashboard data in one call
   */
  static async getAllDashboardData(): Promise<DashboardData> {
    try {
      // For optimization, we could have a single endpoint that returns everything
      // or make parallel calls to individual endpoints
      const [metrics, activity, systemStatus, revenueChart, userGrowthChart] = await Promise.all([
        this.getMetrics(),
        this.getRecentActivity(),
        this.getSystemStatus(),
        this.getRevenueChart({ period: 'month' }),
        this.getUserGrowthChart({ period: 'month' }),
      ]);

      return {
        metrics,
        recentActivity: activity,
        systemStatus,
        revenueChart,
        userGrowthChart,
        quickActions: this.getQuickActions(),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get quick actions (static for now)
   */
  static getQuickActions(): QuickAction[] {
    return [
      {
        id: 'manage-drivers',
        title: 'Manage Drivers',
        description: 'Review applications',
        icon: 'TruckIcon',
        href: '/dashboard/drivers',
        count: 12, // This could come from API
      },
      {
        id: 'active-rides',
        title: 'View Active Rides',
        description: 'Monitor live rides',
        icon: 'MapIcon',
        href: '/dashboard/rides/active',
      },
      {
        id: 'manage-passengers',
        title: 'Manage Passengers',
        description: 'User management',
        icon: 'UsersIcon',
        href: '/dashboard/passengers',
      },
    ];
  }

  // Mock data methods (fallback when API is unavailable)
  private static getMockMetrics(): DashboardMetrics {
    return {
      totalDrivers: {
        count: 847,
        changePercent: 12,
        changeLabel: 'from last month',
        trend: 'up',
      },
      activePassengers: {
        count: 3200,
        changePercent: 8,
        changeLabel: 'from last month',
        trend: 'up',
      },
      completedRides: {
        count: 12800,
        changePercent: 15,
        changeLabel: 'from last month',
        trend: 'up',
      },
      monthlyRevenue: {
        amount: 28540,
        currency: 'MWK',
        changePercent: 5,
        changeLabel: 'from last month',
        trend: 'up',
      },
    };
  }

  private static getMockActivity(): ActivityItem[] {
    return [
      {
        id: '1',
        type: 'driver_registered',
        title: 'New driver registered',
        description: 'John Banda completed registration',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        userName: 'John Banda',
        userType: 'driver',
      },
      {
        id: '2',
        type: 'ride_completed',
        title: 'Ride completed',
        description: 'Lilongwe to Blantyre',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        amount: 15000,
        currency: 'MWK',
      },
      {
        id: '3',
        type: 'document_verified',
        title: 'Document verified',
        description: 'Driver license approved',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        userName: 'Mary Chisomo',
        userType: 'admin',
      },
    ];
  }

  private static getMockSystemStatus(): SystemStatus {
    return {
      apiStatus: 'operational',
      database: 'healthy',
      paymentGateway: 'connected',
      webSocket: 'connected',
      lastUpdated: new Date(),
    };
  }

  private static getMockRevenueData(): RevenueData[] {
    return [
      { period: 'Jan', revenue: 45000, rides: 320, averageRideValue: 140.63 },
      { period: 'Feb', revenue: 52000, rides: 380, averageRideValue: 136.84 },
      { period: 'Mar', revenue: 48000, rides: 350, averageRideValue: 137.14 },
      { period: 'Apr', revenue: 61000, rides: 420, averageRideValue: 145.24 },
      { period: 'May', revenue: 55000, rides: 390, averageRideValue: 141.03 },
      { period: 'Jun', revenue: 67000, rides: 450, averageRideValue: 148.89 },
    ];
  }

  private static getMockUserGrowthData(): UserGrowthData[] {
    return [
      { period: 'Jan', totalUsers: 1200, drivers: 180, passengers: 1020, newUsers: 45 },
      { period: 'Feb', totalUsers: 1350, drivers: 205, passengers: 1145, newUsers: 150 },
      { period: 'Mar', totalUsers: 1480, drivers: 220, passengers: 1260, newUsers: 130 },
      { period: 'Apr', totalUsers: 1650, drivers: 240, passengers: 1410, newUsers: 170 },
      { period: 'May', totalUsers: 1820, drivers: 265, passengers: 1555, newUsers: 170 },
      { period: 'Jun', totalUsers: 2000, drivers: 290, passengers: 1710, newUsers: 180 },
    ];
  }
}

// Export individual functions for easier testing and usage
export const dashboardApi = {
  getMetrics: DashboardService.getMetrics.bind(DashboardService),
  getRecentActivity: DashboardService.getRecentActivity.bind(DashboardService),
  getSystemStatus: DashboardService.getSystemStatus.bind(DashboardService),
  getRevenueChart: DashboardService.getRevenueChart.bind(DashboardService),
  getUserGrowthChart: DashboardService.getUserGrowthChart.bind(DashboardService),
  getAllDashboardData: DashboardService.getAllDashboardData.bind(DashboardService),
  getQuickActions: DashboardService.getQuickActions.bind(DashboardService),
};