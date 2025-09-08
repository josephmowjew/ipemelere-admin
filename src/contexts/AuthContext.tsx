'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { authAPI } from '@/lib/api/auth';
import { User, LoginRequest, ProfileUpdateRequest, AuthError } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_AUTH' };

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'CLEAR_AUTH':
      return { ...initialState, isInitialized: true };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await authAPI.login(credentials);
      
      // Set user and mark as initialized
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Login failed' });
      throw authError;
    }
  }, []);

  const logout = useCallback(() => {
    try {
      authAPI.logout();
    } finally {
      dispatch({ type: 'CLEAR_AUTH' });
    }
  }, []);

  const updateProfile = useCallback(async (profileData: ProfileUpdateRequest) => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
      }
    } catch (error) {
      const authError = error as AuthError;
      dispatch({ type: 'SET_ERROR', payload: authError.message || 'Update failed' });
      throw authError;
    }
  }, [state.user]);

  const checkAuth = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const hasToken = authAPI.isAuthenticated();
      if (hasToken) {
        const authResult = await authAPI.validateAuth();
        if (authResult.isValid && authResult.user) {
          dispatch({ type: 'SET_USER', payload: authResult.user });
        } else {
          dispatch({ type: 'CLEAR_AUTH' });
        }
      } else {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'CLEAR_AUTH' });
    }
  }, []);

  const value: AuthContextType = {
    state,
    login,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const { state } = useAuth();
  return state;
}

export function useAuthActions() {
  const { login, logout, updateProfile, checkAuth } = useAuth();
  return { login, logout, updateProfile, checkAuth };
}