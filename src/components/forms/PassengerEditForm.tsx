/**
 * PassengerEditForm Component - Form for editing passenger information
 * Following React Hook Form patterns from design document
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
// Note: Using native HTML select elements since custom Select component is not available
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import type { 
  PassengerFormData, 
  PassengerFormProps 
} from '@/types/passenger';

/**
 * Form validation rules
 */
const validationRules = {
  firstName: {
    required: 'First name is required',
    minLength: {
      value: 2,
      message: 'First name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'First name cannot exceed 50 characters',
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  lastName: {
    required: 'Last name is required',
    minLength: {
      value: 2,
      message: 'Last name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Last name cannot exceed 50 characters',
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  phoneNumber: {
    required: 'Phone number is required',
    pattern: {
      value: /^\+265[987]\d{8}$/,
      message: 'Please enter a valid Malawian phone number (+265xxxxxxxxx)',
    },
  },
  district: {
    required: 'District is required',
  },
  city: {
    required: 'City is required',
    minLength: {
      value: 2,
      message: 'City must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'City cannot exceed 50 characters',
    },
  },
  address: {
    required: 'Address is required',
    minLength: {
      value: 5,
      message: 'Address must be at least 5 characters',
    },
    maxLength: {
      value: 200,
      message: 'Address cannot exceed 200 characters',
    },
  },
  emergencyContactName: {
    required: 'Emergency contact name is required',
    minLength: {
      value: 2,
      message: 'Contact name must be at least 2 characters',
    },
    maxLength: {
      value: 50,
      message: 'Contact name cannot exceed 50 characters',
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: 'Contact name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  emergencyContactPhone: {
    required: 'Emergency contact phone is required',
    pattern: {
      value: /^\+265[987]\d{8}$/,
      message: 'Please enter a valid Malawian phone number (+265xxxxxxxxx)',
    },
  },
  emergencyContactRelationship: {
    required: 'Emergency contact relationship is required',
    minLength: {
      value: 2,
      message: 'Relationship must be at least 2 characters',
    },
    maxLength: {
      value: 30,
      message: 'Relationship cannot exceed 30 characters',
    },
  },
} as const;

/**
 * Common relationship options
 */
const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Sibling', 
  'Spouse',
  'Child',
  'Friend',
  'Relative',
  'Colleague',
  'Other'
] as const;

/**
 * PassengerEditForm component with comprehensive validation
 */
export const PassengerEditForm: React.FC<PassengerFormProps> = ({
  passenger,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'edit'
}) => {
  // Form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    clearErrors,
    setValue,
    watch,
    reset,
  } = useForm<PassengerFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '+265',
      district: '',
      city: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '+265',
      emergencyContactRelationship: '',
    },
  });

  // Local state for UI feedback
  const [submitAttempts, setSubmitAttempts] = useState<number>(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  // Watch district changes to potentially update city suggestions
  const selectedDistrict = watch('district');

  // Stable references to prevent recreation
  const onSubmitRef = useRef(onSubmit);
  const onCancelRef = useRef(onCancel);

  // Update refs when props change
  onSubmitRef.current = onSubmit;
  onCancelRef.current = onCancel;

  // Reset form when passenger data changes
  useEffect(() => {
    if (passenger) {
      reset({
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        phoneNumber: passenger.phoneNumber,
        district: passenger.district,
        city: passenger.city,
        address: passenger.address,
        emergencyContactName: passenger.emergencyContact?.name || '',
        emergencyContactPhone: passenger.emergencyContact?.phone || '',
        emergencyContactRelationship: passenger.emergencyContact?.relationship || '',
      });
    }
  }, [passenger, reset]);

  /**
   * Form submission handler
   */
  const handleFormSubmit = useCallback(async (data: PassengerFormData) => {
    const now = Date.now();
    
    // Prevent rapid successive submissions
    if (now - lastSubmitTime < 1000) {
      return;
    }
    
    // Clear previous errors
    clearErrors();
    setLastSubmitTime(now);
    setSubmitAttempts(prev => prev + 1);
    
    try {
      await onSubmitRef.current(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while saving passenger data';
      
      // Set form-level error
      setError('root', { message: errorMessage });
      
      console.error('Passenger form error:', error);
    }
  }, [clearErrors, setError, lastSubmitTime]);


  /**
   * District change handler
   */
  const handleDistrictChange = useCallback((district: string) => {
    setValue('district', district);
    clearErrors('district');
    
    // Clear city when district changes (user might need to select appropriate city)
    if (selectedDistrict !== district) {
      setValue('city', '');
    }
  }, [setValue, clearErrors, selectedDistrict]);

  /**
   * Emergency contact relationship handler
   */
  const handleRelationshipChange = useCallback((relationship: string) => {
    setValue('emergencyContactRelationship', relationship);
    clearErrors('emergencyContactRelationship');
  }, [setValue, clearErrors]);

  /**
   * Memoized form state
   */
  const formState = useMemo(() => ({
    isSubmitting: isSubmitting || loading,
    hasErrors: Object.keys(errors).length > 0,
    canSubmit: !isSubmitting && !loading && Object.keys(errors).length === 0,
    canCancel: !isSubmitting && !loading,
    showRateLimit: submitAttempts >= 3,
    isReadOnly: mode === 'view',
    isDirty,
  }), [isSubmitting, loading, errors, mode, isDirty, submitAttempts]);

  /**
   * Memoized error messages
   */
  const errorMessages = useMemo(() => {
    const messages: string[] = [];
    
    // Collect all field validation errors
    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message && field !== 'root') {
        messages.push(error.message);
      }
    });
    
    // Add root error if present
    if (errors.root?.message) {
      messages.push(errors.root.message);
    }
    
    return messages;
  }, [errors]);

  // Don't render form in view mode if no passenger data
  if (mode === 'view' && !passenger) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No passenger data to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6">
        {/* Form Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {mode === 'create' && 'Add New Passenger'}
            {mode === 'edit' && 'Edit Passenger Information'}
            {mode === 'view' && 'Passenger Information'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'create' && 'Enter the passenger\'s personal and contact information.'}
            {mode === 'edit' && 'Update the passenger\'s personal and contact information.'}
            {mode === 'view' && 'View the passenger\'s personal and contact information.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <UserIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('firstName', validationRules.firstName)}
                  type="text"
                  id="firstName"
                  className={cn(
                    'h-10 transition-all duration-200',
                    errors.firstName
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                    formState.isReadOnly && 'bg-muted cursor-default'
                  )}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                  disabled={formState.isSubmitting || formState.isReadOnly}
                  readOnly={formState.isReadOnly}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('lastName', validationRules.lastName)}
                  type="text"
                  id="lastName"
                  className={cn(
                    'h-10 transition-all duration-200',
                    errors.lastName
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                    formState.isReadOnly && 'bg-muted cursor-default'
                  )}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                  disabled={formState.isSubmitting || formState.isReadOnly}
                  readOnly={formState.isReadOnly}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <EnvelopeIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('email', validationRules.email)}
                    type="email"
                    id="email"
                    className={cn(
                      'h-10 pl-10 transition-all duration-200',
                      errors.email
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                      formState.isReadOnly && 'bg-muted cursor-default'
                    )}
                    placeholder="passenger@example.com"
                    autoComplete="email"
                    disabled={formState.isSubmitting || formState.isReadOnly}
                    readOnly={formState.isReadOnly}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('phoneNumber', validationRules.phoneNumber)}
                    type="tel"
                    id="phoneNumber"
                    className={cn(
                      'h-10 pl-10 transition-all duration-200',
                      errors.phoneNumber
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                      formState.isReadOnly && 'bg-muted cursor-default'
                    )}
                    placeholder="+265991234567"
                    autoComplete="tel"
                    disabled={formState.isSubmitting || formState.isReadOnly}
                    readOnly={formState.isReadOnly}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <MapPinIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Location Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-medium text-foreground">
                  District <span className="text-destructive">*</span>
                </Label>
                {formState.isReadOnly ? (
                  <Input
                    value={watch('district')}
                    className="bg-muted cursor-default"
                    readOnly
                    disabled
                  />
                ) : (
                  <select
                    {...register('district', validationRules.district)}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      errors.district && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    )}
                    onChange={(e) => {
                      handleDistrictChange(e.target.value);
                    }}
                    disabled={formState.isSubmitting}
                  >
                    <option value="">Select district</option>
                    {MALAWI_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                )}
                {errors.district && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-foreground">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('city', validationRules.city)}
                  type="text"
                  id="city"
                  className={cn(
                    'h-10 transition-all duration-200',
                    errors.city
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                    formState.isReadOnly && 'bg-muted cursor-default'
                  )}
                  placeholder="Enter city"
                  autoComplete="address-level2"
                  disabled={formState.isSubmitting || formState.isReadOnly}
                  readOnly={formState.isReadOnly}
                />
                {errors.city && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-foreground">
                Full Address <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register('address', validationRules.address)}
                type="text"
                id="address"
                className={cn(
                  'h-10 transition-all duration-200',
                  errors.address
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                  formState.isReadOnly && 'bg-muted cursor-default'
                )}
                placeholder="Enter full address (Area, landmarks, etc.)"
                autoComplete="street-address"
                disabled={formState.isSubmitting || formState.isReadOnly}
                readOnly={formState.isReadOnly}
              />
              {errors.address && (
                <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <UserGroupIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">Emergency Contact</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName" className="text-sm font-medium text-foreground">
                  Contact Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('emergencyContactName', validationRules.emergencyContactName)}
                  type="text"
                  id="emergencyContactName"
                  className={cn(
                    'h-10 transition-all duration-200',
                    errors.emergencyContactName
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                    formState.isReadOnly && 'bg-muted cursor-default'
                  )}
                  placeholder="Enter contact name"
                  disabled={formState.isSubmitting || formState.isReadOnly}
                  readOnly={formState.isReadOnly}
                />
                {errors.emergencyContactName && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-foreground">
                  Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('emergencyContactPhone', validationRules.emergencyContactPhone)}
                  type="tel"
                  id="emergencyContactPhone"
                  className={cn(
                    'h-10 transition-all duration-200',
                    errors.emergencyContactPhone
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                      : 'focus:ring-primary/20 focus:border-primary hover:border-primary/50',
                    formState.isReadOnly && 'bg-muted cursor-default'
                  )}
                  placeholder="+265991234567"
                  disabled={formState.isSubmitting || formState.isReadOnly}
                  readOnly={formState.isReadOnly}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>

              {/* Emergency Contact Relationship */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium text-foreground">
                  Relationship <span className="text-destructive">*</span>
                </Label>
                {formState.isReadOnly ? (
                  <Input
                    value={watch('emergencyContactRelationship')}
                    className="bg-muted cursor-default"
                    readOnly
                    disabled
                  />
                ) : (
                  <select
                    {...register('emergencyContactRelationship', validationRules.emergencyContactRelationship)}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      errors.emergencyContactRelationship && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    )}
                    onChange={(e) => {
                      handleRelationshipChange(e.target.value);
                    }}
                    disabled={formState.isSubmitting}
                  >
                    <option value="">Select relationship</option>
                    {RELATIONSHIP_OPTIONS.map((relationship) => (
                      <option key={relationship} value={relationship}>
                        {relationship}
                      </option>
                    ))}
                  </select>
                )}
                {errors.emergencyContactRelationship && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    {errors.emergencyContactRelationship.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errorMessages.length > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4" role="alert">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Please fix the following errors:</span>
              </div>
              <div className="text-sm text-destructive/80 space-y-1">
                {errorMessages.map((message, index) => (
                  <p key={index}>• {message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Rate Limit Warning */}
          {formState.showRateLimit && (
            <div className="rounded-lg bg-secondary/20 border border-secondary/30 p-4" role="alert">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-secondary-foreground" />
                <span className="text-sm text-secondary-foreground">
                  Multiple submission attempts detected. Please wait before trying again.
                </span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {!formState.isReadOnly && (
            <div className="flex items-center gap-3 pt-6 border-t border-border">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelRef.current}
                  disabled={!formState.canCancel}
                  className="px-6"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!formState.canSubmit}
                className="px-6 min-w-[120px]"
                title={!formState.canSubmit && !formState.isSubmitting && !formState.hasErrors ? 'Make changes to enable update' : ''}
              >
                {formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </span>
                ) : (
                  <>
                    {mode === 'create' ? 'Create Passenger' : (
                      formState.isDirty ? 'Update Passenger' : 'Update Passenger (No changes)'
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

/**
 * Memoized export to prevent unnecessary re-renders
 */
export default React.memo(PassengerEditForm);