import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Building, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  sanitizeInput, 
  isValidEmployeeId, 
  loginLimiter,
  SecureStorage,
  secureLog
} from '../utils/security';
import { ERROR_MESSAGES, SECURITY_CONFIG, VALIDATION_RULES } from '../config/security.config';

export default function Login() {
  const { employees, setCurrentUser, setJustLoggedIn, setSessionLogin } = useAppContext();
  const [employeeId, setEmployeeId] = useState('VS');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [securityWarning, setSecurityWarning] = useState('');

  const handleLogin = async () => {
    setLoginError('');
    setSecurityWarning('');
    
    // Sanitize inputs
    const sanitizedId = sanitizeInput(employeeId).toUpperCase();
    const sanitizedPassword = sanitizeInput(password);

    // Rate limiting check
    if (!loginLimiter.isAllowed(sanitizedId)) {
      const remainingTime = Math.ceil(5 * 60); // 5 minutes
      setLoginError(`Too many login attempts. Please try again in ${remainingTime} seconds.`);
      secureLog('Rate limit exceeded for login attempt', { identifier: sanitizedId }, 'warn');
      return;
    }

    // Input validation
    if (!sanitizedId || !sanitizedPassword) {
      setLoginError('Employee ID and password are required');
      return;
    }

    if (!isValidEmployeeId(sanitizedId) && sanitizedId !== SECURITY_CONFIG.ADMIN_ID) {
      setLoginError(`Invalid Employee ID format. Use ${VALIDATION_RULES.EMPLOYEE_ID.message}`);
      return;
    }

    setIsLoading(true);

    try {
      // Admin login
      if (sanitizedId === SECURITY_CONFIG.ADMIN_ID && sanitizedPassword === SECURITY_CONFIG.ADMIN_PASSWORD) {
        setCurrentUser('admin');
        setSessionLogin();
        SecureStorage.setSession('admin_session', { loginTime: Date.now(), id: sanitizedId }, true);
        secureLog('Admin login successful', { id: sanitizedId });
        return;
      }

      // Employee login
      const emp = employees.find(e => e.id === sanitizedId);
      
      if (!emp) {
        setLoginError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        secureLog('Login failed - employee not found', { id: sanitizedId }, 'warn');
        return;
      }

      // Check if employee is blocked
      const isBlocked = emp.isBlocked !== undefined ? emp.isBlocked : emp.isblocked;
      if (isBlocked) {
        setLoginError(ERROR_MESSAGES.ACCOUNT_BLOCKED);
        secureLog('Login attempt on blocked account', { id: sanitizedId }, 'warn');
        return;
      }

      // Password validation (comparing with stored password or phone last 4 digits)
      const validPassword = emp.password === sanitizedPassword || emp.phone?.slice(-4) === sanitizedPassword;
      
      if (!validPassword) {
        setLoginError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        secureLog('Login failed - invalid password', { id: sanitizedId }, 'warn');
        return;
      }

      // Normalize employee data
      const normalizedEmp = {
        ...emp,
        joinDate: emp.joinDate || emp.joindate || null,
        teamLeadId: emp.teamLeadId || emp.teamleadid || null,
        isFresher: emp.isFresher !== undefined ? emp.isFresher : (emp.isfresher !== undefined ? emp.isfresher : true),
        isLead: emp.isLead !== undefined ? emp.isLead : (emp.islead !== undefined ? emp.islead : false),
        isBlocked: emp.isBlocked !== undefined ? emp.isBlocked : (emp.isblocked !== undefined ? emp.isblocked : false),
        branchOffice: emp.branchOffice || 'Corporate Office',
        bloodGroup: emp.bloodGroup || 'O+ve',
        office: 'Corporate Office'
      };

      // Secure session storage
      setCurrentUser(normalizedEmp);
      setSessionLogin();
      SecureStorage.setSession('employee_session', { loginTime: Date.now(), id: sanitizedId }, true);
      setJustLoggedIn(true);
      
      secureLog('Employee login successful', { id: sanitizedId });
      loginLimiter.reset(sanitizedId); // Reset attempts on successful login
      
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
      secureLog('Login error', { error: error.message }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-5 font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#10b981]/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#f9d976]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Login Card */}
      <div className="bg-[#f1f5f9]/80 backdrop-blur-3xl border border-[#10b981]/20 p-8 sm:p-10 rounded-3xl w-full max-w-[420px] text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          {/* Logo Mark - V with rays representation */}
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            {/* Outer Box */}
            <div className="absolute inset-0 border-2 border-[#10b981] shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
            {/* Inner V */}
            <span className="text-5xl font-serif font-black bg-gradient-to-b from-[#34d399] via-[#10b981] to-[#047857] bg-clip-text text-transparent z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">V</span>
            {/* Abstract Rays (CSS styling) */}
            <div className="absolute inset-0 overflow-hidden opacity-30 flex items-center justify-center">
               <div className="w-[150%] h-[1px] bg-[#10b981] rotate-45 absolute"></div>
               <div className="w-[150%] h-[1px] bg-[#10b981] -rotate-45 absolute"></div>
               <div className="w-[1px] h-[150%] bg-[#10b981] absolute"></div>
               <div className="w-[150%] h-[1px] bg-[#10b981] absolute"></div>
            </div>
            {/* Cutout illusion on right side matching logo */}
            <div className="absolute top-1/4 -right-1 w-2 h-1/2 bg-[#f1f5f9]"></div>
          </div>
          
          {/* Logo Text */}
          <h1 className="text-4xl sm:text-[2.5rem] font-sans font-black mb-2 text-slate-900 tracking-[0.15em] uppercase leading-none">VSquare</h1>
          <p className="text-slate-900 text-[11px] sm:text-xs text-center tracking-[0.6em] uppercase font-light mb-2 ml-1">Estates</p>
          <p className="text-[#10b981] text-[8px] sm:text-[9px] text-center tracking-[0.3em] sm:tracking-[0.4em] uppercase font-bold ml-1">Vision With Values</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-[#10b981] tracking-widest uppercase ml-1 block">Associate ID</label>
            <input
              value={employeeId}
              onChange={(e) => {
                let value = e.target.value.toUpperCase();
                // Ensure VS prefix is always there
                if (!value.startsWith('VS')) {
                  value = 'VS' + value.replace(/[^A-Z0-9]/g, '');
                }
                // Allow admin IDs (letters/numbers) or employee IDs (VS + 5 digits only)
                const afterVS = value.slice(2);
                
                // Check if it contains letters (admin ID) or only digits (employee ID)
                if (/[A-Z]/.test(afterVS)) {
                  // Admin ID - allow letters and numbers, up to 20 chars total
                  setEmployeeId(value.slice(0, 20));
                } else {
                  // Employee ID - only 5 digits after VS
                  const digits = afterVS.replace(/[^0-9]/g, '').slice(0, 5);
                  setEmployeeId('VS' + digits);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="VS00000 or VSADMIN2026"
              disabled={isLoading}
              maxLength={20}
              className="w-full p-4 rounded-xl bg-[#e2e8f0] border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#f8fafc] transition-all text-sm font-medium tracking-wide font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-[#10b981] tracking-widest uppercase ml-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-[#e2e8f0] border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#f8fafc] transition-all text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {loginError && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center font-medium backdrop-blur-sm flex items-center gap-2 justify-center">
              <AlertCircle size={14} />
              {loginError}
            </div>
          )}

          {securityWarning && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 p-3 rounded-xl text-xs text-center font-medium backdrop-blur-sm flex items-center gap-2 justify-center">
              <AlertCircle size={14} />
              {securityWarning}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoading || !employeeId || !password}
              className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:from-[#10b981] hover:via-[#bfdbfe] hover:to-[#059669] text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? '🔐 Securing Login...' : '🔐 Secure Login'}
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-600 bg-slate-100/50 rounded-lg p-2 mt-4">
            <CheckCircle size={12} className="inline mr-1 text-[#10b981]" />
            Your data is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );
}
