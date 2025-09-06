/**
 * Login Page - Authentication Route
 * Uses loop-safe authentication components
 */

'use client';

import React from 'react';
import LoginForm from '@/components/forms/LoginForm';

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-secondary-50"></div>
      
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section with enhanced styling */}
        <div className="text-center space-y-6">
          {/* Logo with gradient background */}
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM12 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          
          {/* Enhanced typography */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ganyu Ipemelere
            </h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Administrator Portal
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your admin dashboard
            </p>
          </div>
        </div>
        
        {/* Login form with enhanced card styling */}
        <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl shadow-primary/5 p-10 transform hover:scale-[1.01] transition-all duration-300">
          <LoginForm 
            redirectTo="/dashboard"
            className=""
          />
        </div>
        
        {/* Footer with branding */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Ganyu Technologies
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;