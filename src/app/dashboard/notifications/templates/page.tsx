/**
 * Notification Templates Page - Manage notification templates
 * Provides pre-defined templates for common notification scenarios
 */

'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'driver' | 'passenger' | 'payment' | 'maintenance';
  usageCount: number;
  lastUsed?: Date;
  isBuiltIn: boolean;
}

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Driver',
    title: 'Welcome to Ganyu Ipemelere - Driver Registration Approved',
    message: 'Congratulations! Your driver registration has been approved. You can now start accepting ride requests. Please review our driver guidelines and ensure you have all necessary documents uploaded.',
    type: 'success',
    category: 'driver',
    usageCount: 156,
    lastUsed: new Date('2024-01-15'),
    isBuiltIn: true,
  },
  {
    id: '2',
    name: 'Maintenance Notice',
    title: 'Scheduled System Maintenance',
    message: 'We will be performing scheduled maintenance on {date} from {start_time} to {end_time}. During this time, some services may be temporarily unavailable. We apologize for any inconvenience.',
    type: 'warning',
    category: 'system',
    usageCount: 23,
    lastUsed: new Date('2024-01-10'),
    isBuiltIn: true,
  },
  {
    id: '3',
    name: 'Payment Failed',
    title: 'Payment Processing Failed',
    message: 'We were unable to process your recent payment of {amount}. Please update your payment information and try again. If you continue to experience issues, please contact our support team.',
    type: 'error',
    category: 'payment',
    usageCount: 45,
    lastUsed: new Date('2024-01-08'),
    isBuiltIn: true,
  },
  {
    id: '4',
    name: 'Feature Update',
    title: 'New Features Available',
    message: 'We\'ve just launched exciting new features! Check out our latest updates including {feature_1} and {feature_2}. Update your app to enjoy the best experience.',
    type: 'info',
    category: 'user',
    usageCount: 89,
    lastUsed: new Date('2024-01-05'),
    isBuiltIn: true,
  },
  {
    id: '5',
    name: 'Document Verification',
    title: 'Document Verification Required',
    message: 'Your submitted documents require verification. Please log in to your account and upload the required documents to continue using our services. Documents needed: {required_documents}.',
    type: 'warning',
    category: 'passenger',
    usageCount: 67,
    isBuiltIn: true,
  },
];

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: NotificationTemplate) => {
    // Navigate to compose page with template data
    const params = new URLSearchParams({
      title: template.title,
      message: template.message,
      type: template.type,
    });
    window.location.href = `/dashboard/notifications/compose?${params.toString()}`;
  };

  const handleDuplicateTemplate = (template: NotificationTemplate) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isBuiltIn: false,
      usageCount: 0,
      lastUsed: undefined,
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const getTemplateIcon = (type: NotificationTemplate['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTemplateTypeColor = (type: NotificationTemplate['type']) => {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'driver':
        return 'bg-blue-100 text-blue-800';
      case 'passenger':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="Notification Templates"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Notifications', href: '/dashboard/notifications' },
        { label: 'Templates', current: true }
      ]}
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Templates</h1>
            <p className="text-muted-foreground">
              Create and manage reusable notification templates for common scenarios.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 p-2 border border-border rounded-md">
              <FunnelIcon className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-background border-0 text-sm focus:outline-none focus:ring-0"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="user">User</option>
                <option value="driver">Driver</option>
                <option value="passenger">Passenger</option>
                <option value="payment">Payment</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <DocumentDuplicateIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first template.'}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTemplateIcon(template.type)}
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        {template.isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">
                            Built-in
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getTemplateTypeColor(template.type))}
                        >
                          {template.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-xs capitalize", getCategoryColor(template.category))}
                        >
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    {!template.isBuiltIn && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Title:</p>
                      <p className="text-sm text-foreground">{template.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Message:</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.message}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Used {template.usageCount} times</span>
                    {template.lastUsed && (
                      <span>Last used {template.lastUsed.toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}