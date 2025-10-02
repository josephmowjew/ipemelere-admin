/**
 * Driver Registration Types
 * Based on Ipemelere Driver Registration Frontend Guide
 */

// Enums for driver registration
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum VehicleType {
  SEDAN = 'sedan',
  HATCHBACK = 'hatchback',
  SUV = 'suv',
  MINIBUS = 'minibus',
  MOTORCYCLE = 'motorcycle',
  PICKUP = 'pickup'
}

export enum LicenseClass {
  A = 'A',  // Motorcycle
  B = 'B',  // Light vehicles
  C = 'C',  // Medium vehicles
  D = 'D',  // Heavy vehicles
  E = 'E'   // Articulated vehicles
}

export enum ApplicationStatus {
  PENDING_DOCUMENTS = 'pending_documents',
  DOCUMENTS_REJECTED = 'documents_rejected',
  UNDER_REVIEW = 'under_review',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  MISSING = 'missing'
}

// Vehicle information interface
export interface VehicleInfo {
  make: string;                    // Max 50 chars
  model: string;                   // Max 50 chars
  year: number;                    // 1990 to current year + 1
  color: string;                   // Max 30 chars
  licensePlate: string;            // Max 20 chars
  vehicleType: VehicleType;
  seatingCapacity: number;         // 1-50
  vin?: string;                    // Max 17 chars, optional
  engineNumber?: string;           // Max 50 chars, optional
}

// Driver registration request (what we send to the backend)
export interface DriverRegistrationRequest {
  // Personal Information
  firstName: string;               // 2-50 chars, letters and spaces only
  lastName: string;                // 2-50 chars, letters and spaces only
  email: string;                   // Valid email format
  phoneNumber: string;             // Malawi format: +265XXXXXXXXX
  password: string;                // Min 8 chars, must include uppercase, lowercase, number, special char
  confirmPassword: string;         // Must match password
  nationalId: string;              // Malawi format: 8 alphanumeric chars
  dateOfBirth: string;             // ISO date format: YYYY-MM-DD
  gender: Gender;

  // Address Information
  district: string;                // Must be valid Malawi district
  city?: string;                   // Max 100 chars, optional
  address?: string;                // Max 200 chars, optional
  postalCode?: string;             // Malawi format, 3-6 alphanumeric, optional

  // License Information
  licenseNumber: string;           // Max 50 chars
  licenseClass: LicenseClass;
  licenseIssueDate: string;        // ISO date format: YYYY-MM-DD
  licenseExpiryDate: string;       // ISO date format: YYYY-MM-DD
  drivingExperience: number;       // 1-50 years

  // Vehicle Information
  vehicleInfo: VehicleInfo;

  // Emergency Contact
  emergencyContactName: string;    // Max 100 chars
  emergencyContactPhone: string;   // Malawi format: +265XXXXXXXXX
  emergencyContactRelationship: string; // Max 50 chars

  // Banking Information (Optional)
  bankName?: string;               // Max 100 chars
  bankAccountNumber?: string;      // Max 50 chars
  bankAccountHolderName?: string;  // Max 100 chars

  // Agreements (All Required)
  acceptTerms: boolean;            // Must be true
  acceptPrivacyPolicy: boolean;    // Must be true
  acceptDriverAgreement: boolean;  // Must be true
  backgroundCheckConsent: boolean; // Must be true
  marketingOptIn?: boolean;        // Optional
}

// Driver registration response (what we get from the backend)
export interface DriverRegistrationResponse {
  success: boolean;
  userId: number;
  driverId: number;
  message: string;
  applicationStatus: ApplicationStatus;
  requiredDocuments: string[];
  nextSteps: string[];
  estimatedVerificationTime: string;
}

// Document status for each required document type
export interface DocumentsStatus {
  nationalId: DocumentStatus;
  driverLicense: DocumentStatus;
  vehicleRegistration: DocumentStatus;
  vehicleInsurance: DocumentStatus;
  profilePicture: DocumentStatus;
}

