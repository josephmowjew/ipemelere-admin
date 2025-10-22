/**
 * Navigation Constants - Centralized navigation configuration
 * Following the principle of single source of truth for navigation items
 */

import { 
  ChartBarIcon, 
  UsersIcon, 
  TruckIcon, 
  MapIcon, 
  DocumentCheckIcon,
  BellIcon,
  CogIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  comingSoon?: boolean;
  children?: Omit<NavigationItem, 'icon' | 'children'>[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    disabled: true,
    comingSoon: true,
  },
  {
    id: 'passengers',
    name: 'Passengers',
    href: '/dashboard/passengers',
    icon: UsersIcon,
    children: [
      { id: 'passengers-list', name: 'All Passengers', href: '/dashboard/passengers' },
      { id: 'passengers-active', name: 'Active', href: '/dashboard/passengers?status=active' },
      { id: 'passengers-suspended', name: 'Suspended', href: '/dashboard/passengers?status=suspended' },
    ],
  },
  {
    id: 'drivers',
    name: 'Drivers',
    href: '/dashboard/drivers',
    icon: TruckIcon,
    children: [
      { id: 'drivers-list', name: 'All Drivers', href: '/dashboard/drivers' },
      { id: 'drivers-pending', name: 'Pending Verification', href: '/dashboard/drivers?status=pending_verification' },
      { id: 'drivers-active', name: 'Active', href: '/dashboard/drivers?status=active' },
    ],
  },
  {
    id: 'rides',
    name: 'Rides',
    href: '/dashboard/rides',
    icon: MapIcon,
    children: [
      { id: 'rides-all', name: 'All Rides', href: '/dashboard/rides' },
      { id: 'rides-completed', name: 'Completed', href: '/dashboard/rides?status=completed' },
      { id: 'rides-active', name: 'Active', href: '/dashboard/rides?status=in_progress' },
      { id: 'rides-cancelled', name: 'Cancelled', href: '/dashboard/rides?status=cancelled' },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    href: '/dashboard/documents',
    icon: DocumentCheckIcon,
    badge: 'pending', // This will be dynamically updated
    children: [
      { id: 'documents-pending', name: 'Pending Review', href: '/dashboard/documents/pending' },
      { id: 'documents-approved', name: 'Approved', href: '/dashboard/documents?status=approved' },
      { id: 'documents-rejected', name: 'Rejected', href: '/dashboard/documents?status=rejected' },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/dashboard/settings',
    icon: CogIcon,
    disabled: true,
    comingSoon: true,
    children: [
      { id: 'settings-platform', name: 'Platform', href: '/dashboard/settings/platform' },
      { id: 'settings-admins', name: 'Admin Users', href: '/dashboard/settings/admins' },
      { id: 'settings-email', name: 'Email Config', href: '/dashboard/settings/email' },
    ],
  },
];

export const MOBILE_BREAKPOINT = 768;
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 80;