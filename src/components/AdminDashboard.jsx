import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Building, Bell, LogOut, TrendingUp, Briefcase, Plus, X, Pencil, Ban, Trash2, Unlock, BadgeCheck, Phone, Eye, EyeOff, ChevronDown, ChevronUp, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import AdminAvailablePlots from './AdminAvailablePlots';
import AdminHomeStats from './AdminHomeStats';
import AdminSettings from './AdminSettings';
import AdminOffers from './AdminOffers';
import AdminEarnings from './AdminEarnings';
import {
  buildEmployeeTeamFields,
  getJoinableTeams,
  isTeamNameTaken,
  normalizeTeamName,
} from '../utils/teams';
import { buildEmployeeEarnings } from '../utils/earnings';

export default function AdminDashboard({ activeTab, setActiveTab }) {
  const { setCurrentUser, employees, setEmployees, deleteEmployee, leads, setLeads, projects, setProjects, deleteProject, notifications, setNotifications, salesCount, adminSettings, setAdminSettings, refreshAll, offers, setOffers } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshAll) await refreshAll();
    
    // Reset filters
    setEmpSearch('');
    setEmpFilterRole('All');
    setEmpFilterStatus('All');
    
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleLogout = () => setCurrentUser(null);

  const handleUpdateSetting = (field, value) => {
    setAdminSettings(prev => ({ ...prev, [field]: value }));
  };

  const DEFAULT_EMPLOYEE_ROLE = 'Sales Executive';

  // Lead Registry View Toggles
  const [showLeadNames, setShowLeadNames] = useState(true);
  const [collapseLeadsList, setCollapseLeadsList] = useState(false);
  const [collapseLeadDist, setCollapseLeadDist] = useState(false);

  // Admin Lead Edit Modal State
  const [showEditLead, setShowEditLead] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    mobile: '',
    project: '',
    budget: '',
    location: '',
    source: '',
    status: 'New',
    assignedTo: '',
    remarks: '',
    visitDate: '',
    earningAmount: ''
  });
  const [leadError, setLeadError] = useState({});

  // Employee Form State
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [empFilterRole, setEmpFilterRole] = useState('All');
  const [empFilterStatus, setEmpFilterStatus] = useState('All');
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [empForm, setEmpForm] = useState({
    id: 'VS',
    name: '',
    phone: '',
    department: 'Marketing',
    role: DEFAULT_EMPLOYEE_ROLE,
    joinDate: '',
    team: '',
    teamLeadId: '',
    isFresher: true,
    isLead: false,
    office: 'Corporate Office',
  });
  const [empError, setEmpError] = useState({});

  // Project Form State
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProjId, setEditingProjId] = useState(null);
  const [projForm, setProjForm] = useState({ name: '', location: '', totalPrice: '', pricePerSqYd: '', startingSize: '', roadSize: '', totalPlots: '', availablePlots: '', soldPlots: '', facing: ['East'], approval: 'DTCP', status: 'Available', isVisible: true, imageUrl: '' });

  const handlePlotChange = (field, value) => {
    const newForm = { ...projForm, [field]: value };
    
    const total = parseInt(newForm.totalPlots) || 0;
    const available = parseInt(newForm.availablePlots) || 0;
    const sold = parseInt(newForm.soldPlots) || 0;
    
    if (field === 'totalPlots' && available > 0) {
      newForm.soldPlots = (total - available).toString();
    } else if (field === 'totalPlots' && sold > 0) {
      newForm.availablePlots = (total - sold).toString();
    } else if (field === 'availablePlots' && total > 0) {
      newForm.soldPlots = (total - available).toString();
    } else if (field === 'availablePlots' && sold > 0) {
      newForm.totalPlots = (available + sold).toString();
    } else if (field === 'soldPlots' && total > 0) {
      newForm.availablePlots = (total - sold).toString();
    } else if (field === 'soldPlots' && available > 0) {
      newForm.totalPlots = (available + sold).toString();
    }
    
    setProjForm(newForm);
  };

  const toggleFacing = (direction) => {
    const currentFacings = projForm.facing || [];
    let newFacings;
    if (currentFacings.includes(direction)) {
      newFacings = currentFacings.filter(f => f !== direction);
    } else {
      newFacings = [...currentFacings, direction];
    }
    setProjForm({ ...projForm, facing: newFacings });
  };
  const validateEmployee = () => {
    const errors = {};
    if (!empForm.id) errors.id = "Required";
    else if (employees.some(e => e.id === empForm.id && e.id !== editingEmpId)) errors.id = "ID must be unique";

    if (!empForm.name) errors.name = "Required";
    if (!empForm.phone || empForm.phone.length !== 10 || !/^\d+$/.test(empForm.phone)) errors.phone = "Must be exactly 10 digits";
    if (!empForm.role) errors.role = "Required";
    if (!empForm.joinDate) errors.joinDate = "Required";

    if (!empForm.department) errors.department = "Required";
    if (!empForm.branchOffice) errors.branchOffice = "Required";
    if (!empForm.bloodGroup) errors.bloodGroup = "Required";

    if (empForm.isLead) {
      const team = normalizeTeamName(empForm.team);
      if (!team) errors.team = 'Team name is required for a team lead';
      else if (isTeamNameTaken(employees, team, editingEmpId)) errors.team = 'This team name is already taken';
    }

    setEmpError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEmployee = () => {
    if (!validateEmployee()) return;

    const teamFields = buildEmployeeTeamFields(empForm, employees, editingEmpId);
    const employeeData = {
      ...empForm,
      ...teamFields,
      password: empForm.phone.slice(-4),
    };

    if (editingEmpId) {
      setEmployees(employees.map(e =>
        e.id === editingEmpId ? { ...e, ...employeeData } : e
      ));
    } else {
      setEmployees([...employees, { ...employeeData, isBlocked: false }]);
    }
    setShowAddEmployee(false);
  };

  const joinableTeams = getJoinableTeams(employees, editingEmpId);

  const handleSaveProject = () => {
    if (!projForm.name) return;
    
    const projToSave = {
      ...projForm,
      facing: Array.isArray(projForm.facing) ? projForm.facing.join(', ') : projForm.facing
    };
    
    if (editingProjId) {
      const oldProj = projects.find(p => p.id === editingProjId);
      const updatedProj = { ...oldProj, ...projToSave };
      setProjects(projects.map(p => p.id === editingProjId ? updatedProj : p));
      
      if (adminSettings.enableNotifications) {
        setNotifications([{
          id: `NOTIF${Date.now()}`,
          type: 'Project Update',
          title: 'Project Updated',
          message: `${updatedProj.name} details have been updated.`,
          tag: 'INFO',
          readBy: [],
          projectId: editingProjId,
          time: new Date().toLocaleString(),
          created_at: new Date().toISOString(),
          status: 'Info',
          forEmployees: true
        }, ...notifications]);
      }
    } else {
      const newProject = { id: `PRJ${Date.now()}`, ...projToSave };
      setProjects([...projects, newProject]);
      
      if (adminSettings.enableNotifications) {
      setNotifications([{
        id: `NOTIF${Date.now()}`,
          type: 'New Project',
          title: 'New Project Added',
          message: `New project "${newProject.name}" has been added!`,
          tag: 'NEW',
          readBy: [],
          projectId: newProject.id,
        time: new Date().toLocaleString(),
          created_at: new Date().toISOString(),
          status: 'New',
          forEmployees: true
      }, ...notifications]);
      }
    }
    
    setShowAddProject(false);
    setEditingProjId(null);
  };

  const handleSettingAwareLeadNotification = (lead, leadId) => {
    const exists = notifications.find(n => n.leadId === leadId && n.type === 'Sales Request');
    if (exists) return;

    const newNotification = {
      id: `NOTIF${Date.now()}`,
      leadId,
      type: 'Sales Request',
      title: 'New Sales Request',
      message: `${lead.name} marked as success — pending approval.`,
      tag: 'SALE',
      readBy: [],
      customerName: lead.name,
      time: new Date().toLocaleString(),
      created_at: new Date().toISOString(),
      status: adminSettings.autoApproveSales ? 'Approved' : 'Pending'
    };

    if (adminSettings.autoApproveSales) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'Approved' } : l));
    }

    setNotifications([newNotification, ...notifications]);
  };

  const handleAdminEditLead = (lead) => {
    setEditingLeadId(lead.id);
    setLeadForm({
      name: lead.name || '',
      mobile: lead.mobile || '',
      project: lead.project || '',
      budget: lead.budget || '',
      location: lead.location || '',
      source: lead.source || '',
      status: lead.status || 'New',
      assignedTo: lead.assignedTo || '',
      remarks: lead.remarks || '',
      visitDate: lead.visitDate || '',
      earningAmount: lead.earningAmount || ''
    });
    setLeadError({});
    setShowEditLead(true);
  };

  const handleAdminSaveLead = () => {
    const errors = {};
    if (!leadForm.name) errors.name = "Customer name is required";
    if (!leadForm.mobile || leadForm.mobile.length !== 10 || !/^\d+$/.test(leadForm.mobile)) {
      errors.mobile = "Must be exactly 10 digits";
    }
    if (!leadForm.project) errors.project = "Project selection is required";
    if (!leadForm.assignedTo) errors.assignedTo = "Must assign to an employee";

    if (Object.keys(errors).length > 0) {
      setLeadError(errors);
      return;
    }

    setLeads(leads.map(l => l.id === editingLeadId ? {
      ...l,
      name: leadForm.name,
      mobile: leadForm.mobile,
      project: leadForm.project,
      budget: leadForm.budget,
      location: leadForm.location,
      source: leadForm.source,
      status: leadForm.status,
      assignedTo: leadForm.assignedTo,
      remarks: leadForm.remarks,
      visitDate: leadForm.visitDate,
      earningAmount: leadForm.earningAmount
    } : l));

    setShowEditLead(false);
    setEditingLeadId(null);
    setLeadError({});
  };

  return (
    <div className="admin-panel min-h-screen bg-gradient-to-br from-[#047857] to-[#065f46] text-slate-900 p-3 pb-32 max-w-4xl text-[13px] mx-auto font-sans relative">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div>
          <p className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-white/80 mb-1.5 uppercase">V SQUARE · ADMIN</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            {activeTab === 'HOME' && 'Dashboard'}
            {activeTab === 'EMP' && 'Associates'}
            {activeTab === 'PROJECTS' && 'Projects'}
            {activeTab === 'OFFERS' && 'Offers'}
            {activeTab === 'EARNINGS' && 'Earnings'}
            {activeTab === 'NOTIFY' && 'Avail Plots'}
            {activeTab === 'SETTINGS' && 'Settings'}
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} className="sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NOTIFY')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg relative"
          >
            <Bell size={18} className="sm:w-6 sm:h-6" />
          </button>
          <button onClick={handleLogout} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg">
            <LogOut size={18} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {activeTab === 'HOME' && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-white/20 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#047857]/5 blur-3xl rounded-full"></div>
            <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#047857] mb-1.5 uppercase">WELCOME BACK</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">Admin Console</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Manage operations for V Square Estates.</p>
          </div>

          <AdminHomeStats
            employeesCount={employees.length}
            projectsCount={projects.length}
          />
          
          {/* Employee Sales Panel */}
          <div className="bg-white border border-white/20 p-5 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Employee Sales</h3>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCollapseLeadDist(!collapseLeadDist)}
                    title={collapseLeadDist ? "Expand Sales" : "Collapse Sales"}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:text-[#047857] transition-all"
                  >
                    {collapseLeadDist ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#047857]/70 uppercase">TOP 3 SALES</span>
            </div>
            
            {collapseLeadDist ? (
              <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setCollapseLeadDist(false)}>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Sales List Collapsed</p>
              </div>
            ) : employees.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No employees onboarded yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {employees.map(emp => {
                  const { earnedItems, pendingItems } = buildEmployeeEarnings(emp, leads);
                  const allSales = [...earnedItems, ...pendingItems];
                  const topSales = allSales.slice(0, 3);
                  
                  return (
                    <div key={emp.id} className="flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-200 hover:border-[#047857]/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#047857]/10 text-[#047857] font-bold text-[11px] flex items-center justify-center border border-[#047857]/20 shadow-sm">
                            {emp.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-slate-900 leading-tight">{emp.name}</p>
                            <p className="text-[9px] text-slate-500">{emp.id} · {emp.role}</p>
                          </div>
                        </div>
                        <span className="bg-[#047857]/10 text-[#047857] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#047857]/20 shadow-sm">
                          {allSales.length} {allSales.length === 1 ? 'Sale' : 'Sales'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-white/20 p-5 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Project Overview</h3>
              <div className="w-8 h-8 rounded-full bg-[#047857]/10 border border-[#047857]/20 flex items-center justify-center text-[11px] text-[#047857] font-bold shadow-sm">
                {projects.length}
              </div>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No projects yet. Add one from the Projects tab.</p>
            ) : (
              <div className="space-y-3">
                {projects.map(p => (
                   <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-[#047857]/30 hover:shadow-md transition-all">
                     <div className="flex justify-between items-center mb-3">
                       <div>
                         <span className="font-bold text-sm text-slate-900">{p.name}</span>
                         <p className="text-[9px] text-slate-600 mt-0.5">{p.location}</p>
                       </div>
                       <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold ${p.status === 'Sold Out' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-[#047857]/10 text-[#047857] border border-[#047857]/20'}`}>
                         {p.status}
                       </span>
                     </div>
                     <div className="grid grid-cols-3 gap-2 mb-3">
                       <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                         <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Total</p>
                         <p className="text-lg font-extrabold text-slate-900 mt-1">{p.totalPlots || '—'}</p>
                       </div>
                       <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                         <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Avail</p>
                         <p className="text-lg font-extrabold text-[#047857] mt-1">{p.availablePlots || '—'}</p>
                       </div>
                       <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                         <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Sold</p>
                         <p className="text-lg font-extrabold text-orange-600 mt-1">{p.soldPlots || '—'}</p>
                       </div>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                       {p.pricePerSqYd && (
                         <span className="bg-[#047857]/10 text-[#047857] font-bold text-[8px] px-2 py-0.5 rounded-full border border-[#047857]/20">
                           {p.pricePerSqYd}/sqyd
                         </span>
                       )}
                       {p.approval && (
                         <span className="bg-[#047857]/10 text-[#047857] font-bold text-[8px] px-2 py-0.5 rounded-full border border-[#047857]/20">
                           {p.approval}
                         </span>
                       )}
                       {p.facing && (
                         <span className="bg-[#047857]/10 text-[#047857] font-bold text-[8px] px-2 py-0.5 rounded-full border border-[#047857]/20">
                           {Array.isArray(p.facing) ? p.facing.join(', ') : p.facing}
                         </span>
                       )}
                     </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'EMP' && !showAddEmployee && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30"
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={empFilterRole}
                onChange={e => setEmpFilterRole(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30 appearance-none"
              >
                <option value="All">All Roles</option>
                {[...new Set(employees.map(e => e.role).filter(Boolean))].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={empFilterStatus}
                onChange={e => setEmpFilterStatus(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30 appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Blocked">Blocked Only</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => { setEmpForm({ id: 'VS', name: '', phone: '', department: 'Marketing', role: DEFAULT_EMPLOYEE_ROLE, joinDate: '', team: '', teamLeadId: '', isFresher: true, isLead: false, office: 'Corporate Office', branchOffice: 'Corporate Office', bloodGroup: 'O+ve' }); setEmpError({}); setEditingEmpId(null); setShowAddEmployee(true); }}
            className="w-full bg-gradient-to-r from-[#047857] to-[#065f46] text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <Plus size={18} className="inline mr-2" /> Add Employee
          </button>
          
          <div className="space-y-3">
          {employees.filter(emp => {
            if (empSearch) {
              const query = empSearch.toLowerCase();
              const matchName = (emp.name || '').toLowerCase().includes(query);
              const matchId = (emp.id || '').toLowerCase().includes(query);
              if (!matchName && !matchId) return false;
            }
            if (empFilterRole !== 'All' && emp.role !== empFilterRole) return false;
            if (empFilterStatus === 'Active' && emp.isBlocked) return false;
            if (empFilterStatus === 'Blocked' && !emp.isBlocked) return false;
            return true;
          }).map((emp, i) => (
             <div key={i} className={`bg-white border ${emp.isBlocked ? 'border-red-200 bg-red-50/50' : 'border-slate-200'} p-4 rounded-2xl relative transition-all hover:shadow-md`}>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {emp.isBlocked && (
                    <div className="bg-red-100 border border-red-200 text-red-700 text-[8px] font-bold px-2 py-0.5 rounded-md flex items-center">
                      BLOCKED
                    </div>
                  )}
                  <div className="bg-[#047857]/10 border border-[#047857]/20 text-[#047857] text-[8px] font-bold px-2.5 py-0.5 rounded-full">
                    {emp.id}
                  </div>
                </div>

                <div className="flex gap-3 items-center mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-md ${emp.isBlocked ? 'bg-red-500/20 text-red-600' : 'bg-[#047857]/10 text-[#047857]'}`}>
                    {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-extrabold ${emp.isBlocked ? 'text-slate-600' : 'text-slate-900'}`}>{emp.name || 'Employee'}</h3>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{emp.role}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                      <Phone size={11} className={emp.isBlocked ? 'text-red-500' : 'text-[#047857]'} />
                    {emp.phone}
                  </div>
                    <div className="flex items-center gap-1.5 bg-[#047857]/10 border border-[#047857]/20 text-[#047857] text-[9px] font-bold px-2.5 py-1.5 rounded-lg">
                      <Briefcase size={10} />
                      {emp.branchOffice && emp.branchOffice.includes('Suchitra') ? 'Suchitra' : 'Kompally'}
                    </div>
                </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEmpForm({ office: 'Corporate Office', branchOffice: 'Corporate Office', bloodGroup: 'O+ve', department: emp.department || 'Marketing', ...emp }); setEditingEmpId(emp.id); setShowAddEmployee(true); }} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#047857]/10 text-slate-600 hover:text-[#047857] flex items-center justify-center transition-colors border border-slate-200"><Pencil size={13}/></button>
                    <button onClick={() => setEmployees(employees.map(e => e.id === emp.id ? { ...e, isBlocked: !e.isBlocked } : e))} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${emp.isBlocked ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'}`}>
                      {emp.isBlocked ? <Unlock size={13} /> : <Ban size={13} />}
                  </button>
                  <button
                      onClick={() => {
                        if (adminSettings.lockEmployeeDeletion) return;
                        
                        const employeeName = emp.name || 'this employee';
                        const confirmed = window.confirm(`Delete ${employeeName}?`);
                        
                        if (confirmed) {
                          deleteEmployee(emp.id);
                        }
                      }}
                    disabled={adminSettings.lockEmployeeDeletion}
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${adminSettings.lockEmployeeDeletion ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'}`}
                  >
                      <Trash2 size={13}/>
                  </button>
                  </div>
                </div>
             </div>
          ))}
          </div>
        </div>
      )}

      {showAddEmployee && (
        <div className="fixed inset-0 bg-white z-50 p-3 sm:p-4 overflow-y-auto pb-32">
          <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{editingEmpId ? 'Edit Employee' : 'Add New Employee'}</h1>
              <p className="text-slate-600 text-sm mt-1">{editingEmpId ? 'Update team member details' : 'Onboard a team member'}</p>
            </div>
            <button onClick={() => setShowAddEmployee(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"><X size={18}/></button>
          </div>

          <div className="bg-[#047857]/10 border border-[#047857]/20 rounded-2xl p-4 flex items-center gap-4 mb-4 max-w-2xl mx-auto">
            <div className="bg-[#047857] text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <BadgeCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#047857] tracking-widest uppercase">LOGIN ID</p>
              <p className="text-xs font-medium mt-1 text-slate-700">Employee will use this ID & password to sign in</p>
            </div>
          </div>

          <div className="space-y-3 mb-3">
            <div className="bg-[#f1f5f9]/60 border border-[#10b981]/20 p-3 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-600 tracking-widest uppercase mb-1">Corporate Office</p>
              <p className="text-xs font-bold text-slate-700">SLV Pride Uppal 500039 (Same for all)</p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Branch Office Location <span className="text-[#10b981]">*</span></label>
              <select value={empForm.branchOffice || 'Corporate Office'} onChange={e => setEmpForm({...empForm, branchOffice: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.branchOffice ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-xs appearance-none text-slate-700`}>
                 <option value="Corporate Office">Corporate Office</option>
                 <option value="Branch">Branch</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Blood Group <span className="text-[#10b981]">*</span></label>
              <select value={empForm.bloodGroup || 'O+ve'} onChange={e => setEmpForm({...empForm, bloodGroup: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.bloodGroup ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-xs appearance-none text-slate-700`}>
                 <option value="A+ve">A+ve</option>
                 <option value="B+ve">B+ve</option>
                 <option value="O+ve">O+ve</option>
                 <option value="AB+ve">AB+ve</option>
                 <option value="A-ve">A-ve</option>
                 <option value="B-ve">B-ve</option>
                 <option value="O-ve">O-ve</option>
                 <option value="AB-ve">AB-ve</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">EMPLOYEE ID <span className="text-[#10b981]">*</span></label>
               <input value={empForm.id} onChange={e => setEmpForm({...empForm, id: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.id ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 font-medium`}/>
               {empError.id ? <p className="text-red-400 text-[10px] mt-2">{empError.id}</p> : <p className="text-[10px] text-slate-500 mt-2">Format: VS + 5 digits (e.g. VS00101)</p>}
             </div>
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">LOGIN PASSWORD</label>
               <input
                 disabled
                 value={empForm.phone.length >= 4 ? empForm.phone.slice(-4) : '---'}
                 className="w-full p-2.5 bg-[#f1f5f9]/60 border border-[#10b981]/20/50 rounded-xl focus:outline-none text-slate-500 text-sm"
               />
               <p className="text-[10px] text-slate-500 mt-2">Auto-set to last 4 digits of phone number</p>
             </div>
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">EMPLOYEE NAME <span className="text-[#10b981]">*</span></label>
               <input value={empForm.name} placeholder="Full name" onChange={e => setEmpForm({...empForm, name: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.name ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900`}/>
             </div>
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">PHONE NUMBER <span className="text-[#10b981]">*</span></label>
               <input value={empForm.phone} placeholder="9876543210" onChange={e => setEmpForm({...empForm, phone: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.phone ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900`}/>
               {empError.phone ? <p className="text-red-400 text-[10px] mt-2">{empError.phone}</p> : <p className="text-[10px] text-slate-500 mt-2">Exactly 10 digits</p>}
             </div>
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">DEPARTMENT <span className="text-[#10b981]">*</span></label>
               <select value={empForm.department || 'Marketing'} onChange={e => setEmpForm({...empForm, department: e.target.value, role: ''})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.department ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 appearance-none`}>
                  <option value="Marketing">Marketing</option>
                  <option value="Office Employee">Office Employee</option>
               </select>
             </div>
             {empForm.department && (
             <div>
                 <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">EMPLOYEE ROLE <span className="text-[#10b981]">*</span></label>
                 <select value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.role ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 appearance-none`}>
                    <option value="" disabled>Select role</option>
                    {empForm.department === 'Marketing' ? (
                      <>
                        <option value="Team Head">Team Head</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Sales Executive">Sales Executive</option>
                      </>
                    ) : (
                      <>
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Back Office Support">Back Office Support</option>
                      </>
                    )}
                 </select>
             </div>
             )}
             <div>
               <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">JOINING DATE <span className="text-[#10b981]">*</span></label>
               <input type="date" value={empForm.joinDate} onChange={e => setEmpForm({...empForm, joinDate: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.joinDate ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-xs text-slate-900`}/>
             </div>



             <div className="bg-[#f1f5f9]/60 border border-[#10b981]/20 rounded-xl p-2.5 flex items-center justify-between">
               <span className="font-bold text-xs text-slate-900">Team Lead</span>
               <div className="flex bg-[#e2e8f0] rounded-lg p-1">
                 <button type="button" onClick={() => setEmpForm({ ...empForm, isLead: true, teamLeadId: '' })} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${empForm.isLead ? 'bg-slate-700 text-slate-900' : 'text-slate-600'}`}>Yes</button>
                 <button type="button" onClick={() => setEmpForm({ ...empForm, isLead: false, team: '', teamLeadId: '' })} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${!empForm.isLead ? 'bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] text-slate-900 shadow-lg' : 'text-slate-600'}`}>No</button>
               </div>
             </div>

             {empForm.isLead ? (
               <div>
                 <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">TEAM NAME <span className="text-[#10b981]">*</span></label>
                 <input value={empForm.team} placeholder="e.g. Alpha Team" onChange={(e) => setEmpForm({ ...empForm, team: e.target.value })} className={`w-full p-2.5 bg-[#e2e8f0] border ${empError.team ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900`} />
                 {empError.team ? <p className="text-red-400 text-[10px] mt-2">{empError.team}</p> : <p className="text-[10px] text-slate-500 mt-2">Unique name — this employee becomes the team lead.</p>}
               </div>
             ) : (
               <div>
                 <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">JOIN TEAM (optional)</label>
                 <select value={empForm.teamLeadId || ''} onChange={(e) => { const leadId = e.target.value; if (!leadId) { setEmpForm({ ...empForm, teamLeadId: '', team: '' }); return; } const lead = employees.find((em) => em.id === leadId); setEmpForm({ ...empForm, teamLeadId: leadId, team: lead ? normalizeTeamName(lead.team) : '' }); }} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 appearance-none">
                   <option value="">No team — work solo</option>
                   {joinableTeams.map((t) => (<option key={t.leadId} value={t.leadId}>{t.teamName} (Lead: {t.leadName})</option>))}
                 </select>
                 {joinableTeams.length === 0 && <p className="text-[10px] text-slate-500 mt-2">No teams yet. Create a team lead first.</p>}
                 {empForm.teamLeadId && <p className="text-[10px] text-[#10b981] mt-2">Will join {normalizeTeamName(empForm.team)} under {employees.find((e) => e.id === empForm.teamLeadId)?.name}</p>}
             </div>
             )}

             <div className="pt-4">
               <button onClick={handleSaveEmployee} className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:opacity-90 text-slate-900 py-2.5 rounded-lg font-black text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all">
                 Save Employee
               </button>
             </div>
          </div>
        </div>
      )}

      {/* PROJECTS & NOTIFY Implementation remains */}
      {activeTab === 'PROJECTS' && !showAddProject && (
        <div className="space-y-4">
          <button onClick={() => { setProjForm({ name: '', location: '', totalPrice: '', pricePerSqYd: '', startingSize: '', roadSize: '', totalPlots: '', availablePlots: '', soldPlots: '', facing: ['East'], approval: 'DTCP', status: 'Available', isVisible: true, imageUrl: '' }); setEditingProjId(null); setShowAddProject(true); }} className="w-full bg-gradient-to-r from-[#047857] to-[#065f46] text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
            <Plus size={18} className="inline mr-2" /> Add Project
          </button>

          {projects.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <Building size={32} className="text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 font-medium">No projects yet. Add your first luxury development.</p>
            </div>
          ) : (
            <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl hover:shadow-md hover:border-[#047857]/30 transition-all">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{proj.name}</h3>
                    <p className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-wider font-semibold">{proj.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { 
                      const projToEdit = {
                        ...proj,
                        facing: Array.isArray(proj.facing) ? proj.facing : (proj.facing ? proj.facing.split(',').map(f => f.trim()) : ['East'])
                      };
                      setProjForm(projToEdit); 
                      setEditingProjId(proj.id); 
                      setShowAddProject(true); 
                    }} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#047857]/10 text-slate-600 hover:text-[#047857] flex items-center justify-center transition-colors border border-slate-200">
                      <Pencil size={13}/>
                    </button>
                    <button onClick={() => { 
                      const projectName = proj.name || 'this project';
                      const confirmed = window.confirm(`Delete ${projectName}?`);
                      
                      if (confirmed) {
                        deleteProject(proj.id);
                      }
                    }} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors border border-slate-200">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 mb-3 border-t border-slate-200 pt-3">
                    <select value={proj.status} onChange={(e) => setProjects(projects.map(p => p.id === proj.id ? {...p, status: e.target.value} : p))} className="bg-slate-50 text-[10px] px-3 py-2 rounded-lg text-slate-900 border border-slate-200 outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30 flex-1 font-semibold">
                      <option value="Available">Available</option>
                      <option value="Launching Soon">Launching Soon</option>
                      <option value="Sold Out">Sold Out</option>
                    </select>
                    <select 
                      value={proj.isVisible ? 'visible' : 'hidden'} 
                      onChange={(e) => {
                        const isVisible = e.target.value === 'visible';
                        setProjects(projects.map(p => p.id === proj.id ? {...p, isVisible} : p));
                        
                        if (isVisible && adminSettings.enableNotifications) {
                          const visibleProj = projects.find(p => p.id === proj.id);
                          if (visibleProj && !visibleProj.isVisible) {
                            setNotifications([{
                              id: `NOTIF${Date.now()}`,
                              type: 'Project Visibility',
                              title: 'Project Now Visible',
                              message: `${visibleProj.name} is now visible to employees.`,
                              tag: 'INFO',
                              readBy: [],
                              projectId: proj.id,
                              time: new Date().toLocaleString(),
                              created_at: new Date().toISOString(),
                              status: 'Info'
                            }, ...notifications]);
                          }
                        }
                      }} 
                      className="bg-slate-50 text-[10px] px-3 py-2 rounded-lg text-slate-900 border border-slate-200 outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30 flex-1 font-semibold">
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                    </select>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Price</p>
                    <p className="text-sm font-extrabold text-[#047857] mt-1">{proj.pricePerSqYd || '—'}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Total</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">{proj.totalPlots || '—'}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Avail</p>
                    <p className="text-sm font-extrabold text-[#047857] mt-1">{proj.availablePlots || '—'}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl text-center border border-slate-200">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Sold</p>
                    <p className="text-sm font-extrabold text-orange-600 mt-1">{proj.soldPlots || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {showAddProject && (
        <div className="fixed inset-0 bg-white z-50 p-3 sm:p-4 overflow-y-auto pb-32">
          <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{editingProjId ? 'Edit Project' : 'Add New Project'}</h1>
              <p className="text-slate-600 text-sm mt-1">{editingProjId ? 'Update project details' : 'Launch a new development'}</p>
            </div>
            <button onClick={() => { setShowAddProject(false); setEditingProjId(null); }} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"><X size={18}/></button>
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">PROJECT NAME <span className="text-[#047857]">*</span></label>
              <input value={projForm.name} placeholder="Emerald Heights" onChange={e => setProjForm({...projForm, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]/30 text-sm text-slate-900 font-medium"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">LOCATION <span className="text-[#10b981]">*</span></label>
              <input value={projForm.location} placeholder="Shamshabad, Hyderabad" onChange={e => setProjForm({...projForm, location: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">TOTAL PRICE</label>
                <input value={projForm.totalPrice} placeholder="₹ 25 Cr" onChange={e => setProjForm({...projForm, totalPrice: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">PRICE / SQ YARD</label>
                <input value={projForm.pricePerSqYd} placeholder="₹ 35,000" onChange={e => setProjForm({...projForm, pricePerSqYd: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">STARTING PLOT SIZE</label>
                <input value={projForm.startingSize} placeholder="167 sq yd" onChange={e => setProjForm({...projForm, startingSize: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">ROAD SIZE</label>
                <input value={projForm.roadSize} placeholder="40 ft" onChange={e => setProjForm({...projForm, roadSize: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">TOTAL PLOTS</label>
                <input value={projForm.totalPlots} placeholder="120" onChange={e => handlePlotChange('totalPlots', e.target.value)} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">AVAILABLE PLOTS</label>
                <input value={projForm.availablePlots} placeholder="80" onChange={e => handlePlotChange('availablePlots', e.target.value)} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">SOLD PLOTS</label>
                <input value={projForm.soldPlots} placeholder="40" onChange={e => handlePlotChange('soldPlots', e.target.value)} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">FACING</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['East', 'West', 'North', 'South', 'North-East', 'South-East', 'North-West', 'South-West'].map(dir => (
                    <button
                      key={dir}
                      onClick={() => toggleFacing(dir)}
                      className={`text-[9px] py-1.5 px-2 rounded-lg border transition-all ${(projForm.facing || []).includes(dir) ? 'bg-[#10b981]/20 border-[#10b981]/50 text-[#10b981]' : 'bg-[#e2e8f0] border-slate-300 text-slate-600 hover:bg-[#e2e8f0]'}`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">APPROVAL TYPE</label>
                <select value={projForm.approval} onChange={e => setProjForm({...projForm, approval: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 appearance-none">
                  <option value="DTCP">DTCP</option>
                  <option value="HMDA">HMDA</option>
                  <option value="RERA">RERA</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">STATUS</label>
                <select value={projForm.status} onChange={e => setProjForm({...projForm, status: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 appearance-none">
                  <option value="Available">Available</option>
                  <option value="Launching Soon">Launching Soon</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">PROJECT IMAGE URL</label>
              <input value={projForm.imageUrl} placeholder="https://..." onChange={e => setProjForm({...projForm, imageUrl: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
            </div>

            <div className="pt-4">
              <button onClick={handleSaveProject} className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:opacity-90 text-slate-900 py-2.5 rounded-lg font-black text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all">Save Project</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <AdminSettings
          adminSettings={adminSettings}
          onUpdateSetting={handleUpdateSetting}
          notifications={notifications}
          employees={employees}
          projects={projects}
          leads={leads}
          salesCount={salesCount}
          offers={offers}
          setOffers={setOffers}
        />
      )}

      {activeTab === 'OFFERS' && (
        <AdminOffers />
      )}

      {activeTab === 'EARNINGS' && (
        <AdminEarnings />
      )}


      {activeTab === 'NOTIFY' && (
        <AdminAvailablePlots employees={employees} setEmployees={setEmployees} />
      )}

      {showEditLead && (
        <div className="fixed inset-0 bg-[#ffffff] z-50 p-3 overflow-y-auto pb-32">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900">Edit Lead Details</h1>
              <p className="text-slate-600 text-xs mt-0.5">Modify customer profile & assignment</p>
            </div>
            <button onClick={() => { setShowEditLead(false); setEditingLeadId(null); }} className="w-8 h-8 bg-[#e2e8f0] rounded-full flex items-center justify-center text-slate-600"><X size={16}/></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Customer Name <span className="text-[#10b981]">*</span></label>
              <input value={leadForm.name} placeholder="Customer Name" onChange={e => setLeadForm({...leadForm, name: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${leadError.name ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900`}/>
              {leadError.name && <p className="text-red-400 text-[10px] mt-1">{leadError.name}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Mobile Number <span className="text-[#10b981]">*</span></label>
              <input value={leadForm.mobile} placeholder="10 digit mobile number" onChange={e => setLeadForm({...leadForm, mobile: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${leadError.mobile ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900`}/>
              {leadError.mobile && <p className="text-red-400 text-[10px] mt-1">{leadError.mobile}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Budget</label>
                <input value={leadForm.budget} placeholder="e.g. 50 Lakhs" onChange={e => setLeadForm({...leadForm, budget: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Location</label>
                <input value={leadForm.location} placeholder="e.g. Hyderabad" onChange={e => setLeadForm({...leadForm, location: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
            </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Incentive (₹)</label>
                <input type="number" value={leadForm.earningAmount} placeholder="e.g. 50000" onChange={e => setLeadForm({...leadForm, earningAmount: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-green-500/30 rounded-xl focus:outline-none focus:border-green-500 text-sm text-green-400"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Lead Source</label>
                <input value={leadForm.source} placeholder="e.g. Facebook Ads" onChange={e => setLeadForm({...leadForm, source: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Visit Date</label>
                <input type="date" value={leadForm.visitDate} onChange={e => setLeadForm({...leadForm, visitDate: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-xs text-slate-700"/>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Interested Project <span className="text-[#10b981]">*</span></label>
              <select value={leadForm.project} onChange={e => setLeadForm({...leadForm, project: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${leadError.project ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-700 appearance-none`}>
                <option value="" disabled>Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              {leadError.project && <p className="text-red-400 text-[10px] mt-1">{leadError.project}</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Lead Status</label>
              <select value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-700 appearance-none">
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Visit Scheduled">Visit Scheduled</option>
                <option value="Success">Success</option>
                <option value="Sold">Sold</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Reassign Employee (Owner) <span className="text-[#10b981]">*</span></label>
              <select value={leadForm.assignedTo} onChange={e => setLeadForm({...leadForm, assignedTo: e.target.value})} className={`w-full p-2.5 bg-[#e2e8f0] border ${leadError.assignedTo ? 'border-red-500 bg-red-500/10' : 'border-[#10b981]/20'} rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-700 appearance-none`}>
                <option value="" disabled>Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                ))}
              </select>
              {leadError.assignedTo && <p className="text-red-400 text-[10px] mt-1">{leadError.assignedTo}</p>}
          </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">Remarks</label>
              <textarea value={leadForm.remarks} placeholder="Enter lead follow-up remarks..." rows={3} onChange={e => setLeadForm({...leadForm, remarks: e.target.value})} className="w-full p-2.5 bg-[#e2e8f0] border border-[#10b981]/20 rounded-xl focus:outline-none focus:border-[#10b981] text-sm text-slate-900 resize-none"/>
            </div>

            <div className="pt-2">
              <button onClick={handleAdminSaveLead} className="w-full bg-gradient-to-r from-[#059669] via-[#34d399] to-[#064e3b] hover:opacity-90 text-slate-900 py-2.5 rounded-xl font-black text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all">
                Save Lead Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
