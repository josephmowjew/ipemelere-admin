/**
 * Dashboard Layout - Loop-Safe Auth Checks
 * Main layout component with authentication verification
 */

'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { useTokenManager } from '@/hooks/useTokenManager';

/**
 * Loading component
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

/**
 * Unauthorized component
 */
const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.334 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-sm text-gray-600 mb-4">
        You don't have permission to access this area. Only administrators can access the dashboard.
      </p>
      <button
        onClick={() => window.location.href = '/login'}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Login
      </button>
    </div>
  </div>
);

/**
 * Dashboard Header Component
 */
const DashboardHeader: React.FC<{ 
  userName?: string;
  onLogout: () => void;
}> = ({ userName, onLogout }) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Ganyu Ipemelere Admin
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {userName && (
            <span className="text-sm text-gray-700">
              Welcome, {userName}
            </span>
          )}
          
          <button
            onClick={onLogout}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);

/**
 * Dashboard Sidebar Component
 */
const DashboardSidebar: React.FC = () => {
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'chart' },
    { name: 'Drivers', href: '/dashboard/drivers', icon: 'users' },
    { name: 'Passengers', href: '/dashboard/passengers', icon: 'user-group' },
    { name: 'Rides', href: '/dashboard/rides', icon: 'car' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: 'bell' },
    { name: 'Documents', href: '/dashboard/documents', icon: 'document' },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">
                {/* Icon placeholder - you can replace with actual icons */}
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
              </span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

/**
 * Token Status Indicator Component (for debugging)
 */
const TokenStatusIndicator: React.FC = () => {
  const { hasToken, isValid, timeUntilExpiry } = useTokenManager();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const formatTime = (ms: number | null) => {
    if (!ms || ms <= 0) return 'Expired';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
      <div>Token: {hasToken ? '✓' : '✗'}</div>
      <div>Valid: {isValid ? '✓' : '✗'}</div>
      <div>Expires: {formatTime(timeUntilExpiry)}</div>
    </div>
  );
};

/**
 * Dashboard Layout Props
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Dashboard Layout Component
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Auth hooks with primitive values (safe for useEffect)
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    isAdmin,
    user,
    logout,
  } = useAuth({
    autoInitialize: true,
    enablePeriodicCheck: false, // Prevent loops
  });
  
  // Route guard (handles redirects)
  const guard = useAdminGuard();
  
  /**
   * Memoized user display name
   */
  const userDisplayName = useMemo(() => {
    if (!user) return undefined;
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }, [user]);
  
  /**
   * Memoized layout state
   */
  const layoutState = useMemo(() => ({
    showLoading: !isInitialized || isLoading || guard.isLoading,
    showUnauthorized: isInitialized && !isLoading && !guard.isLoading && !guard.isAllowed,
    showDashboard: isInitialized && !isLoading && guard.isAllowed && isAuthenticated && isAdmin,
  }), [
    isInitialized,
    isLoading,
    guard.isLoading,
    guard.isAllowed,
    isAuthenticated,
    isAdmin,
  ]);
  
  // Show loading state
  if (layoutState.showLoading) {
    return <LoadingSpinner />;
  }
  
  // Show unauthorized state (shouldn't happen with proper routing)
  if (layoutState.showUnauthorized) {
    return <UnauthorizedAccess />;
  }
  
  // Show dashboard layout
  if (layoutState.showDashboard) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader 
            userName={userDisplayName}
            onLogout={logout}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        <TokenStatusIndicator />
      </div>
    );
  }
  
  // Fallback (should not reach here)
  return <LoadingSpinner />;
};

/**
 * Memoized export to prevent unnecessary re-renders
 */
export default React.memo(DashboardLayout);