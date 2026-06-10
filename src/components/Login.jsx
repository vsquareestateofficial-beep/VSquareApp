import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Building } from 'lucide-react';

export default function Login() {
  const { employees, setCurrentUser, setJustLoggedIn, setSessionLogin } = useAppContext();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    setLoginError('');

    if (employeeId === 'VSQUARE2026' && password === 'Resort@2026') {
      setCurrentUser('admin');
      setSessionLogin();
      return;
    }

    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      // Check if employee is blocked (handle both camelCase and lowercase)
      const isBlocked = emp.isBlocked !== undefined ? emp.isBlocked : emp.isblocked;
      if (isBlocked) {
        setLoginError('You are not an associate of V Square Estates');
        return;
      }
      
      const validPassword = emp.password === password || emp.phone?.slice(-4) === password;
      if (validPassword) {
        // Normalize employee data to ensure camelCase properties
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
        setCurrentUser(normalizedEmp);
        setSessionLogin();
        // Set flag to show top members modal for employee login
        setJustLoggedIn(true);
        return;
      } else {
        setLoginError('Invalid Login');
        return;
      }
    }

    setLoginError('You are not the associate of Vsquare');
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
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. VS00101"
              className="w-full p-4 rounded-xl bg-[#e2e8f0] border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#f8fafc] transition-all text-sm font-medium tracking-wide"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-[#10b981] tracking-widest uppercase ml-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 rounded-xl bg-[#e2e8f0] border border-slate-200 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981]/50 focus:bg-[#f8fafc] transition-all text-sm tracking-widest"
            />
          </div>

          {loginError && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs text-center font-medium backdrop-blur-sm">
              {loginError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:from-[#10b981] hover:via-[#bfdbfe] hover:to-[#059669] text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.01] active:scale-[0.99]"
            >
              Secure Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
