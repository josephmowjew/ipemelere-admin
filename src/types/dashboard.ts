/**
 * Dashboard Types - TypeScript interfaces for admin dashboard data
 * Following clean architecture patterns from design document
 */

export interface DashboardMetrics {
  totalDrivers: {
    count: number;
    changePercent: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activePassengers: {
    count: number;
    changePercent: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
  };
  completedRides: {
    count: number;
    changePercent: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
  };
  monthlyRevenue: {
    amount: number;
    currency: string;
    changePercent: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface ActivityItem {
  id: string;
  type: 'driver_registered' | 'ride_completed' | 'payment_processed' | 'document_verified' | 'user_registered';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  userType?: 'driver' | 'passenger' | 'admin';
  amount?: number;
  currency?: string;
}

export interface SystemStatus {
  apiStatus: 'operational' | 'degraded' | 'down';
  database: 'healthy' | 'warning' | 'error';
  paymentGateway: 'connected' | 'disconnected' | 'error';
  webSocket: 'connected' | 'disconnected';
  lastUpdated: Date;
}

export interface RevenueData {
  period: string; // e.g., "2024-01", "Week 1", etc.
  revenue: number;
  rides: number;
  averageRideValue: number;
}

export interface UserGrowthData {
  period: string;
  totalUsers: number;
  drivers: number;
  passengers: number;
  newUsers: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name or component identifier
  href: string;
  count?: number; // Optional count for badges (e.g., pending documents)
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentActivity: ActivityItem[];
  systemStatus: SystemStatus;
  revenueChart: RevenueData[];
  userGrowthChart: UserGrowthData[];
  quickActions: QuickAction[];
}

// API Response types (what we receive from backend)
export interface APIDashboardMetrics {
  drivers_total: number;
  drivers_change_percent: number;
  passengers_active: number;
  passengers_change_percent: number;
  rides_completed: number;
  rides_change_percent: number;
  revenue_monthly: number;
  revenue_change_percent: number;
  revenue_currency: string;
}

export interface APIActivityItem {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_type?: string;
  amount?: number;
  currency?: string;
}

export interface APISystemStatus {
  api_status: string;
  database_status: string;
  payment_gateway_status: string;
  websocket_status: string;
  last_check: string;
}

export interface APIRevenueData {
  period: string;
  total_revenue: number;
  total_rides: number;
  average_ride_value: number;
}

export interface APIUserGrowthData {
  period: string;
  total_users: number;
  total_drivers: number;
  total_passengers: number;
  new_users: number;
}

// Error types for dashboard API
export interface DashboardError {
  code: string;
  message: string;
  field?: string;
}

// Query parameters for dashboard endpoints
export interface DashboardQueryParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

export interface ChartProps {
  data: RevenueData[] | UserGrowthData[];
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}