/**
 * Driver Registration Zod Validation Schemas
 * Comprehensive validation for the multi-step registration form
 */

import { z } from 'zod';
import {
  validateMalawiPhone,
  validateNationalId,
  validateDistrict,
  validatePassword,
  validateDateOfBirth,
  validateLicenseDates,
  validateVehicleYear,
  validateDrivingExperience,
  validateEmail,
  validatePostalCode,
} from '@/lib/utils/malawiValidation';
import { Gender, VehicleType, LicenseClass } from '@/types/registration';
import { VALIDATION_LIMITS } from '@/constants/driverRegistration';

// Step 1: Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(VALIDATION_LIMITS.name.min, `First name must be at least ${VALIDATION_LIMITS.name.min} characters`)
    .max(VALIDATION_LIMITS.name.max, `First name must not exceed ${VALIDATION_LIMITS.name.max} characters`)
    .regex(/^[A-Za-z\s]+$/, 'First name must contain only letters and spaces'),

  lastName: z
    .string()
    .min(VALIDATION_LIMITS.name.min, `Last name must be at least ${VALIDATION_LIMITS.name.min} characters`)
    .max(VALIDATION_LIMITS.name.max, `Last name must not exceed ${VALIDATION_LIMITS.name.max} characters`)
    .regex(/^[A-Za-z\s]+$/, 'Last name must contain only letters and spaces'),

  email: z
    .string()
    .min(1, 'Email is required')
    .max(VALIDATION_LIMITS.email.max, `Email must not exceed ${VALIDATION_LIMITS.email.max} characters`)
    .refine(validateEmail, {
      message: 'Invalid email format',
    }),

  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .refine(validateMalawiPhone, {
      message: 'Invalid phone number format',
    }),

  password: z
    .string()
    .min(VALIDATION_LIMITS.password.min, `Password must be at least ${VALIDATION_LIMITS.password.min} characters`)
    .max(VALIDATION_LIMITS.password.max, `Password must not exceed ${VALIDATION_LIMITS.password.max} characters`)
    .refine(validatePassword, {
      message: 'Password does not meet requirements',
    }),

  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Step 2: Identity & Address Schema
export const identityAddressSchema = z.object({
  nationalId: z
    .string()
    .min(1, 'National ID is required')
    .length(VALIDATION_LIMITS.nationalId.length, `National ID must be exactly ${VALIDATION_LIMITS.nationalId.length} characters`)
    .refine(validateNationalId, {
      message: 'Invalid national ID format',
    }),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(validateDateOfBirth, {
      message: 'Invalid date of birth',
    }),

  gender: z.nativeEnum(Gender, {
    message: 'Please select a valid gender',
  }),

  district: z
    .string()
    .min(1, 'District is required')
    .refine(validateDistrict, 'Please select a valid Malawi district'),

  city: z
    .string()
    .min(1, 'City is required')
    .max(VALIDATION_LIMITS.city.max, `City must not exceed ${VALIDATION_LIMITS.city.max} characters`),

  address: z
    .string()
    .max(VALIDATION_LIMITS.address.max, `Address must not exceed ${VALIDATION_LIMITS.address.max} characters`)
    .optional(),

  postalCode: z
    .string()
    .refine(
      (val) => !val || validatePostalCode(val),
      'Postal code must be 3-6 alphanumeric characters'
    )
    .optional(),
});

