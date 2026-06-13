import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { CheckCircle, Clock, Users } from 'lucide-react';
import { buildEmployeeEarnings, formatCurrency, buildTeamEarnings } from '../utils/earnings';
import { getTeamMembersForLead, getAllEmployeesUnderExecutive, getReportingTeamHeads } from '../utils/teams';

export default function EmployeeEarnings({ currentUser }) {
  const { leads, employees } = useAppContext();
  const { refresh } = useRealTimeData(['employees', 'leads']);
  const [showPendingDetails, setShowPendingDetails] = useState(false);
  const [showTeamBreakdown, setShowTeamBreakdown] = useState(false);

  const employee = employees.find((e) => e.id === currentUser?.id) || currentUser;
  const isOfficeStaff = employee.department === 'Office Employee';
  const isTeamLead = employee.isLead;
  const isExecutiveOrCEO = employee.role === 'Executive Director' || employee.role === 'CEO';
  
  // Get team members - different for Executives/CEOs vs regular team leads
  let teamMembers = [];
  if (isExecutiveOrCEO) {
    teamMembers = getAllEmployeesUnderExecutive(employees, employee);
  } else if (isTeamLead) {
    teamMembers = getTeamMembersForLead(employees, employee);
  }

  const employeeEarnings = useMemo(
    () => buildEmployeeEarnings(employee, leads),
    [employee, leads],
  );
  const { totalEarned, totalPending, pendingItems, earnedItems, salesCount } = employeeEarnings;

  const teamEarnings = useMemo(
    () => (isTeamLead || isExecutiveOrCEO) ? buildTeamEarnings(employee, teamMembers, leads) : null,
    [employee, teamMembers, leads, isTeamLead, isExecutiveOrCEO],
  );

  const visibleEarnedItems = useMemo(() => {
    return earnedItems.filter((item) => {
      if (!item.earnedAt) return false;
      const earnedTime = new Date(item.earnedAt).getTime();
      return Date.now() - earnedTime < 48 * 60 * 60 * 1000;
    });
  }, [earnedItems]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-3 sm:p-4 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-emerald-600 mb-1 uppercase">
              EARNINGS OVERVIEW
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              {employee.name}
              <span className="block text-[11px] font-normal text-slate-600 mt-1 uppercase tracking-wider">
                {employee.role || 'No Role'} {employee.team ? `· ${employee.team}` : ''}
              </span>
            </h2>
          </div>
          <div className="bg-white/80 border border-emerald-200 rounded-lg px-3 py-2 backdrop-blur">
            <p className="text-[8px] font-bold tracking-widest text-emerald-500 uppercase">{isOfficeStaff ? 'Months' : 'Total Sales'}</p>
            <p className="text-2xl font-serif font-bold text-emerald-600 text-center">{salesCount}</p>
          </div>
        </div>
      </div>

      {(isTeamLead || isExecutiveOrCEO) && teamEarnings && (
        <>
          <button
            type="button"
            onClick={() => setShowTeamBreakdown(v => !v)}
            className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-3 sm:p-4 rounded-2xl relative overflow-hidden text-left hover:border-indigo-300 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Users size={18} className="text-indigo-600" />
              <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                TEAM TOTALS
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 relative z-10">
              <div className="bg-white/80 border border-indigo-200 rounded-lg p-2 text-center">
                <p className="text-[8px] font-bold tracking-widest text-indigo-500 uppercase">Team Sales</p>
                <p className="text-xl font-serif font-bold text-indigo-600">{teamEarnings.teamSalesCount}</p>
              </div>
              <div className="bg-white/80 border border-indigo-200 rounded-lg p-2 text-center">
                <p className="text-[8px] font-bold tracking-widest text-indigo-500 uppercase">Team Earned</p>
                <p className="text-[11px] font-serif font-bold text-indigo-600 break-all">{formatCurrency(teamEarnings.teamTotalEarned)}</p>
              </div>
              <div className="bg-white/80 border border-indigo-200 rounded-lg p-2 text-center">
                <p className="text-[8px] font-bold tracking-widest text-indigo-500 uppercase">Team Pending</p>
                <p className="text-[11px] font-serif font-bold text-indigo-600 break-all">{formatCurrency(teamEarnings.teamTotalPending)}</p>
              </div>
            </div>
          </button>

          {showTeamBreakdown && (
            <div className="bg-white border border-indigo-200 p-3 sm:p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Users size={16} className="text-indigo-600" />
                {isExecutiveOrCEO ? 'Reporting Team Heads' : 'Team Member Breakdown'}
              </h3>

              {/* Lead's own stats first */}
              <div key={employee.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-3 rounded-lg flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{employee.name} (You)</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{employee.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Sales</p>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">{teamEarnings.leadEarnings.salesCount}</p>
                  <p className="text-[9px] text-slate-500">{formatCurrency(teamEarnings.leadEarnings.totalEarned)}</p>
                </div>
              </div>

              {isExecutiveOrCEO ? (
                /* For Executives/CEOs: only show Team Heads with their full team totals */
                getReportingTeamHeads(employees, employee).map(teamHead => {
                  // Get all members under this team head (including the head themselves)
                  const teamHeadMembers = [teamHead, ...getTeamMembersForLead(employees, teamHead)];
                  // Calculate total earnings for this team head's team
                  const teamHeadTotalEarnings = teamHeadMembers.reduce(
                    (acc, m) => {
                      const e = buildEmployeeEarnings(m, leads);
                      acc.sales += e.salesCount;
                      acc.earned += e.totalEarned;
                      return acc;
                    },
                    { sales: 0, earned: 0 }
                  );

                  return (
                    <div key={teamHead.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{teamHead.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{teamHead.role} · {teamHead.team}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Team Sales</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{teamHeadTotalEarnings.sales}</p>
                        <p className="text-[9px] text-slate-500">{formatCurrency(teamHeadTotalEarnings.earned)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* For regular Team Leads: show all team members individually */
                teamEarnings.memberEarnings.map(({ member, earnings }) => (
                  <div key={member.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{member.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Sales</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{earnings.salesCount}</p>
                      <p className="text-[9px] text-slate-500">{formatCurrency(earnings.totalEarned)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3 sm:p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-green-600 uppercase">
                {isOfficeStaff ? 'Total Salary Paid' : 'Total Earned Amount'}
              </p>
              <p className="text-lg sm:text-2xl font-serif font-bold text-green-600 break-all">
                {formatCurrency(totalEarned)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPendingDetails((v) => !v)}
          className="text-left bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 sm:p-4 rounded-xl hover:border-amber-300 transition-colors"
        >
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[8px] sm:text-[9px] font-bold tracking-widest text-amber-600 uppercase">
                {isOfficeStaff ? 'Pending Salary (tap)' : 'Pending Amount (tap)'}
              </p>
              <p className="text-lg sm:text-2xl font-serif font-bold text-amber-600 break-all">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </button>
      </div>

      {showPendingDetails && (
        <div className="bg-white border border-amber-200 p-3 sm:p-4 rounded-xl space-y-2">
          <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            {isOfficeStaff ? 'Pending Salary' : 'Pending Sales'}
          </h3>
          {pendingItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">{isOfficeStaff ? 'No pending salary right now.' : 'No pending sales right now.'}</p>
          ) : (
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-amber-200 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{isOfficeStaff ? 'Salary' : 'Sale'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 uppercase font-bold">Pending amount</p>
                    <p className="text-sm font-bold text-amber-600 mt-0.5">{formatCurrency(item.amount)}</p>
                  </div>
                  {item.label && item.source === 'lead' && (
                    <p className="col-span-2 text-[9px] text-slate-500 truncate">{item.label}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-slate-500 pt-1">
            Amount updates are managed by admin. Contact admin if anything is wrong.
          </p>
        </div>
      )}

      {visibleEarnedItems.length > 0 && (
        <div className="bg-white border border-green-200 p-3 sm:p-4 rounded-xl">
          <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-600" />
            {isOfficeStaff ? 'Salary Paid' : 'Earned Sales'} ({visibleEarnedItems.length})
          </h3>
          <div className="space-y-2">
            {visibleEarnedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-green-200 p-2.5 rounded-lg flex justify-between items-center gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{isOfficeStaff ? 'Salary' : 'Sale'}</p>
                  {item.label && item.label !== 'Pending plot' && (
                    <p className="text-[9px] text-slate-600 truncate">{item.label}</p>
                  )}
                </div>
                <p className="text-xs font-bold text-green-600 shrink-0">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