// Application status response
export interface RegistrationApplicationStatus {
  applicationId: number;
  status: ApplicationStatus;
  statusDescription: string;
  documentsStatus: DocumentsStatus;
  missingDocuments: string[];
  nextSteps: string[];
  lastUpdated: string;
  progressPercentage: number;
  estimatedApprovalTime: string;
  contactInfo: {
    supportEmail: string;
    supportPhone: string;
    workingHours: string;
  };
}

// Verification status response
export interface VerificationStatusResponse {
  emailVerified: boolean;
  phoneVerified: boolean;
  documentsVerified: boolean;
  canActivate: boolean;
  nextSteps: string[];
}

// Comprehensive registration status
export interface ComprehensiveRegistrationStatus {
  userId: number;
  registrationStatus: 'in_progress' | 'completed' | 'rejected';
  registrationProgress: number;
  completedSteps: string[];
  pendingSteps: string[];
  nextSteps: string[];
  verificationStatus: {
    email: {
      status: 'verified' | 'pending' | 'failed';
      verifiedAt: string | null;
      canResend: boolean;
    };
    phone: {
      status: 'verified' | 'pending' | 'failed';
      verifiedAt: string | null;
      canResend: boolean;
    };
    documents: {
      status: 'verified' | 'pending' | 'rejected';
      verifiedAt: string | null;
      requiredDocuments: string[];
      uploadedDocuments: string[];
      missingDocuments: string[];
    };
  };
  canProceed: boolean;
  estimatedCompletionTime: string;
}

// Registration application list item (for admin dashboard)
export interface RegistrationApplicationListItem {
  applicationId: number;
  driverId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  district: string;
  city?: string;
  status: ApplicationStatus;
  progressPercentage: number;
  submittedAt: string;
  lastUpdated: string;
  documentsStatus: DocumentsStatus;
  missingDocumentsCount: number;
  canApprove: boolean;
  canReject: boolean;
}

// Phone verification request
export interface PhoneVerificationRequest {
  userId: number;
}

// Phone verification response
export interface PhoneVerificationResponse {
  success: boolean;
  message: string;
  userId: number;
}

// Phone verification code request
export interface PhoneVerificationCodeRequest {
  userId: number;
  code: string;
}

// Phone verification code response
export interface PhoneVerificationCodeResponse {
  success: boolean;
  message: string;
  userId: number;
  phoneVerified: boolean;
}

// Document upload response
export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  fileInfo: {
    originalName: string;
    filename: string;
    size: number;
    uploadedAt: string;
  };
}

// Vehicle document upload response
export interface VehicleDocumentUploadResponse {
  success: boolean;
  message: string;
  documents: Array<{
    id: number;
    documentType: 'vehicle_registration' | 'vehicle_insurance';
    status: DocumentStatus;
    fileName: string;
    uploadedAt: string;
  }>;
  vehicleStatus: string;
}

// Application approval/rejection request
export interface ApplicationReviewRequest {
  action: 'approve' | 'reject';
  reason?: string;
  notes?: string;
}

// Application approval/rejection response
export interface ApplicationReviewResponse {
  success: boolean;
  message: string;
  applicationId: number;
  newStatus: ApplicationStatus;
  updatedAt: string;
}

// Form data for multi-step wizard (internal state)
export interface DriverRegistrationFormData {
  // Step 1: Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  };

  // Step 2: Identity & Address
  identityAddress: {
    nationalId: string;
    dateOfBirth: string;
    gender: Gender;
    district: string;
    city: string;
    address?: string;
    postalCode?: string;
  };

  // Step 3: Driver Information
  driverInfo: {
    licenseNumber: string;
    licenseClass: LicenseClass;
    licenseIssueDate: string;
    licenseExpiryDate: string;
    drivingExperience: number;
  };

  // Step 4: Vehicle Information
  vehicleInfo: VehicleInfo;

  // Step 5: Emergency Contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  // Step 6: Banking Information (Optional)
  bankingInfo?: {
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolderName?: string;
  };

  // Step 7: Agreements
  agreements: {
    acceptTerms: boolean;
    acceptPrivacyPolicy: boolean;
    acceptDriverAgreement: boolean;
    backgroundCheckConsent: boolean;
    marketingOptIn?: boolean;
  };
}
