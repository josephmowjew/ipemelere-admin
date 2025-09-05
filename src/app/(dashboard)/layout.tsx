/**
 * Dashboard Layout - Protected Route Layout
 * Wraps all dashboard routes with authentication
 */

'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout wrapper with authentication protection
 */
const DashboardLayoutWrapper: React.FC<DashboardLayoutWrapperProps> = ({ 
  children 
}) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default DashboardLayoutWrapper;