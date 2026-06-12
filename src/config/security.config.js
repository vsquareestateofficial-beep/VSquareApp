/**
 * Security Configuration
 * Centralized security settings and configurations
 */

// ==================== ENVIRONMENT SETTINGS ====================

export const SECURITY_CONFIG = {
  // Session timeout (in milliseconds) - 30 minutes for high security
  SESSION_TIMEOUT: 30 * 60 * 1000,

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
    MAX_AGE_DAYS: 90 // Force password change every 90 days
  },

  // Rate limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    API_REQUESTS: 100,
    API_WINDOW_MS: 60 * 1000 // 1 minute
  },

  // Data encryption
  ENCRYPTION: {
    ENABLED: true,
    ALGORITHM: 'AES-256-GCM' // Reference only, uses Web Crypto API
  },

  // HTTPS enforcement
  HTTPS_ONLY: import.meta.env.PROD === true,
  HSTS_MAX_AGE: 31536000, // 1 year

  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Allowed CORS origins
  ALLOWED_ORIGINS: [
    import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    'https://vsquare.app',
    'https://www.vsquare.app'
  ],

  // Content Security Policy
  CSP: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://supabase.co https://*.supabase.co",

  // Sensitive fields to mask
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'apiKey',
    'secret',
    'key',
    'phone',
    'email',
    'ssn',
    'creditCard'
  ],

  // Admin credentials (should be from env variables ONLY)
  ADMIN_ID: import.meta.env.VITE_ADMIN_ID || 'VSADMIN2026',
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'Resort@2026',

  // Feature flags
  FEATURES: {
    TWO_FACTOR_AUTH: false, // Enable 2FA in future
    BIOMETRIC_LOGIN: false, // Enable biometric in future
    SESSION_MONITORING: true, // Monitor active sessions
    AUDIT_LOGGING: true, // Log all actions
    ENCRYPTION_AT_REST: true // Encrypt sensitive data in storage
  }
};

// ==================== VALIDATION RULES ====================

export const VALIDATION_RULES = {
  EMPLOYEE_ID: {
    pattern: /^VS\d{5}$/,
    message: 'Employee ID must be in format VS00000',
    maxLength: 7
  },

  PHONE: {
    pattern: /^\d{10}$/,
    message: 'Phone must be exactly 10 digits',
    maxLength: 10
  },

  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
    maxLength: 255
  },

  NAME: {
    pattern: /^[a-zA-Z\s'-]{2,100}$/,
    message: 'Name must contain only letters, spaces, hyphens, and apostrophes',
    maxLength: 100
  },

  ROLE: {
    allowedValues: [
      'Executive Director',
      'MD',
      'CEO',
      'Sales Executive',
      'Team Lead',
      'Admin',
      'HR',
      'Accountant',
      'Receptionist',
      'Back Office Support'
    ],
    message: 'Invalid role selected'
  },

  DEPARTMENT: {
    allowedValues: [
      'Executive Director',
      'MD',
      'CEO',
      'Marketing',
      'Office Employee'
    ],
    message: 'Invalid department selected'
  },

  BRANCH: {
    allowedValues: [
      'Corporate Office',
      'Uppal Branch',
      'Kompally Branch'
    ],
    message: 'Invalid branch selected'
  },

  BLOOD_GROUP: {
    allowedValues: [
      'O+ve',
      'O-ve',
      'A+ve',
      'A-ve',
      'B+ve',
      'B-ve',
      'AB+ve',
      'AB-ve'
    ],
    message: 'Invalid blood group'
  }
};

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid employee ID or password',
  ACCOUNT_BLOCKED: 'Your account is blocked. Contact HR.',
  INVALID_INPUT: 'Invalid input provided',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',
  ENCRYPTION_FAILED: 'Failed to encrypt data',
  DECRYPTION_FAILED: 'Failed to decrypt data',
  INVALID_CSRF_TOKEN: 'Invalid security token. Please refresh and try again.'
};

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  DATA_SAVED: 'Data saved securely',
  PASSWORD_CHANGED: 'Password changed successfully',
  SESSION_RENEWED: 'Session renewed'
};

export default SECURITY_CONFIG;
