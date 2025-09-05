/**
 * Token Manager - HttpOnly Cookie Support with Loop Prevention
 * Handles JWT token storage and retrieval safely
 */

import { TokenData, AUTH_COOKIES, AUTH_CONFIG } from '@/types/auth';

// Client-side cookie utilities (fallback for when httpOnly cookies aren't available)
class ClientTokenManager {
  private static instance: ClientTokenManager;
  
  // Use a stable reference to prevent useEffect loops
  private readonly cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };

  private constructor() {}

  static getInstance(): ClientTokenManager {
    if (!ClientTokenManager.instance) {
      ClientTokenManager.instance = new ClientTokenManager();
    }
    return ClientTokenManager.instance;
  }

  /**
   * Set cookie with secure options
   * Uses document.cookie for client-side fallback
   */
  private setCookie(name: string, value: string, expiresIn?: number): void {
    let cookieString = `${name}=${value}; path=${this.cookieOptions.path}; SameSite=${this.cookieOptions.sameSite}`;
    
    if (this.cookieOptions.secure) {
      cookieString += '; Secure';
    }
    
    if (expiresIn) {
      const expiresDate = new Date(Date.now() + expiresIn * 1000);
      cookieString += `; Expires=${expiresDate.toUTCString()}`;
    }
    
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
    }
  }

  /**
   * Get cookie value
   * Returns null if not found (primitive for safe useEffect dependencies)
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    
    return null;
  }

  /**
   * Delete cookie
   */
  private deleteCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${this.cookieOptions.path}`;
    }
  }

  /**
   * Store access token
   * Returns primitive boolean for safe useEffect dependencies
   */
  setAccessToken(token: string, expiresIn: number): boolean {
    try {
      const tokenData: TokenData = {
        token,
        expiresAt: Date.now() + (expiresIn * 1000),
        issuedAt: Date.now(),
      };

      // Store in cookie
      this.setCookie(AUTH_COOKIES.ACCESS_TOKEN, JSON.stringify(tokenData), expiresIn);
      
      // Also store in memory for quick access (with stable reference)
      this.memoryTokenCache = tokenData;
      
      return true;
    } catch (error) {
      console.error('Failed to set access token:', error);
      return false;
    }
  }

  /**
   * Get access token
   * Returns null (primitive) for safe useEffect dependencies
   */
  getAccessToken(): string | null {
    try {
      // Check memory cache first (faster)
      if (this.memoryTokenCache && this.isTokenValid(this.memoryTokenCache)) {
        return this.memoryTokenCache.token;
      }

      // Fall back to cookie
      const cookieValue = this.getCookie(AUTH_COOKIES.ACCESS_TOKEN);
      if (!cookieValue) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(cookieValue);
      
      // Validate token
      if (!this.isTokenValid(tokenData)) {
        this.clearAccessToken();
        return null;
      }

      // Update memory cache
      this.memoryTokenCache = tokenData;
      return tokenData.token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      this.clearAccessToken();
      return null;
    }
  }

  /**
   * Check if token is valid
   * Returns primitive boolean for safe useEffect dependencies
   */
  isTokenValid(tokenData: TokenData): boolean {
    if (!tokenData || !tokenData.token || !tokenData.expiresAt) {
      return false;
    }

    // Check if token is expired (with buffer)
    const now = Date.now();
    const expiresAt = tokenData.expiresAt - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER;
    
    return now < expiresAt;
  }

  /**
   * Check if current stored token is valid
   * Returns primitive boolean for safe useEffect dependencies
   */
  hasValidToken(): boolean {
    try {
      const token = this.getAccessToken();
      return token !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get token expiry time
   * Returns primitive number or null for safe useEffect dependencies
   */
  getTokenExpiry(): number | null {
    try {
      const cookieValue = this.getCookie(AUTH_COOKIES.ACCESS_TOKEN);
      if (!cookieValue) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(cookieValue);
      return tokenData.expiresAt;
    } catch {
      return null;
    }
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.deleteCookie(AUTH_COOKIES.ACCESS_TOKEN);
    this.memoryTokenCache = null;
  }

  /**
   * Store user data (for quick access without API calls)
   */
  setUserData(userData: any): boolean {
    try {
      this.setCookie(AUTH_COOKIES.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to set user data:', error);
      return false;
    }
  }

  /**
   * Get user data
   * Returns parsed user data or null (primitive)
   */
  getUserData(): any | null {
    try {
      const cookieValue = this.getCookie(AUTH_COOKIES.USER_DATA);
      if (!cookieValue) {
        return null;
      }
      return JSON.parse(cookieValue);
    } catch {
      return null;
    }
  }

  /**
   * Clear user data
   */
  clearUserData(): void {
    this.deleteCookie(AUTH_COOKIES.USER_DATA);
  }

  /**
   * Clear all auth data
   */
  clearAll(): void {
    this.clearAccessToken();
    this.clearUserData();
    this.memoryTokenCache = null;
  }

  // Memory cache for performance (with stable reference to prevent loops)
  private memoryTokenCache: TokenData | null = null;
}

// Server-side token manager (for API routes and server components)
class ServerTokenManager {
  /**
   * Set HttpOnly cookie on server
   * This would be used in API routes or server actions
   */
  static setHttpOnlyToken(token: string, expiresIn: number): string {
    const maxAge = expiresIn;
    const secure = process.env.NODE_ENV === 'production';
    
    return `${AUTH_COOKIES.ACCESS_TOKEN}=${token}; HttpOnly; Secure=${secure}; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
  }

  /**
   * Clear HttpOnly cookie
   */
  static clearHttpOnlyToken(): string {
    return `${AUTH_COOKIES.ACCESS_TOKEN}=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0`;
  }
}

// Token validation utilities (pure functions to prevent useEffect loops)
export const tokenUtils = {
  /**
   * Parse JWT token payload (client-side only)
   * Returns null if invalid (primitive for safe dependencies)
   */
  parseTokenPayload: (token: string): any | null => {
    try {
      if (typeof window === 'undefined') {
        return null; // Don't parse on server
      }
      
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /**
   * Check if token is expired
   * Returns primitive boolean
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = tokenUtils.parseTokenPayload(token);
      if (!payload || !payload.exp) {
        return true;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiry = payload.exp - (AUTH_CONFIG.TOKEN_EXPIRY_BUFFER / 1000);
      
      return now >= expiry;
    } catch {
      return true;
    }
  },

  /**
   * Get token expiry timestamp
   * Returns primitive number or null
   */
  getTokenExpiry: (token: string): number | null => {
    try {
      const payload = tokenUtils.parseTokenPayload(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  },

  /**
   * Get time until token expires (in milliseconds)
   * Returns primitive number or null
   */
  getTimeUntilExpiry: (token: string): number | null => {
    try {
      const expiry = tokenUtils.getTokenExpiry(token);
      if (!expiry) {
        return null;
      }
      
      const timeUntilExpiry = expiry - Date.now();
      return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
    } catch {
      return null;
    }
  },
};

// Export singleton instance to prevent recreating objects in useEffect
export const tokenManager = ClientTokenManager.getInstance();
export { ServerTokenManager };

// Export types
export type { TokenData };