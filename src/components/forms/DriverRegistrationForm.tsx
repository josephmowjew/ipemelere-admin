/**
 * Multi-Step Driver Registration Form
 * Complete 7-step wizard for driver registration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { RegistrationProgressBar } from '@/components/registration/RegistrationProgressBar';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import {
  personalInfoSchema,
  identityAddressSchema,
  driverInfoSchema,
  vehicleInfoSchema,
  emergencyContactSchema,
  bankingInfoSchema,
  agreementsSchema,
} from '@/lib/validations/driverRegistration';
import {
  Gender,
  LicenseClass,
  VehicleType,
  type DriverRegistrationRequest,
} from '@/types/registration';
import {
  REGISTRATION_STEPS,
  LOCAL_STORAGE_KEYS,
  FIELD_HELP_TEXT,
} from '@/constants/driverRegistration';
import { MALAWI_DISTRICTS } from '@/lib/api/types';
import {
  Step3DriverInfo,
  Step4VehicleInfo,
  Step5EmergencyContact,
  Step6BankingInfo,
  Step7ReviewAgreements,
} from './DriverRegistrationFormSteps';

interface DriverRegistrationFormProps {
  onSubmit: (data: DriverRegistrationRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<DriverRegistrationRequest>;
}

export function DriverRegistrationForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: DriverRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DriverRegistrationRequest>>(
    initialData || {}
  );

  const totalSteps = REGISTRATION_STEPS.length;

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEYS.registrationForm);
    const savedStep = localStorage.getItem(LOCAL_STORAGE_KEYS.registrationStep);

    if (savedData && !initialData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }

    if (savedStep) {
      try {
        setCurrentStep(parseInt(savedStep));
      } catch (error) {
        console.error('Failed to load saved step:', error);
      }
    }
  }, [initialData]);

  // Save form data to localStorage
  const saveFormData = (data: Record<string, unknown>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    localStorage.setItem(LOCAL_STORAGE_KEYS.registrationForm, JSON.stringify(updatedData));
    localStorage.setItem(LOCAL_STORAGE_KEYS.registrationStep, currentStep.toString());
  };

  // Clear saved form data
  const clearSavedData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.registrationForm);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.registrationStep);
  };

  // Get current step schema
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return personalInfoSchema;
      case 2:
        return identityAddressSchema;
      case 3:
        return driverInfoSchema;
      case 4:
        return vehicleInfoSchema;
      case 5:
        return emergencyContactSchema;
      case 6:
        return bankingInfoSchema;
      case 7:
        return agreementsSchema;
      default:
        return personalInfoSchema;
    }
  };

  // Initialize form for current step
  const form = useForm({
    resolver: zodResolver(getCurrentSchema()),
    mode: 'onChange',
    defaultValues: getStepDefaultValues(currentStep, formData),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  // Handle step navigation
  const handleNext = handleSubmit((data) => {
    saveFormData(data);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = handleSubmit((data) => {
    // Merge all form data
    const mergedData = {
      ...formData,
      ...data,
    } as Record<string, unknown>;

    // Transform the data to match backend expectations
    const finalData: DriverRegistrationRequest = {
      // Personal Info (Step 1)
      firstName: mergedData.firstName as string,
      lastName: mergedData.lastName as string,
      email: mergedData.email as string,
      phoneNumber: mergedData.phoneNumber as string,
      password: mergedData.password as string,
      confirmPassword: mergedData.confirmPassword as string,

      // Identity & Address (Step 2)
      nationalId: mergedData.nationalId as string,
      dateOfBirth: mergedData.dateOfBirth as string,
      gender: mergedData.gender as Gender,
      district: mergedData.district as string,
      city: mergedData.city as string,
      address: mergedData.address as string | undefined,
      postalCode: mergedData.postalCode as string | undefined,

      // Driver Info (Step 3)
      licenseNumber: mergedData.licenseNumber as string,
      licenseClass: mergedData.licenseClass as LicenseClass,
      licenseIssueDate: mergedData.licenseIssueDate as string,
      licenseExpiryDate: mergedData.licenseExpiryDate as string,
      drivingExperience: mergedData.drivingExperience as number,

      // Vehicle Info (Step 4) - nest in vehicleInfo object
      vehicleInfo: {
        make: mergedData.make as string,
        model: mergedData.model as string,
        year: mergedData.year as number,
        color: mergedData.color as string,
        licensePlate: mergedData.licensePlate as string,
        vehicleType: mergedData.vehicleType as VehicleType,
        seatingCapacity: mergedData.seatingCapacity as number,
        vin: mergedData.vin as string | undefined,
        engineNumber: mergedData.engineNumber as string | undefined,
      },

      // Emergency Contact (Step 5) - use proper field names
      emergencyContactName: mergedData.name as string,
      emergencyContactPhone: mergedData.phone as string,
      emergencyContactRelationship: mergedData.relationship as string,

      // Banking Info (Step 6) - optional
      bankName: mergedData.bankName as string | undefined,
      bankAccountNumber: mergedData.bankAccountNumber as string | undefined,
      bankAccountHolderName: mergedData.bankAccountHolderName as string | undefined,

      // Agreements (Step 7)
      acceptTerms: mergedData.acceptTerms as boolean,
      acceptPrivacyPolicy: mergedData.acceptPrivacyPolicy as boolean,
      acceptDriverAgreement: mergedData.acceptDriverAgreement as boolean,
      backgroundCheckConsent: mergedData.backgroundCheckConsent as boolean,
      marketingOptIn: mergedData.marketingOptIn as boolean | undefined,
    };

    clearSavedData();
    onSubmit(finalData);
  });

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo register={register} errors={errors} />;
      case 2:
        return <Step2IdentityAddress register={register} errors={errors} control={control} />;
      case 3:
        return <Step3DriverInfo register={register} errors={errors} control={control} />;
      case 4:
        return <Step4VehicleInfo register={register} errors={errors} control={control} />;
      case 5:
        return <Step5EmergencyContact register={register} errors={errors} control={control} />;
      case 6:
        return <Step6BankingInfo register={register} errors={errors} />;
      case 7:
        return <Step7ReviewAgreements formData={formData} register={register} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <RegistrationProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          showPercentage={true}
        />
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-foreground">
            {REGISTRATION_STEPS[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {REGISTRATION_STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <form className="space-y-6">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleFinalSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// Step Components

// Step 1: Personal Information
function Step1PersonalInfo({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName.message as string}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName.message as string}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message as string}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+265771234567"
          {...register('phoneNumber')}
          className={errors.phoneNumber ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.phoneNumber}</p>
        {errors.phoneNumber && (
          <p className="text-sm text-red-600">{errors.phoneNumber.message as string}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.password}</p>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message as string}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword.message as string}</p>
        )}
      </div>
    </div>
  );
}

// Step 2: Identity & Address
function Step2IdentityAddress({
  register,
  errors,
  control,
}: {
  register: ReturnType<typeof useForm>['register'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
  control: ReturnType<typeof useForm>['control'];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* National ID */}
        <div className="space-y-2">
          <Label htmlFor="nationalId">
            National ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nationalId"
            placeholder="AB123456"
            {...register('nationalId')}
            className={errors.nationalId ? 'border-red-500' : ''}
            maxLength={8}
          />
          <p className="text-xs text-muted-foreground">{FIELD_HELP_TEXT.nationalId}</p>
          {errors.nationalId && (
            <p className="text-sm text-red-600">{errors.nationalId.message as string}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className={errors.dateOfBirth ? 'border-red-500' : ''}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message as string}</p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label htmlFor="gender">
          Gender <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>Male</SelectItem>
                <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                <SelectItem value={Gender.OTHER}>Other</SelectItem>
                <SelectItem value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-sm text-red-600">{errors.gender.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district">
            District <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
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
            <p className="text-sm text-red-600">{errors.district.message as string}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            {...register('city')}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message as string}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Street address, area, landmarks..."
          className={errors.address ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address.message as string}</p>
        )}
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          placeholder="P.O. Box or postal code"
          {...register('postalCode')}
          className={errors.postalCode ? 'border-red-500' : ''}
        />
        {errors.postalCode && (
          <p className="text-sm text-red-600">{errors.postalCode.message as string}</p>
        )}
      </div>
    </div>
  );
}

