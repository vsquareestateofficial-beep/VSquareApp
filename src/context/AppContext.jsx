import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapOfferFromDb, mapOfferToDb } from '../utils/offers';

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
    let rawEmployees = [];
    if (SUPABASE_ENABLED) {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (error) {
          console.error('Error fetching employees:', error);
        } else {
          rawEmployees = data || [];
        }
      } catch (e) {
        console.error('Error in fetchEmployees Supabase:', e);
      }
    } else {
      rawEmployees = JSON.parse(localStorage.getItem('vsquare_employees') || '[]');
    }

    const localAttrs = JSON.parse(localStorage.getItem('vsquare_employee_attrs') || '{}');
    const mappedData = rawEmployees.map(emp => {
      const attrs = localAttrs[emp.id] || {};
      return {
        ...emp,
        isFresher: emp.isfresher !== undefined ? emp.isfresher : emp.isFresher,
        isLead: emp.islead !== undefined ? emp.islead : emp.isLead,
        isBlocked: emp.isblocked !== undefined ? emp.isblocked : emp.isBlocked,
        joinDate: emp.joindate || emp.joinDate,
        teamLeadId: emp.teamleadid || emp.teamLeadId,
        office: 'Corporate Office',
        branchOffice: attrs.branchOffice || 'Corporate Office',
        bloodGroup: attrs.bloodGroup || 'O+ve',
        manualTotalEarned: (emp.manual_total_earned || attrs.manualTotalEarned) ?? '',
        manualPendingDue: (emp.manual_pending_due || attrs.manualPendingDue) ?? '',
        manualSalesCount: (emp.manual_sales_count || attrs.manualSalesCount) ?? '',
        availablePlotsNote: attrs.availablePlotsNote ?? '',
        earningPlots: emp.earning_plots || attrs.earningPlots || [],
      };
    });
    setEmployees(mappedData);
  };

  const saveEmployees = async (newEmployees) => {
    setEmployees(newEmployees);
    
    // Save extra attributes to localStorage
    const localAttrs = JSON.parse(localStorage.getItem('vsquare_employee_attrs') || '{}');
    newEmployees.forEach(emp => {
      const prev = localAttrs[emp.id] || {};
      localAttrs[emp.id] = {
        ...prev,
        branchOffice: emp.branchOffice || prev.branchOffice || 'Corporate Office',
        bloodGroup: emp.bloodGroup || prev.bloodGroup || 'O+ve',
        manualTotalEarned: emp.manualTotalEarned ?? prev.manualTotalEarned ?? '',
        manualPendingDue: emp.manualPendingDue ?? prev.manualPendingDue ?? '',
        manualSalesCount: emp.manualSalesCount ?? prev.manualSalesCount ?? '',
        availablePlotsNote: emp.availablePlotsNote ?? prev.availablePlotsNote ?? '',
        earningPlots: emp.earningPlots ?? prev.earningPlots ?? [],
      };
    });
    localStorage.setItem('vsquare_employee_attrs', JSON.stringify(localAttrs));

    if (!SUPABASE_ENABLED) {
      localStorage.setItem('vsquare_employees', JSON.stringify(newEmployees));
      return;
    }
    
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
        earning_plots: emp.earningPlots || []
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
    let fetchedLeads = [];
    if (SUPABASE_ENABLED) {
      try {
        const { data, error } = await supabase.from('leads').select('*');
        if (error) {
          console.error('Error fetching leads:', error);
        } else {
          fetchedLeads = data || [];
        }
      } catch (e) {
        console.error('Error in fetchLeads:', e);
      }
    } else {
      fetchedLeads = JSON.parse(localStorage.getItem('vsquare_leads') || '[]');
    }

    const mappedData = fetchedLeads.map(lead => {
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
  };

  const saveLeads = async (newLeads) => {
    setLeads(newLeads);

    if (!SUPABASE_ENABLED) {
      localStorage.setItem('vsquare_leads', JSON.stringify(newLeads));
      return;
    }
    
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
        console.error('Error fetching projects:', error);
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
      console.error('Error in fetchProjects:', e);
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
  const [offers, setOffers] = useState(() => {
    try {
      const saved = localStorage.getItem('vsquare_offers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Error loading offers from localStorage:', e);
      return [];
    }
  });

  const fetchOffers = async () => {
    if (!SUPABASE_ENABLED) {
      console.warn('Supabase not enabled - using local offers cache');
      return;
    }
    
    try {
      const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase fetch offers failed, using local cache:', error);
        return;
      }
      
      const mapped = (data || []).map(mapOfferFromDb).filter(Boolean);
      
      // Merge Supabase data with local data to avoid losing unsync'd offers
      const currentOffers = offers || [];
      const supabaseIds = new Set(mapped.map(o => o.id));
      const localOnlyOffers = currentOffers.filter(o => !supabaseIds.has(o.id));
      const mergedOffers = [...mapped, ...localOnlyOffers];
      
      setOffers(mergedOffers);
      try {
        localStorage.setItem('vsquare_offers', JSON.stringify(mergedOffers));
      } catch (err) {
        console.warn('Failed to save offers to localStorage:', err);
      }
    } catch (e) {
      console.warn('Error in fetchOffers:', e);
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
    
    // Always save to localStorage
    try {
      localStorage.setItem('vsquare_offers', JSON.stringify(newOffers));
    } catch (err) {
      console.warn('Failed to save offers to localStorage:', err);
    }

    if (!SUPABASE_ENABLED) {
      console.warn('Supabase not enabled - offers saved to local storage only');
      return { ok: true };
    }

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

      const activeNow = newOffers.filter((o) => {
        const now = new Date();
        const startOk = !o.startDate || new Date(o.startDate) <= now;
        const endOk = !o.endDate || new Date(o.endDate) >= now;
        const isNew = !offers.find((oldOffer) => oldOffer.id === o.id);
        return startOk && endOk && o.isActive !== false && isNew;
      });

      if (adminSettings.enableNotifications && activeNow.length > 0) {
        const notificationsToAdd = activeNow.map((o) => ({
          id: `NOTIF${Date.now()}${o.id}`,
          type: 'Offer',
          title: o.title,
          message: o.message || '',
          tag: 'INFO',
          readBy: [],
          forEmployees: true,
          created_at: new Date().toISOString(),
        }));
        saveNotifications([...notificationsToAdd, ...notifications]);
      }

      return { ok: true };
    } catch (e) {
      console.error('Error saving offers to Supabase:', e);
      return { ok: false, error: e.message || 'Save failed' };
    }
  };

  const deleteOffer = async (offerId) => {
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      console.error('Unauthorized: Only admins can delete offers');
      return { ok: false, error: 'Unauthorized: Only admins can delete offers' };
    }

    try {
      // First delete from Supabase if enabled (CRITICAL - must succeed)
      if (SUPABASE_ENABLED) {
        const { error: deleteError } = await supabase
          .from('offers')
          .delete()
          .eq('id', offerId)
          .eq('is_admin_only', true); // Extra security: only delete admin-created offers
        
        if (deleteError) {
          console.error('Error deleting offer from Supabase:', deleteError);
          return { ok: false, error: `Failed to delete from database: ${deleteError.message}` };
        }
        console.log('✓ Offer deleted from Supabase:', offerId);
      }

      // Then update local state and localStorage
      const updatedOffers = offers.filter(o => o.id !== offerId);
      setOffers(updatedOffers);
      
      try {
        localStorage.setItem('vsquare_offers', JSON.stringify(updatedOffers));
        console.log('✓ Offer deleted from localStorage:', offerId);
      } catch (err) {
        console.warn('Warning: Failed to update localStorage cache:', err);
      }
      
      return { ok: true, message: 'Offer deleted successfully' };
    } catch (e) {
      console.error('Fatal error in deleteOffer:', e);
      return { ok: false, error: e.message || 'Unknown error occurred' };
    }
  };

  // --- Notifications ---
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('vsquare_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Error loading notifications from localStorage:', e);
      return [];
    }
  });

  const fetchNotifications = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Error fetching notifications (falling back to local cache):', error);
        return;
      }
      const mappedData = (data || []).map(notif => ({
        ...notif,
        forEmployees: notif.foremployees !== undefined ? notif.foremployees : notif.forEmployees !== undefined ? notif.forEmployees : true,
        targetEmployeeIds: notif.targetemployeeids || notif.targetEmployeeIds,
        readBy: typeof notif.readby === 'string' ? notif.readby.split(',').filter(Boolean) : (Array.isArray(notif.readby) ? notif.readby : (notif.readBy || []))
      }));
      setNotifications(mappedData);
      try {
        localStorage.setItem('vsquare_notifications', JSON.stringify(mappedData));
      } catch (err) {
        console.warn('Failed to save notifications to localStorage:', err);
      }
    } catch (e) {
      console.warn('Error in fetchNotifications (falling back to local cache):', e);
    }
  };

  const cleanupOldNotifications = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (SUPABASE_ENABLED) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .lt('created_at', sevenDaysAgo.toISOString());
          
        if (error) {
          console.error('Error deleting old notifications from Supabase:', error);
        } else {
          const updatedNotifications = notifications.filter(notif => {
            if (notif.created_at) {
              const notifDate = new Date(notif.created_at);
              return notifDate >= sevenDaysAgo;
            }
            return true;
          });
          setNotifications(updatedNotifications);
          try {
            localStorage.setItem('vsquare_notifications', JSON.stringify(updatedNotifications));
          } catch (err) {
            console.warn('Failed to save notifications to localStorage:', err);
          }
        }
      } else {
        const updatedNotifications = notifications.filter(notif => {
          if (notif.created_at) {
            const notifDate = new Date(notif.created_at);
            return notifDate >= sevenDaysAgo;
          }
          return true;
        });
        setNotifications(updatedNotifications);
        try {
          localStorage.setItem('vsquare_notifications', JSON.stringify(updatedNotifications));
        } catch (err) {
          console.warn('Failed to save notifications to localStorage:', err);
        }
      }
    } catch (e) {
      console.error('Error in cleanupOldNotifications:', e);
    }
  };

  const saveNotifications = async (newNotifications) => {
    setNotifications(newNotifications);
    try {
      localStorage.setItem('vsquare_notifications', JSON.stringify(newNotifications));
    } catch (err) {
      console.warn('Failed to save notifications to localStorage:', err);
    }

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
      if (error) console.warn('Error saving notifications to Supabase (saved locally):', error);
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
  const [topPerformers, setTopPerformers] = useState(() => {
    try {
      const saved = localStorage.getItem('vsquare_top_performers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Error loading top performers from localStorage:', e);
      return [];
    }
  });

  const [topPerformersExpiry, setTopPerformersExpiry] = useState(() => {
    try {
      const saved = localStorage.getItem('vsquare_top_performers_expiry');
      return saved ? parseInt(saved, 10) : null;
    } catch (e) {
      return null;
    }
  });

  const fetchTopPerformers = async () => {
    if (!SUPABASE_ENABLED) return;
    try {
      const { data, error } = await supabase.from('top_performers').select('*').eq('id', 1).single();
      if (error) {
        console.error('Error fetching top performers:', error);
        return;
      }
      if (data) {
        const performers = data.performers || [];
        const expiry = data.expiry_at ? new Date(data.expiry_at).getTime() : null;
        setTopPerformers(performers);
        setTopPerformersExpiry(expiry);
        localStorage.setItem('vsquare_top_performers', JSON.stringify(performers));
        if (expiry) {
          localStorage.setItem('vsquare_top_performers_expiry', expiry.toString());
        }
      }
    } catch (e) {
      console.error('Error in fetchTopPerformers:', e);
    }
  };

  const saveTopPerformers = async (performers, daysToShow = 7) => {
    const expiry = Date.now() + (daysToShow * 24 * 60 * 60 * 1000);
    setTopPerformers(performers);
    setTopPerformersExpiry(expiry);
    localStorage.setItem('vsquare_top_performers', JSON.stringify(performers));
    localStorage.setItem('vsquare_top_performers_expiry', expiry.toString());

    if (!SUPABASE_ENABLED) return;
    try {
      const { error } = await supabase.from('top_performers').upsert({
        id: 1,
        performers,
        expiry_at: new Date(expiry).toISOString()
      });
      if (error) {
        console.error('Error saving top performers:', error);
      }
    } catch (e) {
      console.error('Error in saveTopPerformers:', e);
    }
  };

  const clearTopPerformers = async () => {
    setTopPerformers([]);
    setTopPerformersExpiry(null);
    localStorage.removeItem('vsquare_top_performers');
    localStorage.removeItem('vsquare_top_performers_expiry');

    if (!SUPABASE_ENABLED) return;
    try {
      const { error } = await supabase.from('top_performers').delete().eq('id', 1);
      if (error) {
        console.error('Error clearing top performers:', error);
      }
    } catch (e) {
      console.error('Error in clearTopPerformers:', e);
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
      const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (error) {
        console.error('Error fetching admin settings:', error);
        return;
      }
      if (data) {
        const mappedData = {
          ...data,
          enableNotifications: data.enablenotifications !== undefined ? data.enablenotifications : data.enableNotifications !== undefined ? data.enableNotifications : true,
          autoApproveSales: data.autoapprovesales !== undefined ? data.autoapprovesales : data.autoApproveSales !== undefined ? data.autoApproveSales : false,
          lockEmployeeDeletion: data.lockemployeedeletion !== undefined ? data.lockemployeedeletion : data.lockEmployeeDeletion !== undefined ? data.lockEmployeeDeletion : false,
          autoCleanupNotifications: data.autocleanupnotifications !== undefined ? data.autocleanupnotifications : data.autoCleanupNotifications !== undefined ? data.autoCleanupNotifications : true
        };
        setAdminSettings(mappedData);
      }
    } catch (e) {
      console.error('Error in fetchAdminSettings:', e);
    }
  };

  const saveAdminSettings = async (newSettings) => {
    setAdminSettings(newSettings);
    if (!SUPABASE_ENABLED) return;
    try {
      const { error } = await supabase.from('admin_settings').upsert({ 
        id: 1, 
        enablenotifications: newSettings.enableNotifications !== undefined ? newSettings.enableNotifications : newSettings.enablenotifications !== undefined ? newSettings.enablenotifications : true,
        autoapprovesales: newSettings.autoApproveSales !== undefined ? newSettings.autoApproveSales : newSettings.autoapprovesales !== undefined ? newSettings.autoapprovesales : false,
        lockemployeedeletion: newSettings.lockEmployeeDeletion !== undefined ? newSettings.lockEmployeeDeletion : newSettings.lockemployeedeletion !== undefined ? newSettings.lockemployeedeletion : false,
        autocleanupnotifications: newSettings.autoCleanupNotifications !== undefined ? newSettings.autoCleanupNotifications : newSettings.autocleanupnotifications !== undefined ? newSettings.autocleanupnotifications : true
      });
      if (error) console.error('Error saving admin settings:', error);
    } catch (e) {
      console.error('Error in saveAdminSettings:', e);
    }
  };

  const loadData = async () => {
    if (SUPABASE_ENABLED) {
      await Promise.all([
        fetchEmployees(),
        fetchLeads(),
        fetchProjects(),
        fetchNotifications(),
        fetchOffers(),
        fetchAdminSettings(),
        fetchTopPerformers()
      ]);
    }
    setLoading(false);
  };

  // --- Initial Fetch & Realtime Subscriptions with Polling ---
  useEffect(() => {
    loadData();

    // Setup polling intervals for auto-updates (fallback for real-time)
    const pollingIntervals = [];
    
    if (SUPABASE_ENABLED) {
      // Poll employees every 5 seconds (CRITICAL: earnings & availablePlotsNote need fast updates)
      pollingIntervals.push(
        setInterval(() => {
          fetchEmployees().catch(err => console.warn('Polling fetchEmployees error:', err));
        }, 5000)
      );

      // Poll leads every 6 seconds (fast updates for new assignments & changes)
      pollingIntervals.push(
        setInterval(() => {
          fetchLeads().catch(err => console.warn('Polling fetchLeads error:', err));
        }, 6000)
      );

      // Poll offers every 8 seconds (faster for employee-facing data)
      pollingIntervals.push(
        setInterval(() => {
          fetchOffers().catch(err => console.warn('Polling fetchOffers error:', err));
        }, 8000)
      );

      // Poll notifications every 10 seconds
      pollingIntervals.push(
        setInterval(() => {
          fetchNotifications().catch(err => console.warn('Polling fetchNotifications error:', err));
        }, 10000)
      );

      // Poll projects every 12 seconds
      pollingIntervals.push(
        setInterval(() => {
          fetchProjects().catch(err => console.warn('Polling fetchProjects error:', err));
        }, 12000)
      );

      // Setup real-time subscription channel
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, (payload) => {
          console.log('Realtime offers change received!', payload);
          fetchOffers();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
          console.log('Realtime notifications change received!', payload);
          fetchNotifications();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
          console.log('Realtime leads change received!', payload);
          fetchLeads();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, (payload) => {
          console.log('Realtime employees change received!', payload);
          fetchEmployees();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
          console.log('Realtime projects change received!', payload);
          fetchProjects();
        })
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      // Handle page visibility changes (user switches tabs)
      const handleVisibilityChange = () => {
        if (document.hidden === false) {
          console.log('Page became visible - refreshing all data');
          loadData();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        // Cleanup: remove all polling intervals
        pollingIntervals.forEach(interval => clearInterval(interval));
        // Remove real-time subscription
        supabase.removeChannel(channel);
        // Remove visibility listener
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    return () => {
      // Cleanup polling if Supabase is not enabled
      pollingIntervals.forEach(interval => clearInterval(interval));
    };
  }, []);

  // --- Cleanup old notifications when settings load ---
  useEffect(() => {
    if (!loading && adminSettings.autoCleanupNotifications) {
      cleanupOldNotifications();
    }
  }, [loading, adminSettings.autoCleanupNotifications]);

  // Keep logged-in employee in sync when admin updates earnings attrs
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

  // --- Wrapped Setters that Save to Supabase ---
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
    
    // Admin sees all offers (including admin-only and test data)
    if (currentUser?.role === 'admin') {
      return offers;
    }
    
    // Employees only see public offers (not marked as admin-only)
    // This prevents data leakage even if someone inspects the network tab
    return offers.filter(o => {
      // Hide admin-only metadata
      if (o.id === 'TOP_PERFORMERS') return false; // Already filtered elsewhere
      if (o.message?.includes('[ADMIN]')) return false; // Hide admin notes
      return true;
    });
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

  // --- Session Management (Activity-based 3 hour timeout) ---
  const setSessionLogin = () => {
    const loginTime = Date.now();
    setSessionExpiry(loginTime);
    localStorage.setItem('vsquare_session_login_time', loginTime.toString());
  };

  const resetSessionTimer = () => {
    if (currentUser) {
      const loginTime = Date.now();
      setSessionExpiry(loginTime);
      localStorage.setItem('vsquare_session_login_time', loginTime.toString());
    }
  };

  const checkSessionExpiry = () => {
    const storedLoginTime = localStorage.getItem('vsquare_session_login_time');
    if (storedLoginTime) {
      const loginTime = parseInt(storedLoginTime, 10);
      const elapsedTime = Date.now() - loginTime;
      const threeHoursMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
      
      if (elapsedTime > threeHoursMs) {
        // Session expired
        setCurrentUser(null);
        localStorage.removeItem('vsquare_session_login_time');
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
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
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
    notifications, setNotifications: wrappedSetNotifications, cleanupOldNotifications,
    salesCount: approvedSalesCount,
    setSalesCount: () => {},
    adminSettings, setAdminSettings: wrappedSetAdminSettings,
    offers: getAccessibleOffers(), setOffers: wrappedSetOffers, isOfferActive, fetchOffers,
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
