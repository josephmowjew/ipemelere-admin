/**
 * useRouteGuard Hook - Conditional Logic for Route Protection
 * Prevents infinite redirect loops with careful state management
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthSelectors } from '@/store/authStore';
import { RouteGuardOptions, UserRole } from '@/types/auth';

/**
 * Default route guard options
 */
const DEFAULT_GUARD_OPTIONS: Required<RouteGuardOptions> = {
  requiredRole: 'admin',
  requiredStatus: 'active',
  redirectTo: '/login',
  requireAuth: true,
};

/**
 * Route protection result (primitive values only)
 */
interface RouteGuardResult {
  isAllowed: boolean; // Primitive boolean
  isLoading: boolean; // Primitive boolean
  needsRedirect: boolean; // Primitive boolean
  redirectTo: string | null; // Primitive string or null
  reason: string | null; // Primitive string or null
}

/**
 * Main route guard hook with loop prevention
 */
export const useRouteGuard = (options: Partial<RouteGuardOptions> = {}): RouteGuardResult => {
  const fullOptions = useMemo(() => ({ ...DEFAULT_GUARD_OPTIONS, ...options }), [options]);
  
  // Router and pathname
  const router = useRouter();
  const pathname = usePathname();
  
  // Get primitive auth state values (safe for useEffect)
  const isAuthenticated = useAuthSelectors.isAuthenticated();
  const isLoading = useAuthSelectors.isLoading();
  const isInitialized = useAuthSelectors.isInitialized();
  const userRole = useAuthSelectors.userRole();
  const userStatus = useAuthSelectors.userStatus();
  
  // Stable references to prevent redirect loops
  const hasRedirectedRef = useRef<boolean>(false);
  const lastPathRef = useRef<string>('');
  const lastCheckRef = useRef<number>(0);
  
  /**
   * Check if user meets role requirements (primitive boolean)
   */
  const hasRequiredRole = useMemo((): boolean => {
    if (!fullOptions.requiredRole) return true;
    return userRole === fullOptions.requiredRole;
  }, [userRole, fullOptions.requiredRole]);
  
  /**
   * Check if user meets status requirements (primitive boolean)
   */
  const hasRequiredStatus = useMemo((): boolean => {
    if (!fullOptions.requiredStatus) return true;
    return userStatus === fullOptions.requiredStatus;
  }, [userStatus, fullOptions.requiredStatus]);
  
  /**
   * Determine if access is allowed (primitive boolean)
   */
  const isAllowed = useMemo((): boolean => {
    if (!isInitialized) return false; // Not yet determined
    if (!fullOptions.requireAuth) return true; // Public route
    if (!isAuthenticated) return false; // Not authenticated
    if (!hasRequiredRole) return false; // Wrong role
    if (!hasRequiredStatus) return false; // Wrong status
    return true;
  }, [
    isInitialized,
    fullOptions.requireAuth,
    isAuthenticated,
    hasRequiredRole,
    hasRequiredStatus,
  ]);
  
  /**
   * Determine redirect requirement (primitive boolean)
   */
  const needsRedirect = useMemo((): boolean => {
    if (!isInitialized || isLoading) return false; // Wait for initialization
    if (isAllowed) return false; // Access allowed
    return true; // Needs redirect
  }, [isInitialized, isLoading, isAllowed]);
  
  /**
   * Determine redirect reason
   */
  const redirectReason = useMemo((): string | null => {
    if (isAllowed) return null;
    if (!isInitialized) return 'initializing';
    if (!isAuthenticated) return 'not_authenticated';
    if (!hasRequiredRole) return 'insufficient_role';
    if (!hasRequiredStatus) return 'invalid_status';
    return 'access_denied';
  }, [isAllowed, isInitialized, isAuthenticated, hasRequiredRole, hasRequiredStatus]);
  
  /**
   * Perform redirect with loop prevention
   */
  const performRedirect = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid successive redirects
    if (now - lastCheckRef.current < 1000) {
      return;
    }
    
    // Prevent redirecting to the same place
    if (hasRedirectedRef.current && pathname === lastPathRef.current) {
      return;
    }
    
    // Prevent redirecting if already at redirect target
    if (pathname === fullOptions.redirectTo) {
      return;
    }
    
    try {
      hasRedirectedRef.current = true;
      lastPathRef.current = pathname;
      lastCheckRef.current = now;
      
      // Add current path as return URL for better UX
      const returnUrl = encodeURIComponent(pathname);
      const redirectUrl = fullOptions.redirectTo.includes('?') 
        ? `${fullOptions.redirectTo}&returnUrl=${returnUrl}`
        : `${fullOptions.redirectTo}?returnUrl=${returnUrl}`;
      
      router.push(redirectUrl);
    } catch (error) {
      console.error('Redirect failed:', error);
      // Fallback: try basic redirect without return URL
      router.push(fullOptions.redirectTo);
    }
  }, [router, pathname, fullOptions.redirectTo]);
  
  /**
   * Reset redirect tracking when path changes
   */
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      hasRedirectedRef.current = false;
      lastPathRef.current = pathname;
    }
  }, [pathname]);
  
  /**
   * Handle redirects with careful dependency management
   */
  useEffect(() => {
    // Only redirect if we need to and haven't already
    if (needsRedirect && !hasRedirectedRef.current) {
      performRedirect();
    }
  }, [
    needsRedirect, // Primitive boolean
    performRedirect,
  ]);
  
  /**
   * Return memoized result with primitive values
   */
  return useMemo((): RouteGuardResult => ({
    isAllowed, // Primitive boolean
    isLoading: isLoading || !isInitialized, // Primitive boolean
    needsRedirect, // Primitive boolean
    redirectTo: needsRedirect ? fullOptions.redirectTo : null, // Primitive string or null
    reason: redirectReason, // Primitive string or null
  }), [
    isAllowed,
    isLoading,
    isInitialized,
    needsRedirect,
    fullOptions.redirectTo,
    redirectReason,
  ]);
};

