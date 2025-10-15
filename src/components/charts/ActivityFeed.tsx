/**
 * ActivityFeed Component - Recent activity display
 * Following clean architecture patterns from design document
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  UserPlusIcon,
  MapIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  TruckIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ActivityItem } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';

// Activity type to icon mapping
const activityIcons = {
  driver_registered: TruckIcon,
  ride_completed: MapIcon,
  payment_processed: CreditCardIcon,
  document_verified: DocumentCheckIcon,
  user_registered: UserPlusIcon,
  vehicle_submitted: TruckIcon,
  vehicle_approved: TruckIcon,
  vehicle_rejected: TruckIcon,
};

// Activity type to color mapping
const activityColors = {
  driver_registered: 'bg-blue-50 text-blue-600 border-blue-200',
  ride_completed: 'bg-green-50 text-green-600 border-green-200',
  payment_processed: 'bg-purple-50 text-purple-600 border-purple-200',
  document_verified: 'bg-orange-50 text-orange-600 border-orange-200',
  user_registered: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  vehicle_submitted: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  vehicle_approved: 'bg-green-50 text-green-600 border-green-200',
  vehicle_rejected: 'bg-red-50 text-red-600 border-red-200',
};

// Loading skeleton for activity items
const ActivityItemSkeleton: React.FC = () => (
  <div className="flex items-start space-x-3 p-4">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
    </div>
  </div>
);

// Individual activity item component
interface ActivityItemCardProps {
  item: ActivityItem;
  showTime?: boolean;
}

const ActivityItemCard: React.FC<ActivityItemCardProps> = ({ 
  item, 
  showTime = true 
}) => {
  const IconComponent = activityIcons[item.type] || ClockIcon;
  const colorClass = activityColors[item.type] || 'bg-gray-50 text-gray-600 border-gray-200';

  const formatAmount = (amount: number, currency: string): string => {
    const formatter = new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: currency === 'MWK' ? 'MWK' : 'USD',
      minimumFractionDigits: 0,
    });
    
    // For MWK, show K for thousands to save space
    if (currency === 'MWK' && amount >= 1000) {
      return `MWK ${(amount / 1000).toFixed(0)}K`;
    }
    
    return formatter.format(amount);
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border', colorClass)}>
          <IconComponent className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {item.title}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {item.userName && (
              <span className="font-medium">{item.userName}</span>
            )}
            {item.userType && (
              <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                {item.userType}
              </span>
            )}
            {showTime && (
              <span>
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </span>
            )}
          </div>
          {item.amount && item.currency && (
            <span className="text-sm font-medium text-green-600">
              {formatAmount(item.amount, item.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Error state component
const ActivityFeedError: React.FC<{ error: string }> = ({ error }) => (
  <Card className="p-6">
    <div className="text-center">
      <ClockIcon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-medium text-foreground">Failed to load activity</h3>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
    </div>
  </Card>
);

// Empty state component
const ActivityFeedEmpty: React.FC = () => (
  <Card className="p-6">
    <div className="text-center">
      <ClockIcon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-medium text-foreground">No recent activity</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Activity will appear here as it happens
      </p>
    </div>
  </Card>
);

// Main ActivityFeed component
interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  error?: string;
  title?: string;
  showTime?: boolean;
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  error,
  title = 'Recent Activity',
  showTime = true,
  maxItems,
  className
}) => {
  // Handle error state
  if (error) {
    return <ActivityFeedError error={error} />;
  }

  // Limit activities if maxItems is specified
  const displayActivities = maxItems 
    ? activities.slice(0, maxItems)
    : activities;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        {activities.length > 0 && !isLoading && (
          <p className="text-sm text-muted-foreground mt-1">
            {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        )}
      </div>
      
      <div className="divide-y divide-border">
        {isLoading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, index) => (
            <ActivityItemSkeleton key={index} />
          ))
        ) : displayActivities.length === 0 ? (
          // Empty state
          <div className="p-6">
            <ActivityFeedEmpty />
          </div>
        ) : (
          // Activity items
          displayActivities.map((item) => (
            <ActivityItemCard 
              key={item.id} 
              item={item} 
              showTime={showTime} 
            />
          ))
        )}
      </div>
      
      {/* Show more button if activities are truncated */}
      {maxItems && activities.length > maxItems && (
        <div className="px-6 py-3 bg-muted/30 border-t border-border">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View all {activities.length} activities
          </button>
        </div>
      )}
    </Card>
  );
};

// Compact version for smaller spaces
export const CompactActivityFeed: React.FC<ActivityFeedProps> = (props) => (
  <ActivityFeed 
    {...props} 
    showTime={false}
    maxItems={3}
    className={cn('text-sm', props.className)}
  />
);

// Export individual components for flexibility
export { ActivityItemCard, ActivityFeedError, ActivityFeedEmpty };

// Default export
export default ActivityFeed;