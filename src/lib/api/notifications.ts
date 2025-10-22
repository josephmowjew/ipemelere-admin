/**
 * Notifications API - Notification management and read status
 * Implements repository pattern for notification operations
 */

import { api } from '@/lib/api/client';
import { NotificationItem } from '@/types/layout';

// API response types
export interface APINotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  href?: string;
}

export interface APINotificationResponse {
  data: APINotification[];
  total: number;
  unreadCount: number;
}

// Notification service class
export class NotificationService {
  /**
   * Get all notifications for the current user
   */
  static async getNotifications(params?: {
    limit?: number;
    offset?: number;
    type?: NotificationItem['type'];
    read?: boolean;
  }): Promise<APINotificationResponse> {
    try {
      const response = await api.get<APINotificationResponse>('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a specific notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await api.patch('/notifications/mark-read', { notificationIds });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  }
}

// Export individual functions for easier usage
export const notificationsApi = {
  getNotifications: NotificationService.getNotifications.bind(NotificationService),
  markAsRead: NotificationService.markAsRead.bind(NotificationService),
  markMultipleAsRead: NotificationService.markMultipleAsRead.bind(NotificationService),
  markAllAsRead: NotificationService.markAllAsRead.bind(NotificationService),
  deleteNotification: NotificationService.deleteNotification.bind(NotificationService),
  getUnreadCount: NotificationService.getUnreadCount.bind(NotificationService),
};