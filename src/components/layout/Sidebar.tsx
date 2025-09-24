/**
 * Sidebar Component - Main navigation sidebar
 * Following compound component pattern and reusability principles
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { type SidebarProps, type NavigationItem } from '@/types/layout';
import { cn } from '@/lib/utils';

// Compound component structure for better composition
export function Sidebar({ navigation, isOpen, onToggle, isCollapsed = false, onCollapse }: SidebarProps) {
  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300',
      'bg-card border-r border-border',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      isCollapsed ? 'w-20' : 'w-80',
      'lg:translate-x-0'
    )}>
      <SidebarHeader isCollapsed={isCollapsed} onClose={onToggle} />
      <SidebarNavigation navigation={navigation} isCollapsed={isCollapsed} />
      <SidebarFooter isCollapsed={isCollapsed} onCollapse={onCollapse} />
    </div>
  );
}

// Header section with logo and close button
function SidebarHeader({ isCollapsed, onClose }: { isCollapsed: boolean; onClose: () => void }) {
  return (
    <div className="flex h-16 items-center justify-between px-4 lg:px-6">
      {!isCollapsed && (
        <Link href="/dashboard" className="flex items-center space-x-3">
          <Image
            src="/Ipemelere_Logo.png"
            alt="Ipemelere"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ipemelere
          </span>
        </Link>
      )}
      
      {isCollapsed && (
        <Link href="/dashboard" className="flex items-center justify-center w-full">
          <Image
            src="/Ipemelere_Logo.png"
            alt="Ipemelere"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
        </Link>
      )}
      
      <button
        onClick={onClose}
        className="lg:hidden p-2 rounded-md hover:bg-accent"
        aria-label="Close sidebar"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

// Main navigation section
function SidebarNavigation({ navigation, isCollapsed }: { navigation: NavigationItem[]; isCollapsed: boolean }) {
  return (
    <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
      {navigation.map((item) => (
        <NavigationItem key={item.id} item={item} isCollapsed={isCollapsed} />
      ))}
    </nav>
  );
}

// Individual navigation item with children support
function NavigationItem({ item, isCollapsed }: { item: NavigationItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasChildren = item.children && item.children.length > 0;

  // Build current full URL with search params
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  // Check if any child is active
  const hasActiveChild = hasChildren && item.children?.some(child => {
    return currentUrl === child.href || pathname === child.href;
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Update expansion state when route changes
  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true);
    }
  }, [hasActiveChild]);

  const isActive = pathname === item.href || hasActiveChild;

  if (isCollapsed) {
    return (
      <CollapsedNavigationItem 
        item={item} 
        isActive={!!isActive}
        hasChildren={!!hasChildren}
      />
    );
  }

  return (
    <div>
      <NavigationLink
        item={item}
        isActive={!!isActive}
        hasChildren={!!hasChildren}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => {
            const isChildActive = currentUrl === child.href || pathname === child.href;
            return (
              <Link
                key={child.id}
                href={child.href}
                className={cn(
                  'group flex items-center rounded-md py-2 pl-11 pr-3 text-sm font-medium transition-colors',
                  isChildActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Collapsed navigation item with tooltip
function CollapsedNavigationItem({
  item,
  isActive,
  hasChildren
}: {
  item: NavigationItem;
  isActive: boolean;
  hasChildren: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const linkContent = (
    <>
      <item.icon className={cn(
        "h-5 w-5",
        item.disabled && "opacity-50"
      )} />
      {item.badge && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
          {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </>
  );

  return (
    <div className="relative">
      {item.disabled ? (
        <div
          className={cn(
            'group flex items-center justify-center rounded-md p-3 text-sm font-medium cursor-not-allowed',
            'text-muted-foreground/50 opacity-50'
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {linkContent}
        </div>
      ) : (
        <Link
          href={item.href}
          className={cn(
            'group flex items-center justify-center rounded-md p-3 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {linkContent}
        </Link>
      )}
      
      {showTooltip && (
        <div className="absolute left-full top-0 ml-2 z-50">
          <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md shadow-lg text-sm whitespace-nowrap">
            {item.name}
            {item.disabled && item.comingSoon && (
              <span className="text-xs text-muted-foreground block">Coming Soon</span>
            )}
            {hasChildren && !item.disabled && ' →'}
          </div>
        </div>
      )}
    </div>
  );
}

// Main navigation link component
function NavigationLink({
  item,
  isActive,
  hasChildren,
  isExpanded,
  onToggle
}: {
  item: NavigationItem;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center flex-1 min-w-0">
        <item.icon className={cn(
          "mr-3 h-5 w-5 flex-shrink-0",
          item.disabled && "opacity-50"
        )} />
        <span className={cn(
          "truncate",
          item.disabled && "opacity-50"
        )}>
          {item.name}
        </span>
        {item.comingSoon && item.disabled && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Coming Soon
          </span>
        )}
        {item.badge && !item.disabled && (
          <span className={cn(
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            typeof item.badge === 'string'
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-destructive text-destructive-foreground'
          )}>
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      {hasChildren && !item.disabled && (
        <div className="ml-auto">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </div>
      )}
    </>
  );

  const className = cn(
    'group flex items-center rounded-md px-3 py-2 text-sm font-medium w-full',
    item.disabled
      ? 'cursor-not-allowed text-muted-foreground/50 opacity-50'
      : cn(
          'transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
  );

  if (item.disabled) {
    return (
      <div className={className}>
        {content}
      </div>
    );
  }

  if (hasChildren) {
    return (
      <button onClick={onToggle} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

// Footer section with collapse toggle
function SidebarFooter({ 
  isCollapsed, 
  onCollapse 
}: { 
  isCollapsed: boolean; 
  onCollapse?: () => void;
}) {
  if (!onCollapse) return null;

  return (
    <div className="border-t border-border p-4">
      <button
        onClick={onCollapse}
        className={cn(
          'flex items-center justify-center w-full px-3 py-2 text-sm font-medium rounded-md',
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          'transition-colors'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <>
            <ChevronRightIcon className="h-4 w-4 mr-2 rotate-180" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );
}