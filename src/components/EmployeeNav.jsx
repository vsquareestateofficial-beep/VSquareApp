import React from 'react';
import { Home, Building, Users, Briefcase, User, Bell, Megaphone, DollarSign } from 'lucide-react';

export default function EmployeeNav({ activeTab, setActiveTab, unreadCount = 0 }) {
  const tabs = [
    { id: 'DASH', icon: Home },
    { id: 'EARNINGS', icon: DollarSign },
    { id: 'PROJECTS', icon: Building },
    { id: 'OFFERS', icon: Megaphone },
    { id: 'NOTIFY', icon: Bell },
    { id: 'TEAM', icon: Briefcase },
    { id: 'ME', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 max-w-[350px] mx-auto bg-white/80 backdrop-blur-xl border border-white px-1.5 py-1.5 flex justify-around rounded-2xl z-[999] shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 h-12 rounded-xl transition-all relative ${
                isActive ? 'bg-gradient-to-br from-[#047857] to-[#0f766e] text-white shadow-[0_4px_15px_rgba(4,120,87,0.3)]' : 'text-slate-400 hover:text-[#047857]'
              }`}
            >
              <Icon size={17} className={isActive ? 'mb-0.5' : 'mb-0.5 opacity-70'} />
              {tab.badge > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 bg-[#34d399] rounded-full text-[#0b1120] text-[9px] font-bold flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
              <span className="text-[8px] font-semibold tracking-wider uppercase truncate w-full text-center">
                {tab.id === 'NOTIFY' ? 'AVAIL' : tab.id === 'PROJECTS' ? 'PROJ' : tab.id === 'EARNINGS' ? 'EARN' : tab.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Side Nav */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-24 bg-white/95 backdrop-blur-xl border-r border-slate-200 py-6 z-[999] shadow-[10px_0_30px_rgba(0,0,0,0.02)] items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-serif font-bold text-xl mb-4 shadow-md">
          V
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] rounded-2xl transition-all relative ${
                isActive ? 'bg-gradient-to-br from-[#047857] to-[#0f766e] text-white shadow-[0_4px_15px_rgba(4,120,87,0.3)]' : 'text-slate-400 hover:bg-slate-50 hover:text-[#047857]'
              }`}
            >
              <Icon size={20} className={isActive ? 'mb-1' : 'mb-1 opacity-70'} />
              {tab.badge > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-[#34d399] rounded-full text-[#0b1120] text-[9px] font-bold flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
              <span className="text-[9px] font-bold tracking-wider uppercase truncate w-full text-center px-1">
                {tab.id === 'NOTIFY' ? 'AVAIL' : tab.id === 'PROJECTS' ? 'PROJ' : tab.id === 'EARNINGS' ? 'EARN' : tab.id}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
