/**
 * Zustand Auth Store - Loop-Safe with Primitive Selectors
 * Prevents useEffect infinite loops through careful state design
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { authAPI, authUtils } from '@/lib/api/auth';
import { tokenManager } from '@/lib/auth/tokenManager';
import { 
  AuthState, 
  AuthActions, 
  AuthStore, 
  LoginRequest, 
  ProfileUpdateRequest, 
  User,
  AuthError 
} from '@/types/auth';

/**
 * Initial auth state with primitive values to prevent useEffect loops
 */
const initialAuthState: AuthState = {
  // Primitive booleans - safe for useEffect dependencies
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  
  // User data - can be null
  user: null,
  
  // Primitive user identifiers - safe for useEffect dependencies
  userId: null,
  userRole: null,
  userStatus: null,
  
  // Error state
  error: null,
  
  // Last check timestamp - primitive number
  lastCheck: null,
};

/**
 * Auth store implementation with loop prevention patterns
 */
const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialAuthState,

        /**
         * Login action with error handling
         */
        login: async (credentials: LoginRequest) => {
          const state = get();
          
          // Prevent multiple concurrent login attempts
          if (state.isLoading) {
            return;
          }

          // Set loading state
          set({ 
            isLoading: true, 
            error: null,
            lastCheck: Date.now() 
          });

          try {
            const loginResponse = await authAPI.login(credentials);
            const user = loginResponse.user;

            // Update state with user data and primitive identifiers
            set({
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              user: user,
              // Extract primitive values for safe useEffect dependencies
              userId: user.id,
              userRole: user.role,
              userStatus: user.status,
              error: null,
              lastCheck: Date.now(),
            });
          } catch (error) {
            const authError = error as AuthError;
            
            // Clear auth state on login failure
            set({
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              user: null,
              userId: null,
              userRole: null,
              userStatus: null,
              error: authUtils.formatErrorMessage(authError),
              lastCheck: Date.now(),
            });

            throw authError;
          }
        },

        /**
         * Logout action with cleanup
         */
        logout: () => {
          try {
            // Clear API tokens and cached data
            authAPI.logout();
            
            // Reset store to initial state
            set({
              ...initialAuthState,
              isInitialized: true, // Keep initialized as true after logout
              lastCheck: Date.now(),
            });
          } catch (error) {
            // Even if API logout fails, clear local state
            set({
              ...initialAuthState,
              isInitialized: true,
              error: 'Logout completed with warnings',
              lastCheck: Date.now(),
            });
          }
        },

        /**
         * Update profile with optimistic updates
         */
        updateProfile: async (profileData: ProfileUpdateRequest) => {
          const state = get();
          
          if (!state.user || state.isLoading) {
            throw new Error('No authenticated user or update in progress');
          }

          set({ isLoading: true, error: null });

          try {
            const response = await authAPI.updateProfile(profileData);
            
            if (response.success && response.user) {
              // Update user data and primitive identifiers
              set({
                user: response.user,
                userId: response.user.id,
                userRole: response.user.role,
                userStatus: response.user.status,
                isLoading: false,
                error: null,
                lastCheck: Date.now(),
              });
            } else {
              throw new Error(response.message || 'Profile update failed');
            }
          } catch (error) {
            const authError = error as AuthError;
            set({
              isLoading: false,
              error: authUtils.formatErrorMessage(authError),
              lastCheck: Date.now(),
            });
            throw authError;
          }
        },

        /**
         * Set user data directly (used by auth checks)
         */
        setUser: (user: User | null) => {
          set({
            user,
            userId: user?.id || null,
            userRole: user?.role || null,
            userStatus: user?.status || null,
            isAuthenticated: user !== null,
            lastCheck: Date.now(),
          });
        },

        /**
         * Set loading state
         */
        setLoading: (loading: boolean) => {
          set({ 
            isLoading: loading,
            lastCheck: Date.now() 
          });
        },

        /**
         * Set error state
         */
        setError: (error: string | null) => {
          set({ 
            error,
            lastCheck: Date.now() 
          });
        },

        /**
         * Set initialized state
         */
        setInitialized: (initialized: boolean) => {
          set({ 
            isInitialized: initialized,
            lastCheck: Date.now() 
          });
        },

        /**
         * Refresh token (placeholder for future implementation)
         */
        refreshToken: async () => {
          try {
            const newToken = await authAPI.refreshToken();
            if (!newToken) {
              // If refresh fails, logout
              get().logout();
            }
            set({ lastCheck: Date.now() });
          } catch (error) {
            get().logout();
            throw error;
          }
        },

        /**
         * Check authentication status against server
         */
        checkAuthStatus: async () => {
          const state = get();
          
          // Prevent concurrent auth checks
          if (state.isLoading) {
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const authResult = await authAPI.validateAuth();
            
            if (authResult.isValid && authResult.user) {
              // Update with fresh user data
              set({
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                user: authResult.user,
                userId: authResult.user.id,
                userRole: authResult.user.role,
                userStatus: authResult.user.status,
                error: null,
                lastCheck: Date.now(),
              });
            } else {
              // Clear auth state if validation failed
              set({
                ...initialAuthState,
                isInitialized: true,
                lastCheck: Date.now(),
              });
            }
          } catch (error) {
            // Clear auth state on error
            set({
              ...initialAuthState,
              isInitialized: true,
              error: 'Authentication check failed',
              lastCheck: Date.now(),
            });
          }
        },
      }),
      {
        name: 'auth-store',
        storage: createJSONStorage(() => localStorage),
        // Only persist essential primitive data to prevent hydration issues
        partialize: (state) => ({
          isInitialized: state.isInitialized,
          userId: state.userId,
          userRole: state.userRole,
          userStatus: state.userStatus,
          lastCheck: state.lastCheck,
        }),
      }
    )
  )
);

