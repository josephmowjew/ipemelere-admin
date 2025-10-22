/**
 * Notification Utilities - Helper functions for transforming activity data to notifications
 * Following clean architecture patterns
 */

import { ActivityItem } from '@/types/dashboard';
import { NotificationItem } from '@/types/layout';

/**
 * Transform activity items to notification items
 * Maps activity data to the notification format expected by TopNavbar
 */
export function transformActivityToNotifications(activity: ActivityItem[]): NotificationItem[] {
  if (!activity || !Array.isArray(activity)) {
    return [];
  }

  return activity.map((item) => {
    // Map activity type to notification type
    const getNotificationType = (activityType: string): NotificationItem['type'] => {
      switch (activityType) {
        case 'driver_registered':
        case 'user_registered':
        case 'document_verified':
        case 'vehicle_approved':
          return 'success';
        case 'vehicle_rejected':
          return 'error';
        case 'vehicle_submitted':
          return 'info';
        case 'payment_processed':
        case 'ride_completed':
          return 'info';
        default:
          return 'info';
      }
    };

    // Generate href for navigation based on activity type
    const getNotificationHref = (activityItem: ActivityItem): string | undefined => {
      switch (activityItem.type) {
        case 'driver_registered':
        case 'document_verified':
          // For driver-related activities, prioritize driverId over userId
          if (activityItem.driverId) {
            return `/dashboard/drivers/${activityItem.driverId}`;
          }
          // Fallback to userId if driverId is not available (for backward compatibility)
          return activityItem.userId ? `/dashboard/drivers/${activityItem.userId}` : '/dashboard/drivers';
        case 'user_registered':
          return activityItem.userId ? `/dashboard/passengers/${activityItem.userId}` : '/dashboard/passengers';
        case 'vehicle_submitted':
        case 'vehicle_approved':
        case 'vehicle_rejected':
          return activityItem.vehicleId ? `/dashboard/vehicles/${activityItem.vehicleId}` : '/dashboard/vehicles';
        case 'ride_completed':
          return '/dashboard/rides';
        case 'payment_processed':
          return '/dashboard/analytics';
        default:
          return undefined;
      }
    };

    return {
      id: item.id,
      title: item.title,
      message: item.description,
      type: getNotificationType(item.type),
      timestamp: item.timestamp,
      read: false, // Activities are considered unread by default
      href: getNotificationHref(item),
    };
  });
}

/**
 * Filter notifications by type
 */
export function filterNotificationsByType(
  notifications: NotificationItem[],
  type: NotificationItem['type']
): NotificationItem[] {
  return notifications.filter(notification => notification.type === type);
}

/**
 * Filter notifications by read status
 */
export function filterNotificationsByReadStatus(
  notifications: NotificationItem[],
  isRead: boolean
): NotificationItem[] {
  return notifications.filter(notification => notification.read === isRead);
}

/**
 * Get unread notifications count
 */
export function getUnreadNotificationsCount(notifications: NotificationItem[]): number {
  return notifications.filter(notification => !notification.read).length;
}

/**
 * Sort notifications by timestamp (most recent first)
 */
export function sortNotificationsByTimestamp(notifications: NotificationItem[]): NotificationItem[] {
  return [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get recent notifications (last N items)
 */
export function getRecentNotifications(
  notifications: NotificationItem[],
  limit: number = 10
): NotificationItem[] {
  return sortNotificationsByTimestamp(notifications).slice(0, limit);
}