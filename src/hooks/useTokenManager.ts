/**
 * useTokenManager Hook - Stable References for Token Operations
 * Prevents useEffect loops through stable function references and primitive returns
 */

import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { tokenManager, tokenUtils } from '@/lib/auth/tokenManager';
import { useAuthActions } from '@/store/authStore';

// Type for the required auth actions
interface RequiredAuthActions {
  logout: () => void;
  refreshToken: () => Promise<void>;
}
import { AUTH_CONFIG } from '@/types/auth';

/**
 * Token monitoring configuration
 */
interface TokenManagerConfig {
  // Enable automatic token expiry monitoring
  enableExpiryMonitoring?: boolean;
  // Check interval for token expiry (in milliseconds)
  checkInterval?: number;
  // Buffer time before token expiry to trigger refresh (in milliseconds)
  expiryBuffer?: number;
  // Enable automatic refresh attempts
  enableAutoRefresh?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<TokenManagerConfig> = {
  enableExpiryMonitoring: true,
  checkInterval: 60 * 1000, // Check every minute
  expiryBuffer: AUTH_CONFIG.TOKEN_EXPIRY_BUFFER,
  enableAutoRefresh: false, // Disabled until refresh endpoint is implemented
};

/**
 * Token status interface (primitive values only)
 */
interface TokenStatus {
  hasToken: boolean; // Primitive boolean
  isValid: boolean; // Primitive boolean
  expiresAt: number | null; // Primitive number or null
  timeUntilExpiry: number | null; // Primitive number or null
  isExpiringSoon: boolean; // Primitive boolean
  needsRefresh: boolean; // Primitive boolean
}

/**
 * Hook for managing token lifecycle with loop prevention
 */
export const useTokenManager = (config: TokenManagerConfig = {}) => {
  const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // Auth actions (stable from Zustand)
  const authActions = useAuthActions() as RequiredAuthActions;
  const { logout, refreshToken } = authActions;
  
  // Local state for token status (primitive values)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    hasToken: false,
    isValid: false,
    expiresAt: null,
    timeUntilExpiry: null,
    isExpiringSoon: false,
    needsRefresh: false,
  });
  
  // Stable references to prevent useEffect loops
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  
  /**
   * Check token status and return primitive values
   */
  const checkTokenStatus = useCallback((): TokenStatus => {
    try {
      const token = tokenManager.getAccessToken();
      
      if (!token) {
        return {
          hasToken: false,
          isValid: false,
          expiresAt: null,
          timeUntilExpiry: null,
          isExpiringSoon: false,
          needsRefresh: false,
        };
      }
      
      // Get token expiry information
      const expiresAt = tokenUtils.getTokenExpiry(token);
      const timeUntilExpiry = expiresAt ? expiresAt - Date.now() : null;
      const isValid = !tokenUtils.isTokenExpired(token);
      const isExpiringSoon = timeUntilExpiry !== null && timeUntilExpiry <= fullConfig.expiryBuffer;
      const needsRefresh = isExpiringSoon && fullConfig.enableAutoRefresh;
      
      return {
        hasToken: true,
        isValid,
        expiresAt,
        timeUntilExpiry,
        isExpiringSoon,
        needsRefresh,
      };
    } catch (error) {
      console.error('Token status check failed:', error);
      return {
        hasToken: false,
        isValid: false,
        expiresAt: null,
        timeUntilExpiry: null,
        isExpiringSoon: false,
        needsRefresh: false,
      };
    }
  }, [fullConfig.expiryBuffer, fullConfig.enableAutoRefresh]);
  
  /**
   * Update token status with loop prevention
   */
  const updateTokenStatus = useCallback(() => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return;
    }
    
    isCheckingRef.current = true;
    
    try {
      const newStatus = checkTokenStatus();
      
      // Only update state if status actually changed (prevent unnecessary re-renders)
      setTokenStatus(current => {
        const hasChanged = (
          current.hasToken !== newStatus.hasToken ||
          current.isValid !== newStatus.isValid ||
          current.expiresAt !== newStatus.expiresAt ||
          current.isExpiringSoon !== newStatus.isExpiringSoon ||
          current.needsRefresh !== newStatus.needsRefresh
        );
        
        return hasChanged ? newStatus : current;
      });
      
      lastCheckRef.current = Date.now();
    } catch (error) {
      console.error('Token status update failed:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [checkTokenStatus]);
  
  /**
   * Handle token refresh with error handling
   */
  const handleTokenRefresh = useCallback(async () => {
    try {
      await refreshToken();
      // Update status after refresh
      updateTokenStatus();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Logout if refresh fails
      logout();
      return false;
    }
  }, [refreshToken, updateTokenStatus, logout]);
  
  /**
   * Clear token and logout
   */
  const clearToken = useCallback(() => {
    tokenManager.clearAll();
    logout();
    updateTokenStatus();
  }, [logout, updateTokenStatus]);
  
  /**
   * Get current token (returns primitive string or null)
   */
  const getCurrentToken = useCallback((): string | null => {
    return tokenManager.getAccessToken();
  }, []);
  
  /**
   * Check if token is valid (primitive boolean)
   */
  const isTokenValid = useCallback((): boolean => {
    try {
      const token = getCurrentToken();
      return token !== null && !tokenUtils.isTokenExpired(token);
    } catch {
      return false;
    }
  }, [getCurrentToken]);
  
  /**
   * Get time until token expires (primitive number or null)
   */
  const getTimeUntilExpiry = useCallback((): number | null => {
    try {
      const token = getCurrentToken();
      if (!token) return null;
      
      return tokenUtils.getTimeUntilExpiry(token);
    } catch {
      return null;
    }
  }, [getCurrentToken]);
  
  /**
   * Initial token status check on mount
   * We want this to run only once when the component mounts, regardless of updateTokenStatus changes
   */
  useEffect(() => {
    updateTokenStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount
  
  /**
   * Periodic token status monitoring (with loop prevention)
   */
  useEffect(() => {
    if (!fullConfig.enableExpiryMonitoring) {
      return;
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Throttle checks to prevent excessive updates
      if (now - lastCheckRef.current >= fullConfig.checkInterval) {
        updateTokenStatus();
      }
    }, fullConfig.checkInterval);
    
    return () => clearInterval(interval);
  }, [
    fullConfig.enableExpiryMonitoring,
    fullConfig.checkInterval,
    updateTokenStatus,
  ]);
  
  /**
   * Auto-refresh token when needed (with loop prevention)
   */
  useEffect(() => {
    if (!tokenStatus.needsRefresh || !fullConfig.enableAutoRefresh) {
      return;
    }
    
    // Add small delay to prevent immediate refresh loops
    const refreshTimer = setTimeout(() => {
      handleTokenRefresh();
    }, 1000);
    
    return () => clearTimeout(refreshTimer);
  }, [
    tokenStatus.needsRefresh, // Primitive boolean
    fullConfig.enableAutoRefresh,
    handleTokenRefresh,
  ]);
  
  /**
   * Memoized return object with stable references
   */
  const tokenManagerState = useMemo(() => ({
    // Token status (all primitive values - safe for useEffect)
    hasToken: tokenStatus.hasToken,
    isValid: tokenStatus.isValid,
    expiresAt: tokenStatus.expiresAt,
    timeUntilExpiry: tokenStatus.timeUntilExpiry,
    isExpiringSoon: tokenStatus.isExpiringSoon,
    needsRefresh: tokenStatus.needsRefresh,
    
    // Computed primitive values
    isExpired: tokenStatus.hasToken && !tokenStatus.isValid,
    willExpireInMinutes: (minutes: number) => {
      if (!tokenStatus.timeUntilExpiry) return false;
      return tokenStatus.timeUntilExpiry <= (minutes * 60 * 1000);
    },
    
    // Actions (stable references)
    refresh: handleTokenRefresh,
    clear: clearToken,
    check: updateTokenStatus,
    
    // Getters (stable references)
    getToken: getCurrentToken,
    getExpiry: getTimeUntilExpiry,
    isTokenValid,
    
    // Status object (for spreading - primitive values only)
    status: {
      hasToken: tokenStatus.hasToken,
      isValid: tokenStatus.isValid,
      isExpired: tokenStatus.hasToken && !tokenStatus.isValid,
      isExpiringSoon: tokenStatus.isExpiringSoon,
      needsRefresh: tokenStatus.needsRefresh,
    },
  }), [
    tokenStatus,
    handleTokenRefresh,
    clearToken,
    updateTokenStatus,
    getCurrentToken,
    getTimeUntilExpiry,
    isTokenValid,
  ]);
  
  return tokenManagerState;
};

/**
 * Simplified hook for just token validation (primitive boolean only)
 */
export const useTokenValid = (): boolean => {
  const [isValid, setIsValid] = useState<boolean>(false);
  
  // Stable reference to prevent loops
  const checkValidityRef = useRef(() => {
    try {
      const token = tokenManager.getAccessToken();
      const valid = token !== null && !tokenUtils.isTokenExpired(token);
      setIsValid(current => current !== valid ? valid : current);
    } catch {
      setIsValid(current => current !== false ? false : current);
    }
  });
  
  useEffect(() => {
    // Initial check
    checkValidityRef.current();
    
    // Periodic check (less frequent than main token manager)
    const interval = setInterval(checkValidityRef.current, 2 * 60 * 1000); // Every 2 minutes
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array
  
  return isValid;
};

/**
 * Hook for token expiry countdown (returns primitive number or null)
 */
export const useTokenExpiry = (): number | null => {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  
  useEffect(() => {
    const updateExpiry = () => {
      try {
        const token = tokenManager.getAccessToken();
        if (!token) {
          setTimeUntilExpiry(null);
          return;
        }
        
        const expiry = tokenUtils.getTimeUntilExpiry(token);
        setTimeUntilExpiry(current => current !== expiry ? expiry : current);
      } catch {
        setTimeUntilExpiry(null);
      }
    };
    
    // Update immediately
    updateExpiry();
    
    // Update every 30 seconds for countdown
    const interval = setInterval(updateExpiry, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array
  
  return timeUntilExpiry;
};

/**
 * Hook that runs an effect only when token is valid (prevents loops)
 */
export const useTokenValidEffect = (
  effect: () => void | (() => void),
  deps: React.DependencyList = []
) => {
  const isTokenValid = useTokenValid();
  
  // Create a stable dependency array by combining fixed deps with dynamic ones
  const allDeps = useMemo(() => [isTokenValid, effect, ...deps], [isTokenValid, effect, deps]);
  
  useEffect(() => {
    if (isTokenValid) {
      return effect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, allDeps); // Using computed dependency array - spread is handled in useMemo
};

export default useTokenManager;