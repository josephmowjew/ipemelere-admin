/**
 * Driver Registration Form - Steps 3-7
 * Separated for better code organization
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { type DriverRegistrationRequest } from '@/types/registration';
import {
  VEHICLE_TYPES,
  LICENSE_CLASSES,
  EMERGENCY_CONTACT_RELATIONSHIPS,
  FIELD_HELP_TEXT,
} from '@/constants/driverRegistration';

// Step 3: Driver Information
export function Step3DriverInfo({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      {/* License Number */}
      <div className="space-y-2">
        <Label htmlFor="licenseNumber">
          License Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="licenseNumber"
          {...register('licenseNumber')}
          className={errors.licenseNumber ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.licenseNumber}</p>
        {errors.licenseNumber && (
          <p className="text-sm text-red-600">{errors.licenseNumber.message as string}</p>
        )}
      </div>

      {/* License Class */}
      <div className="space-y-2">
        <Label htmlFor="licenseClass">
          License Class <span className="text-red-500">*</span>
        </Label>
        <Select {...register('licenseClass')} className={errors.licenseClass ? 'border-red-500' : ''}>
          <option value="">Select license class</option>
          {LICENSE_CLASSES.map((license) => (
            <option key={license.value} value={license.value}>
              {license.label} - {license.description}
            </option>
          ))}
        </Select>
        {errors.licenseClass && (
          <p className="text-sm text-red-600">{errors.licenseClass.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* License Issue Date */}
        <div className="space-y-2">
          <Label htmlFor="licenseIssueDate">
            License Issue Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="licenseIssueDate"
            type="date"
            {...register('licenseIssueDate')}
            className={errors.licenseIssueDate ? 'border-red-500' : ''}
          />
          {errors.licenseIssueDate && (
            <p className="text-sm text-red-600">{errors.licenseIssueDate.message as string}</p>
          )}
        </div>

        {/* License Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="licenseExpiryDate">
            License Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="licenseExpiryDate"
            type="date"
            {...register('licenseExpiryDate')}
            className={errors.licenseExpiryDate ? 'border-red-500' : ''}
          />
          {errors.licenseExpiryDate && (
            <p className="text-sm text-red-600">{errors.licenseExpiryDate.message as string}</p>
          )}
        </div>
      </div>

      {/* Driving Experience */}
      <div className="space-y-2">
        <Label htmlFor="drivingExperience">
          Driving Experience (years) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="drivingExperience"
          type="number"
          min="1"
          max="50"
          {...register('drivingExperience', { valueAsNumber: true })}
          className={errors.drivingExperience ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.drivingExperience}</p>
        {errors.drivingExperience && (
          <p className="text-sm text-red-600">{errors.drivingExperience.message as string}</p>
        )}
      </div>
    </div>
  );
}

