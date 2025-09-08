/**
 * Dashboard Layout - Main layout for dashboard routes
 * Provides LayoutProvider context only; pages decide their wrappers.
 */

'use client';

import React from 'react';
import { LayoutProvider } from '@/contexts/LayoutContext';

interface DashboardLayoutPageProps {
  children: React.ReactNode;
}

export default function DashboardLayoutPage({ children }: DashboardLayoutPageProps) {
  return (
    <LayoutProvider>
      {children}
    </LayoutProvider>
  );
}