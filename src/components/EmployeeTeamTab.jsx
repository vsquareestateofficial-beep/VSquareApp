import React from 'react';
import { Users, Phone, Building, Briefcase } from 'lucide-react';
import { getTeamLeadForEmployee, getTeamMembersForLead, normalizeTeamName, getReportingTeamHeads, getReportingEmployees } from '../utils/teams';

// Format ID to VS + 5 digits
const formatEmployeeId = (id) => {
  const numericId = String(id).replace(/\D/g, '').slice(-5).padStart(5, '0');
  return `VS${numericId}`;
};

export default function EmployeeTeamTab({ currentUser, employees }) {
  const myTeamLead = getTeamLeadForEmployee(employees, currentUser);
  const myTeamMembers = currentUser.isLead
    ? getTeamMembersForLead(employees, currentUser)
    : [];
  const reportingTeamHeads = (currentUser.role === 'Executive Director' || currentUser.role === 'CEO')
    ? getReportingTeamHeads(employees, currentUser)
    : [];
  const reportingEmployees = (currentUser.role === 'Executive Director' || currentUser.role === 'CEO')
    ? getReportingEmployees(employees, currentUser)
    : [];
  const mySupervisor = currentUser.underExecutiveDirector
    ? employees.find(e => e.id === currentUser.underExecutiveDirector)
    : null;

  if (currentUser.isLead) {
    return (
      <div className="space-y-3">
        {mySupervisor && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-3 rounded-2xl">
            <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">Your Supervisor</p>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {mySupervisor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{mySupervisor.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{mySupervisor.role || mySupervisor.department}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-2xl">
          <p className="text-[10px] font-bold tracking-widest text-amber-600 uppercase mb-1">Your team</p>
          <h2 className="text-lg font-serif font-bold text-slate-900">{normalizeTeamName(currentUser.team)}</h2>
          <p className="text-xs text-slate-600 mt-1">You are the team lead</p>
        </div>
        {myTeamMembers.length === 0 && reportingTeamHeads.length === 0 ? (
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
                <div className="bg-slate-200/50 border border-slate-300 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {formatEmployeeId(member.id)}
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

        {reportingTeamHeads.length > 0 && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-3 rounded-2xl mt-4">
              <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1">Reporting Team Heads</p>
              <h2 className="text-base font-serif font-bold text-slate-900">Directly under your supervision</h2>
            </div>
            {reportingTeamHeads.map((teamHead) => (
              <div key={teamHead.id} className="bg-[#f1f5f9]/80 border border-blue-200 p-3 rounded-2xl">
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {teamHead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{teamHead.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{teamHead.role}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-[#f8fafc]/80 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    <Phone size={12} className="text-pink-500" />
                    {teamHead.phone}
                  </div>
                  <div className="bg-slate-200/50 border border-slate-300 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {formatEmployeeId(teamHead.id)}
                  </div>
                  {teamHead.team && (
                    <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Team: {normalizeTeamName(teamHead.team)}
                    </div>
                  )}
                  {teamHead.branchOffice && (
                    <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <Briefcase size={10} />
                      {teamHead.branchOffice.includes('UPPAL') || teamHead.branchOffice.includes('PRIDE') ? 'Uppal Branch' : 'Kompally Branch'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {reportingEmployees.length > 0 && (
          <>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 p-3 rounded-2xl mt-4">
              <p className="text-[10px] font-bold tracking-widest text-rose-600 uppercase mb-1">Reporting Employees</p>
              <h2 className="text-base font-serif font-bold text-slate-900">Direct reports under your supervision</h2>
            </div>
            {reportingEmployees.map((employee) => (
              <div key={employee.id} className="bg-[#f1f5f9]/80 border border-rose-200 p-3 rounded-2xl">
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{employee.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{employee.role}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2 bg-[#f8fafc]/80 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    <Phone size={12} className="text-pink-500" />
                    {employee.phone}
                  </div>
                  <div className="bg-slate-200/50 border border-slate-300 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {formatEmployeeId(employee.id)}
                  </div>
                  {employee.team && (
                    <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Team: {normalizeTeamName(employee.team)}
                    </div>
                  )}
                  {employee.department && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {employee.department}
                    </div>
                  )}
                  {employee.branchOffice && (
                    <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <Briefcase size={10} />
                      {employee.branchOffice.includes('UPPAL') || employee.branchOffice.includes('PRIDE') ? 'Uppal Branch' : 'Kompally Branch'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  if (myTeamLead) {
    return (
      <div className="space-y-3">
        {mySupervisor && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-3 rounded-2xl">
            <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">Your Supervisor</p>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {mySupervisor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{mySupervisor.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{mySupervisor.role || mySupervisor.department}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-[#f1f5f9]/80 border border-[#10b981]/20 p-4 rounded-2xl">
          <Users size={36} className="mx-auto mb-3 text-[#10b981] opacity-80" />
          <p className="text-xs text-slate-600 mb-2">You are from</p>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-3">{normalizeTeamName(currentUser.team)}</h2>
          <div className="bg-[#e2e8f0]/60 border border-slate-300 rounded-xl p-3 text-left">
            <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-1">Team lead</p>
            <p className="text-base font-bold text-[#10b981]">{myTeamLead.name}</p>
            <p className="text-[10px] text-slate-500 mt-1">{myTeamLead.role} · {myTeamLead.id}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mySupervisor && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-3 rounded-2xl">
          <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">Your Supervisor</p>
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
              {mySupervisor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{mySupervisor.name}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{mySupervisor.role || mySupervisor.department}</p>
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#f1f5f9]/80 p-4 rounded-2xl text-center text-slate-600">
        <Users size={36} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">You are not assigned to a team yet.</p>
        <p className="text-xs text-slate-500 mt-2">Ask admin to add you under a team lead.</p>
      </div>
    </div>
  );
}
