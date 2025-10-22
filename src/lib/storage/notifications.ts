/**
 * Local Storage Notification Manager - Client-side notification read state management
 * Provides persistent notification state until backend API is available
 */

import { NotificationItem } from '@/types/layout';

const STORAGE_KEY = 'ganyu-notifications-read-state';
const STORAGE_VERSION = '1.0';

interface NotificationReadState {
  readNotifications: Set<string>;
  lastUpdated: Date;
  version: string;
}

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Local storage manager for notification read status
 */
class NotificationStorageManager {
  /**
   * Get the current read state from local storage
   */
  private static getReadState(): NotificationReadState {
    if (!isBrowser) {
      return {
        readNotifications: new Set(),
        lastUpdated: new Date(),
        version: STORAGE_VERSION,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          readNotifications: new Set(),
          lastUpdated: new Date(),
          version: STORAGE_VERSION,
        };
      }

      const parsed = JSON.parse(stored);

      // Handle version migration
      if (parsed.version !== STORAGE_VERSION) {
        // Clear old data and start fresh
        this.clearReadState();
        return {
          readNotifications: new Set(),
          lastUpdated: new Date(),
          version: STORAGE_VERSION,
        };
      }

      return {
        readNotifications: new Set(parsed.readNotifications || []),
        lastUpdated: new Date(parsed.lastUpdated),
        version: parsed.version || STORAGE_VERSION,
      };
    } catch (error) {
      console.error('Error reading notification state from storage:', error);
      return {
        readNotifications: new Set(),
        lastUpdated: new Date(),
        version: STORAGE_VERSION,
      };
    }
  }

  /**
   * Save the read state to local storage
   */
  private static saveReadState(state: NotificationReadState): void {
    if (!isBrowser) {
      return;
    }

    try {
      const toStore = {
        readNotifications: Array.from(state.readNotifications),
        lastUpdated: state.lastUpdated.toISOString(),
        version: state.version,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving notification state to storage:', error);
    }
  }

  /**
   * Check if a notification is marked as read
   */
  static isNotificationRead(notificationId: string): boolean {
    const state = this.getReadState();
    return state.readNotifications.has(notificationId);
  }

  /**
   * Mark a notification as read
   */
  static markAsRead(notificationId: string): void {
    const state = this.getReadState();
    state.readNotifications.add(notificationId);
    state.lastUpdated = new Date();
    this.saveReadState(state);
  }

  /**
   * Mark multiple notifications as read
   */
  static markMultipleAsRead(notificationIds: string[]): void {
    const state = this.getReadState();
    notificationIds.forEach(id => state.readNotifications.add(id));
    state.lastUpdated = new Date();
    this.saveReadState(state);
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(notificationIds: string[]): void {
    const state = this.getReadState();
    notificationIds.forEach(id => state.readNotifications.add(id));
    state.lastUpdated = new Date();
    this.saveReadState(state);
  }

  /**
   * Mark a notification as unread
   */
  static markAsUnread(notificationId: string): void {
    const state = this.getReadState();
    state.readNotifications.delete(notificationId);
    state.lastUpdated = new Date();
    this.saveReadState(state);
  }

  /**
   * Get the count of unread notifications
   */
  static getUnreadCount(notifications: NotificationItem[]): number {
    const state = this.getReadState();
    return notifications.filter(notification =>
      !state.readNotifications.has(notification.id)
    ).length;
  }

  /**
   * Apply read status to notifications
   */
  static applyReadStatus(notifications: NotificationItem[]): NotificationItem[] {
    const state = this.getReadState();
    return notifications.map(notification => ({
      ...notification,
      read: state.readNotifications.has(notification.id),
    }));
  }

  /**
   * Clear all read state (for testing or reset)
   */
  static clearReadState(): void {
    if (!isBrowser) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notification state from storage:', error);
    }
  }

  /**
   * Get read state statistics
   */
  static getReadStats(notifications: NotificationItem[]): {
    total: number;
    read: number;
    unread: number;
    lastUpdated: Date | null;
  } {
    const state = this.getReadState();
    const readCount = notifications.filter(notification =>
      state.readNotifications.has(notification.id)
    ).length;

    return {
      total: notifications.length,
      read: readCount,
      unread: notifications.length - readCount,
      lastUpdated: state.lastUpdated,
    };
  }
}

// Export the manager as a singleton
export const notificationStorage = NotificationStorageManager;

// Utility functions for convenience
export const markNotificationAsRead = (notificationId: string) =>
  notificationStorage.markAsRead(notificationId);

export const markNotificationsAsRead = (notificationIds: string[]) =>
  notificationStorage.markMultipleAsRead(notificationIds);

export const markAllNotificationsAsRead = (notifications: NotificationItem[]) => {
  const ids = notifications.map(n => n.id);
  notificationStorage.markAllAsRead(ids);
};

export const isNotificationRead = (notificationId: string) =>
  notificationStorage.isNotificationRead(notificationId);

export const getUnreadNotificationsCount = (notifications: NotificationItem[]) =>
  notificationStorage.getUnreadCount(notifications);