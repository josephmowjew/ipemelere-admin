/**
 * Authentication API Functions - Backend Compatible
 * Based on Ipemelere API Documentation
 */

import { api } from './client';
import { tokenManager } from '@/lib/auth/tokenManager';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  UserWithEmergencyContact,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  AuthError,
  UserRole,
  UserStatus,
  RegistrationStatus,
  VerificationStatus,
  API_ENDPOINTS 
} from '@/types/auth';

// Helper function to convert user objects to storage format
const convertToUserDataStorage = (user: User | UserWithEmergencyContact): { id: number; email: string; firstName?: string; lastName?: string; role?: string } => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
};

// Backend user response interface (what the API actually returns)
interface BackendUserResponse {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  role: string;
}

/**
 * Authentication API class with loop-safe methods
 */
class AuthAPI {
  private static instance: AuthAPI;

  private constructor() {}

  static getInstance(): AuthAPI {
    if (!AuthAPI.instance) {
      AuthAPI.instance = new AuthAPI();
    }
    return AuthAPI.instance;
  }

  /**
   * Login user with email and password
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Backend actually returns { token, user } format
      const response = await api.post<{ token: string; user: BackendUserResponse }>(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      const backendData = response.data;

      // Validate response structure (backend format)
      if (!backendData.token || !backendData.user) {
        throw new Error('Invalid login response format');
      }

      // Transform backend user to match our User type
      const user: User = {
        id: backendData.user.id,
        firstName: backendData.user.name?.split(' ')[0] || '',
        lastName: backendData.user.name?.split(' ').slice(1).join(' ') || '',
        email: backendData.user.email,
        phoneNumber: backendData.user.phone || '',
        role: backendData.user.role as UserRole,
        status: 'active' as UserStatus, // Assume active if logged in
        district: '',
        city: '',
        address: '',
        nationalId: '',
        registrationStatus: 'completed' as RegistrationStatus,
        emailVerificationStatus: 'verified' as VerificationStatus,
        phoneVerificationStatus: 'verified' as VerificationStatus,
        documentVerificationStatus: 'verified' as VerificationStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create standardized login response
      const loginData: LoginResponse = {
        access_token: backendData.token,
        user: user,
        expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds (default)
      };

      // Store token in secure storage
      const tokenStored = tokenManager.setAccessToken(
        loginData.access_token, 
        loginData.expiresIn
      );

      if (!tokenStored) {
        throw new Error('Failed to store authentication token');
      }

      // Store user data for quick access (convert to storage format)
      tokenManager.setUserData(convertToUserDataStorage(loginData.user));

      return loginData;
    } catch (error) {
      // Clear any partial auth data on login failure
      tokenManager.clearAll();
      throw this.handleApiError(error);
    }
  }

  /**
   * Logout user and clear all auth data
   * Note: Backend doesn't have explicit logout endpoint in the documentation
   */
  async logout(): Promise<void> {
    try {
      // Clear local storage first
      tokenManager.clearAll();

      // If backend had logout endpoint, we'd call it here:
      // await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      return Promise.resolve();
    } catch (error) {
      // Always clear local storage even if API call fails
      tokenManager.clearAll();
      throw this.handleApiError(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/user/profile
   */
  async getProfile(): Promise<UserWithEmergencyContact> {
    try {
      const response = await api.get<UserWithEmergencyContact>(API_ENDPOINTS.USER.PROFILE);
      
      // Update cached user data
      tokenManager.setUserData(convertToUserDataStorage(response.data));
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/user/profile
   */
  async updateProfile(profileData: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.put<ProfileUpdateResponse>(
        API_ENDPOINTS.USER.PROFILE, 
        profileData
      );

      // Update cached user data with new information
      if (response.data.success && response.data.user) {
        tokenManager.setUserData(convertToUserDataStorage(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Check API health status
   * GET /api/v1/user/health
   */
  async checkHealth(): Promise<{ status: string; module: string }> {
    try {
      const response = await api.get(API_ENDPOINTS.USER.HEALTH);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Validate current authentication status
   * This combines token validation with optional server verification
   */
  async validateAuth(): Promise<{ isValid: boolean; user: User | null }> {
    try {
      // First check local token validity
      const hasValidToken = tokenManager.hasValidToken();
      
      if (!hasValidToken) {
        return { isValid: false, user: null };
      }

      // Note: We don't rely on cached user data for admin validation
      // Always verify with server to ensure current permissions
      
      // For admin dashboard, we should verify with server
      // This prevents using stale tokens after role changes
      try {
        const currentUser = await this.getProfile();
        
        // Verify user is still admin and active
        if (currentUser.role !== 'admin' || currentUser.status !== 'active') {
          tokenManager.clearAll();
          return { isValid: false, user: null };
        }

        return { isValid: true, user: currentUser };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_serverError) {
        // If server call fails, we can't guarantee user data is current
        // Clear token and require re-authentication
        tokenManager.clearAll();
        return { isValid: false, user: null };
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return { isValid: false, user: null };
    }
  }

  /**
   * Refresh authentication token
   * Note: Backend documentation shows no refresh endpoint, so this is a placeholder
   */
  async refreshToken(): Promise<string | null> {
    try {
      // Backend doesn't have refresh token endpoint in documentation
      // This would be implemented if refresh tokens were supported:
      // const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
      
      // For now, validate current token
      const currentToken = tokenManager.getAccessToken();
      if (currentToken) {
        return currentToken;
      }
      
      return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      tokenManager.clearAll();
      return null;
    }
  }

  // Note: getCachedUser removed - don't rely on incomplete cached data
  // Always use getProfile() or validateAuth() for complete user information

  /**
   * Get cached user ID (primitive for safe useEffect dependencies)
   */
  getCachedUserId(): number | null {
    try {
      const userData = tokenManager.getUserData();
      return userData?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has admin role (primitive boolean for safe dependencies)
   */
  isAdmin(): boolean {
    try {
      const userData = tokenManager.getUserData();
      return userData?.role === 'admin';
      // Note: We can't check status from cached data as it's not stored
      // For full validation, use validateAuth() instead
    } catch {
      return false;
    }
  }

  /**
   * Check authentication status without API call (primitive boolean)
   */
  isAuthenticated(): boolean {
    try {
      return tokenManager.hasValidToken();
    } catch {
      return false;
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: unknown): AuthError {
    // If it's already an AuthError from the interceptor, return as is
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return error as AuthError;
    }

    // Handle Axios errors
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as { status: number; data?: { message?: string; field?: string } };
      const status = response.status;
      const data = response.data;

      // Handle specific status codes
      switch (status) {
        case 400:
          return {
            code: 'VALIDATION_ERROR',
            message: data?.message || 'Invalid request data',
            field: data?.field,
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: data?.message || 'Invalid credentials',
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: data?.message || 'Access denied',
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message: data?.message || 'Resource not found',
          };
        case 409:
          return {
            code: 'CONFLICT',
            message: data?.message || 'Account already exists',
          };
        case 429:
          return {
            code: 'RATE_LIMIT',
            message: data?.message || 'Too many requests',
          };
        default:
          return {
            code: 'SERVER_ERROR',
            message: data?.message || 'Server error occurred',
          };
      }
    }

    // Handle network errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'NETWORK_ERROR') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
      };
    }

    // Generic error fallback
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'An unexpected error occurred';
    
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
    };
  }
}

// Export singleton instance to prevent object recreation in useEffect
export const authAPI = AuthAPI.getInstance();

// Utility functions for common auth checks (pure functions to prevent loops)
export const authUtils = {
  /**
   * Check if error is authentication-related (primitive boolean)
   */
  isAuthError: (error: AuthError): boolean => {
    const authErrorCodes = ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_TOKEN'];
    return authErrorCodes.includes(error.code);
  },

  /**
   * Check if error requires re-authentication (primitive boolean)
   */
  requiresReauth: (error: AuthError): boolean => {
    return error.code === 'UNAUTHORIZED' || error.code === 'INVALID_TOKEN';
  },

  /**
   * Format error message for user display
   */
  formatErrorMessage: (error: AuthError): string => {
    const errorMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again.',
      UNAUTHORIZED: 'Invalid email or password.',
      FORBIDDEN: 'You do not have permission to access this resource.',
      NOT_FOUND: 'The requested resource was not found.',
      CONFLICT: 'An account with this email already exists.',
      RATE_LIMIT: 'Too many attempts. Please try again later.',
      NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
      SERVER_ERROR: 'A server error occurred. Please try again later.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    };

    return errorMessages[error.code] || error.message || 'An error occurred.';
  },

  /**
   * Extract field-specific validation errors
   */
  getFieldErrors: (error: AuthError): Record<string, string> => {
    if (error.field) {
      return { [error.field]: error.message };
    }
    return {};
  },
};

// Type exports
export type { LoginRequest, LoginResponse, ProfileUpdateRequest, ProfileUpdateResponse };