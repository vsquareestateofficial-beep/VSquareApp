import React from 'react';
import { Building, Users, TrendingUp } from 'lucide-react';
import { buildEmployeeEarnings } from '../utils/earnings';

export default function BranchWiseSales({ employees, leads }) {
  // Group employees by branch office
  const branches = employees.reduce((acc, emp) => {
    const branchKey = emp.branchOffice || 'Corporate Office';
    
    if (!acc[branchKey]) {
      acc[branchKey] = [];
    }
    acc[branchKey].push(emp);
    return acc;
  }, {});

  // Calculate total sales for a branch
  const getBranchTotalSales = (branchEmployees) => {
    return branchEmployees.reduce((total, emp) => {
      const earnings = buildEmployeeEarnings(emp, leads);
      return total + earnings.salesCount;
    }, 0);
  };

  const branchNames = Object.keys(branches);

  return (
    <div className="space-y-4">
      {branchNames.map((branchName, index) => {
        const branchEmployees = branches[branchName];
        const totalSales = getBranchTotalSales(branchEmployees);
        const displayBranchName = branchName;

        return (
          <div key={branchName} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-[#047857]" />
                <div>
                        <h3 className="font-bold text-slate-900">{displayBranchName}</h3>
                        <p className="text-[10px] text-slate-500">{branchEmployees.length} employees</p>
                      </div>
              </div>
              <div className="bg-[#047857]/10 px-3 py-1 rounded-full">
                <p className="text-[10px] font-bold text-[#047857] uppercase tracking-wider">Total Sales</p>
                <p className="text-xl font-bold text-[#047857]">{totalSales}</p>
              </div>
            </div>

            <div className="space-y-2">
              {branchEmployees.map((emp) => {
                const earnings = buildEmployeeEarnings(emp, leads);
                return (
                  <div key={emp.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#047857] to-[#10b981] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-[#047857]" />
                      <span className="text-lg font-bold text-[#047857]">{earnings.salesCount}</span>
                      <span className="text-[10px] text-slate-500">sales</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {branchNames.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Building size={32} className="mx-auto mb-2 text-slate-400 opacity-50" />
          <p className="text-sm text-slate-500">No employees found</p>
        </div>
      )}
    </div>
  );
}
