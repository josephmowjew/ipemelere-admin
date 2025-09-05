/**
 * Axios API Client - Loop-Safe Interceptors
 * Prevents infinite loops in token refresh and request retry patterns
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { tokenManager, tokenUtils } from '@/lib/auth/tokenManager';
import { AuthError, HttpStatusCode, AUTH_CONFIG } from '@/types/auth';

// Request retry tracking (stable reference to prevent loops)
interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _retryTimestamp?: number;
}

// Token refresh state (singleton to prevent concurrent refresh calls)
class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
  }> = [];

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * Handle token refresh with queue management to prevent concurrent calls
   */
  async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, return the existing promise
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      this.processQueue(null, newToken);
      return newToken;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Add request to queue during token refresh
   */
  addToQueue(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject });
    });
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Actual token refresh logic (would integrate with your auth store/API)
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      // This would typically call your refresh endpoint
      // For now, we'll check if we have a valid token in storage
      const currentToken = tokenManager.getAccessToken();
      
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      // In a real implementation, you'd call:
      // const response = await axios.post('/api/v1/auth/refresh', { token: currentToken });
      // return response.data.access_token;
      
      // For now, return current token if still valid
      if (!tokenUtils.isTokenExpired(currentToken)) {
        return currentToken;
      }

      // If expired, clear tokens and throw error
      tokenManager.clearAll();
      throw new Error('Token expired and refresh not implemented');
    } catch (error) {
      tokenManager.clearAll();
      return null;
    }
  }
}

// API Client class with loop-safe patterns
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private tokenRefreshManager: TokenRefreshManager;

  private constructor() {
    this.tokenRefreshManager = TokenRefreshManager.getInstance();
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Create axios instance with base configuration
   */
  private createAxiosInstance(): AxiosInstance {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
    
    return axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth errors and retry
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig;
        
        // Handle 401 Unauthorized
        if (error.response?.status === HttpStatusCode.UNAUTHORIZED) {
          return this.handleUnauthorizedError(error, config);
        }

        // Handle other retryable errors
        if (this.isRetryableError(error) && this.shouldRetry(config)) {
          return this.retryRequest(config);
        }

        return Promise.reject(this.createAuthError(error));
      }
    );
  }

  /**
   * Handle 401 unauthorized errors with token refresh
   */
  private async handleUnauthorizedError(error: AxiosError, config: RetryConfig): Promise<AxiosResponse> {
    // Prevent infinite retry loops
    if (config._retry) {
      tokenManager.clearAll();
      return Promise.reject(this.createAuthError(error));
    }

    config._retry = true;

    try {
      // Start or wait for token refresh
      const newToken = await this.tokenRefreshManager.handleTokenRefresh();

      if (!newToken) {
        tokenManager.clearAll();
        return Promise.reject(this.createAuthError(error));
      }

      // Update request with new token
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;

      // Retry original request
      return this.axiosInstance(config);
    } catch (refreshError) {
      tokenManager.clearAll();
      return Promise.reject(this.createAuthError(error));
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    const retryableStatusCodes = [
      HttpStatusCode.TOO_MANY_REQUESTS,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    ];

    return (
      !error.response ||
      retryableStatusCodes.includes(error.response.status as HttpStatusCode) ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  /**
   * Check if request should be retried (prevent infinite loops)
   */
  private shouldRetry(config: RetryConfig): boolean {
    if (!config) return false;

    const retryCount = config._retryCount || 0;
    const lastRetryTime = config._retryTimestamp || 0;
    const now = Date.now();

    // Prevent too many retries
    if (retryCount >= AUTH_CONFIG.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    // Prevent rapid retries (exponential backoff)
    const minInterval = AUTH_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
    if (now - lastRetryTime < minInterval) {
      return false;
    }

    return true;
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(config: RetryConfig): Promise<AxiosResponse> {
    const retryCount = (config._retryCount || 0) + 1;
    const delay = AUTH_CONFIG.RETRY_DELAY * Math.pow(2, retryCount - 1);

    // Update retry tracking
    config._retryCount = retryCount;
    config._retryTimestamp = Date.now();

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    return this.axiosInstance(config);
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(error: AxiosError): AuthError {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      return {
        code: data.code || error.response.status.toString(),
        message: data.message || error.message,
        field: data.field,
      };
    }

    return {
      code: error.response?.status?.toString() || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
  }

  /**
   * Get axios instance for use in API functions
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Update base URL (useful for environment changes)
   */
  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Clear all auth tokens and reset client
   */
  clearAuth(): void {
    tokenManager.clearAll();
    // Remove Authorization header from default headers
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

// Request/Response logging utilities (development only)
const setupLogging = (instance: AxiosInstance): void => {
  if (process.env.NODE_ENV === 'development') {
    instance.interceptors.request.use(
      (config) => {
        console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🔴 API Request Error:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => {
        console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`🔴 API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
        return Promise.reject(error);
      }
    );
  }
};

// Create and export singleton instance
const apiClient = ApiClient.getInstance();

// Setup development logging
if (process.env.NODE_ENV === 'development') {
  setupLogging(apiClient.getAxiosInstance());
}

// Export the axios instance for use in API functions
export const api = apiClient.getAxiosInstance();
export { apiClient };

// Utility function to check if user has valid authentication
export const hasValidAuth = (): boolean => {
  try {
    const token = tokenManager.getAccessToken();
    return token !== null && !tokenUtils.isTokenExpired(token);
  } catch {
    return false;
  }
};

// Utility to get current user ID from token (primitive for safe useEffect dependencies)
export const getCurrentUserId = (): number | null => {
  try {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    const payload = tokenUtils.parseTokenPayload(token);
    return payload?.sub ? parseInt(payload.sub) : null;
  } catch {
    return null;
  }
};

// Type exports
export type { AuthError, RetryConfig };