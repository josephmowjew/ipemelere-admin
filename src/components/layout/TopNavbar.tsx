/**
 * TopNavbar Component - Main navigation header
 * Following compound component pattern for better composition and reusability
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { type TopNavbarProps, type NotificationItem, type UserMenuProps } from '@/types/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TopNavbar({ onSidebarToggle, user, notifications = [] }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <MobileMenuButton onToggle={onSidebarToggle} />
      <SearchBar />
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationDropdown notifications={notifications} />
          {user && <UserMenu user={user} onSignOut={() => {}} />}
        </div>
      </div>
    </header>
  );
}

// Mobile menu toggle button
function MobileMenuButton({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      className="-m-2.5 p-2.5 text-muted-foreground lg:hidden hover:text-foreground transition-colors"
      onClick={onToggle}
      aria-label="Open sidebar"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}

// Search bar component
function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className="relative flex flex-1 max-w-xs">
      <div 
        className={cn(
          "relative w-full transition-all duration-200",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto"
        )}
      >
        <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search..."
          className={cn(
            "h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 py-1 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "transition-all duration-200"
          )}
          onBlur={() => setIsExpanded(false)}
        />
      </div>
      
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "sm:hidden p-2 hover:bg-accent rounded-md transition-colors",
          isExpanded && "hidden"
        )}
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

// Notification dropdown
function NotificationDropdown({ notifications }: { notifications: NotificationItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Notifications ({unreadCount} unread)
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onClick={() => setIsOpen(false)}
                />
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual notification item
function NotificationItem({ 
  notification, 
  onClick 
}: { 
  notification: NotificationItem; 
  onClick: () => void;
}) {

  return (
    <div 
      className={cn(
        "p-4 hover:bg-accent cursor-pointer transition-colors border-l-4",
        !notification.read && "bg-accent/20",
        notification.type === 'error' && "border-l-destructive",
        notification.type === 'warning' && "border-l-yellow-500",
        notification.type === 'success' && "border-l-green-500",
        notification.type === 'info' && "border-l-blue-500"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatTimestamp(notification.timestamp)}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

// User menu dropdown
function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    onSignOut();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 p-1.5 hover:bg-accent rounded-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        {user.avatar ? (
          <Image
            src={user.avatar} 
            alt={user.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{user.role}</p>
          </div>
          
          <div className="py-1">
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Settings
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={handleSignOut}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to format timestamps
function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return timestamp.toLocaleDateString();
}