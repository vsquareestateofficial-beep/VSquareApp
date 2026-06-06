import React from 'react';
import { Home, Users, Building, Bell, Settings, Megaphone, Wallet } from 'lucide-react';

export default function AdminNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'HOME', icon: Home },
    { id: 'EMP', icon: Users },
    { id: 'PROJECTS', icon: Building },
    { id: 'OFFERS', icon: Megaphone },
    { id: 'EARNINGS', icon: Wallet },
    { id: 'NOTIFY', icon: Bell },
    { id: 'SETTINGS', icon: Settings },
  ];

  return (
    <div className="admin-panel fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-slate-200 px-1 py-2 flex justify-around max-w-sm mx-auto rounded-t-2xl z-[999] text-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-10 rounded-xl transition-all ${
              isActive
                ? 'text-[#10b981]'
                : 'text-slate-500'
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-2xl bg-[#34d399]/15 blur-md" aria-hidden />
            )}
            <Icon size={17} className={`relative mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'opacity-70'}`} />
            <span className="text-[8px] font-semibold tracking-wider">
              {tab.id === 'NOTIFY' ? 'AVAIL' : tab.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
