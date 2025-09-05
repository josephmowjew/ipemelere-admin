/**
 * Authentication Types - Backend API Compatible
 * Based on Ipemelere API Documentation
 */

// User roles as defined in backend
export type UserRole = 'passenger' | 'driver' | 'admin';

// User status as defined in backend
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';

// Registration status
export type RegistrationStatus = 'in_progress' | 'completed' | 'pending';

// Verification statuses
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Base User interface matching backend user structure
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  district?: string;
  city?: string;
  address?: string;
  nationalId?: string;
  registrationStatus: RegistrationStatus;
  emailVerificationStatus: VerificationStatus;
  phoneVerificationStatus: VerificationStatus;
  documentVerificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

// Emergency contact structure
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Extended user with emergency contact
export interface UserWithEmergencyContact extends User {
  emergencyContact: EmergencyContact;
}

// Login request structure
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response structure matching backend
export interface LoginResponse {
  access_token: string;
  user: User;
  expiresIn: number;
}

// Profile update request
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  district?: string;
  city?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

// Profile update response
export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user: User;
}

// Auth state for client-side state management (primitive values for useEffect safety)
export interface AuthState {
  // Primitive values to prevent useEffect loops
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // User data (can be null)
  user: User | null;
  
  // Primitive user identifiers for safe useEffect dependencies
  userId: number | null;
  userRole: UserRole | null;
  userStatus: UserStatus | null;
  
  // Error state
  error: string | null;
  
  // Last authentication check timestamp (primitive)
  lastCheck: number | null;
}

// Auth actions for store
export interface AuthActions {
  // Authentication actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  
  // Profile management
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  
  // State management
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Token management
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Combined auth store type
export interface AuthStore extends AuthState, AuthActions {}

// Token data structure
export interface TokenData {
  token: string;
  expiresAt: number;
  issuedAt: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Route guard types
export interface RouteGuardOptions {
  requiredRole?: UserRole;
  requiredStatus?: UserStatus;
  redirectTo?: string;
  requireAuth?: boolean;
}

// HTTP status codes for error handling
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    HEALTH: '/user/health',
  },
} as const;

// Auth cookies configuration
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
} as const;

// Auth configuration constants
export const AUTH_CONFIG = {
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes buffer before expiry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  AUTO_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
} as const;

// Type guards for safer type checking (prevents useEffect loops)
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string';
};

export const isAuthenticatedUser = (user: User | null): user is User => {
  return user !== null && user.status === 'active';
};

export const isAdminUser = (user: User | null): boolean => {
  return user !== null && user.role === 'admin' && user.status === 'active';
};

// Utility types for form validation
export type LoginValidationErrors = Partial<Record<keyof LoginFormData, string>>;
export type ProfileValidationErrors = Partial<Record<keyof ProfileUpdateRequest, string>>;