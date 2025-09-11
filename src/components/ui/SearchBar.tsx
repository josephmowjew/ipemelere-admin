/**
 * SearchBar Component - Reusable search input with debouncing
 * Following design document patterns for reusability
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className,
  initialValue = '',
  size = 'md',
  variant = 'default'
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  const handleClear = () => {
    setQuery('');
  };

  const sizeStyles = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  const inputPadding = {
    sm: 'pl-8 pr-8',
    md: 'pl-10 pr-10',
    lg: 'pl-12 pr-12'
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const iconPosition = {
    sm: 'left-2',
    md: 'left-3',
    lg: 'left-4'
  };

  const clearPosition = {
    sm: 'right-2',
    md: 'right-3',
    lg: 'right-4'
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      <MagnifyingGlassIcon 
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
          iconSize[size],
          iconPosition[size]
        )}
      />

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-input bg-background transition-colors',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeStyles[size],
          inputPadding[size],
          variant === 'minimal' && 'border-none bg-accent/50 focus:bg-background'
        )}
      />

      {/* Clear Button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
            'transition-colors rounded p-1',
            iconSize[size],
            clearPosition[size]
          )}
          aria-label="Clear search"
        >
          <XMarkIcon className={cn(iconSize[size])} />
        </button>
      )}
    </div>
  );
}

// Specialized search bars for different contexts
export function UserSearchBar({ onSearch, className, ...props }: Omit<SearchBarProps, 'placeholder'> & { onSearch: (query: string) => void }) {
  return (
    <SearchBar
      placeholder="Search users by name, email, or phone..."
      onSearch={onSearch}
      className={className}
      {...props}
    />
  );
}

export function PassengerSearchBar({ onSearch, className, ...props }: Omit<SearchBarProps, 'placeholder'> & { onSearch: (query: string) => void }) {
  return (
    <SearchBar
      placeholder="Search passengers by name, email, or phone..."
      onSearch={onSearch}
      className={className}
      {...props}
    />
  );
}

export function DriverSearchBar({ onSearch, className, ...props }: Omit<SearchBarProps, 'placeholder'> & { onSearch: (query: string) => void }) {
  return (
    <SearchBar
      placeholder="Search drivers by name, email, phone, or license..."
      onSearch={onSearch}
      className={className}
      {...props}
    />
  );
}