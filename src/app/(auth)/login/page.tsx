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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM12 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Administrator Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the Ganyu Ipemelere admin dashboard
          </p>
        </div>
        
        <LoginForm 
          redirectTo="/dashboard"
          className="mt-8"
        />
      </div>
    </div>
  );
};

export default LoginPage;