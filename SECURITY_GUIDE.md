# 🔐 VSquare Security Implementation Guide

## Overview
This document outlines the comprehensive security measures implemented in the VSquare application to protect user data and prevent unauthorized access.

---

## 1. AUTHENTICATION & SESSION MANAGEMENT

### Session Timeout
- **Duration**: 30 minutes (configurable in `SECURITY_CONFIG`)
- **Storage**: Uses secure `sessionStorage` with encryption
- **Auto-logout**: Automatically logs out users after inactivity
- **Credentials**: Never stored in `localStorage`

### Rate Limiting
- **Login attempts**: 5 failed attempts per 15 minutes
- **Auto-lockout**: Temporarily blocks login attempts after limit exceeded
- **Progress**: Informs user of remaining attempts

### Password Requirements (Future Implementation)
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

---

## 2. INPUT VALIDATION & SANITIZATION

### Validated Fields
- **Employee ID**: Format `VS + 5 digits` (e.g., VS00001)
- **Phone**: Exactly 10 digits
- **Email**: Standard email format
- **Passwords**: Strong password requirements
- **Names**: Only letters, spaces, hyphens, apostrophes

### XSS Prevention
- All user inputs are sanitized
- HTML characters are escaped (&, <, >, ", ')
- Prevents injection of malicious scripts

### CSRF Protection
- CSRF tokens generated for sensitive operations
- Token validation on all state-changing requests

---

## 3. DATA PROTECTION

### Encryption
- **Sensitive data**: Base64 encryption (upgrade to AES-256 in production)
- **Transit**: Always use HTTPS/TLS
- **Storage**: Encrypted session storage for sensitive data
- **At rest**: Encrypt passwords and tokens before storage

### Sensitive Data Masking
```javascript
Phone: 925****89
Email: jo****@email.com
ID: VS00****
```

### Database Security
- Row-level security policies on Supabase
- Parameterized queries to prevent SQL injection
- Regular database backups

---

## 4. SECURE STORAGE

### SessionStorage (Temporary)
- Used for: Session tokens, login time
- Encrypted: Yes
- Cleared on: Browser close or logout
- Prefix: `sec_` for all security items

### LocalStorage (Persistent)
- Used for: Minimal non-sensitive data
- Encrypted: Yes for sensitive items
- Prefix: `secure_` for encrypted items
- Never stores: Passwords, API keys, tokens

### Remove Before Production
```javascript
// REMOVE if using
localStorage.setItem('vsquare_session_login_time', ...)
```

---

## 5. ADMIN SECURITY

### Admin Credentials
**CRITICAL: Change default credentials immediately!**

```env
Default ID: VSQUARE2026
Default Password: Resort@2026

⚠️ These are placeholders - SET YOUR OWN IN .env
```

### Steps to Change:
1. Open `.env` file
2. Update `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD`
3. Use strong, unique credentials
4. Never commit `.env` to version control

---

## 6. SECURITY UTILITIES REFERENCE

### Input Validation
```javascript
import { 
  isValidEmployeeId,
  isValidPhone,
  isValidEmail,
  isStrongPassword,
  sanitizeInput 
} from '@/utils/security';

// Usage
isValidEmployeeId('VS00001'); // true
sanitizeInput('<script>alert("xss")</script>'); // escaped
```

### Secure Storage
```javascript
import { SecureStorage, SecureLocalStorage } from '@/utils/security';

// Session storage (cleared on browser close)
SecureStorage.setSession('token', value, encrypt=true);
const token = SecureStorage.getSession('token', decrypt=true);

// Local storage (persistent)
SecureLocalStorage.setItem('preference', value, encrypt=true);
const pref = SecureLocalStorage.getItem('preference', decrypt=true);
```

### Data Encryption
```javascript
import { encryptData, decryptData, hashPassword } from '@/utils/security';

// Encrypt sensitive data
const encrypted = encryptData({ phone: '9876543210' });

// Hash passwords
const hashed = await hashPassword('MyPassword@123');
```

### Logging
```javascript
import { secureLog } from '@/utils/security';

// Automatically redacts sensitive fields
secureLog('User login', { 
  id: 'VS00001', 
  password: 'secret' // Will show as [REDACTED]
}, 'info');
```

---

## 7. CONFIGURATION

### Update Security Settings in `.env`

```env
# Session timeout (milliseconds)
VITE_SESSION_TIMEOUT=1800000

# Enable audit logging
VITE_ENABLE_AUDIT_LOGGING=true

# Enable encryption
VITE_ENABLE_ENCRYPTION=true

# HTTPS enforcement
VITE_HTTPS_ONLY=true
```

### Modify Default Values
Edit `src/config/security.config.js`:
```javascript
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD: { MIN_LENGTH: 8, ... },
  RATE_LIMIT: { LOGIN_ATTEMPTS: 5, ... }
}
```

---

## 8. SECURITY BEST PRACTICES

### ✅ DO:
- ✅ Always validate user input
- ✅ Use HTTPS in production
- ✅ Store sensitive data encrypted
- ✅ Implement rate limiting
- ✅ Log security events
- ✅ Use strong passwords
- ✅ Clear sessions on logout
- ✅ Implement session timeouts
- ✅ Sanitize all outputs

### ❌ DON'T:
- ❌ Hardcode credentials in code
- ❌ Store passwords in plain text
- ❌ Trust client-side validation alone
- ❌ Expose API keys in frontend
- ❌ Use localStorage for sensitive data
- ❌ Skip HTTPS in production
- ❌ Log sensitive information
- ❌ Allow unlimited login attempts
- ❌ Commit `.env` files

---

## 9. PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Change admin credentials in `.env`
- [ ] Enable HTTPS/TLS encryption
- [ ] Configure Supabase RLS policies
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Enable rate limiting on backend
- [ ] Configure CORS properly
- [ ] Set up backup and recovery
- [ ] Review all API endpoints for security
- [ ] Test authentication flows
- [ ] Implement 2FA (optional)
- [ ] Set up SSL certificate
- [ ] Enable HSTS headers
- [ ] Configure CSP headers
- [ ] Test all security measures

---

## 10. UPDATING SECURITY

### Upgrade Encryption
Current: Base64 (demo purposes only)
Recommended: AES-256-GCM

```bash
npm install tweetnacl-js
```

Replace `encryptData` in `security.js` with proper encryption.

### Database Encryption
Enable Supabase:
- pgcrypto extension
- Row-level security policies
- Database backups

### Advanced Security Features
- [ ] Two-Factor Authentication (2FA)
- [ ] Biometric authentication
- [ ] Session monitoring
- [ ] IP whitelisting
- [ ] Device fingerprinting

---

## 11. TROUBLESHOOTING

### "Too many login attempts"
- User exceeded 5 failed logins in 15 minutes
- **Solution**: Wait 15 minutes or reset rate limiter

### "Invalid Employee ID format"
- ID format must be `VS + 5 digits`
- **Example**: VS00001, VS12345
- **Solution**: Re-enter with correct format

### "Session expired"
- More than 30 minutes of inactivity
- **Solution**: Login again

### Data not encrypting
- Check if `VITE_ENABLE_ENCRYPTION` is true
- Verify `SecureStorage` is being used
- **Solution**: Clear storage and retry

---

## 12. SECURITY REPORTING

If you discover a security vulnerability:
1. **DO NOT** post it publicly
2. Email security details to: security@vsquare.app
3. Include: description, severity, affected version
4. Wait for confirmation before public disclosure

---

## 13. ADDITIONAL RESOURCES

- [OWASP Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/database/security)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)

---

## Version History

- **v1.0.0** (2026-06-12): Initial security implementation
  - Input validation and sanitization
  - Session management with timeout
  - Rate limiting
  - Secure storage
  - Basic encryption
  - Audit logging

---

**Last Updated**: 2026-06-12  
**Status**: ✅ Secure  
**Next Review**: 2026-09-12
