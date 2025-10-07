/**
 * FilterDropdown Component - Reusable filter dropdown with multi-select support
 * Following design document patterns for composition and reusability
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showCounts?: boolean;
  searchable?: boolean;
}

export function FilterDropdown({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  label: _label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
  multiSelect = false,
  className,
  variant = 'outline',
  size = 'md',
  showCounts = false,
  searchable = false
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    !searchQuery || option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    
    return `${selectedValues.length} selected`;
  };

  const sizeStyles = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-6'
  };

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant={variant}
        size={size === 'md' ? 'default' : size}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'justify-between min-w-32',
          sizeStyles[size],
          selectedValues.length > 0 && 'text-foreground font-medium'
        )}
      >
        <span className="truncate">{getDisplayText()}</span>
        <div className="flex items-center gap-2 ml-2">
          {selectedValues.length > 0 && multiSelect && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 hover:bg-accent rounded cursor-pointer inline-flex items-center justify-center"
              aria-label="Clear all filters"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearAll();
                }
              }}
            >
              <XMarkIcon className="h-3 w-3" />
            </span>
          )}
          <ChevronDownIcon
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-48 bg-popover border border-border rounded-md shadow-lg">
          {/* Search Input (if searchable) */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded bg-background"
              />
            </div>
          )}

          {/* Header with clear all (if multiSelect) */}
          {multiSelect && selectedValues.length > 0 && (
            <div className="flex items-center justify-between p-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">
                {selectedValues.length} selected
              </span>
              <button
                onClick={handleClearAll}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 text-sm text-left',
                      'hover:bg-accent transition-colors',
                      isSelected && 'bg-accent/50',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {multiSelect && (
                        <div className={cn(
                          'h-4 w-4 border border-input rounded-sm flex items-center justify-center',
                          isSelected && 'bg-primary border-primary'
                        )}>
                          {isSelected && (
                            <CheckIcon className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                    </div>
                    
                    {showCounts && option.count !== undefined && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined filter dropdowns for common use cases
export function StatusFilter({
  selectedValues,
  onSelectionChange,
  statuses = ['active', 'inactive', 'suspended', 'pending_verification'],
  ...props
}: Omit<FilterDropdownProps, 'label' | 'options'> & {
  statuses?: string[]
}) {
  const options: FilterOption[] = statuses.map(status => ({
    value: status,
    label: status === 'pending_verification'
      ? 'Pending Verification'
      : status.charAt(0).toUpperCase() + status.slice(1)
  }));

  return (
    <FilterDropdown
      label="Status"
      options={options}
      selectedValues={selectedValues}
      onSelectionChange={onSelectionChange}
      placeholder="All statuses"
      multiSelect
      {...props}
    />
  );
}

export function DistrictFilter({ 
  selectedValues, 
  onSelectionChange, 
  districts = ['Blantyre', 'Lilongwe', 'Mzuzu', 'Zomba', 'Kasungu'],
  ...props 
}: Omit<FilterDropdownProps, 'label' | 'options'> & { 
  districts?: string[]
}) {
  const options: FilterOption[] = districts.map(district => ({
    value: district,
    label: district
  }));

  return (
    <FilterDropdown
      label="District"
      options={options}
      selectedValues={selectedValues}
      onSelectionChange={onSelectionChange}
      placeholder="All districts"
      multiSelect
      searchable
      {...props}
    />
  );
}