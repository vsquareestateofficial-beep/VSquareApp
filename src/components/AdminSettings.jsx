import React, { useRef } from 'react';
import { isNotificationUnread } from './AdminNotifications';
import { Download, Upload, Trash2 } from 'lucide-react';
import { exportAllData, importData } from '../utils/exportData';

export default function AdminSettings({
  adminSettings,
  onUpdateSetting,
  notifications,
  employees,
  projects,
  leads,
  salesCount,
  offers,
  setOffers
}) {
  const fileInputRef = useRef(null);
  const unreadCount = notifications.filter(isNotificationUnread).length;
  const pendingSales = notifications.filter(
    (n) => n.status === 'Pending' && n.type === 'Sales Request',
  ).length;
  const activeTeam = employees.filter((e) => !e.isBlocked).length;
  const visibleProjects = projects.filter((p) => p.isVisible).length;

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importData(file).then(() => {
        alert('Data imported successfully! Please refresh the page.');
        window.location.reload();
      }).catch(err => {
        alert('Error importing data: ' + err.message);
      });
    }
  };

  const toggles = [
    {
      key: 'enableNotifications',
      title: 'Project visibility alerts',
      description: 'Notify the team when a project is shown to employees.',
    },
    {
      key: 'autoApproveSales',
      title: 'Auto-approve sales',
      description: 'Skip manual approval when a lead is marked successful.',
    },
    {
      key: 'lockEmployeeDeletion',
      title: 'Lock employee deletion',
      description: 'Block removing employee records from the admin panel.',
    },
    {
      key: 'autoCleanupNotifications',
      title: 'Auto-cleanup old notifications',
      description: 'Delete notifications older than 7 days.',
    },
  ];

  const overview = [
    { label: 'Pending sales', value: pendingSales, accent: false },
    { label: 'Unread alerts', value: unreadCount, accent: true },
    { label: 'Active team', value: activeTeam, accent: false },
    { label: 'Visible projects', value: visibleProjects, accent: false },
  ];

  const topPerformersOffer = offers.find(o => o.id === 'TOP_PERFORMERS');
  let topPerformerIds = ['', '', ''];
  try {
    if (topPerformersOffer && topPerformersOffer.message) {
      topPerformerIds = JSON.parse(topPerformersOffer.message);
    }
  } catch (e) {
    console.error('Error parsing top performers:', e);
  }

  return (
    <div className="space-y-2">
      <div className="bg-[#f1f5f9]/90 border border-[#10b981]/30 p-3 rounded-xl shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-800 mb-2">Admin settings</p>
        <h2 className="text-xl font-serif font-bold text-slate-900">Operations</h2>
        <p className="text-xs font-medium text-slate-700 mt-1">Controls that affect alerts, sales workflow, and team safety.</p>
      </div>

      <div className="bg-[#f1f5f9]/90 border border-[#10b981]/30 rounded-xl p-3 space-y-2 shadow-sm">
        {toggles.map(({ key, title, description }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-slate-300 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="text-[11px] font-medium text-slate-700 mt-0.5">{description}</p>
            </div>
            <label className="inline-flex shrink-0">
              <input
                type="checkbox"
                checked={adminSettings[key]}
                onChange={(e) => onUpdateSetting(key, e.target.checked)}
                className="accent-cyan-400 w-4 h-4"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="bg-[#f1f5f9]/90 border border-[#10b981]/30 rounded-xl p-3 space-y-2 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-emerald-800 mb-2 uppercase">Data Management</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportAllData}
            className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Download size={14} /> Export Data
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Upload size={14} /> Import Data
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <div className="bg-white border border-white/20 p-5 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <p className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#047857] mb-3 uppercase">LIVE OVERVIEW</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {overview.map(({ label, value, accent }) => (
            <div
              key={label}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#047857]/70 uppercase mb-2">{label}</p>
              <p
                className={`text-lg sm:text-2xl font-extrabold ${accent ? 'text-[#047857]' : 'text-slate-900'}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
