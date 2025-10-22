/**
 * DashboardLayout Component - Main layout wrapper for dashboard pages
 * Following composition pattern and responsive design principles
 */

'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLayout } from '@/contexts/LayoutContext';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Breadcrumb } from './Breadcrumb';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import { type DashboardLayoutProps, type BreadcrumbItem } from '@/types/layout';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function DashboardLayout({
  children,
  title,
  breadcrumbs = [],
  actions,
  className
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, collapseSidebar, isMobile } = useLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-64" />}>
        <Sidebar
          navigation={NAVIGATION_ITEMS}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isCollapsed={sidebarCollapsed}
          onCollapse={collapseSidebar}
        />
      </Suspense>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className={cn(
        'transition-all duration-300 min-h-screen flex flex-col',
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      )}>
        {/* Top navigation */}
        <TopNavbar
          onSidebarToggle={toggleSidebar}
          user={user ? {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: undefined,
            role: user.role
          } : undefined}
        />

        {/* Page content */}
        <main className="flex-1">
          {/* Page header with breadcrumbs and actions */}
          {(title || breadcrumbs.length > 0 || actions) && (
            <PageHeader
              title={title}
              breadcrumbs={breadcrumbs}
              actions={actions}
            />
          )}

          {/* Page content wrapper */}
          <div className={cn(
            'px-4 sm:px-6 lg:px-8 py-6',
            className
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Page header component with breadcrumbs and actions
function PageHeader({
  title,
  breadcrumbs = [],
  actions
}: {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}) {
  if (!title && breadcrumbs.length === 0 && !actions) {
    return null;
  }

  return (
    <div className="border-b border-border bg-background">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and breadcrumbs */}
          <div className="flex-1 min-w-0">
            {breadcrumbs.length > 0 && (
              <div className="mb-1">
                <Breadcrumb items={breadcrumbs} />
              </div>
            )}
            {title && (
              <h1 className="text-2xl font-bold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right side - Actions */}
          {actions && (
            <div className="ml-4 flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized layout components for common patterns
export function ListPageLayout({
  title,
  description,
  breadcrumbs,
  children,
  searchBar,
  filterBar,
  actions,
  backUrl,
  className
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  searchBar?: React.ReactNode;
  filterBar?: React.ReactNode;
  actions?: React.ReactNode;
  backUrl?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      className={className}
    >
      {/* Page Header with Back Button */}
      <div className="mb-6">
        {backUrl && (
          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      </div>

      {/* Search and filter bar */}
      {(searchBar || filterBar) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1">
            {searchBar}
          </div>
          {filterBar && (
            <div className="flex-shrink-0">
              {filterBar}
            </div>
          )}
        </div>
      )}

      {children}
    </DashboardLayout>
  );
}

export function DetailPageLayout({
  title,
  subtitle,
  breadcrumbs,
  children,
  sidebar,
  actions,
  headerAction,
  backUrl,
  className
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  actions?: React.ReactNode;
  headerAction?: React.ReactNode;
  backUrl?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      className={className}
    >
      {/* Page Header with Back Button */}
      <div className="mb-6">
        {backUrl && (
          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {headerAction}
            {actions}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content */}
        <div className={cn(
          sidebar ? 'lg:col-span-8' : 'lg:col-span-12'
        )}>
          {children}
        </div>

        {/* Sidebar content */}
        {sidebar && (
          <div className="lg:col-span-4">
            {sidebar}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default React.memo(DashboardLayout);