// Step 4: Vehicle Information
export function Step4VehicleInfo({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="make">
            Vehicle Make <span className="text-red-500">*</span>
          </Label>
          <Input
            id="make"
            placeholder="Toyota, Honda, etc."
            {...register('make')}
            className={errors.make ? 'border-red-500' : ''}
          />
          {errors.make && (
            <p className="text-sm text-red-600">{errors.make.message as string}</p>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">
            Vehicle Model <span className="text-red-500">*</span>
          </Label>
          <Input
            id="model"
            placeholder="Corolla, Civic, etc."
            {...register('model')}
            className={errors.model ? 'border-red-500' : ''}
          />
          {errors.model && (
            <p className="text-sm text-red-600">{errors.model.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Year <span className="text-red-500">*</span>
          </Label>
          <Input
            id="year"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            {...register('year', { valueAsNumber: true })}
            className={errors.year ? 'border-red-500' : ''}
          />
          {errors.year && (
            <p className="text-sm text-red-600">{errors.year.message as string}</p>
          )}
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color">
            Color <span className="text-red-500">*</span>
          </Label>
          <Input
            id="color"
            placeholder="White, Black, etc."
            {...register('color')}
            className={errors.color ? 'border-red-500' : ''}
          />
          {errors.color && (
            <p className="text-sm text-red-600">{errors.color.message as string}</p>
          )}
        </div>
      </div>

      {/* License Plate */}
      <div className="space-y-2">
        <Label htmlFor="licensePlate">
          License Plate <span className="text-red-500">*</span>
        </Label>
        <Input
          id="licensePlate"
          placeholder="MW 123 ABC"
          {...register('licensePlate')}
          className={errors.licensePlate ? 'border-red-500' : ''}
        />
        {errors.licensePlate && (
          <p className="text-sm text-red-600">{errors.licensePlate.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Type */}
        <div className="space-y-2">
          <Label htmlFor="vehicleType">
            Vehicle Type <span className="text-red-500">*</span>
          </Label>
          <Select {...register('vehicleType')} className={errors.vehicleType ? 'border-red-500' : ''}>
            <option value="">Select vehicle type</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </Select>
          {errors.vehicleType && (
            <p className="text-sm text-red-600">{errors.vehicleType.message as string}</p>
          )}
        </div>

        {/* Seating Capacity */}
        <div className="space-y-2">
          <Label htmlFor="seatingCapacity">
            Seating Capacity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="seatingCapacity"
            type="number"
            min="1"
            max="50"
            {...register('seatingCapacity', { valueAsNumber: true })}
            className={errors.seatingCapacity ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.seatingCapacity}</p>
          {errors.seatingCapacity && (
            <p className="text-sm text-red-600">{errors.seatingCapacity.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VIN (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="vin">VIN (Optional)</Label>
          <Input
            id="vin"
            placeholder="17-character VIN"
            maxLength={17}
            {...register('vin')}
            className={errors.vin ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.vin}</p>
          {errors.vin && (
            <p className="text-sm text-red-600">{errors.vin.message as string}</p>
          )}
        </div>

        {/* Engine Number (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="engineNumber">Engine Number (Optional)</Label>
          <Input
            id="engineNumber"
            {...register('engineNumber')}
            className={errors.engineNumber ? 'border-red-500' : ''}
          />
          {errors.engineNumber && (
            <p className="text-sm text-red-600">{errors.engineNumber.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 5: Emergency Contact
export function Step5EmergencyContact({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      {/* Emergency Contact Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Emergency Contact Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message as string}</p>
        )}
      </div>

      {/* Emergency Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Emergency Contact Phone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+265771234567"
          {...register('phone')}
          className={errors.phone ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.phoneNumber}</p>
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message as string}</p>
        )}
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <Label htmlFor="relationship">
          Relationship <span className="text-red-500">*</span>
        </Label>
        <Select {...register('relationship')} className={errors.relationship ? 'border-red-500' : ''}>
          <option value="">Select relationship</option>
          {EMERGENCY_CONTACT_RELATIONSHIPS.map((rel) => (
            <option key={rel.value} value={rel.value}>
              {rel.label}
            </option>
          ))}
        </Select>
        {errors.relationship && (
          <p className="text-sm text-red-600">{errors.relationship.message as string}</p>
        )}
      </div>
    </div>
  );
}

// Step 6: Banking Information (Optional)
export function Step6BankingInfo({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Optional:</strong> Provide your banking information to receive payments for completed rides.
          You can add this information later in your profile settings.
        </p>
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          placeholder="Standard Bank, NBS Bank, etc."
          {...register('bankName')}
          className={errors.bankName ? 'border-red-500' : ''}
        />
        {errors.bankName && (
          <p className="text-sm text-red-600">{errors.bankName.message as string}</p>
        )}
      </div>

      {/* Account Number */}
      <div className="space-y-2">
        <Label htmlFor="bankAccountNumber">Account Number</Label>
        <Input
          id="bankAccountNumber"
          {...register('bankAccountNumber')}
          className={errors.bankAccountNumber ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.bankAccount}</p>
        {errors.bankAccountNumber && (
          <p className="text-sm text-red-600">{errors.bankAccountNumber.message as string}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div className="space-y-2">
        <Label htmlFor="bankAccountHolderName">Account Holder Name</Label>
        <Input
          id="bankAccountHolderName"
          placeholder="Name as it appears on the account"
          {...register('bankAccountHolderName')}
          className={errors.bankAccountHolderName ? 'border-red-500' : ''}
        />
        {errors.bankAccountHolderName && (
          <p className="text-sm text-red-600">{errors.bankAccountHolderName.message as string}</p>
        )}
      </div>
    </div>
  );
}

// Step 7: Review & Agreements
export function Step7ReviewAgreements({
  formData,
  register,
  errors,
}: {
  formData: Partial<DriverRegistrationRequest>;
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Review Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{formData.phoneNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">District</p>
            <p className="font-medium">{formData.district}</p>
          </div>
          <div>
            <p className="text-muted-foreground">License Number</p>
            <p className="font-medium">{formData.licenseNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vehicle</p>
            <p className="font-medium">
              {String((formData as Record<string, unknown>).make || '')} {String((formData as Record<string, unknown>).model || '')} {(formData as Record<string, unknown>).year ? `(${(formData as Record<string, unknown>).year})` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-4">
        <h3 className="font-semibold">Terms and Agreements</h3>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptTerms"
            {...register('acceptTerms')}
            className="mt-1"
          />
          <Label htmlFor="acceptTerms" className="cursor-pointer">
            I accept the{' '}
            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
              Terms and Conditions
            </a>{' '}
            <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600 ml-6">{errors.acceptTerms.message as string}</p>
        )}

        {/* Privacy Policy */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptPrivacyPolicy"
            {...register('acceptPrivacyPolicy')}
            className="mt-1"
          />
          <Label htmlFor="acceptPrivacyPolicy" className="cursor-pointer">
            I accept the{' '}
            <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>{' '}
            <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.acceptPrivacyPolicy && (
          <p className="text-sm text-red-600 ml-6">{errors.acceptPrivacyPolicy.message as string}</p>
        )}

        {/* Driver Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptDriverAgreement"
            {...register('acceptDriverAgreement')}
            className="mt-1"
          />
          <Label htmlFor="acceptDriverAgreement" className="cursor-pointer">
            I accept the{' '}
            <a href="/driver-agreement" target="_blank" className="text-blue-600 hover:underline">
              Driver Agreement
            </a>{' '}
            <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.acceptDriverAgreement && (
          <p className="text-sm text-red-600 ml-6">{errors.acceptDriverAgreement.message as string}</p>
        )}

        {/* Background Check Consent */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="backgroundCheckConsent"
            {...register('backgroundCheckConsent')}
            className="mt-1"
          />
          <Label htmlFor="backgroundCheckConsent" className="cursor-pointer">
            I consent to a background check <span className="text-red-500">*</span>
          </Label>
        </div>
        {errors.backgroundCheckConsent && (
          <p className="text-sm text-red-600 ml-6">{errors.backgroundCheckConsent.message as string}</p>
        )}

        {/* Marketing Opt-in (Optional) */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketingOptIn"
            {...register('marketingOptIn')}
            className="mt-1"
          />
          <Label htmlFor="marketingOptIn" className="cursor-pointer">
            I want to receive promotional emails and updates (optional)
          </Label>
        </div>
      </div>
    </div>
  );
}
