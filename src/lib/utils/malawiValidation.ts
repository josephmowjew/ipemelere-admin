/**
 * Malawi-Specific Validation Utilities
 * Based on Ipemelere Driver Registration Frontend Guide
 */

// Valid Malawi phone number prefixes (after +265)
const VALID_PHONE_PREFIXES = ['77', '88', '99', '01'];

/**
 * Validate Malawi phone number format
 * Format: +265XXXXXXXXX (13 characters total)
 * Valid prefixes: 77, 88, 99, 01
 *
 * Examples:
 * - ✅ +265771234567
 * - ✅ +265881234567
 * - ✅ +265991234567
 * - ✅ +265012345678
 * - ❌ +265661234567 (invalid prefix)
 * - ❌ 0771234567 (missing country code)
 */
export const validateMalawiPhone = (phone: string): boolean => {
  // Check basic format: +265 followed by 9 digits
  const phonePattern = /^\+265[0-9]{9}$/;
  if (!phonePattern.test(phone)) {
    return false;
  }

  // Extract prefix (2 digits after +265)
  const prefix = phone.substring(4, 6);

  // Check if prefix is valid
  return VALID_PHONE_PREFIXES.includes(prefix);
};

/**
 * Get detailed phone validation error message
 */
export const getMalawiPhoneError = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }

  if (!phone.startsWith('+265')) {
    return 'Phone number must start with +265';
  }

  const phonePattern = /^\+265[0-9]{9}$/;
  if (!phonePattern.test(phone)) {
    if (phone.length !== 13) {
      return 'Phone number must be exactly 13 characters (+265 followed by 9 digits)';
    }
    return 'Phone number must contain only digits after +265';
  }

  const prefix = phone.substring(4, 6);
  if (!VALID_PHONE_PREFIXES.includes(prefix)) {
    return `Invalid prefix ${prefix}. Valid prefixes are: ${VALID_PHONE_PREFIXES.join(', ')}`;
  }

  return null;
};

/**
 * Format phone number for display
 * Converts +265771234567 to +265 77 123 4567
 */
export const formatMalawiPhone = (phone: string): string => {
  if (!phone || phone.length !== 13) {
    return phone;
  }

  return `${phone.substring(0, 4)} ${phone.substring(4, 6)} ${phone.substring(6, 9)} ${phone.substring(9)}`;
};

/**
 * Validate Malawi National ID format
 * Format: 8 alphanumeric characters (letters and numbers)
 *
 * Examples:
 * - ✅ AB123456
 * - ✅ CD789012
 * - ❌ AB12345 (too short)
 * - ❌ ABC123456 (too long)
 * - ❌ AB-12345 (special characters not allowed)
 */
export const validateNationalId = (id: string): boolean => {
  const idPattern = /^[A-Za-z0-9]{8}$/;
  return idPattern.test(id);
};

/**
 * Get detailed national ID validation error message
 */
export const getNationalIdError = (id: string): string | null => {
  if (!id) {
    return 'National ID is required';
  }

  if (id.length !== 8) {
    return 'National ID must be exactly 8 characters';
  }

  const idPattern = /^[A-Za-z0-9]{8}$/;
  if (!idPattern.test(id)) {
    return 'National ID must contain only letters and numbers';
  }

  return null;
};

/**
 * Validate Malawi district
 * Must be one of the 26 valid districts
 */
const MALAWI_DISTRICTS = [
  // Northern Region
  'Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi',
  // Central Region
  'Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota',
  'Ntcheu', 'Ntchisi', 'Salima',
  // Southern Region
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi',
  'Mwanza', 'Neno', 'Nsanje', 'Thyolo', 'Zomba'
];

export const validateDistrict = (district: string): boolean => {
  return MALAWI_DISTRICTS.includes(district);
};

