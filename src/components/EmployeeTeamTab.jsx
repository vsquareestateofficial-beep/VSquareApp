import React from 'react';
import { Users, Phone, Building, Briefcase } from 'lucide-react';
import { getTeamLeadForEmployee, getTeamMembersForLead, normalizeTeamName } from '../utils/teams';

export default function EmployeeTeamTab({ currentUser, employees }) {
  const myTeamLead = getTeamLeadForEmployee(employees, currentUser);
  const myTeamMembers = currentUser.isLead
    ? getTeamMembersForLead(employees, currentUser)
    : [];

  if (currentUser.isLead) {
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-2xl">
          <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-1">Your team</p>
          <h2 className="text-lg font-serif font-bold text-slate-900">{normalizeTeamName(currentUser.team)}</h2>
          <p className="text-xs text-slate-600 mt-1">You are the team lead</p>
        </div>
        {myTeamMembers.length === 0 ? (
          <div className="bg-[#f1f5f9]/80 p-4 rounded-2xl text-center text-slate-600 text-sm">
            No members have joined this team yet.
          </div>
        ) : (
          myTeamMembers.map((member) => (
            <div key={member.id} className="bg-[#f1f5f9]/80 border border-[#10b981]/20 p-3 rounded-2xl">
              <div className="flex gap-3 items-center mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center text-sm font-bold text-slate-900 shadow-lg">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{member.role}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-[#f8fafc]/80 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                  <Phone size={12} className="text-pink-500" />
                  {member.phone}
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/30 text-yellow-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {member.id}
                </div>
                {member.branchOffice && (
                  <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Briefcase size={10} />
                    {member.branchOffice.includes('UPPAL') || member.branchOffice.includes('PRIDE') ? 'Uppal Branch' : 'Kompally Branch'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (myTeamLead) {
    return (
      <div className="bg-[#f1f5f9]/80 border border-[#10b981]/20 p-4 rounded-2xl text-center">
        <Users size={36} className="mx-auto mb-3 text-[#10b981] opacity-80" />
        <p className="text-xs text-slate-600 mb-2">You are from</p>
        <h2 className="text-xl font-serif font-bold text-slate-900 mb-3">{normalizeTeamName(currentUser.team)}</h2>
        <div className="bg-[#e2e8f0]/60 border border-slate-300 rounded-xl p-3 text-left">
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-1">Team lead</p>
          <p className="text-base font-bold text-[#10b981]">{myTeamLead.name}</p>
          <p className="text-[10px] text-slate-500 mt-1">{myTeamLead.role} · {myTeamLead.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f5f9]/80 p-4 rounded-2xl text-center text-slate-600">
      <Users size={36} className="mx-auto mb-3 opacity-20" />
      <p className="text-sm">You are not assigned to a team yet.</p>
      <p className="text-xs text-slate-500 mt-2">Ask admin to add you under a team lead.</p>
    </div>
  );
}
