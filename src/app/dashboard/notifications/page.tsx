/**
 * Notifications Page - Central notification management for admin dashboard
 * Displays all system notifications with filtering, search, and management features
 */

'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNotifications, useNotificationSummary } from '@/hooks/useNotifications';
import {
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowPathIcon,
  InboxIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/layout';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationTypeFilter = NotificationItem['type'] | 'all';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications(50);
  const { byType } = useNotificationSummary();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationFilter>('all');
  const [notificationTypeFilter, setNotificationTypeFilter] = useState<NotificationTypeFilter>('all');

  // Filter notifications based on search query and filters
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }

    // Apply read status filter
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Apply notification type filter
    if (notificationTypeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === notificationTypeFilter);
    }

    return filtered;
  }, [notifications, searchQuery, filterType, notificationTypeFilter]);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to the notification's href if it exists
    if (notification.href) {
      window.location.href = notification.href;
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationTypeColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications', current: true }
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <InboxIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <BellIcon className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success</p>
                <p className="text-2xl font-bold text-green-600">{byType.success}</p>
              </div>
              <CheckIcon className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{byType.error}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {/* Read Status Filter */}
              <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                <FunnelIcon className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as NotificationFilter)}
                  className="bg-background border-0 text-sm focus:outline-none focus:ring-0"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {/* Notification Type Filter */}
              <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                <select
                  value={notificationTypeFilter}
                  onChange={(e) => setNotificationTypeFilter(e.target.value as NotificationTypeFilter)}
                  className="bg-background border-0 text-sm focus:outline-none focus:ring-0"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <Card className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <InboxIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' || notificationTypeFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'You\'re all caught up! No new notifications.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                      !notification.read && "bg-blue-50/50 border-blue-200",
                      "border-l-4",
                      notification.type === 'error' && "border-l-red-500",
                      notification.type === 'warning' && "border-l-yellow-500",
                      notification.type === 'success' && "border-l-green-500",
                      notification.type === 'info' && "border-l-blue-500"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground truncate">
                                {notification.title}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", getNotificationTypeColor(notification.type))}
                              >
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {formatTimestamp(notification.timestamp)}
                              </div>
                              {notification.href && (
                                <span className="text-blue-600 hover:text-blue-800">
                                  Click to view details →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
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