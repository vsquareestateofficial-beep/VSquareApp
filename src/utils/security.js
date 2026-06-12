/**
 * Security Utilities Module
 * Handles input validation, sanitization, encryption, and data protection
 */

// ==================== INPUT VALIDATION ====================

/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return input.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(String(phone).replace(/\D/g, ''));
};

/**
 * Validate ID format (VS + 5 digits)
 */
export const isValidEmployeeId = (id) => {
  return /^VS\d{5}$/.test(String(id));
};

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 number, 1 special char
 */
export const isStrongPassword = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

/**
 * Get password strength score (0-5)
 */
export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  return strength;
};

/**
 * Validate object to prevent prototype pollution
 */
export const isValidObject = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  return !dangerousKeys.some(key => key in obj);
};

// ==================== DATA PROTECTION ====================

/**
 * Hash password using SHA-256 (for demo purposes)
 * In production, use bcrypt on backend
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Encrypt sensitive data using base64 (basic encryption)
 * Note: For production, use a proper encryption library like TweetNaCl.js
 */
export const encryptData = (data, key = 'default') => {
  try {
    const json = JSON.stringify(data);
    return btoa(json); // Base64 encoding (for demo)
  } catch (e) {
    console.error('Encryption error:', e);
    return null;
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encrypted, key = 'default') => {
  try {
    const json = atob(encrypted); // Base64 decoding
    return JSON.parse(json);
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
};

/**
 * Mask sensitive data (phone, ID, etc.)
 */
export const maskSensitiveData = (data, type = 'phone') => {
  const str = String(data);
  
  switch (type) {
    case 'phone':
      return str.slice(0, 3) + '****' + str.slice(-2);
    case 'id':
      return str.slice(0, 4) + '****';
    case 'email':
      const [name, domain] = str.split('@');
      return name.slice(0, 2) + '****@' + domain;
    default:
      return '****';
  }
};

// ==================== SESSION SECURITY ====================

/**
 * Secure session storage (using sessionStorage instead of localStorage for sensitive data)
 */
export const SecureStorage = {
  setSession: (key, value, encrypt = false) => {
    try {
      const data = encrypt ? encryptData(value) : value;
      sessionStorage.setItem(`sec_${key}`, data);
    } catch (e) {
      console.error('Session storage error:', e);
    }
  },

  getSession: (key, decrypt = false) => {
    try {
      const data = sessionStorage.getItem(`sec_${key}`);
      if (!data) return null;
      return decrypt ? decryptData(data) : data;
    } catch (e) {
      console.error('Session retrieval error:', e);
      return null;
    }
  },

  removeSession: (key) => {
    sessionStorage.removeItem(`sec_${key}`);
  },

  clearSession: () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('sec_')) sessionStorage.removeItem(key);
    });
  }
};

/**
 * Secure local storage (using encryption for sensitive data)
 */
export const SecureLocalStorage = {
  setItem: (key, value, encrypt = false) => {
    try {
      const data = encrypt ? encryptData(value) : value;
      localStorage.setItem(`secure_${key}`, data);
    } catch (e) {
      console.error('Local storage error:', e);
    }
  },

  getItem: (key, decrypt = false) => {
    try {
      const data = localStorage.getItem(`secure_${key}`);
      if (!data) return null;
      return decrypt ? decryptData(data) : data;
    } catch (e) {
      console.error('Local storage retrieval error:', e);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(`secure_${key}`);
  }
};

// ==================== RATE LIMITING ====================

/**
 * Rate limiter to prevent brute force attacks
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, resetTime: now + this.windowMs };

    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(identifier) {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.count);
  }

  reset(identifier) {
    this.attempts.delete(identifier);
  }
}

export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// ==================== CORS & HEADERS ====================

/**
 * Get secure headers for API requests
 */
export const getSecureHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
};

/**
 * Validate CORS origin
 */
export const isAllowedOrigin = (origin) => {
  const allowedOrigins = [
    import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    'https://vsquare.app',
    'https://www.vsquare.app'
  ];
  return allowedOrigins.includes(origin);
};

// ==================== CSRF PROTECTION ====================

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  return generateSecureToken(32);
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

// ==================== LOGGING & MONITORING ====================

/**
 * Secure logging (doesn't log sensitive data)
 */
export const secureLog = (message, data = {}, level = 'info') => {
  const timestamp = new Date().toISOString();
  const sanitizedData = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'apiKey', 'phone'];
  sensitiveFields.forEach(field => {
    if (sensitiveFields.some(f => field.toLowerCase().includes(f))) {
      sanitizedData[field] = '[REDACTED]';
    }
  });

  const logEntry = {
    timestamp,
    level,
    message,
    data: sanitizedData,
    url: window.location.pathname
  };

  // In production, send to logging service
  if (level === 'error') {
    console.error(`[${timestamp}] ERROR:`, message, sanitizedData);
  } else if (level === 'warn') {
    console.warn(`[${timestamp}] WARN:`, message, sanitizedData);
  } else {
    console.log(`[${timestamp}] INFO:`, message, sanitizedData);
  }
};

// ==================== EXPORT ====================

export default {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidEmployeeId,
  isStrongPassword,
  getPasswordStrength,
  isValidObject,
  hashPassword,
  generateSecureToken,
  encryptData,
  decryptData,
  maskSensitiveData,
  SecureStorage,
  SecureLocalStorage,
  RateLimiter,
  loginLimiter,
  getSecureHeaders,
  isAllowedOrigin,
  generateCSRFToken,
  validateCSRFToken,
  secureLog
};
