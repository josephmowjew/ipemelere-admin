/**
 * Auth Provider - Simple Context-based Authentication
 */

'use client';

import React from 'react';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
};

export default AuthProvider;