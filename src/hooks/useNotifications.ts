/**
 * Use Notifications Hook - Centralized notification management for the dashboard
 * Combines activity data and system notifications into a unified notification system
 */

'use client';

import { useMemo, useCallback } from 'react';
import { useRecentActivity } from '@/hooks/api/useDashboardData';
import { notificationStorage } from '@/lib/storage/notifications';
import {
  transformActivityToNotifications,
  sortNotificationsByTimestamp,
  getRecentNotifications
} from '@/lib/utils/notifications';

/**
 * Hook for fetching and managing dashboard notifications
 * Returns real activity data transformed into notification format
 */
export function useNotifications(limit: number = 20) {
  const {
    data: activityData,
    isLoading,
    error,
    refetch
  } = useRecentActivity(limit);

  const notifications = useMemo(() => {
    // Handle no activity data gracefully
    if (!activityData || !Array.isArray(activityData) || activityData.length === 0) {
      return [];
    }

    // Transform activity data to notification format
    const transformedNotifications = transformActivityToNotifications(activityData);

    // Apply read status from local storage
    const notificationsWithReadStatus = notificationStorage.applyReadStatus(transformedNotifications);

    // Sort by timestamp and limit the results
    return getRecentNotifications(
      sortNotificationsByTimestamp(notificationsWithReadStatus),
      limit
    );
  }, [activityData, limit]);

  const unreadCount = useMemo(() => {
    return notificationStorage.getUnreadCount(notifications);
  }, [notifications]);

  // Function to mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    notificationStorage.markAsRead(notificationId);
    // Trigger a refetch to update the UI
    refetch();
  }, [refetch]);

  // Function to mark multiple notifications as read
  const markMultipleAsRead = useCallback((notificationIds: string[]) => {
    notificationStorage.markMultipleAsRead(notificationIds);
    // Trigger a refetch to update the UI
    refetch();
  }, [refetch]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const notificationIds = notifications.map(n => n.id);
    notificationStorage.markAllAsRead(notificationIds);
    // Trigger a refetch to update the UI
    refetch();
  }, [notifications, refetch]);

  // Function to mark a notification as unread
  const markAsUnread = useCallback((notificationId: string) => {
    notificationStorage.markAsUnread(notificationId);
    // Trigger a refetch to update the UI
    refetch();
  }, [refetch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    // Actions
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    markAsUnread,
    // Utility flags
    hasNotifications: notifications.length > 0,
    hasUnreadNotifications: unreadCount > 0,
  };
}

/**
 * Hook for getting notification summary stats
 */
export function useNotificationSummary() {
  const { notifications, isLoading } = useNotifications();

  const summary = useMemo(() => {
    if (isLoading || !notifications.length) {
      return {
        total: 0,
        unread: 0,
        byType: {
          info: 0,
          success: 0,
          warning: 0,
          error: 0,
        },
      };
    }

    const byType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        info: byType.info || 0,
        success: byType.success || 0,
        warning: byType.warning || 0,
        error: byType.error || 0,
      },
    };
  }, [notifications, isLoading]);

  return summary;
}