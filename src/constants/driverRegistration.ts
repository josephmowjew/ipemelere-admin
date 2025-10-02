/**
 * Driver Registration Constants
 * Centralized configuration for driver registration forms and workflows
 */

import { VehicleType, LicenseClass, ApplicationStatus, DocumentStatus } from '@/types/registration';

// Vehicle types with labels
export const VEHICLE_TYPES = [
  { value: VehicleType.SEDAN, label: 'Sedan', description: 'Standard 4-door passenger car' },
  { value: VehicleType.HATCHBACK, label: 'Hatchback', description: 'Compact car with rear door' },
  { value: VehicleType.SUV, label: 'SUV', description: 'Sport Utility Vehicle' },
  { value: VehicleType.MINIBUS, label: 'Minibus', description: 'Small passenger bus (8-20 seats)' },
  { value: VehicleType.MOTORCYCLE, label: 'Motorcycle', description: 'Two-wheeled motor vehicle' },
  { value: VehicleType.PICKUP, label: 'Pickup', description: 'Truck with open cargo area' },
] as const;

// License classes with labels
export const LICENSE_CLASSES = [
  { value: LicenseClass.A, label: 'Class A', description: 'Motorcycles and motor tricycles' },
  { value: LicenseClass.B, label: 'Class B', description: 'Light motor vehicles (cars, light trucks)' },
  { value: LicenseClass.C, label: 'Class C', description: 'Medium motor vehicles (trucks, buses)' },
  { value: LicenseClass.D, label: 'Class D', description: 'Heavy motor vehicles (heavy trucks, buses)' },
  { value: LicenseClass.E, label: 'Class E', description: 'Articulated vehicles (semi-trailers, truck-trailers)' },
] as const;

// Emergency contact relationships
export const EMERGENCY_CONTACT_RELATIONSHIPS = [
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
] as const;

// Required document types
export const REQUIRED_DOCUMENT_TYPES = [
  { type: 'national_id', label: 'National ID', description: 'Valid Malawi national ID card' },
  { type: 'driver_license', label: 'Driver License', description: 'Valid Malawi driver\'s license (front and back)' },
  { type: 'vehicle_registration', label: 'Vehicle Registration', description: 'Valid vehicle registration certificate' },
  { type: 'vehicle_insurance', label: 'Vehicle Insurance', description: 'Current vehicle insurance certificate' },
  { type: 'profile_picture', label: 'Profile Picture', description: 'Professional headshot photo' },
] as const;

// Application status labels and descriptions
export const APPLICATION_STATUS_CONFIG = {
  [ApplicationStatus.PENDING_DOCUMENTS]: {
    label: 'Pending Documents',
    description: 'Driver needs to upload required documents',
    color: 'yellow',
    icon: 'DocumentIcon',
  },
  [ApplicationStatus.DOCUMENTS_REJECTED]: {
    label: 'Documents Rejected',
    description: 'One or more documents were rejected',
    color: 'red',
    icon: 'XCircleIcon',
  },
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    description: 'Admin is reviewing the application',
    color: 'blue',
    icon: 'ClockIcon',
  },
  [ApplicationStatus.PENDING_APPROVAL]: {
    label: 'Pending Approval',
    description: 'Final approval stage',
    color: 'yellow',
    icon: 'ExclamationCircleIcon',
  },
  [ApplicationStatus.APPROVED]: {
    label: 'Approved',
    description: 'Application approved, driver can start',
    color: 'green',
    icon: 'CheckCircleIcon',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    description: 'Application rejected',
    color: 'red',
    icon: 'XCircleIcon',
  },
} as const;

