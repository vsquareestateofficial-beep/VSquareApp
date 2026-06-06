import React from 'react';
import { Briefcase, Building } from 'lucide-react';

export default function AdminHomeStats({ employeesCount, projectsCount }) {
  const stats = [
    { label: 'EMPLOYEES', value: employeesCount, icon: Briefcase, iconBg: 'bg-[#047857]/10', iconColor: 'text-[#047857]' },
    { label: 'PROJECTS', value: projectsCount, icon: Building, iconBg: 'bg-[#047857]/10', iconColor: 'text-[#047857]' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <div
          key={label}
          className="bg-white border border-white/20 p-4 sm:p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
            <Icon size={20} className="sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#047857]/70 uppercase mb-1">{label}</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">{value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
