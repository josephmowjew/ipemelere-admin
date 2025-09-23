/**
 * NotificationContainer - Toast/Snackbar display component
 * Renders all active notifications with proper styling and animations
 */

'use client';

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotificationList, type Notification, type NotificationType } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return XCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'info':
      return InformationCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

// Color classes for notification types
const getNotificationClasses = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-green-50 border-green-200 text-green-800',
        icon: 'text-green-600',
        button: 'text-green-600 hover:text-green-800'
      };
    case 'error':
      return {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-600',
        button: 'text-red-600 hover:text-red-800'
      };
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: 'text-yellow-600',
        button: 'text-yellow-600 hover:text-yellow-800'
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: 'text-blue-600',
        button: 'text-blue-600 hover:text-blue-800'
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200 text-gray-800',
        icon: 'text-gray-600',
        button: 'text-gray-600 hover:text-gray-800'
      };
  }
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const classes = getNotificationClasses(notification.type);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
        'animate-in slide-in-from-right-full',
        classes.container
      )}
    >
      {/* Icon */}
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', classes.icon)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">
          {notification.title}
        </h4>
        {notification.message && (
          <p className="text-sm opacity-90 mt-1">
            {notification.message}
          </p>
        )}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(notification.id)}
        className={cn('h-6 w-6 p-0 hover:bg-transparent', classes.button)}
      >
        <XMarkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationList();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}

export default NotificationContainer;