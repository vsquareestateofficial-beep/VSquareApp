import React, { useState, useRef } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminNav from './components/AdminNav';
import EmployeeNav from './components/EmployeeNav';
import TopMembersModal from './components/TopMembersModal';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const { currentUser, justLoggedIn, setJustLoggedIn, employees, offers, isSupabaseConnected } = useAppContext();
  const [adminTab, setAdminTab] = useState('HOME');
  const [employeeTab, setEmployeeTab] = useState('DASH');
  const hasResetTabsOnLogin = useRef(false);

  // Reset tabs only once on fresh login
  React.useEffect(() => {
    if (justLoggedIn && !hasResetTabsOnLogin.current) {
      setAdminTab('HOME');
      setEmployeeTab('DASH');
      hasResetTabsOnLogin.current = true;
      setJustLoggedIn(false);
    }
  }, [justLoggedIn, setJustLoggedIn]);

  // Reset the flag when user logs out
  React.useEffect(() => {
    if (!currentUser) {
      hasResetTabsOnLogin.current = false;
    }
  }, [currentUser]);

  // Extract top performers from offers
  const topPerformersOffer = offers?.find(o => o.id === 'TOP_PERFORMERS');
  let topMembers = [];
  try {
    if (topPerformersOffer && topPerformersOffer.message) {
      const ids = JSON.parse(topPerformersOffer.message);
      topMembers = ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
    }
  } catch (e) {
    console.warn('Error parsing top performers:', e);
  }

  const handleCloseTopMembers = () => {
    setJustLoggedIn(false);
  };

  if (!isSupabaseConnected) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-emerald-500/20">
          <div className="text-amber-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Supabase Not Connected</h2>
          <p className="text-slate-700 mb-6 leading-relaxed">
            To use this app, you must connect to a Supabase database. 
            Please set the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
          </p>
          <div className="text-left bg-slate-100 rounded-lg p-4 text-sm text-slate-800 font-mono mb-6">
            <p>VITE_SUPABASE_URL=your-supabase-url</p>
            <p>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</p>
          </div>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Open Supabase Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  if (currentUser === 'admin') {
    return (
      <>
        <AdminDashboard activeTab={adminTab} setActiveTab={setAdminTab} />
        <AdminNav activeTab={adminTab} setActiveTab={setAdminTab} />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {/* Show Top Members Modal only on fresh login for employees */}
      {justLoggedIn && topMembers.length > 0 && (
        <TopMembersModal 
          isOpen={justLoggedIn} 
          onClose={handleCloseTopMembers} 
          topMembers={topMembers}
        />
      )}
      
      <EmployeeDashboard activeTab={employeeTab} setActiveTab={setEmployeeTab} />
      <EmployeeNav activeTab={employeeTab} setActiveTab={setEmployeeTab} unreadCount={0} />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
