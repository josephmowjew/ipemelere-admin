/**
 * Notification Compose Page - Create and send broadcast notifications
 * Allows admin to compose notifications for specific user groups or all users
 */

'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PaperAirplaneIcon,
  UsersIcon,
  TruckIcon,
  UserGroupIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type TargetAudience = 'all' | 'drivers' | 'passengers' | 'specific';

interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationType;
  targetAudience: TargetAudience;
  userIds?: string[];
}

export default function NotificationComposePage() {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call to send notification
      console.log('Sending notification:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetAudience: 'all',
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <DashboardLayout
        title="Notification Sent"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications', href: '/dashboard/notifications' },
          { label: 'Compose', current: true }
        ]}
      >
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Notification Sent Successfully!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your notification has been sent to the selected recipients.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset} variant="outline">
                Send Another Notification
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/notifications'}>
                View All Notifications
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Compose Notification"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'Compose', current: true }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notification Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['info', 'success', 'warning', 'error'] as NotificationType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      "p-3 border rounded-lg text-center transition-colors",
                      formData.type === type
                        ? type === 'info' ? "border-blue-500 bg-blue-50 text-blue-700"
                        : type === 'success' ? "border-green-500 bg-green-50 text-green-700"
                        : type === 'warning' ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-red-500 bg-red-50 text-red-700"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {type === 'info' && <BellIcon className="h-5 w-5" />}
                      {type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                      {type === 'warning' && <UsersIcon className="h-5 w-5" />}
                      {type === 'error' && <UsersIcon className="h-5 w-5" />}
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Audience
              </label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value: TargetAudience) =>
                  setFormData({ ...formData, targetAudience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="drivers">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4" />
                      All Drivers
                    </div>
                  </SelectItem>
                  <SelectItem value="passengers">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4" />
                      All Passengers
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter notification title"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Message *
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter notification message"
                required
                rows={6}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/500 characters
              </p>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preview
              </label>
              <Card className="p-4 border-l-4 bg-accent/30">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {formData.type === 'info' && <BellIcon className="h-5 w-5 text-blue-500" />}
                    {formData.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {formData.type === 'warning' && <UsersIcon className="h-5 w-5 text-yellow-500" />}
                    {formData.type === 'error' && <UsersIcon className="h-5 w-5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">
                        {formData.title || 'Notification Title'}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          formData.type === 'info' && "bg-blue-100 text-blue-800",
                          formData.type === 'success' && "bg-green-100 text-green-800",
                          formData.type === 'warning' && "bg-yellow-100 text-yellow-800",
                          formData.type === 'error' && "bg-red-100 text-red-800"
                        )}
                      >
                        {formData.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formData.message || 'Notification message will appear here...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Target: {formData.targetAudience === 'all' && 'All Users'}
                      {formData.targetAudience === 'drivers' && 'All Drivers'}
                      {formData.targetAudience === 'passengers' && 'All Passengers'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={!formData.title.trim() || !formData.message.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/dashboard/notifications'}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Guidelines */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Notification Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep titles concise and informative</li>
                <li>• Use clear and specific messages</li>
                <li>• Choose appropriate notification types</li>
                <li>• Target the right audience</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">When to Use Each Type</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <span className="text-blue-600 font-medium">Info:</span> General announcements</li>
                <li>• <span className="text-green-600 font-medium">Success:</span> Completed actions</li>
                <li>• <span className="text-yellow-600 font-medium">Warning:</span> Important notices</li>
                <li>• <span className="text-red-600 font-medium">Error:</span> Critical issues</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}