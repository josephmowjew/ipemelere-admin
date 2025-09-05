/**
 * LoginForm Component - Memoized Handlers to Prevent useEffect Loops
 * Secure login form with backend API integration
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData } from '@/types/auth';

/**
 * Form validation rules
 */
const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
  },
} as const;

/**
 * Login form props
 */
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
}

/**
 * Login form component with loop-safe patterns
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  className = '',
}) => {
  // Auth hook with primitive values
  const { login, isLoading, error, isAuthenticated } = useAuth();
  
  // Router for navigation
  const router = useRouter();
  
  // Form handling with react-hook-form (stable reference)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  
  // Local state for UI feedback (primitive values)
  const [submitAttempts, setSubmitAttempts] = useState<number>(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  
  // Stable references to prevent recreation
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Update refs when props change (without triggering re-renders)
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);
  
  /**
   * Form submission handler
   */
  const handleFormSubmit = useCallback(async (data: LoginFormData) => {
    const now = Date.now();
    
    // Prevent rapid successive submissions (rate limiting)
    if (now - lastSubmitTime < 1000) {
      return;
    }
    
    // Clear previous errors
    clearErrors();
    setLastSubmitTime(now);
    setSubmitAttempts(prev => prev + 1);
    
    try {
      await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      
      // Reset form on success
      reset();
      setSubmitAttempts(0);
      
      // Call success callback
      onSuccessRef.current?.();
      
      // Navigate to redirect target
      router.push(redirectTo);
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      
      // Set form-level error
      setError('root', { message: errorMessage });
      
      // Call error callback
      onErrorRef.current?.(errorMessage);
      
      console.error('Login error:', error);
    }
  }, [
    login,
    clearErrors,
    reset,
    router,
    redirectTo,
    setError,
    lastSubmitTime,
  ]);
  
  /**
   * Memoized input change handlers (prevent recreation)
   */
  const handleEmailChange = useCallback(() => {
    // Clear email-specific errors on change
    if (errors.email) {
      clearErrors('email');
    }
  }, [errors.email, clearErrors]);
  
  const handlePasswordChange = useCallback(() => {
    // Clear password-specific errors on change
    if (errors.password) {
      clearErrors('password');
    }
  }, [errors.password, clearErrors]);
  
  /**
   * Memoized form state
   */
  const formState = useMemo(() => ({
    isSubmitting: isSubmitting || isLoading,
    hasErrors: Object.keys(errors).length > 0 || !!error,
    canSubmit: !isSubmitting && !isLoading,
    showRateLimit: submitAttempts >= 3,
  }), [isSubmitting, isLoading, errors, error, submitAttempts]);
  
  /**
   * Memoized error messages
   */
  const errorMessages = useMemo(() => {
    const messages: string[] = [];
    
    // Form validation errors
    if (errors.email?.message) messages.push(errors.email.message);
    if (errors.password?.message) messages.push(errors.password.message);
    if (errors.root?.message) messages.push(errors.root.message);
    
    // Auth error from store
    if (error && !errors.root) messages.push(error);
    
    return messages;
  }, [errors, error]);
  
  // Don't render form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">You are already logged in. Redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            {...register('email', validationRules.email)}
            type="email"
            id="email"
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="admin@ipemelere.mw"
            autoComplete="email"
            autoFocus
            onChange={handleEmailChange}
            disabled={formState.isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password', validationRules.password)}
            type="password"
            id="password"
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.password ? 'border-red-500' : ''
            }`}
            placeholder="Enter your password"
            autoComplete="current-password"
            onChange={handlePasswordChange}
            disabled={formState.isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={formState.isSubmitting}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="rounded-md bg-red-50 p-4" role="alert">
            <div className="text-sm text-red-700">
              {errorMessages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Rate Limit Warning */}
        {formState.showRateLimit && (
          <div className="rounded-md bg-yellow-50 p-4" role="alert">
            <div className="text-sm text-yellow-700">
              Multiple failed attempts detected. Please wait before trying again.
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!formState.canSubmit}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            formState.canSubmit
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {formState.isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Admin access only. Contact support if you need assistance.
        </p>
      </div>
    </div>
  );
};

/**
 * Memoized export to prevent unnecessary re-renders
 */
export default React.memo(LoginForm);