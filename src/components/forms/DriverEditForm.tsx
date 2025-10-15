/**
 * Driver Edit Form - Form for editing driver details
 * Following form patterns from design document
 */

'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import type { Driver, DriverUpdateData } from '@/lib/api/drivers';

// Form data interface
interface DriverEditFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  district: string;
  city: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
}

interface DriverEditFormProps {
  driver: Driver;
  onSubmit: (data: DriverUpdateData) => void;
  onCancel: () => void;
  loading?: boolean;
  mode: 'edit' | 'create';
}

export function DriverEditForm({
  driver,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'edit'
}: DriverEditFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<DriverEditFormData>({
    defaultValues: {
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber || driver.phone,
      district: driver.district,
      city: driver.city,
      address: driver.address || '',
      emergencyContactName: driver.emergencyContact?.name || '',
      emergencyContactPhone: driver.emergencyContact?.phone || '',
      emergencyContactRelationship: driver.emergencyContact?.relationship || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiryDate: driver.licenseExpiryDate ? driver.licenseExpiryDate.split('T')[0] : '',
    },
  });

  const handleFormSubmit = (data: DriverEditFormData) => {
    const updateData: DriverUpdateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      district: data.district,
      city: data.city,
      address: data.address,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelationship: data.emergencyContactRelationship,
      licenseNumber: data.licenseNumber,
      licenseExpiryDate: data.licenseExpiryDate,
    };

    onSubmit(updateData);
  };


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'First name is required' })}
                className={errors.firstName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'Last name is required' })}
                className={errors.lastName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber', { required: 'Phone number is required' })}
              placeholder="+265 123 456 789"
              className={errors.phoneNumber ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Controller
                name="district"
                control={control}
                rules={{ required: 'District is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {MALAWI_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.district && (
                <p className="text-sm text-red-600">{errors.district.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city', { required: 'City is required' })}
                className={errors.city ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter full address"
              className={errors.address ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* License Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">License Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                {...register('licenseNumber')}
                placeholder="DL123456789"
                className={errors.licenseNumber ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
              <Input
                id="licenseExpiryDate"
                type="date"
                {...register('licenseExpiryDate')}
                className={errors.licenseExpiryDate ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.licenseExpiryDate && (
                <p className="text-sm text-red-600">{errors.licenseExpiryDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder="Full name"
                className={errors.emergencyContactName ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.emergencyContactName && (
                <p className="text-sm text-red-600">{errors.emergencyContactName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                {...register('emergencyContactPhone')}
                placeholder="+265 123 456 789"
                className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.emergencyContactPhone && (
                <p className="text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Controller
              name="emergencyContactRelationship"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </div>
  );
}