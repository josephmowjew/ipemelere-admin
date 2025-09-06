/**
 * Next.js Middleware - Route Protection & Role-Based Access Control
 * Protects dashboard routes while preserving existing auth system
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple JWT payload decoder for middleware
 * (Same logic as in permissions.ts but duplicated to avoid import issues in middleware)
 */
function decodeJWTPayload(token: string): { sub: number; email: string; roles: string[]; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(payload: { exp: number }): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Check if user has admin role from token
 */
function hasAdminRole(token: string): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload || isTokenExpired(payload)) {
    return false;
  }
  return payload.roles && payload.roles.includes('admin');
}

/**
 * Get token from request (checking multiple sources)
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies - using the same cookie name as tokenManager
  const tokenCookieValue = request.cookies.get('auth_access_token')?.value;
  if (tokenCookieValue) {
    try {
      // Parse the JSON token data structure used by tokenManager
      const tokenData = JSON.parse(tokenCookieValue);
      
      // Check if token is valid (not expired)
      if (tokenData.token && tokenData.expiresAt) {
        const now = Date.now();
        if (now < tokenData.expiresAt) {
          return tokenData.token;
        }
      }
    } catch (error) {
      console.error('Failed to parse token cookie:', error);
    }
  }

  return null;
}

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
  ];

  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return pathname.startsWith('/dashboard');
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // Special case: if user is authenticated and trying to access login, redirect to dashboard
    if (pathname === '/login') {
      const token = getTokenFromRequest(request);
      if (token && hasAdminRole(token)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
    
    // Special case: root path redirect
    if (pathname === '/') {
      const token = getTokenFromRequest(request);
      const url = request.nextUrl.clone();
      
      if (token && hasAdminRole(token)) {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      } else {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
    
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (requiresAuth(pathname)) {
    const token = getTokenFromRequest(request);
    
    // No token - redirect to login
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Token exists but invalid or expired
    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Token valid but user is not admin
    if (!payload.roles || !payload.roles.includes('admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'insufficient_permissions');
      return NextResponse.redirect(url);
    }

    // All checks passed - allow access
    return NextResponse.next();
  }

  // Default: allow request to continue
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Define which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};