/**
 * Auth Layout - Layout for authentication pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Ganyu Ipemelere',
  description: 'Administrator login for the Ipemelere taxi booking system',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}