/**
 * Primitive selectors to prevent useEffect loops
 * These return only primitive values, ensuring stable references
 */
export const authSelectors = {
  // Authentication state selectors (primitives only)
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  isInitialized: (state: AuthStore) => state.isInitialized,
  
  // User identification selectors (primitives only)
  userId: (state: AuthStore) => state.userId,
  userRole: (state: AuthStore) => state.userRole,
  userStatus: (state: AuthStore) => state.userStatus,
  
  // Error state selector
  error: (state: AuthStore) => state.error,
  
  // Timestamp selector (primitive)
  lastCheck: (state: AuthStore) => state.lastCheck,
  
  // Computed primitive selectors
  isAdmin: (state: AuthStore) => state.userRole === 'admin' && state.userStatus === 'active',
  isActiveUser: (state: AuthStore) => state.userStatus === 'active',
  hasError: (state: AuthStore) => state.error !== null,
  
  // Full user object selector (use sparingly to avoid loops)
  user: (state: AuthStore) => state.user,
};

/**
 * Hook selectors for components (memoized to prevent unnecessary re-renders)
 */
export const useAuthSelectors = {
  // Authentication status hooks (return primitives)
  isAuthenticated: () => useAuthStore(authSelectors.isAuthenticated),
  isLoading: () => useAuthStore(authSelectors.isLoading),
  isInitialized: () => useAuthStore(authSelectors.isInitialized),
  
  // User identification hooks (primitives)
  userId: () => useAuthStore(authSelectors.userId),
  userRole: () => useAuthStore(authSelectors.userRole),
  userStatus: () => useAuthStore(authSelectors.userStatus),
  
  // Error hook
  error: () => useAuthStore(authSelectors.error),
  
  // Computed status hooks (primitives)
  isAdmin: () => useAuthStore(authSelectors.isAdmin),
  isActiveUser: () => useAuthStore(authSelectors.isActiveUser),
  hasError: () => useAuthStore(authSelectors.hasError),
  
  // Full user object hook (use with caution in useEffect)
  user: () => useAuthStore(authSelectors.user),
};

/**
 * Action hooks for components with stable reference using shallow equality
 */
export const useAuthActions = () => useAuthStore(
  (state) => ({
    login: state.login,
    logout: state.logout,
    updateProfile: state.updateProfile,
    setUser: state.setUser,
    setLoading: state.setLoading,
    setError: state.setError,
    setInitialized: state.setInitialized,
    refreshToken: state.refreshToken,
    checkAuthStatus: state.checkAuthStatus,
  }),
  shallow
);

/**
 * Initialize auth store on app start
 * This function should be called once during app initialization
 */
export const initializeAuth = async (): Promise<void> => {
  const store = useAuthStore.getState();
  
  try {
    // Check if we have valid local authentication
    const hasValidToken = authAPI.isAuthenticated();
    
    if (hasValidToken) {
      // Validate against server
      await store.checkAuthStatus();
    } else {
      // No valid token, mark as initialized but not authenticated
      store.setInitialized(true);
    }
  } catch (error) {
    // Clear auth state and mark as initialized
    store.logout();
    store.setInitialized(true);
  }
};

/**
 * Cached snapshot to prevent infinite loops
 */
let cachedSnapshot: any = null;
let lastSnapshotTime = 0;

/**
 * Utility function to get current auth state snapshot
 * Returns primitive values only for safe use in effects
 * Cached to prevent infinite loops
 */
export const getAuthSnapshot = () => {
  const state = useAuthStore.getState();
  const currentTime = state.lastCheck || 0;
  
  // Only create new snapshot if state actually changed
  if (!cachedSnapshot || currentTime > lastSnapshotTime) {
    cachedSnapshot = {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      userId: state.userId,
      userRole: state.userRole,
      userStatus: state.userStatus,
      error: state.error,
      lastCheck: state.lastCheck,
      isAdmin: state.userRole === 'admin' && state.userStatus === 'active',
    };
    lastSnapshotTime = currentTime;
  }
  
  return cachedSnapshot;
};

export default useAuthStore;