/**
 * Simplified admin route guard (for dashboard pages)
 */
export const useAdminGuard = () => {
  return useRouteGuard({
    requiredRole: 'admin',
    requiredStatus: 'active',
    redirectTo: '/login',
    requireAuth: true,
  });
};

/**
 * Auth-only guard (any authenticated user)
 */
export const useAuthGuard = () => {
  return useRouteGuard({
    requiredRole: undefined, // Any role
    requiredStatus: 'active',
    redirectTo: '/login',
    requireAuth: true,
  });
};

/**
 * Public route guard (no authentication required)
 */
export const usePublicGuard = () => {
  return useRouteGuard({
    requireAuth: false,
  });
};

/**
 * Hook for conditional routing based on authentication
 * Prevents redirect loops by checking if already authenticated
 */
export const useAuthRedirect = (
  authenticatedRoute: string = '/dashboard',
  options: { 
    skipIfAlreadyThere?: boolean;
    onlyIfFullyLoaded?: boolean;
  } = {}
) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const isAuthenticated = useAuthSelectors.isAuthenticated();
  const isInitialized = useAuthSelectors.isInitialized();
  const isAdmin = useAuthSelectors.isAdmin();
  
  // Stable references
  const hasRedirectedRef = useRef<boolean>(false);
  const skipIfAlreadyThere = options.skipIfAlreadyThere ?? true;
  const onlyIfFullyLoaded = options.onlyIfFullyLoaded ?? true;
  
  useEffect(() => {
    // Wait for initialization if required
    if (onlyIfFullyLoaded && !isInitialized) {
      return;
    }
    
    // Skip if already redirected
    if (hasRedirectedRef.current) {
      return;
    }
    
    // Skip if already at target route
    if (skipIfAlreadyThere && pathname === authenticatedRoute) {
      return;
    }
    
    // Only redirect if authenticated and admin
    if (isAuthenticated && isAdmin) {
      hasRedirectedRef.current = true;
      router.push(authenticatedRoute);
    }
  }, [
    isAuthenticated, // Primitive boolean
    isAdmin, // Primitive boolean
    isInitialized, // Primitive boolean
    pathname,
    authenticatedRoute,
    router,
    skipIfAlreadyThere,
    onlyIfFullyLoaded,
  ]);
  
  // Return current status (primitive values)
  return {
    shouldRedirect: isAuthenticated && isAdmin && pathname !== authenticatedRoute,
    isRedirecting: hasRedirectedRef.current,
    canAccess: isAuthenticated && isAdmin,
  };
};

/**
 * Hook that provides loading state during auth checks
 * Returns primitive boolean for safe use in components
 */
export const useRouteLoading = (): boolean => {
  const isLoading = useAuthSelectors.isLoading();
  const isInitialized = useAuthSelectors.isInitialized();
  
  return isLoading || !isInitialized;
};

/**
 * Hook for getting current route access status
 * Returns primitive values only
 */
export const useRouteAccess = (requiredRole?: UserRole) => {
  const isAuthenticated = useAuthSelectors.isAuthenticated();
  const userRole = useAuthSelectors.userRole();
  const userStatus = useAuthSelectors.userStatus();
  const isInitialized = useAuthSelectors.isInitialized();
  
  return useMemo(() => ({
    canAccess: isAuthenticated && 
               userStatus === 'active' && 
               (!requiredRole || userRole === requiredRole),
    isAuthenticated, // Primitive boolean
    hasValidStatus: userStatus === 'active', // Primitive boolean
    hasValidRole: !requiredRole || userRole === requiredRole, // Primitive boolean
    isReady: isInitialized, // Primitive boolean
  }), [isAuthenticated, userRole, userStatus, isInitialized, requiredRole]);
};

/**
 * Component wrapper for route protection (HOC alternative)
 */
export const withRouteGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardOptions?: Partial<RouteGuardOptions>
) => {
  return function GuardedComponent(props: P) {
    const guard = useRouteGuard(guardOptions);
    
    // Show loading state
    if (guard.isLoading) {
      return React.createElement('div', null, 'Loading...');
    }
    
    // Show access denied (this shouldn't happen if redirect is working)
    if (!guard.isAllowed && !guard.needsRedirect) {
      return React.createElement('div', null, 'Access Denied');
    }
    
    // Show component if access is allowed
    if (guard.isAllowed) {
      return React.createElement(WrappedComponent, props);
    }
    
    // Show loading during redirect
    return React.createElement('div', null, 'Redirecting...');
  };
};

export default useRouteGuard;