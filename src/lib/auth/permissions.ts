/**
 * Role-Based Permission Utilities
 * Works with existing tokenManager and auth system
 */

import { tokenManager } from './tokenManager';
import { UserRole } from '@/types/auth';

/**
 * JWT payload structure from backend
 */
interface JWTPayload {
  sub: number; // user ID
  email: string;
  roles: string[]; // array of roles from backend
  iat: number; // issued at
  exp: number; // expires at
}

/**
 * Decode JWT token payload without verification
 * For middleware use - verification happens server-side
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    return decodedPayload as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Check if user has admin role from JWT token
 */
export function hasAdminRole(token: string): boolean {
  try {
    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      return false;
    }

    // Backend returns roles as array, check if admin is included
    return payload.roles && payload.roles.includes('admin');
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

/**
 * Get user role from JWT token
 */
export function getUserRoleFromToken(token: string): UserRole | null {
  try {
    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      return null;
    }

    // Return the first role (assuming single role per user)
    if (payload.roles && payload.roles.length > 0) {
      return payload.roles[0] as UserRole;
    }

    return null;
  } catch (error) {
    console.error('Error getting user role from token:', error);
    return null;
  }
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(token: string): number | null {
  try {
    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      return null;
    }

    return payload.sub;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}

/**
 * Check if current user is authenticated admin
 * Uses existing tokenManager
 */
export function isAuthenticatedAdmin(): boolean {
  try {
    // Use existing tokenManager to check validity
    if (!tokenManager.hasValidToken()) {
      return false;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      return false;
    }

    return hasAdminRole(token);
  } catch (error) {
    console.error('Error checking authenticated admin status:', error);
    return false;
  }
}

/**
 * Check if current user is authenticated (any role)
 * Uses existing tokenManager
 */
export function isAuthenticated(): boolean {
  try {
    return tokenManager.hasValidToken();
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

/**
 * Route permission definitions
 */
export const ROUTE_PERMISSIONS = {
  // Public routes - no authentication required
  PUBLIC: [
    '/',
    '/login',
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ],
  
  // Protected routes - authentication required
  PROTECTED: [
    '/dashboard',
  ],
  
  // Admin routes - admin role required
  ADMIN_ONLY: [
    '/dashboard/analytics',
    '/dashboard/drivers', 
    '/dashboard/passengers',
    '/dashboard/rides',
    '/dashboard/notifications',
    '/dashboard/documents',
  ],
} as const;

/**
 * Check if route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  // Check if it's explicitly public
  const isPublic = ROUTE_PERMISSIONS.PUBLIC.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublic) {
    return false;
  }

  // Check if it's protected
  const isProtected = ROUTE_PERMISSIONS.PROTECTED.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  return isProtected;
}

/**
 * Check if route requires admin role
 */
export function requiresAdminRole(pathname: string): boolean {
  return ROUTE_PERMISSIONS.ADMIN_ONLY.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Determine redirect URL based on authentication status
 */
export function getRedirectUrl(pathname: string, isAuth: boolean, isAdmin: boolean): string | null {
  // If user is authenticated and trying to access login, redirect to dashboard
  if (isAuth && pathname === '/login') {
    return '/dashboard';
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuth && requiresAuth(pathname)) {
    return '/login';
  }

  // If user is authenticated but not admin and trying to access admin routes
  if (isAuth && !isAdmin && requiresAdminRole(pathname)) {
    return '/dashboard'; // or could redirect to access denied page
  }

  // Root path redirect
  if (pathname === '/') {
    return isAuth ? '/dashboard' : '/login';
  }

  return null;
}