// Document status labels and colors
export const DOCUMENT_STATUS_CONFIG = {
  [DocumentStatus.PENDING]: {
    label: 'Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  [DocumentStatus.VERIFIED]: {
    label: 'Verified',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  [DocumentStatus.REJECTED]: {
    label: 'Rejected',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  [DocumentStatus.MISSING]: {
    label: 'Missing',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
} as const;

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  maxSizeMB: 5,
  acceptedTypes: {
    images: ['image/jpeg', 'image/jpg', 'image/png'],
    documents: ['application/pdf'],
    all: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  },
  acceptedExtensions: {
    images: ['.jpg', '.jpeg', '.png'],
    documents: ['.pdf'],
    all: ['.jpg', '.jpeg', '.png', '.pdf'],
  },
} as const;

// Multi-step form configuration
export const REGISTRATION_STEPS = [
  {
    step: 1,
    title: 'Personal Information',
    description: 'Basic personal details',
    fields: ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword'],
  },
  {
    step: 2,
    title: 'Identity & Address',
    description: 'National ID and address information',
    fields: ['nationalId', 'dateOfBirth', 'gender', 'district', 'city', 'address', 'postalCode'],
  },
  {
    step: 3,
    title: 'Driver Information',
    description: 'License and driving experience',
    fields: ['licenseNumber', 'licenseClass', 'licenseIssueDate', 'licenseExpiryDate', 'drivingExperience'],
  },
  {
    step: 4,
    title: 'Vehicle Information',
    description: 'Vehicle details',
    fields: ['make', 'model', 'year', 'color', 'licensePlate', 'vehicleType', 'seatingCapacity', 'vin', 'engineNumber'],
  },
  {
    step: 5,
    title: 'Emergency Contact',
    description: 'Emergency contact information',
    fields: ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'],
  },
  {
    step: 6,
    title: 'Banking Information',
    description: 'Optional payment details',
    fields: ['bankName', 'bankAccountNumber', 'bankAccountHolderName'],
  },
  {
    step: 7,
    title: 'Review & Submit',
    description: 'Review and accept agreements',
    fields: ['acceptTerms', 'acceptPrivacyPolicy', 'acceptDriverAgreement', 'backgroundCheckConsent', 'marketingOptIn'],
  },
] as const;

// Validation limits
export const VALIDATION_LIMITS = {
  name: {
    min: 2,
    max: 50,
  },
  email: {
    max: 100,
  },
  nationalId: {
    length: 8,
  },
  licenseNumber: {
    max: 50,
  },
  phoneNumber: {
    length: 13, // +265XXXXXXXXX
  },
  password: {
    min: 8,
    max: 100,
  },
  city: {
    max: 100,
  },
  address: {
    max: 200,
  },
  postalCode: {
    min: 3,
    max: 6,
  },
  vehicle: {
    make: { max: 50 },
    model: { max: 50 },
    color: { max: 30 },
    licensePlate: { max: 20 },
    vin: { max: 17 },
    engineNumber: { max: 50 },
    yearMin: 1990,
    yearMax: new Date().getFullYear() + 1,
    seatingCapacityMin: 1,
    seatingCapacityMax: 50,
  },
  drivingExperience: {
    min: 1,
    max: 50,
  },
  emergencyContact: {
    name: { max: 100 },
    phone: { length: 13 },
    relationship: { max: 50 },
  },
  banking: {
    bankName: { max: 100 },
    accountNumber: { max: 50 },
    accountHolderName: { max: 100 },
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid Malawi phone number (+265XXXXXXXXX)',
  invalidNationalId: 'National ID must be 8 alphanumeric characters',
  invalidPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  passwordMismatch: 'Passwords do not match',
  invalidDate: 'Please enter a valid date',
  minAge: 'You must be at least 18 years old',
  invalidDistrict: 'Please select a valid Malawi district',
  invalidVehicleYear: 'Vehicle year must be between 1990 and current year + 1',
  invalidLicenseDates: 'License dates are invalid',
  licenseExpired: 'License has expired',
  fileTooLarge: 'File size must not exceed 5MB',
  invalidFileType: 'Only JPG, PNG, and PDF files are allowed',
  networkError: 'Network error occurred. Please check your connection and try again',
  serverError: 'Server error occurred. Please try again later',
  duplicateEmail: 'An account with this email already exists',
  duplicateLicense: 'A driver with this license number already exists',
  duplicatePhone: 'An account with this phone number already exists',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  registrationComplete: 'Driver registration completed successfully!',
  documentUploaded: 'Document uploaded successfully',
  applicationApproved: 'Application approved successfully',
  applicationRejected: 'Application rejected',
  phoneVerificationSent: 'Verification code sent to your phone',
  phoneVerified: 'Phone number verified successfully',
  emailVerified: 'Email verified successfully',
} as const;

// API endpoints (relative to base URL)
export const REGISTRATION_ENDPOINTS = {
  register: '/auth/register/driver',
  uploadLicense: (driverId: number) => `/auth/register/driver/${driverId}/upload-license`,
  uploadVehicleDocs: (driverId: number) => `/auth/register/driver/${driverId}/upload-vehicle-documents`,
  status: (driverId: number) => `/auth/register/driver/${driverId}/status`,
  sendPhoneVerification: '/auth/send-phone-verification',
  verifyPhone: '/auth/verify-phone',
  verificationStatus: (userId: number) => `/auth/verification-status/${userId}`,
  registrationStatus: (userId: number) => `/auth/registration-status/${userId}`,
} as const;

// Admin endpoints for registration management
export const ADMIN_REGISTRATION_ENDPOINTS = {
  applications: '/admin/drivers/registration/applications',
  applicationDetail: (applicationId: number) => `/admin/drivers/registration/applications/${applicationId}`,
  approve: (applicationId: number) => `/admin/drivers/registration/applications/${applicationId}/approve`,
  reject: (applicationId: number) => `/admin/drivers/registration/applications/${applicationId}/reject`,
  requestChanges: (applicationId: number) => `/admin/drivers/registration/applications/${applicationId}/request-changes`,
} as const;

// Help text for form fields
export const FIELD_HELP_TEXT = {
  phoneNumber: 'Malawi phone number format: +265 followed by 9 digits (e.g., +265771234567)',
  nationalId: 'Your national ID number (8 alphanumeric characters)',
  password: 'Must be at least 8 characters with uppercase, lowercase, number, and special character',
  licenseNumber: 'Your Malawi driver\'s license number',
  vin: 'Vehicle Identification Number (optional, 17 characters)',
  seatingCapacity: 'Number of passenger seats (excluding driver)',
  drivingExperience: 'Years of driving experience',
  bankAccount: 'Optional: For receiving payments from rides',
} as const;

// Local storage keys for form data persistence
export const LOCAL_STORAGE_KEYS = {
  registrationForm: 'driver_registration_form_data',
  registrationStep: 'driver_registration_current_step',
} as const;
