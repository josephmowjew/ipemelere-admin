/**
 * Notification History Page - View sent notification history
 * Shows all broadcast notifications that have been sent to users
 */

'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UsersIcon,
  TruckIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'drivers' | 'passengers';
  sentAt: Date;
  sentBy: string;
  recipientCount: number;
  readCount: number;
  status: 'sent' | 'sending' | 'failed';
  deliveryRate?: number;
}

const mockHistory: SentNotification[] = [
  {
    id: '1',
    title: 'System Maintenance Tonight',
    message: 'We will be performing scheduled maintenance tonight from 11 PM to 12 AM. Some services may be temporarily unavailable.',
    type: 'warning',
    targetAudience: 'all',
    sentAt: new Date('2024-01-20T18:30:00'),
    sentBy: 'Admin User',
    recipientCount: 4850,
    readCount: 3987,
    status: 'sent',
    deliveryRate: 82.1,
  },
  {
    id: '2',
    title: 'New Driver Features Released',
    message: 'Exciting new features for drivers are now available! Update your app to enjoy enhanced earnings and better ride matching.',
    type: 'info',
    targetAudience: 'drivers',
    sentAt: new Date('2024-01-19T10:15:00'),
    sentBy: 'Mary Chisomo',
    recipientCount: 847,
    readCount: 654,
    status: 'sent',
    deliveryRate: 77.2,
  },
  {
    id: '3',
    title: 'Payment Processing Issue Resolved',
    message: 'The recent payment processing issues have been resolved. All pending transactions have been processed successfully.',
    type: 'success',
    targetAudience: 'passengers',
    sentAt: new Date('2024-01-18T14:45:00'),
    sentBy: 'John Banda',
    recipientCount: 3200,
    readCount: 2456,
    status: 'sent',
    deliveryRate: 76.8,
  },
  {
    id: '4',
    title: 'Urgent: Update Your App',
    message: 'Critical security update required. Please update your app immediately to continue using our services.',
    type: 'error',
    targetAudience: 'all',
    sentAt: new Date('2024-01-17T09:00:00'),
    sentBy: 'Admin User',
    recipientCount: 4047,
    readCount: 3890,
    status: 'sent',
    deliveryRate: 96.1,
  },
  {
    id: '5',
    title: 'Welcome New Drivers',
    message: 'Welcome to our platform! We\'re excited to have you join our community of professional drivers.',
    type: 'success',
    targetAudience: 'drivers',
    sentAt: new Date('2024-01-16T16:20:00'),
    sentBy: 'Sarah Phiri',
    recipientCount: 125,
    readCount: 98,
    status: 'sending',
  },
];

export default function NotificationHistoryPage() {
  const [notifications] = useState<SentNotification[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');

  // Filter notifications based on search and filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.sentBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
      const matchesAudience = filterAudience === 'all' || notification.targetAudience === filterAudience;
      return matchesSearch && matchesStatus && matchesAudience;
    });
  }, [notifications, searchQuery, filterStatus, filterAudience]);

  const getStatusColor = (status: SentNotification['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: SentNotification['type']) => {
    switch (type) {
      case 'success':
        return <div className="h-3 w-3 bg-green-500 rounded-full" />;
      case 'error':
        return <div className="h-3 w-3 bg-red-500 rounded-full" />;
      case 'warning':
        return <div className="h-3 w-3 bg-yellow-500 rounded-full" />;
      default:
        return <div className="h-3 w-3 bg-blue-500 rounded-full" />;
    }
  };

  const getAudienceIcon = (audience: SentNotification['targetAudience']) => {
    switch (audience) {
      case 'drivers':
        return <TruckIcon className="h-4 w-4" />;
      case 'passengers':
        return <UsersIcon className="h-4 w-4" />;
      default:
        return <UsersIcon className="h-4 w-4" />;
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateReadRate = (readCount: number, recipientCount: number): number => {
    if (recipientCount === 0) return 0;
    return (readCount / recipientCount) * 100;
  };

  return (
    <DashboardLayout
      title="Notification History"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'History', current: true }
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">
                  {notifications.reduce((sum, n) => sum + n.recipientCount, 0).toLocaleString()}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Read Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    if (notifications.length === 0) return '0%';
                    const avgRate = notifications.reduce((sum, n) => sum + calculateReadRate(n.readCount, n.recipientCount), 0) / notifications.length;
                    return `${avgRate.toFixed(1)}%`;
                  })()}
                </p>
              </div>
              <EyeIcon className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.length > 0
                    ? ((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="h-8 w-8 text-blue-500" />
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
              {/* Status Filter */}
              <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                <FunnelIcon className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-background border-0 text-sm focus:outline-none focus:ring-0"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="sending">Sending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Audience Filter */}
              <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="bg-background border-0 text-sm focus:outline-none focus:ring-0"
                >
                  <option value="all">All Audiences</option>
                  <option value="all">All Users</option>
                  <option value="drivers">Drivers</option>
                  <option value="passengers">Passengers</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterStatus !== 'all' || filterAudience !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'No notifications have been sent yet.'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Audience</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent At</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Recipients</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Read Rate</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          <span className="text-sm capitalize">{notification.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate max-w-xs">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {notification.message}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getAudienceIcon(notification.targetAudience)}
                          <span className="text-sm capitalize">{notification.targetAudience}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{notification.sentBy}</td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {formatDateTime(notification.sentAt)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-foreground">
                        {notification.recipientCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-foreground">
                            {calculateReadRate(notification.readCount, notification.recipientCount)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {notification.readCount}/{notification.recipientCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getStatusColor(notification.status))}
                        >
                          {notification.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}