export const getMalawiDistricts = (): string[] => {
  return [...MALAWI_DISTRICTS];
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 *
 * Examples:
 * - ✅ SecurePass123!
 * - ✅ MyP@ssw0rd
 * - ❌ password (no uppercase, number, or special char)
 * - ❌ Pass123 (too short)
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

/**
 * Get detailed password validation error message
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const missing: string[] = [];
  if (!hasUppercase) missing.push('one uppercase letter');
  if (!hasLowercase) missing.push('one lowercase letter');
  if (!hasNumber) missing.push('one number');
  if (!hasSpecial) missing.push('one special character (@$!%*?&)');

  if (missing.length > 0) {
    return `Password must include ${missing.join(', ')}`;
  }

  return null;
};

/**
 * Get password strength score (0-4)
 * 0: Very weak
 * 1: Weak
 * 2: Fair
 * 3: Good
 * 4: Strong
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;

  return Math.min(strength, 4);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[strength] || 'Very Weak';
};

/**
 * Validate date of birth (must be at least 18 years old)
 */
export const validateDateOfBirth = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

/**
 * Get date of birth validation error
 */
export const getDateOfBirthError = (dateOfBirth: string): string | null => {
  if (!dateOfBirth) {
    return 'Date of birth is required';
  }

  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) {
    return 'Invalid date format';
  }

  const today = new Date();
  if (birthDate > today) {
    return 'Date of birth cannot be in the future';
  }

  if (!validateDateOfBirth(dateOfBirth)) {
    return 'You must be at least 18 years old';
  }

  return null;
};

/**
 * Validate license dates
 * - Issue date must be in the past
 * - Expiry date must be in the future
 * - Issue date must be before expiry date
 */
export const validateLicenseDates = (
  issueDate: string,
  expiryDate: string
): { valid: boolean; error?: string } => {
  const issue = new Date(issueDate);
  const expiry = new Date(expiryDate);
  const today = new Date();

  if (isNaN(issue.getTime())) {
    return { valid: false, error: 'Invalid license issue date' };
  }

  if (isNaN(expiry.getTime())) {
    return { valid: false, error: 'Invalid license expiry date' };
  }

  if (issue > today) {
    return { valid: false, error: 'License issue date cannot be in the future' };
  }

  if (expiry < today) {
    return { valid: false, error: 'License has expired' };
  }

  if (issue >= expiry) {
    return { valid: false, error: 'License issue date must be before expiry date' };
  }

  return { valid: true };
};

/**
 * Validate vehicle year
 * Must be between 1990 and current year + 1
 */
export const validateVehicleYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1990 && year <= currentYear + 1;
};

/**
 * Get vehicle year validation error
 */
export const getVehicleYearError = (year: number): string | null => {
  if (!year) {
    return 'Vehicle year is required';
  }

  const currentYear = new Date().getFullYear();

  if (year < 1990) {
    return 'Vehicle year must be 1990 or later';
  }

  if (year > currentYear + 1) {
    return `Vehicle year cannot be later than ${currentYear + 1}`;
  }

  return null;
};

/**
 * Validate driving experience (must be consistent with license issue date)
 */
export const validateDrivingExperience = (
  experience: number,
  licenseIssueDate?: string
): { valid: boolean; error?: string } => {
  if (experience < 1 || experience > 50) {
    return {
      valid: false,
      error: 'Driving experience must be between 1 and 50 years'
    };
  }

  // If license issue date is provided, check consistency
  if (licenseIssueDate) {
    const issueDate = new Date(licenseIssueDate);
    const today = new Date();
    const yearsSinceLicense = (today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (experience > Math.ceil(yearsSinceLicense)) {
      return {
        valid: false,
        error: 'Driving experience cannot exceed years since license was issued'
      };
    }
  }

  return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Get email validation error
 */
export const getEmailError = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }

  if (!validateEmail(email)) {
    return 'Invalid email format';
  }

  return null;
};

/**
 * Validate postal code (Malawi format: 3-6 alphanumeric characters)
 */
export const validatePostalCode = (postalCode: string): boolean => {
  const postalPattern = /^[A-Za-z0-9]{3,6}$/;
  return postalPattern.test(postalCode);
};

/**
 * Get postal code validation error
 */
export const getPostalCodeError = (postalCode: string): string | null => {
  if (!postalCode) {
    return null; // Postal code is optional
  }

  if (postalCode.length < 3 || postalCode.length > 6) {
    return 'Postal code must be 3-6 characters';
  }

  const postalPattern = /^[A-Za-z0-9]{3,6}$/;
  if (!postalPattern.test(postalCode)) {
    return 'Postal code must contain only letters and numbers';
  }

  return null;
};
