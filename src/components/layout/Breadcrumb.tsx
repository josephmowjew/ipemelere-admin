/**
 * Breadcrumb Component - Navigation breadcrumb trail
 * Following reusability principles with customizable separators
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { BreadcrumbProps, BreadcrumbItem } from '@/types/layout';
import { cn } from '@/lib/utils';

export function Breadcrumb({ 
  items, 
  separator = <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />,
  className 
}: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav className={cn('flex items-center space-x-1', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={`${item.href || 'current'}-${index}`} className="flex items-center">
              {/* Separator - show before all items except first */}
              {!isFirst && (
                <div className="mx-2 flex-shrink-0">
                  {separator}
                </div>
              )}
              
              <BreadcrumbLink 
                item={item} 
                isLast={isLast} 
                isFirst={isFirst}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Individual breadcrumb link component
function BreadcrumbLink({ 
  item, 
  isLast, 
  isFirst 
}: { 
  item: BreadcrumbItem; 
  isLast: boolean;
  isFirst: boolean;
}) {
  const baseClasses = "flex items-center text-sm font-medium transition-colors";
  
  // Show home icon for first item if it's the dashboard
  const showHomeIcon = isFirst && (item.href === '/dashboard' || item.label.toLowerCase() === 'dashboard');
  
  if (isLast || item.current || !item.href) {
    return (
      <span 
        className={cn(
          baseClasses,
          "text-foreground cursor-default",
          isLast && "font-semibold"
        )}
        aria-current={isLast ? "page" : undefined}
      >
        {showHomeIcon && <HomeIcon className="h-4 w-4 mr-1" />}
        {item.label}
      </span>
    );
  }

  return (
    <Link 
      href={item.href}
      className={cn(
        baseClasses,
        "text-muted-foreground hover:text-foreground"
      )}
    >
      {showHomeIcon && <HomeIcon className="h-4 w-4 mr-1" />}
      {item.label}
    </Link>
  );
}

// Hook to generate breadcrumbs from pathname
export function useBreadcrumbs(pathname: string, customLabels?: Record<string, string>) {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Build breadcrumb items from URL segments
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip empty segments or certain patterns
      if (!segment) return;
      
      // Get label from custom labels or format the segment
      const label = customLabels?.[currentPath] || formatSegmentLabel(segment);
      
      breadcrumbs.push({
        label,
        href: currentPath,
        current: index === segments.length - 1
      });
    });

    return breadcrumbs;
  }, [pathname, customLabels]);
}

// Utility to format URL segments into readable labels
function formatSegmentLabel(segment: string): string {
  // Handle common patterns
  if (segment === 'dashboard') return 'Dashboard';
  if (segment === 'analytics') return 'Analytics';
  if (segment === 'passengers') return 'Passengers';
  if (segment === 'drivers') return 'Drivers';
  if (segment === 'rides') return 'Rides';
  if (segment === 'documents') return 'Documents';
  if (segment === 'notifications') return 'Notifications';
  if (segment === 'settings') return 'Settings';
  
  // Handle sub-pages
  if (segment === 'active') return 'Active';
  if (segment === 'pending') return 'Pending';
  if (segment === 'history') return 'History';
  if (segment === 'compose') return 'Compose';
  if (segment === 'templates') return 'Templates';
  if (segment === 'platform') return 'Platform';
  if (segment === 'admins') return 'Admin Users';
  if (segment === 'email') return 'Email Config';
  
  // Handle dynamic segments (UUIDs, IDs)
  if (/^[0-9a-f-]{36}$/i.test(segment)) return 'Details';
  if (/^\d+$/.test(segment)) return `ID: ${segment}`;
  
  // Default: capitalize first letter and replace hyphens/underscores with spaces
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Pre-built breadcrumb components for common patterns
export const DashboardBreadcrumb = () => {
  return (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/dashboard' }
      ]}
    />
  );
};

export const SectionBreadcrumb = ({ section, subsection }: { section: string; subsection?: string }) => {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: formatSegmentLabel(section), href: `/dashboard/${section}` }
  ];
  
  if (subsection) {
    items.push({
      label: formatSegmentLabel(subsection),
      href: `/dashboard/${section}/${subsection}`,
      current: true
    });
  }
  
  return <Breadcrumb items={items} />;
};