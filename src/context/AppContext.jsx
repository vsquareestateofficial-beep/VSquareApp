import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapOfferFromDb, mapOfferToDb } from '../utils/offers';
import { SecureStorage, secureLog } from '../utils/security';
import { SECURITY_CONFIG } from '../config/security.config';

const SUPABASE_ENABLED = supabase !== null;

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Session management
  const [sessionExpiry, setSessionExpiry] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // --- Employees ---
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) {
        if (error.code !== 'PGRST205') { // Don't log if table doesn't exist
          console.error('Error fetching employees:', error);
        }
      } else {
        const mappedData = (data || []).map(emp => ({
          ...emp,
          isFresher: emp.isfresher !== undefined ? emp.isfresher : emp.isFresher,
          isLead: emp.islead !== undefined ? emp.islead : emp.isLead,
          isBlocked: emp.isblocked !== undefined ? emp.isblocked : emp.isBlocked,
          joinDate: emp.joindate || emp.joinDate,
          teamLeadId: emp.teamleadid || emp.teamLeadId,
          department: emp.department || (['Executive Director', 'MD', 'CEO'].includes(emp.role) ? emp.role : (['Admin', 'HR', 'Accountant', 'Receptionist', 'Back Office Support'].includes(emp.role) ? 'Office Employee' : 'Marketing')),
          underExecutiveDirector: emp.underExecutiveDirector || 'No Selection',
          office: 'Corporate Office',
          branchOffice: emp.branchOffice || 'Corporate Office',
          bloodGroup: emp.bloodGroup || 'O+ve',
          manualTotalEarned: emp.manual_total_earned ?? '',
          manualPendingDue: emp.manual_pending_due ?? '',
          manualSalesCount: emp.manual_sales_count ?? '',
          availablePlotsNote: emp.availablePlotsNote ?? '',
          earningPlots: emp.earning_plots || [],
        }));
        setEmployees(mappedData);
      }
    } catch (e) {
      // Don't log network errors, etc.
    }
  };

  const saveEmployees = async (newEmployees) => {
    setEmployees(newEmployees);
    if (!SUPABASE_ENABLED) return;
    
    try {
      const cleanEmployees = newEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        role: emp.role || 'Sales Executive',
        joindate: emp.joinDate || emp.joindate || null,
        team: emp.team || null,
        teamleadid: emp.teamLeadId || emp.teamleadid || null,
        isfresher: emp.isFresher !== undefined ? emp.isFresher : emp.isfresher !== undefined ? emp.isfresher : true,
        islead: emp.isLead !== undefined ? emp.isLead : emp.islead !== undefined ? emp.islead : false,
        isblocked: emp.isBlocked !== undefined ? emp.isBlocked : emp.isblocked !== undefined ? emp.isblocked : false,
        password: emp.password || emp.phone?.slice(-4) || '1234',
        manual_total_earned: emp.manualTotalEarned || '',
        manual_pending_due: emp.manualPendingDue || '',
        manual_sales_count: emp.manualSalesCount || '',
        earning_plots: emp.earningPlots || [],
        department: emp.department || 'Marketing',
        underExecutiveDirector: emp.underExecutiveDirector || 'No Selection',
        branchOffice: emp.branchOffice || 'Corporate Office',
        bloodGroup: emp.bloodGroup || 'O+ve',
        availablePlotsNote: emp.availablePlotsNote || ''
      }));
      for (const emp of cleanEmployees) {
        const { error } = await supabase.from('employees').upsert(emp);
        if (error) console.error('Error saving employee:', emp.id, error);
      }
    } catch (e) {
      console.error('Error in saveEmployees:', e);
    }
  };

  const deleteEmployee = async (empId) => {
    try {
      const updatedEmployees = employees.filter(e => e.id !== empId);
      setEmployees(updatedEmployees);
      
      if (SUPABASE_ENABLED) {
        const { error } = await supabase.from('employees').delete().eq('id', empId);
        if (error) {
          console.error('Error deleting employee from Supabase:', error);
        }
      }
    } catch (e) {
      console.error('Error in deleteEmployee:', e);
    }
  };

  // --- Leads ---
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) {
        if (error.code !== 'PGRST205') { // Don't log if table doesn't exist
          console.error('Error fetching leads:', error);
        }
      } else {
        const mappedData = (data || []).map(lead => {
          let earningAmount = null;
          let cleanRemarks = lead.remarks || '';
          
          if (cleanRemarks && cleanRemarks.includes('||EARNING:')) {
            const match = cleanRemarks.match(/\|\|EARNING:(.*?)\|\|/);
            if (match) {
              earningAmount = match[1];
              cleanRemarks = cleanRemarks.replace(match[0], '').trim();
            }
          }

          return {
            ...lead,
            visitDate: lead.visitdate || lead.visitDate,
            earningAmount: earningAmount || lead.earningAmount || null,
            remarks: cleanRemarks
          };
        });
        setLeads(mappedData);
      }
    } catch (e) {
      // Don't log network errors, etc.
    }
  };

  const saveLeads = async (newLeads) => {
    setLeads(newLeads);
    if (!SUPABASE_ENABLED) return;
    
    try {
      const cleanLeads = newLeads.map(lead => {
        let remarks = lead.remarks || '';
        if (lead.earningAmount) {
          remarks = `${remarks} ||EARNING:${lead.earningAmount}||`.trim();
        }

        return {
          id: lead.id,
          assignedTo: lead.assignedTo || null,
          name: lead.name || 'Unknown',
          mobile: lead.mobile || 'N/A', // mobile is NOT NULL in DB
          project: lead.project || 'Unknown',
          budget: lead.budget || null,
          location: lead.location || null,
          source: lead.source || null,
          status: lead.status || 'New',
          visitdate: lead.visitDate || lead.visitdate || null,
          remarks: remarks || null
        };
      });
      
      const { error } = await supabase.from('leads').upsert(cleanLeads);
      if (error) console.error('Error saving leads:', error);
    } catch (e) {
      console.error('Error in saveLeads:', e);
    }
  };

  // --- Projects ---
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        if (error.code !== 'PGRST205') { // Don't log if table doesn't exist
          console.error('Error fetching projects:', error);
        }
        return;
      }
      const mappedData = (data || []).map(proj => ({
        ...proj,
        totalPrice: proj.totalprice || proj.totalPrice,
        pricePerSqYd: proj.pricepersqyd || proj.pricePerSqYd,
        startingSize: proj.startingsize || proj.startingSize,
        roadSize: proj.roadsize || proj.roadSize,
        totalPlots: proj.totalplots || proj.totalPlots,
        availablePlots: proj.availableplots || proj.availablePlots,
        soldPlots: proj.soldplots || proj.soldPlots,
        isVisible: proj.isvisible !== undefined ? proj.isvisible : proj.isVisible !== undefined ? proj.isVisible : true,
        imageUrl: proj.imageurl || proj.imageUrl
      }));
      setProjects(mappedData);
    } catch (e) {
      // Don't log network errors, etc.
    }
  };

  const saveProjects = async (newProjects) => {
    setProjects(newProjects);
    if (!SUPABASE_ENABLED) return;
    try {
      const cleanProjects = newProjects.map(proj => ({
        id: proj.id,
        name: proj.name,
        location: proj.location || null,
        totalprice: proj.totalPrice || proj.totalprice || null,
        pricepersqyd: proj.pricePerSqYd || proj.pricepersqyd || null,
        startingsize: proj.startingSize || proj.startingsize || null,
        roadsize: proj.roadSize || proj.roadsize || null,
        totalplots: proj.totalPlots || proj.totalplots || null,
        availableplots: proj.availablePlots || proj.availableplots || null,
        soldplots: proj.soldPlots || proj.soldplots || null,
        facing: proj.facing || 'East',
        approval: proj.approval || 'DTCP',
        status: proj.status || 'Available',
        isvisible: proj.isVisible !== undefined ? proj.isVisible : proj.isvisible !== undefined ? proj.isvisible : true,
        imageurl: proj.imageUrl || proj.imageurl || null
      }));
      
      for (const proj of cleanProjects) {
        const { error } = await supabase.from('projects').upsert(proj);
        if (error) console.error('Error saving project:', proj.id, error);
      }
    } catch (e) {
      console.error('Error in saveProjects:', e);
    }
  };

  const deleteProject = async (projId) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== projId);
      setProjects(updatedProjects);
      
      if (SUPABASE_ENABLED) {
        const { error } = await supabase.from('projects').delete().eq('id', projId);
        if (error) {
          console.error('Error deleting project from Supabase:', error);
        }
      }
    } catch (e) {
      console.error('Error in deleteProject:', e);
    }
  };

  // --- Offers ---
  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    if (!SUPABASE_ENABLED) {
      return;
    }
    
    try {
      const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code !== 'PGRST205') { // Don't log if table doesn't exist
          console.warn('Supabase fetch offers failed:', error);
        }
        return;
      }
      
      const mapped = (data || []).map(mapOfferFromDb).filter(Boolean);
      setOffers(mapped);
    } catch (e) {
      // Don't log network errors, etc.
    }
  };

  // Helper to determine if an offer should be visible based on schedule
  const isOfferActive = (offer) => {
    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) return false;
    if (offer.endDate && new Date(offer.endDate) < now) return false;
    return offer.isActive !== false;
  };

  // Extend saveOffers to send a notification when a new active offer is added
  const saveOffers = async (newOffers) => {
    setOffers(newOffers);
    if (!SUPABASE_ENABLED) return { ok: true };

    try {
      const cleanOffers = newOffers.map(mapOfferToDb);
      let lastError = null;

      for (const cleanOffer of cleanOffers) {
        const { error } = await supabase.from('offers').upsert(cleanOffer);
        if (error) {
          console.error(`Supabase save offer failed for ${cleanOffer.id}:`, error);
          lastError = error.message;
        }
      }

      if (lastError) {
        return { ok: false, error: lastError };
      }

      return { ok: true };
    } catch (e) {
      console.error('Error saving offers to Supabase:', e);
      return { ok: false, error: e.message || 'Save failed' };
    }
  };

  const deleteOffer = async (offerId) => {
    try {
      const updatedOffers = offers.filter(o => o.id !== offerId);
      setOffers(updatedOffers);
      
      if (SUPABASE_ENABLED) {
        await supabase.from('offers').delete().eq('id', offerId);
      }
      
      return { ok: true, message: 'Offer deleted successfully' };
    } catch (e) {
      console.error('Error in deleteOffer:', e);
      return { ok: false, error: e.message };
    }
  };

  // --- Notifications ---
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code !== 'PGRST205') { // Don't log if table doesn't exist
          console.warn('Error fetching notifications:', error);
        }
        return;
      }
      const mappedData = (data || []).map(notif => ({
        ...notif,
        forEmployees: notif.foremployees !== undefined ? notif.foremployees : notif.forEmployees !== undefined ? notif.forEmployees : true,
        targetEmployeeIds: notif.targetemployeeids || notif.targetEmployeeIds,
        readBy: typeof notif.readby === 'string' ? notif.readby.split(',').filter(Boolean) : (Array.isArray(notif.readby) ? notif.readby : (notif.readBy || []))
      }));
      setNotifications(mappedData);
    } catch (e) {
      // Don't log network errors, etc.
    }
  };

  const saveNotifications = async (newNotifications) => {
    setNotifications(newNotifications);
    if (!SUPABASE_ENABLED) return;
    try {
      const cleanNotifications = newNotifications.map(notif => {
        const notifData = {
          id: notif.id,
          type: notif.type || null,
          title: notif.title,
          message: notif.message,
          tag: notif.tag || 'INFO',
          read: notif.read !== undefined ? notif.read : false,
          time: notif.time || null,
          status: notif.status || null,
          foremployees: notif.forEmployees !== undefined ? notif.forEmployees : notif.foremployees !== undefined ? notif.foremployees : true,
          targetemployeeids: notif.targetEmployeeIds || notif.targetemployeeids || null,
          readby: Array.isArray(notif.readBy) ? notif.readBy.join(',') : (notif.readBy || '')
        };
        
        return notifData;
      });
      const { error } = await supabase.from('notifications').upsert(cleanNotifications);
      if (error) console.warn('Error saving notifications to Supabase:', error);
    } catch (e) {
      console.warn('Error in saveNotifications:', e);
    }
  };

  // --- Approved Sales Count (calculated from leads) ---
  const approvedSalesCount = leads.filter(lead => lead.status === 'Approved' || lead.status === 'Sold').length;

  // --- Admin Settings ---
  const [adminSettings, setAdminSettings] = useState({
    enableNotifications: true,
    autoApproveSales: false,
    lockEmployeeDeletion: false,
    autoCleanupNotifications: true,
  });

  // --- Top Performers ---
  const [topPerformers, setTopPerformers] = useState([]);
  const [topPerformersExpiry, setTopPerformersExpiry] = useState(null);

  const fetchTopPerformers = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('offers').select('*').eq('id', 'TOP_PERFORMERS').single();
      if (error) {
        return;
      }
      if (data && data.message) {
        try {
          const payload = JSON.parse(data.message);
          const performers = payload.performers || [];
          const expiry = payload.expiry_at ? new Date(payload.expiry_at).getTime() : null;
          setTopPerformers(performers);
          setTopPerformersExpiry(expiry);
        } catch (e) {
          console.warn('Error parsing top performers:', e);
        }
      }
    } catch (e) {
      // Don't log errors
    }
  };

  const saveTopPerformers = async (performers, daysToShow = 7) => {
    const expiry = Date.now() + (daysToShow * 24 * 60 * 60 * 1000);
    setTopPerformers(performers);
    setTopPerformersExpiry(expiry);
    if (!SUPABASE_ENABLED) return;
    try {
      const payload = {
        performers,
        expiry_at: new Date(expiry).toISOString()
      };
      
      await supabase.from('offers').upsert({
        id: 'TOP_PERFORMERS',
        title: 'Top Performers',
        message: JSON.stringify(payload),
        isactive: true,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      // Don't log errors
    }
  };

  const clearTopPerformers = async () => {
    setTopPerformers([]);
    setTopPerformersExpiry(null);
    if (!SUPABASE_ENABLED) return;
    try {
      await supabase.from('offers').delete().eq('id', 'TOP_PERFORMERS');
    } catch (e) {
      // Don't log errors
    }
  };

  const isTopPerformersActive = () => {
    if (topPerformers.length === 0) return false;
    if (!topPerformersExpiry) return true;
    return Date.now() < topPerformersExpiry;
  };

  const fetchAdminSettings = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('offers').select('*').eq('id', 'ADMIN_SETTINGS').single();
      if (error) {
        return;
      }
      if (data && data.message) {
        try {
          const mappedData = JSON.parse(data.message);
          setAdminSettings({
            enableNotifications: mappedData.enableNotifications !== undefined ? mappedData.enableNotifications : true,
            autoApproveSales: mappedData.autoApproveSales !== undefined ? mappedData.autoApproveSales : false,
            lockEmployeeDeletion: mappedData.lockEmployeeDeletion !== undefined ? mappedData.lockEmployeeDeletion : false,
            autoCleanupNotifications: mappedData.autoCleanupNotifications !== undefined ? mappedData.autoCleanupNotifications : true
          });
        } catch (e) {
          console.warn('Error parsing admin settings:', e);
        }
      }
    } catch (e) {
      // Don't log errors
    }
  };

  const saveAdminSettings = async (newSettings) => {
    setAdminSettings(newSettings);
    if (!SUPABASE_ENABLED) return;
    try {
      await supabase.from('offers').upsert({ 
        id: 'ADMIN_SETTINGS', 
        title: 'Admin Settings',
        message: JSON.stringify(newSettings),
        isactive: true,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      // Don't log errors
    }
  };

  const loadData = async () => {
    setLoading(false); // Show app immediately!
    if (SUPABASE_ENABLED) {
      // Load data in background after app is visible
      Promise.all([
        fetchEmployees(),
        fetchLeads(),
        fetchProjects(),
        fetchNotifications(),
        fetchOffers(),
        fetchAdminSettings(),
        fetchTopPerformers()
      ]).catch(() => {
        // Ignore errors, app still works
      });
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    loadData();
  }, []);

  // --- Keep logged-in employee in sync ---
  useEffect(() => {
    if (!currentUser?.id || currentUser.role === 'Admin') return;
    const fresh = employees.find((e) => e.id === currentUser.id);
    if (!fresh) return;
    const earningsKeys = [
      'manualTotalEarned',
      'manualPendingDue',
      'manualSalesCount',
      'availablePlotsNote',
      'earningPlots',
    ];
    const changed = earningsKeys.some((k) => currentUser[k] !== fresh[k]);
    if (changed) setCurrentUser({ ...currentUser, ...fresh });
  }, [employees, currentUser]);

  // --- Wrapped Setters ---
  const wrappedSetEmployees = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(employees);
      saveEmployees(updated);
    } else {
      saveEmployees(newVal);
    }
  };

  const wrappedSetLeads = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(leads);
      saveLeads(updated);
    } else {
      saveLeads(newVal);
    }
  };

  const wrappedSetProjects = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(projects);
      saveProjects(updated);
    } else {
      saveProjects(newVal);
    }
  };

  const wrappedSetNotifications = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(notifications);
      saveNotifications(updated);
    } else {
      saveNotifications(newVal);
    }
  };

  // Helper to filter offers based on user role
  const getAccessibleOffers = () => {
    if (!offers || offers.length === 0) return [];
    return offers.filter(o => o.id !== 'TOP_PERFORMERS' && !o.id.startsWith('AVAIL_PLOTS_') && !o.message?.includes('[ADMIN]'));
  };

  const wrappedSetOffers = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(offers);
      return saveOffers(updated);
    }
    return saveOffers(newVal);
  };

  const wrappedSetAdminSettings = (newVal) => {
    if (typeof newVal === 'function') {
      const updated = newVal(adminSettings);
      saveAdminSettings(updated);
    } else {
      saveAdminSettings(newVal);
    }
  };

  // --- Session Management ---
  const setSessionLogin = () => {
    const loginTime = Date.now();
    setSessionExpiry(loginTime);
    SecureStorage.setSession('login_time', loginTime.toString());
  };

  const resetSessionTimer = () => {
    if (currentUser) {
      const loginTime = Date.now();
      setSessionExpiry(loginTime);
      SecureStorage.setSession('login_time', loginTime.toString());
    }
  };

  const checkSessionExpiry = () => {
    const storedLoginTime = SecureStorage.getSession('login_time');
    if (storedLoginTime) {
      const loginTime = parseInt(storedLoginTime, 10);
      const elapsedTime = Date.now() - loginTime;
      const sessionTimeoutMs = SECURITY_CONFIG.SESSION_TIMEOUT; // 30 minutes
      
      if (elapsedTime > sessionTimeoutMs) {
        setCurrentUser(null);
        SecureStorage.clearSession();
        return false;
      }
      setSessionExpiry(loginTime);
      return true;
    }
    return false;
  };

  // Check session on mount
  useEffect(() => {
    checkSessionExpiry();
  }, []);

  // Reset timer on user activity
  useEffect(() => {
    if (!currentUser) return;

    const handleActivity = () => {
      resetSessionTimer();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousemove', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, [currentUser]);

  // --- Toast Notifications ---
  const addToast = (message, type = 'info', autoClose = true) => {
    const id = `toast_${Date.now()}`;
    const newToast = {
      id,
      message,
      type, // 'info', 'success', 'warning', 'error'
      displayCount: 0,
      maxDisplays: 2,
    };
    setToasts(prev => [...prev, newToast]);
    
    if (autoClose) {
      setTimeout(() => removeToast(id), 4000);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const incrementToastDisplay = (id) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, displayCount: t.displayCount + 1 } : t
    ).filter(t => t.displayCount < t.maxDisplays));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="text-slate-900 text-xl">Loading...</div>
      </div>
    );
  }

  const value = {
    currentUser, setCurrentUser, justLoggedIn, setJustLoggedIn,
    setSessionLogin, checkSessionExpiry, resetSessionTimer,
    toasts, addToast, removeToast, incrementToastDisplay,
    employees, setEmployees: wrappedSetEmployees, deleteEmployee,
    leads, setLeads: wrappedSetLeads,
    projects, setProjects: wrappedSetProjects, deleteProject,
    notifications, setNotifications: wrappedSetNotifications,
    salesCount: approvedSalesCount,
    setSalesCount: () => {},
    adminSettings, setAdminSettings: wrappedSetAdminSettings,
    offers: getAccessibleOffers(),
    rawOffers: offers,
    setOffers: wrappedSetOffers, isOfferActive, fetchOffers, deleteOffer,
    topPerformers, saveTopPerformers, clearTopPerformers, isTopPerformersActive,
    refreshAll: loadData,
    isSupabaseConnected: SUPABASE_ENABLED,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