// Helper function to get default values for each step
function getStepDefaultValues(
  step: number,
  formData: Partial<DriverRegistrationRequest>
): Record<string, unknown> {
  switch (step) {
    case 1:
      return {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || '',
        password: formData.password || '',
        confirmPassword: formData.confirmPassword || '',
      };
    case 2:
      return {
        nationalId: formData.nationalId || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        district: formData.district || '',
        city: formData.city || '',
        address: formData.address || '',
        postalCode: formData.postalCode || '',
      };
    case 3:
      return {
        licenseNumber: formData.licenseNumber || '',
        licenseClass: formData.licenseClass || '',
        licenseIssueDate: formData.licenseIssueDate || '',
        licenseExpiryDate: formData.licenseExpiryDate || '',
        drivingExperience: formData.drivingExperience || 1,
      };
    case 4:
      return {
        make: formData.vehicleInfo?.make || '',
        model: formData.vehicleInfo?.model || '',
        year: formData.vehicleInfo?.year || new Date().getFullYear(),
        color: formData.vehicleInfo?.color || '',
        licensePlate: formData.vehicleInfo?.licensePlate || '',
        vehicleType: formData.vehicleInfo?.vehicleType || '',
        seatingCapacity: formData.vehicleInfo?.seatingCapacity || 4,
        vin: formData.vehicleInfo?.vin || '',
        engineNumber: formData.vehicleInfo?.engineNumber || '',
      };
    case 5:
      return {
        name: formData.emergencyContactName || '',
        phone: formData.emergencyContactPhone || '',
        relationship: formData.emergencyContactRelationship || '',
      };
    case 6:
      return {
        bankName: formData.bankName || '',
        bankAccountNumber: formData.bankAccountNumber || '',
        bankAccountHolderName: formData.bankAccountHolderName || '',
      };
    case 7:
      return {
        acceptTerms: formData.acceptTerms || false,
        acceptPrivacyPolicy: formData.acceptPrivacyPolicy || false,
        acceptDriverAgreement: formData.acceptDriverAgreement || false,
        backgroundCheckConsent: formData.backgroundCheckConsent || false,
        marketingOptIn: formData.marketingOptIn || false,
      };
    default:
      return {};
  }
}

// Continuing with Step 3 in the next message due to length...
