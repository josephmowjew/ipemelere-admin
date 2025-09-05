/**
 * Simple Auth Hook - Main authentication interface
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAuth as useAuthContext, useAuthState, useAuthActions } from '@/contexts/AuthContext';

/**
 * Main authentication hook
 */
export const useAuth = () => {
  const { state } = useAuthContext();
  const actions = useAuthActions();
  
  // Track initialization to prevent multiple auth checks
  const initializationRef = useRef(false);
  
  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    if (!initializationRef.current && !state.isInitialized && !state.isLoading) {
      initializationRef.current = true;
      actions.checkAuth().catch(() => {
        // Ignore errors - they're handled in the context
      });
    }
  }, [state.isInitialized, state.isLoading, actions]);
  
  // Derived values
  const isAuthenticated = !!state.user;
  const isAdmin = state.user?.role === 'admin' && state.user?.status === 'active';
  const isActiveUser = state.user?.status === 'active';
  
  return {
    // State
    user: state.user,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    isAuthenticated,
    isAdmin,
    isActiveUser,
    
    // Actions
    login: actions.login,
    logout: actions.logout,
    updateProfile: actions.updateProfile,
    checkAuth: actions.checkAuth,
  };
};

/**
 * Hook for route guards and authentication-dependent components
 */
export const useAuthStatus = () => {
  const state = useAuthState();
  const isAuthenticated = !!state.user;
  const isAdmin = state.user?.role === 'admin' && state.user?.status === 'active';
  
  return {
    isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isAdmin,
  };
};

/**
 * Hook for user information display
 */
export const useUserInfo = () => {
  const state = useAuthState();
  const isAdmin = state.user?.role === 'admin' && state.user?.status === 'active';
  const isActiveUser = state.user?.status === 'active';
  
  return {
    user: state.user,
    userId: state.user?.id || null,
    userRole: state.user?.role || null,
    userStatus: state.user?.status || null,
    isAdmin,
    isActiveUser,
  };
};

/**
 * Hook for error handling
 */
export const useAuthError = () => {
  const state = useAuthState();
  
  return {
    error: state.error,
    hasError: !!state.error,
  };
};

/**
 * Hook for user ID only
 */
export const useUserId = () => {
  const state = useAuthState();
  return state.user?.id || null;
};

/**
 * Hook for user role only
 */
export const useUserRole = () => {
  const state = useAuthState();
  return state.user?.role || null;
};

/**
 * Hook for admin status only
 */
export const useIsAdmin = () => {
  const state = useAuthState();
  return state.user?.role === 'admin' && state.user?.status === 'active';
};

/**
 * Hook for getting user object
 */
export const useUser = () => {
  const state = useAuthState();
  return state.user;
};

export default useAuth;