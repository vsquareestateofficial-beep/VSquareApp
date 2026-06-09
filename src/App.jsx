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
  const { currentUser, justLoggedIn, setJustLoggedIn, employees, offers } = useAppContext();
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
