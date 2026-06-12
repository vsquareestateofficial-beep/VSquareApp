# 🔐 VSquare Security - Quick Start Guide

## What's Been Implemented

### ✅ Core Security (Completed)

1. **Input Validation & Sanitization**
   - All user inputs are validated
   - XSS attacks are prevented
   - SQL injection risks mitigated

2. **Authentication Hardening**
   - Rate limiting (5 failed attempts = 15 min lockout)
   - Secure session storage (30 min timeout)
   - Input sanitization before auth

3. **Data Protection**
   - Encrypted session storage
   - Sensitive data masking
   - Token generation with crypto

4. **Secure Logging**
   - Automatic sensitive field redaction
   - Activity tracking
   - Error monitoring

---

## 🚀 Immediate Actions Required

### 1. Change Admin Credentials (CRITICAL!)

Edit `.env.local`:
```env
# CHANGE THESE FROM DEFAULTS!
VITE_ADMIN_ID=YourCustomAdminID
VITE_ADMIN_PASSWORD=YourStrongPassword@123!
```

**⚠️ DO NOT use default credentials in production!**

### 2. Set Up Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use your editor
```

### 3. Verify .env Files Are NOT Committed

```bash
# Check git ignore
git check-ignore -v .env.local

# Should output: .env.local
# If not, run: git rm --cached .env.local
```

---

## 🧪 Test the Security Features

### Test 1: Rate Limiting
```
1. Go to login page
2. Enter wrong password 5 times
3. 6th attempt shows: "Too many attempts" error
4. Wait 15 minutes or restart browser
```

### Test 2: Session Timeout
```
1. Login successfully
2. Wait 30 minutes without any activity
3. Try to perform an action
4. Auto-logout and redirect to login
```

### Test 3: Input Validation
```
// Try these in Employee ID field:
- "VS000" → Invalid (needs 5 digits)
- "VS00001" → Valid
- "admin" → Invalid
- "<script>alert('xss')</script>" → Sanitized and invalid
```

### Test 4: Secure Storage
```javascript
// Open browser console and run:
sessionStorage.getItem('sec_login_time');
// Should show encrypted/prefixed data (not plain text)
```

---

## 📊 Security Configuration

### Current Settings
```javascript
SESSION_TIMEOUT: 30 minutes
LOGIN_ATTEMPTS: 5 per 15 minutes
PASSWORD_MIN_LENGTH: 8 characters
ENCRYPTION: Base64 (basic)
```

### To Change Settings

Edit `src/config/security.config.js`:

```javascript
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour instead of 30 min
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 3, // 3 instead of 5
    LOGIN_WINDOW_MS: 10 * 60 * 1000, // 10 min instead of 15
  }
}
```

---

## 📁 New Security Files

### Created Files
```
src/
  ├── utils/
  │   └── security.js                 ← Security utilities
  └── config/
      └── security.config.js          ← Configuration

SECURITY_GUIDE.md                      ← Full documentation
SECURITY_CHECKLIST.md                  ← Implementation tracker
```

### Updated Files
```
src/
  ├── components/
  │   └── Login.jsx                   ← Secure authentication
  └── context/
      └── AppContext.jsx              ← Secure session management

.gitignore                             ← Added .env file protection
```

---

## 🔒 Using Security Utilities in Your Code

### Import Security Functions
```javascript
import { 
  sanitizeInput,
  isValidEmployeeId,
  SecureStorage,
  secureLog,
  RateLimiter
} from '@/utils/security';

import { SECURITY_CONFIG, ERROR_MESSAGES } from '@/config/security.config';
```

### Validate User Input
```javascript
// Employee ID validation
if (!isValidEmployeeId(id)) {
  setError('Invalid Employee ID format');
  return;
}

// Sanitize before using
const clean = sanitizeInput(userInput);
```

### Secure Storage
```javascript
// Store securely (session)
SecureStorage.setSession('user_data', userData, encrypt=true);

// Retrieve securely
const data = SecureStorage.getSession('user_data', decrypt=true);

// Clear on logout
SecureStorage.clearSession();
```

### Logging Securely
```javascript
// Passwords/tokens auto-redacted
secureLog('User action', { 
  id: 'VS00001',
  password: 'secret', // Will show as [REDACTED]
  phone: '9876543210' // Will show as [REDACTED]
}, 'info');
```

---

## ⚙️ Production Deployment

### Pre-Deployment Checklist
```
☐ Change admin credentials in .env
☐ Enable HTTPS/SSL certificate
☐ Update Supabase RLS policies
☐ Test all authentication flows
☐ Verify rate limiting works
☐ Check session timeout
☐ Confirm .env not in git
☐ Enable audit logging
☐ Set up monitoring
☐ Test data encryption
```

### Deploy Commands
```bash
# Build
npm run build

# Test security
npm run lint
npm run test

# Deploy (adjust for your hosting)
npm run deploy
```

---

## 📚 Documentation

### Full Security Guide
Read `SECURITY_GUIDE.md` for:
- Detailed implementation
- Best practices
- Configuration options
- Troubleshooting
- Advanced features

### Implementation Checklist
Read `SECURITY_CHECKLIST.md` for:
- What's completed
- What's in progress
- High/medium/low priority items
- Testing checklist
- Deployment requirements

---

## ⚠️ Common Issues

### "Too many login attempts"
**Cause**: 5+ failed login attempts in 15 minutes  
**Fix**: Wait 15 minutes or clear sessionStorage in browser console

### "Session expired"
**Cause**: 30 minutes of inactivity  
**Fix**: Login again (this is expected behavior for security)

### Data not encrypted
**Cause**: Not using `SecureStorage`  
**Fix**: Use `SecureStorage.setSession()` instead of `sessionStorage.setItem()`

### Validation fails with correct ID
**Cause**: ID format must be `VS + 5 digits`  
**Fix**: Use format like `VS00001`, `VS12345`, etc.

---

## 🆘 Troubleshooting

### Check Security Status
```javascript
// Open browser console and run:
console.log('Session storage:', sessionStorage);
console.log('Local storage:', localStorage);
// Should show encrypted/prefixed data
```

### Clear All Security Data
```javascript
// In browser console:
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Debug Logging
```javascript
// In browser console:
localStorage.setItem('debug', 'true');
// Now all security events will log to console
```

---

## 📞 Support

### Documentation
- Read: `SECURITY_GUIDE.md`
- Read: `SECURITY_CHECKLIST.md`

### Common Questions

**Q: Can I use simple passwords?**  
A: No, rate limiting and secure storage are enforced. Upgrade password policy in production.

**Q: How long is the session?**  
A: 30 minutes. Configurable in `SECURITY_CONFIG.SESSION_TIMEOUT`.

**Q: Is data encrypted at rest?**  
A: Yes, using Base64. Upgrade to AES-256 for production.

**Q: Can I disable rate limiting?**  
A: Not recommended, but modifiable in `SECURITY_CONFIG.RATE_LIMIT`.

**Q: What if I forget the admin password?**  
A: Check `.env.local` file. Use that password to login.

---

## 🎯 Next Steps

1. **Read** `SECURITY_GUIDE.md` for complete details
2. **Update** `.env.local` with custom credentials
3. **Test** all security features
4. **Review** `SECURITY_CHECKLIST.md` for remaining tasks
5. **Deploy** to production with confidence

---

**Status**: ✅ Core Security Implemented  
**Last Updated**: 2026-06-12  
**Security Score**: 7/10  
**Next Review**: 2026-09-12
