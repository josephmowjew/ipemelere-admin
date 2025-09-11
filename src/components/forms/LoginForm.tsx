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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
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
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
        {/* Email Field */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email Address
          </Label>
          <Input
            {...register('email', validationRules.email)}
            type="email"
            id="email"
            className={`h-12 text-base transition-all duration-200 ${
              errors.email 
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50'
            }`}
            placeholder="admin@ipemelere.mw"
            autoComplete="email"
            autoFocus
            onChange={handleEmailChange}
            disabled={formState.isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1" role="alert">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>
        
        {/* Password Field */}
        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </Label>
          <Input
            {...register('password', validationRules.password)}
            type="password"
            id="password"
            className={`h-12 text-base transition-all duration-200 ${
              errors.password 
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50'
            }`}
            placeholder="Enter your password"
            autoComplete="current-password"
            onChange={handlePasswordChange}
            disabled={formState.isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1" role="alert">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>
        
        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 text-primary focus:ring-primary focus:ring-2 focus:ring-primary/20 border-border rounded transition-all duration-200"
            disabled={formState.isSubmitting}
          />
          <Label htmlFor="rememberMe" className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200">
            Remember me for 30 days
          </Label>
        </div>
        
        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4" role="alert">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-destructive">Login Error</span>
            </div>
            <div className="text-sm text-destructive/80 space-y-1">
              {errorMessages.map((message, index) => (
                <p key={index}>• {message}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Rate Limit Warning */}
        {formState.showRateLimit && (
          <div className="rounded-lg bg-secondary/20 border border-secondary/30 p-4" role="alert">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-secondary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-secondary-foreground">
                Multiple failed attempts detected. Please wait before trying again.
              </span>
            </div>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={!formState.canSubmit}
          className="w-full h-12 text-base font-semibold transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-primary/25"
          size="lg"
        >
          {formState.isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Dashboard
            </span>
          )}
        </Button>
      </form>
      
      {/* Help Text */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Admin access only. Contact support if you need assistance.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure Login
          </span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
          <span>Protected Dashboard</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Memoized export to prevent unnecessary re-renders
 */
export default React.memo(LoginForm);