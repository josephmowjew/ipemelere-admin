/**
 * Layout Types - Type definitions for layout components
 * Following TypeScript-first approach for better developer experience
 */

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: Omit<NavigationItem, 'icon' | 'children'>[];
}

export interface SidebarProps {
  navigation: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export interface TopNavbarProps {
  onSidebarToggle: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  notifications?: NotificationItem[];
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  href?: string;
}

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onSignOut: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
}

export type LayoutContextType = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  isMobile: boolean;
};