// Step 3: Driver Information Schema
export const driverInfoSchema = z.object({
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(VALIDATION_LIMITS.licenseNumber.max, `License number must not exceed ${VALIDATION_LIMITS.licenseNumber.max} characters`),

  licenseClass: z.nativeEnum(LicenseClass, {
    message: 'Please select a valid license class',
  }),

  licenseIssueDate: z
    .string()
    .min(1, 'License issue date is required'),

  licenseExpiryDate: z
    .string()
    .min(1, 'License expiry date is required'),

  drivingExperience: z
    .number({
      message: 'Driving experience must be a number',
    })
    .min(VALIDATION_LIMITS.drivingExperience.min, `Driving experience must be at least ${VALIDATION_LIMITS.drivingExperience.min} year`)
    .max(VALIDATION_LIMITS.drivingExperience.max, `Driving experience cannot exceed ${VALIDATION_LIMITS.drivingExperience.max} years`),
}).refine(
  (data) => {
    const result = validateLicenseDates(data.licenseIssueDate, data.licenseExpiryDate);
    return result.valid;
  },
  {
    message: 'Invalid license dates',
    path: ['licenseExpiryDate'],
  }
).refine(
  (data) => {
    const result = validateDrivingExperience(data.drivingExperience, data.licenseIssueDate);
    return result.valid;
  },
  {
    message: 'Driving experience is inconsistent with license issue date',
    path: ['drivingExperience'],
  }
);

// Step 4: Vehicle Information Schema
export const vehicleInfoSchema = z.object({
  make: z
    .string()
    .min(1, 'Vehicle make is required')
    .max(VALIDATION_LIMITS.vehicle.make.max, `Make must not exceed ${VALIDATION_LIMITS.vehicle.make.max} characters`),

  model: z
    .string()
    .min(1, 'Vehicle model is required')
    .max(VALIDATION_LIMITS.vehicle.model.max, `Model must not exceed ${VALIDATION_LIMITS.vehicle.model.max} characters`),

  year: z
    .number({
      message: 'Vehicle year must be a number',
    })
    .refine(validateVehicleYear, {
      message: 'Invalid vehicle year',
    }),

  color: z
    .string()
    .min(1, 'Vehicle color is required')
    .max(VALIDATION_LIMITS.vehicle.color.max, `Color must not exceed ${VALIDATION_LIMITS.vehicle.color.max} characters`),

  licensePlate: z
    .string()
    .min(1, 'License plate is required')
    .max(VALIDATION_LIMITS.vehicle.licensePlate.max, `License plate must not exceed ${VALIDATION_LIMITS.vehicle.licensePlate.max} characters`),

  vehicleType: z.nativeEnum(VehicleType, {
    message: 'Please select a valid vehicle type',
  }),

  seatingCapacity: z
    .number({
      message: 'Seating capacity must be a number',
    })
    .min(VALIDATION_LIMITS.vehicle.seatingCapacityMin, `Seating capacity must be at least ${VALIDATION_LIMITS.vehicle.seatingCapacityMin}`)
    .max(VALIDATION_LIMITS.vehicle.seatingCapacityMax, `Seating capacity cannot exceed ${VALIDATION_LIMITS.vehicle.seatingCapacityMax}`),

  vin: z
    .string()
    .max(VALIDATION_LIMITS.vehicle.vin.max, `VIN must not exceed ${VALIDATION_LIMITS.vehicle.vin.max} characters`)
    .optional(),

  engineNumber: z
    .string()
    .max(VALIDATION_LIMITS.vehicle.engineNumber.max, `Engine number must not exceed ${VALIDATION_LIMITS.vehicle.engineNumber.max} characters`)
    .optional(),
});

// Step 5: Emergency Contact Schema
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Emergency contact name is required')
    .max(VALIDATION_LIMITS.emergencyContact.name.max, `Name must not exceed ${VALIDATION_LIMITS.emergencyContact.name.max} characters`),

  phone: z
    .string()
    .min(1, 'Emergency contact phone is required')
    .refine(validateMalawiPhone, {
      message: 'Invalid phone number format',
    }),

  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(VALIDATION_LIMITS.emergencyContact.relationship.max, `Relationship must not exceed ${VALIDATION_LIMITS.emergencyContact.relationship.max} characters`),
});

// Step 6: Banking Information Schema (All Optional)
export const bankingInfoSchema = z.object({
  bankName: z
    .string()
    .max(VALIDATION_LIMITS.banking.bankName.max, `Bank name must not exceed ${VALIDATION_LIMITS.banking.bankName.max} characters`)
    .optional(),

  bankAccountNumber: z
    .string()
    .max(VALIDATION_LIMITS.banking.accountNumber.max, `Account number must not exceed ${VALIDATION_LIMITS.banking.accountNumber.max} characters`)
    .optional(),

  bankAccountHolderName: z
    .string()
    .max(VALIDATION_LIMITS.banking.accountHolderName.max, `Account holder name must not exceed ${VALIDATION_LIMITS.banking.accountHolderName.max} characters`)
    .optional(),
});

