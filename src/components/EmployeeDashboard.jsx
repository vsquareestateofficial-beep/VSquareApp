import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, Briefcase, Plus, UserCircle, Users, X, ChevronRight, CheckCircle2, AlertCircle, Building, MapPin, Tag, LogOut, ArrowRight, RefreshCw, Pencil, Trash2, ShieldAlert, BadgeCheck, Phone, Mail, Award, Medal, Lock } from 'lucide-react';
import { getTeamLeadForEmployee, getTeamMembersForLead, normalizeTeamName } from '../utils/teams';
import EmployeeTeamTab from './EmployeeTeamTab';
import EmployeeAvailPlots from './EmployeeAvailPlots';
import EmployeeOffers from './EmployeeOffers';
import EmployeeEarnings from './EmployeeEarnings';
import { getAvailPlotsImages } from '../utils/availPlotsImages';
import BranchWiseSales from './BranchWiseSales';

export default function EmployeeDashboard({ activeTab, setActiveTab }) {
  const { currentUser, setCurrentUser, leads, setLeads, projects, employees, setEmployees, notifications, setNotifications, salesCount, adminSettings, offers, refreshAll } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availPlotsImages, setAvailPlotsImages] = useState([]);

  useEffect(() => {
    if (activeTab === 'NOTIFY' && currentUser?.id) {
      setAvailPlotsImages(getAvailPlotsImages(currentUser.id));
    }
  }, [activeTab, currentUser?.id, employees]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshAll) await refreshAll();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const [showAddLead, setShowAddLead] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [resetPasswordError, setResetPasswordError] = useState('');
  
  // Lead Form
  const [leadName, setLeadName] = useState('');
  const [leadMobile, setLeadMobile] = useState('');
  const [leadProject, setLeadProject] = useState('');
  const [leadBudget, setLeadBudget] = useState('');
  const [leadLocation, setLeadLocation] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [leadStatus, setLeadStatus] = useState('New');
  const [leadVisitDate, setLeadVisitDate] = useState('');
  const [leadRemarks, setLeadRemarks] = useState('');
  const [leadError, setLeadError] = useState({});

  const myLeads = leads.filter(l => l.assignedTo === currentUser.id);
  const visibleProjects = projects.filter(p => p.isVisible !== false);
  const myTeamLead = getTeamLeadForEmployee(employees, currentUser);
  const myTeamMembers = currentUser.isLead
    ? getTeamMembersForLead(employees, currentUser)
    : [];

  const handleResetPassword = () => {
    setResetPasswordError('');
    
    if (resetPasswordForm.oldPassword !== currentUser.password) {
      setResetPasswordError('Current password is incorrect');
      return;
    }
    
    if (resetPasswordForm.newPassword.length < 4) {
      setResetPasswordError('New password must be at least 4 characters');
      return;
    }
    
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      setResetPasswordError('Passwords do not match');
      return;
    }

    const updatedEmployees = employees.map(e => 
      e.id === currentUser.id ? { ...e, password: resetPasswordForm.newPassword } : e
    );
    
    setCurrentUser({ ...currentUser, password: resetPasswordForm.newPassword });
    setEmployees(updatedEmployees);
    setShowResetPassword(false);
    setResetPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setResetPasswordError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const validateLead = () => {
    const errors = {};
    if (!leadName) errors.leadName = "Name is required";
    if (!leadMobile || leadMobile.length !== 10 || !/^\d+$/.test(leadMobile)) errors.leadMobile = "Must be exactly 10 digits";
    if (!leadProject) errors.leadProject = "Project is required";
    
    setLeadError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLead = () => {
    if (!validateLead()) return;

    if (editingLeadId) {
      setLeads(leads.map(l => l.id === editingLeadId ? {
        ...l,
        name: leadName, mobile: leadMobile, project: leadProject,
        budget: leadBudget, location: leadLocation, source: leadSource,
        status: leadStatus,
        visitDate: leadVisitDate, remarks: leadRemarks
      } : l));
    } else {
      setLeads([...leads, {
        id: `LD${Date.now()}`,
        assignedTo: currentUser.id,
        status: leadStatus,
        name: leadName, mobile: leadMobile, project: leadProject,
        budget: leadBudget, location: leadLocation, source: leadSource,
        visitDate: leadVisitDate, remarks: leadRemarks
      }]);
    }

    setShowAddLead(false);
    resetLeadForm();
  };

  const resetLeadForm = () => {
    setEditingLeadId(null);
    setLeadName(''); setLeadMobile(''); setLeadProject('');
    setLeadBudget(''); setLeadLocation(''); setLeadSource(''); setLeadStatus('New');
    setLeadVisitDate(''); setLeadRemarks(''); setLeadError({});
  };

  const handleEditLead = (lead) => {
    setEditingLeadId(lead.id);
    setLeadName(lead.name || ''); setLeadMobile(lead.mobile || '');
    setLeadProject(lead.project || ''); setLeadBudget(lead.budget || '');
    setLeadLocation(lead.location || ''); setLeadSource(lead.source || ''); setLeadStatus(lead.status || 'New');
    setLeadVisitDate(lead.visitDate || ''); setLeadRemarks(lead.remarks || '');
    setShowAddLead(true);
  };

  const handleStatusChange = (leadId, newStatus) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    if (newStatus === 'Success') {
      const lead = leads.find(l => l.id === leadId);
      const exists = notifications.find(n => n.leadId === leadId && n.type === 'Sales Request');
      if (!exists) {
        const notification = {
          id: `NOTIF${Date.now()}`,
          leadId,
          type: 'Sales Request',
          title: 'New Sales Request',
          message: `${currentUser.name} marked lead ${lead.name} as success.`,
          tag: 'SALE',
          readBy: [],
          empName: currentUser.name,
          customerName: lead.name,
          time: new Date().toLocaleString(),
          created_at: new Date().toISOString(),
          status: adminSettings.autoApproveSales ? 'Approved' : 'Pending'
        };

        if (adminSettings.autoApproveSales) {
          setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'Approved' } : l));
        }

        setNotifications([notification, ...notifications]);
      }
    }
  };

  const [viewProject, setViewProject] = useState(null);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative pb-32 overflow-x-hidden">
      {/* Ultra Premium Deep Emerald Gradient Header */}
      <div className="absolute top-0 left-0 right-0 h-[300px] md:h-[340px] bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f766e] rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-[0_20px_50px_rgba(4,120,87,0.3)] z-0 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-32 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="md:ml-24 max-w-sm md:max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 md:mb-10 pt-2">
          <div>
            <p className="text-[9px] font-black tracking-[0.3em] text-emerald-100/80 mb-1 uppercase">V Square &bull; Employee</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {activeTab === 'DASH' && 'Dashboard'}
              {activeTab === 'EARNINGS' && 'Earnings'}
              {activeTab === 'PROJECTS' && 'Projects'}
              {activeTab === 'OFFERS' && 'Announcements'}
              {activeTab === 'NOTIFY' && 'Avail Plots'}
              {activeTab === 'TEAM' && 'My Team'}
              {activeTab === 'ME' && 'Profile'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className={`w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-sm">
              <LogOut size={15} />
            </button>
          </div>
        </div>

      {activeTab === 'NOTIFY' && (
        <EmployeeAvailPlots
          availablePlotsNote={
            employees.find((e) => e.id === currentUser?.id)?.availablePlotsNote ||
            currentUser?.availablePlotsNote ||
            ''
          }
          availPlotsImages={availPlotsImages}
        />
      )}

      {activeTab === 'OFFERS' && (
        <EmployeeOffers />
      )}

      {activeTab === 'EARNINGS' && (
        <EmployeeEarnings currentUser={currentUser} />
      )}

      {activeTab === 'DASH' && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-white/20 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
            <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#047857] mb-1.5 uppercase">WELCOME BACK</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{currentUser.name}</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Let's close some deals today.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            <div className="bg-white border border-white/20 p-4 sm:p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover-lift cursor-pointer">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#047857]/10 flex items-center justify-center text-[#047857] shrink-0"><Building size={20} className="sm:w-7 sm:h-7" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#047857]/70 mb-1 uppercase">VISIBLE PROJECTS</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{visibleProjects.length}</h3>
              </div>
            </div>
            {currentUser.isLead && (
              <div className="bg-white border border-white/20 p-4 sm:p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover-lift cursor-pointer">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#047857]/10 flex items-center justify-center text-[#047857] shrink-0"><Briefcase size={20} className="sm:w-7 sm:h-7" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#047857]/70 mb-1 uppercase">TEAM MEMBERS</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{myTeamMembers.length}</h3>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-[10px] font-black tracking-widest text-[#047857] mb-3 uppercase">Overall Project Status</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-center shadow-sm">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Plots</p>
                <p className="text-xl font-extrabold text-slate-800">{visibleProjects.reduce((acc, p) => acc + (parseInt(p.totalPlots) || 0), 0)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center shadow-sm">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available</p>
                <p className="text-xl font-extrabold text-[#047857]">{visibleProjects.reduce((acc, p) => acc + (parseInt(p.availablePlots) || 0), 0)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center shadow-sm">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sold</p>
                <p className="text-xl font-extrabold text-[#047857]">{visibleProjects.reduce((acc, p) => acc + (parseInt(p.soldPlots) || 0), 0)}</p>
              </div>
            </div>
            
            {visibleProjects.length > 0 && (
              <>
                <div className="h-px bg-emerald-100 mb-3"></div>
                <p className="text-[9px] font-bold tracking-widest text-emerald-700 mb-2 uppercase">Project Breakdown</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                  {visibleProjects.map((proj, idx) => (
                    <div key={idx} className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-[10px] text-emerald-900">{proj.name}</span>
                        <span className={`text-[7px] px-2 py-0.5 rounded-full ${proj.status === 'Sold Out' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-200 text-emerald-800 border border-emerald-300'}`}>
                          {proj.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="text-center">
                          <p className="text-[7px] font-bold text-emerald-700">Total</p>
                          <p className="font-bold text-[10px] text-emerald-900">{proj.totalPlots || '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[7px] font-bold text-emerald-700">Avail</p>
                          <p className="font-bold text-[10px] text-emerald-600">{proj.availablePlots || '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[7px] font-bold text-emerald-700">Sold</p>
                          <p className="font-bold text-[10px] text-emerald-600">{proj.soldPlots || '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {visibleProjects.length === 0 ? (
             <div className="text-center text-emerald-100 mt-10">No visible projects right now.</div>
          ) : visibleProjects.map((proj, index) => (
            <div key={index} className="bg-white border-none p-2.5 rounded-2xl relative shadow-sm">
              <div className="flex gap-2 items-center mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-white shrink-0 overflow-hidden shadow-sm">
                  {proj.imageUrl ? <img src={proj.imageUrl} alt={proj.name} className="w-full h-full object-cover" /> : <Building size={16} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-900">{proj.name}</h3>
                  <p className="text-[9px] font-bold text-emerald-700">{proj.location} • {proj.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-center">
                  <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Price</p>
                  <p className="text-[11px] font-bold text-emerald-600">{proj.pricePerSqYd || '—'}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-center">
                  <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Total</p>
                  <p className="text-[11px] font-bold text-emerald-900">{proj.totalPlots || '—'}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-center">
                  <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Avail</p>
                  <p className="text-[11px] font-bold text-emerald-600">{proj.availablePlots || '—'}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg text-center">
                  <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Sold</p>
                  <p className="text-[11px] font-bold text-emerald-600">{proj.soldPlots || '—'}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewProject(proj)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl font-bold text-[10px] transition-colors shadow-sm"
              >
                View Details
              </button>
            </div>
          ))}

          {viewProject && (
            <div className="fixed inset-0 bg-emerald-600 z-50 p-3 overflow-y-auto pb-32">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-bold text-white">{viewProject.name}</h2>
                <button onClick={() => setViewProject(null)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-50"><X size={18}/></button>
              </div>
              {viewProject.imageUrl && <img src={viewProject.imageUrl} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-sm" alt="Project" />}
              <div className="space-y-2.5">
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Location</span>
                  <span className="font-bold text-xs text-emerald-900">{viewProject.location}</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Price / Sq Yd</span>
                  <span className="font-bold text-xs text-emerald-900">{viewProject.pricePerSqYd}</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Total Price</span>
                  <span className="font-bold text-xs text-emerald-600">{viewProject.totalPrice}</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Starting Size</span>
                  <span className="font-bold text-xs text-emerald-900">{viewProject.startingSize}</span>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Road Size</span>
                  <span className="font-bold text-xs text-emerald-900">{viewProject.roadSize}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-emerald-100 p-3 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase block mb-2">Facing</span>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const facingStr = viewProject.facing;
                        const facingArray = facingStr ? (Array.isArray(facingStr) ? facingStr : facingStr.split(',').map(f => f.trim())) : [];
                        return facingArray.map((f, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-700 text-[8px] px-2 py-0.5 rounded-full border border-emerald-200">
                            {f}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                  <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                    <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Approval</span>
                    <span className="font-bold text-xs text-emerald-600">{viewProject.approval}</span>
                  </div>
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="text-[9px] font-bold text-emerald-700 tracking-wider uppercase">Availability</span>
                  <span className="font-bold text-xs text-orange-600">{viewProject.availablePlots} / {viewProject.totalPlots} Plots</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'TEAM' && (
        <EmployeeTeamTab currentUser={currentUser} employees={employees} />
      )}

      {activeTab === 'ME' && (
        <div className="space-y-3">
          <div className="bg-white border-none p-4 rounded-3xl text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 blur-3xl rounded-full"></div>
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg rounded-full flex items-center justify-center text-3xl font-bold mb-3 text-white relative z-10 border-4 border-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl md:text-3xl font-serif font-bold text-slate-800 mb-1 relative z-10">{currentUser.name}</h2>
            <p className="text-teal-600 text-[11px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-8 relative z-10">{currentUser.role}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-left relative z-10 mb-4 md:mb-8">
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">ID NO</p>
                <p className="font-bold text-xs sm:text-sm text-emerald-900">{currentUser.id}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">PHONE</p>
                <p className="font-bold text-xs sm:text-sm text-emerald-900">{currentUser.phone}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">BLOOD GROUP</p>
                <p className="font-bold text-xs sm:text-sm text-rose-500 uppercase">{currentUser.bloodGroup || 'O+ve'}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">EXPERIENCE</p>
                <p className="font-bold text-xs sm:text-sm text-emerald-900">{currentUser.isFresher ? 'Fresher' : 'Experienced'}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">JOIN DATE</p>
                <p className="font-bold text-xs sm:text-sm text-emerald-600">{currentUser.joinDate || '—'}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-1 uppercase">TEAM NAME</p>
                <p className="font-bold text-xs sm:text-sm text-emerald-900">{normalizeTeamName(currentUser.team) || 'None'}</p>
              </div>

              {/* CORPORATE OFFICE */}
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl col-span-1 sm:col-span-2 text-left flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Building size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-0.5 uppercase">Corporate Office</p>
                  <p className="font-bold text-xs sm:text-sm text-emerald-900 leading-tight">Corporate Office</p>
                </div>
              </div>

              {/* BRANCH OFFICE */}
              <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl col-span-1 sm:col-span-2 text-left flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Briefcase size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-emerald-700 mb-0.5 uppercase">Branch Office</p>
                  <p className="font-bold text-xs sm:text-sm text-emerald-900 leading-tight">
                    {currentUser.branchOffice || 'Branch Office'}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowResetPassword(true)}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-100 shadow-sm"
            >
              <Lock size={14} /> Reset Password
            </button>
          </div>
        </div>
      )}

      {showResetPassword && (
        <div className="fixed inset-0 bg-emerald-600 z-50 p-4 overflow-y-auto pb-32">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-serif font-bold text-white">Reset Password</h1>
              <p className="text-emerald-100 text-sm mt-0.5">Change your login password</p>
            </div>
            <button onClick={() => { setShowResetPassword(false); setResetPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); setResetPasswordError(''); }} className="w-9 h-9 bg-[#e2e8f0] rounded-full flex items-center justify-center text-slate-600"><X size={18}/></button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">CURRENT PASSWORD <span className="text-[#10b981]">*</span></label>
              <input 
                type="password"
                value={resetPasswordForm.oldPassword} 
                placeholder="Enter current password" 
                onChange={e => setResetPasswordForm({...resetPasswordForm, oldPassword: e.target.value})} 
                className={`w-full p-3 bg-[#e2e8f0] border ${resetPasswordError ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm`} 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">NEW PASSWORD <span className="text-[#10b981]">*</span></label>
              <input 
                type="password"
                value={resetPasswordForm.newPassword} 
                placeholder="Enter new password (min 4 chars)" 
                onChange={e => setResetPasswordForm({...resetPasswordForm, newPassword: e.target.value})} 
                className="w-full p-3 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">CONFIRM NEW PASSWORD <span className="text-[#10b981]">*</span></label>
              <input 
                type="password"
                value={resetPasswordForm.confirmPassword} 
                placeholder="Confirm new password" 
                onChange={e => setResetPasswordForm({...resetPasswordForm, confirmPassword: e.target.value})} 
                className="w-full p-3 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm" 
              />
            </div>
            {resetPasswordError && <p className="text-red-400 text-xs">{resetPasswordError}</p>}
            <div className="pt-4">
              <button onClick={handleResetPassword} className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:opacity-90 text-slate-900 py-3 rounded-xl font-black text-sm shadow-[0_0_18px_rgba(212,175,55,0.2)] transition-all">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