// Step 7: Agreements Schema
export const agreementsSchema = z.object({
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),

  acceptPrivacyPolicy: z
    .boolean()
    .refine((val) => val === true, 'You must accept the privacy policy'),

  acceptDriverAgreement: z
    .boolean()
    .refine((val) => val === true, 'You must accept the driver agreement'),

  backgroundCheckConsent: z
    .boolean()
    .refine((val) => val === true, 'You must consent to background check'),

  marketingOptIn: z
    .boolean()
    .optional(),
});

// Complete Registration Schema (combines all steps)
export const completeRegistrationSchema = z.object({
  personalInfo: personalInfoSchema,
  identityAddress: identityAddressSchema,
  driverInfo: driverInfoSchema,
  vehicleInfo: vehicleInfoSchema,
  emergencyContact: emergencyContactSchema,
  bankingInfo: bankingInfoSchema.optional(),
  agreements: agreementsSchema,
});

// Flattened schema for API submission (matches DriverRegistrationRequest)
export const driverRegistrationApiSchema = z.object({
  // Personal Information
  firstName: personalInfoSchema.shape.firstName,
  lastName: personalInfoSchema.shape.lastName,
  email: personalInfoSchema.shape.email,
  phoneNumber: personalInfoSchema.shape.phoneNumber,
  password: personalInfoSchema.shape.password,
  confirmPassword: personalInfoSchema.shape.confirmPassword,

  // Identity & Address
  nationalId: identityAddressSchema.shape.nationalId,
  dateOfBirth: identityAddressSchema.shape.dateOfBirth,
  gender: identityAddressSchema.shape.gender,
  district: identityAddressSchema.shape.district,
  city: identityAddressSchema.shape.city,
  address: identityAddressSchema.shape.address,
  postalCode: identityAddressSchema.shape.postalCode,

  // Driver Information
  licenseNumber: driverInfoSchema.shape.licenseNumber,
  licenseClass: driverInfoSchema.shape.licenseClass,
  licenseIssueDate: driverInfoSchema.shape.licenseIssueDate,
  licenseExpiryDate: driverInfoSchema.shape.licenseExpiryDate,
  drivingExperience: driverInfoSchema.shape.drivingExperience,

  // Vehicle Information
  vehicleInfo: vehicleInfoSchema,

  // Emergency Contact
  emergencyContactName: emergencyContactSchema.shape.name,
  emergencyContactPhone: emergencyContactSchema.shape.phone,
  emergencyContactRelationship: emergencyContactSchema.shape.relationship,

  // Banking Information
  bankName: bankingInfoSchema.shape.bankName,
  bankAccountNumber: bankingInfoSchema.shape.bankAccountNumber,
  bankAccountHolderName: bankingInfoSchema.shape.bankAccountHolderName,

  // Agreements
  acceptTerms: agreementsSchema.shape.acceptTerms,
  acceptPrivacyPolicy: agreementsSchema.shape.acceptPrivacyPolicy,
  acceptDriverAgreement: agreementsSchema.shape.acceptDriverAgreement,
  backgroundCheckConsent: agreementsSchema.shape.backgroundCheckConsent,
  marketingOptIn: agreementsSchema.shape.marketingOptIn,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Type inference from schemas
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type IdentityAddressFormData = z.infer<typeof identityAddressSchema>;
export type DriverInfoFormData = z.infer<typeof driverInfoSchema>;
export type VehicleInfoFormData = z.infer<typeof vehicleInfoSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type BankingInfoFormData = z.infer<typeof bankingInfoSchema>;
export type AgreementsFormData = z.infer<typeof agreementsSchema>;
export type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>;
export type DriverRegistrationApiData = z.infer<typeof driverRegistrationApiSchema>;
