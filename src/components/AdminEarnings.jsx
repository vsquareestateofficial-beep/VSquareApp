import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  CheckCircle,
  Clock,
  Pencil,
  Search,
  User,
  AlertCircle,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  buildEmployeeEarnings,
  computeEarningsTotals,
  formatCurrency,
  parseAmount,
} from '../utils/earnings';

export default function AdminEarnings() {
  const { leads, setLeads, employees, setEmployees } = useAppContext();

  const [searchId, setSearchId] = useState('');
  const [searchedEmployee, setSearchedEmployee] = useState(null);

  const [editPlotId, setEditPlotId] = useState(null);
  const [tempPlotAmount, setTempPlotAmount] = useState('');

  const [newPlotNo, setNewPlotNo] = useState('');
  const [newPlotAmount, setNewPlotAmount] = useState('');

  const [tempTotalEarned, setTempTotalEarned] = useState('');
  const [tempPendingDue, setTempPendingDue] = useState('');
  const [tempSalesCount, setTempSalesCount] = useState('');
  const [editingSales, setEditingSales] = useState(false);
  const [addPlotError, setAddPlotError] = useState('');

  const earnedLeads = leads.filter((l) => l.status === 'Approved');
  const companySalesCount = earnedLeads.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const emp = employees.find(
      (em) => em.id.toUpperCase() === searchId.trim().toUpperCase(),
    );
    setSearchedEmployee(emp || 'NOT_FOUND');
    setEditPlotId(null);
    if (emp) {
      const totals = computeEarningsTotals(emp, leads);
      setTempTotalEarned(emp.manualTotalEarned !== '' ? emp.manualTotalEarned : totals.totalEarned);
      setTempPendingDue(emp.manualPendingDue !== '' ? emp.manualPendingDue : totals.totalPending);
      setTempSalesCount(emp.manualSalesCount !== '' ? emp.manualSalesCount : totals.autoSalesCount);
      setEditingSales(false);
    }
  };

  const getFreshEmployee = (emp) =>
    employees.find((e) => e.id === emp.id) || emp;

  const patchEmployee = (emp, patch) => {
    const merged = { ...getFreshEmployee(emp), ...patch };
    const updatedList = employees.map((e) => (e.id === emp.id ? merged : e));
    setEmployees(updatedList);
    setSearchedEmployee(merged);
    return merged;
  };

  const applyPlotsAndRecalc = (emp, plots, leadsList = leads) => {
    const totals = computeEarningsTotals({ ...getFreshEmployee(emp), earningPlots: plots }, leadsList);
    const merged = patchEmployee(emp, { earningPlots: plots, ...totals });
    setTempTotalEarned(totals.manualTotalEarned);
    setTempPendingDue(totals.manualPendingDue);
    setTempSalesCount(totals.manualSalesCount);
    return merged;
  };

  const handleSaveTotals = () => {
    if (!searchedEmployee || searchedEmployee === 'NOT_FOUND') return;
    patchEmployee(searchedEmployee, {
      manualTotalEarned: tempTotalEarned,
      manualPendingDue: tempPendingDue,
      manualSalesCount: tempSalesCount,
    });
    setEditingSales(false);
  };

  const handleSaveSalesOnly = () => {
    if (!searchedEmployee || searchedEmployee === 'NOT_FOUND') return;
    patchEmployee(searchedEmployee, { manualSalesCount: tempSalesCount });
    setEditingSales(false);
  };

  const handleAddPendingPlot = (e) => {
    e.preventDefault();
    if (!searchedEmployee || searchedEmployee === 'NOT_FOUND') return;
    if (!newPlotNo.trim() || newPlotAmount === '') {
      setAddPlotError('Enter plot number and pending amount.');
      return;
    }
    setAddPlotError('');

    const plots = [
      ...(searchedEmployee.earningPlots || []),
      {
        id: `PLOT_${Date.now()}`,
        plotNo: newPlotNo.trim(),
        amount: newPlotAmount,
        status: 'pending',
        label: `Plot ${newPlotNo.trim()}`,
      },
    ];

    applyPlotsAndRecalc(searchedEmployee, plots);
    setNewPlotNo('');
    setNewPlotAmount('');
  };

  const handleSavePlotAmount = (plotId, source) => {
    if (tempPlotAmount === '') return;

    if (source === 'plot') {
      const plots = (searchedEmployee.earningPlots || []).map((p) =>
        p.id === plotId ? { ...p, amount: tempPlotAmount } : p,
      );
      applyPlotsAndRecalc(searchedEmployee, plots);
    } else {
      const newLeads = leads.map((l) =>
        l.id === plotId ? { ...l, earningAmount: tempPlotAmount } : l,
      );
      setLeads(newLeads);
      applyPlotsAndRecalc(searchedEmployee, searchedEmployee.earningPlots || [], newLeads);
    }
    setEditPlotId(null);
  };

  const handleMarkCleared = (item) => {
    const amount = parseAmount(item.amount);
    if (!amount) return;
    const now = new Date().toISOString();

    if (item.source === 'plot') {
      const plots = (searchedEmployee.earningPlots || []).map((p) =>
        p.id === item.id ? { ...p, status: 'earned', earnedAt: now } : p,
      );
      applyPlotsAndRecalc(searchedEmployee, plots);
    } else if (item.lead) {
      const newLeads = leads.map((l) =>
        l.id === item.id ? { ...l, status: 'Approved', earnedAt: now } : l,
      );
      setLeads(newLeads);
      applyPlotsAndRecalc(searchedEmployee, searchedEmployee.earningPlots || [], newLeads);
    }
    setEditPlotId(null);
  };

  const handleDeletePending = (item) => {
    if (item.source === 'plot') {
      const plots = (searchedEmployee.earningPlots || []).filter((p) => p.id !== item.id);
      applyPlotsAndRecalc(searchedEmployee, plots);
    } else {
      const newLeads = leads.map((l) =>
        l.id === item.id ? { ...l, status: 'Rejected', earningAmount: 0 } : l,
      );
      setLeads(newLeads);
      applyPlotsAndRecalc(searchedEmployee, searchedEmployee.earningPlots || [], newLeads);
    }
    setEditPlotId(null);
  };

  const earnings = useMemo(() => {
    if (!searchedEmployee || searchedEmployee === 'NOT_FOUND') return null;
    return buildEmployeeEarnings(getFreshEmployee(searchedEmployee), leads);
  }, [searchedEmployee, employees, leads]);

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-br from-[#022c22]/80 to-[#f1f5f9] border border-[#064e3b]/50 p-3 sm:p-4 rounded-2xl relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[9px] font-bold tracking-widest text-emerald-400 mb-1 uppercase">
              COMPANY OVERVIEW
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Admin Earnings</h2>
          </div>
          <div className="bg-[#f1f5f9]/60 border border-emerald-500/30 rounded-lg px-3 py-2">
            <p className="text-[8px] font-bold tracking-widest text-emerald-300 uppercase">Total Sales</p>
            <p className="text-2xl font-serif font-bold text-emerald-400 text-center">{companySalesCount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="bg-[#f1f5f9]/80 border border-[#10b981]/20 p-3 rounded-xl">
        <label className="text-[10px] font-bold text-slate-600 tracking-widest uppercase block mb-2">
          Search employee by ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="e.g. VS00101"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-[#e2e8f0] border border-[#10b981]/30 text-slate-900 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#10b981]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#10b981] hover:bg-emerald-600 text-slate-900 px-4 py-2.5 rounded-lg font-bold text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {!searchedEmployee && (
        <div className="bg-[#f1f5f9]/50 border border-slate-200 p-8 rounded-xl text-center">
          <User size={32} className="text-slate-500 mb-2 opacity-50 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Enter employee ID</p>
          <p className="text-xs text-slate-500 mt-1">
            Manage total earned, pending amount, and plot-wise pending entries.
          </p>
        </div>
      )}

      {searchedEmployee === 'NOT_FOUND' && (
        <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl text-center">
          <AlertCircle size={24} className="text-red-400 mb-2 mx-auto" />
          <p className="text-sm font-bold text-red-400">Employee not found</p>
        </div>
      )}

      {earnings && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#e2e8f0]/60 border border-[#10b981]/20 p-3 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#047857] text-slate-900 flex items-center justify-center text-lg font-bold">
              {searchedEmployee.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900">{searchedEmployee.name}</h3>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                {searchedEmployee.role} · {searchedEmployee.id}
              </p>
            </div>
            <div className="bg-[#f1f5f9]/80 border border-emerald-500/30 rounded-lg px-3 py-2 min-w-[88px]">
              <p className="text-[8px] font-bold tracking-widest text-emerald-300 uppercase text-center">
                Total Sales
              </p>
              {editingSales ? (
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    min="0"
                    value={tempSalesCount}
                    onChange={(e) => setTempSalesCount(e.target.value)}
                    className="w-full bg-[#e2e8f0] border border-emerald-500/50 text-emerald-300 rounded p-1 text-sm text-center"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveSalesOnly}
                    className="bg-emerald-600 text-slate-900 px-2 rounded text-[9px] font-bold shrink-0"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-xl font-serif font-bold text-emerald-400">{earnings.salesCount}</p>
                  <button
                    type="button"
                    onClick={() => setEditingSales(true)}
                    className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5"
                  >
                    <Pencil size={9} /> Edit
                  </button>
                </div>
              )}
              <p className="text-[8px] text-slate-500 text-center mt-1">
                Auto: {earnings.autoSalesCount}
              </p>
            </div>
          </div>

          <div className="bg-[#f1f5f9]/80 border border-[#10b981]/20 p-3 rounded-xl space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Total amounts (admin can edit &amp; save)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-green-300 uppercase font-bold block mb-1">
                  Total earned amount
                </label>
                <input
                  type="number"
                  value={tempTotalEarned}
                  onChange={(e) => setTempTotalEarned(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#f1f5f9] border border-green-500/40 text-green-400 rounded-lg p-2 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Showing: {formatCurrency(earnings.totalEarned)}
                </p>
              </div>
              <div>
                <label className="text-[9px] text-amber-300 uppercase font-bold block mb-1">
                  Pending amount
                </label>
                <input
                  type="number"
                  value={tempPendingDue}
                  onChange={(e) => setTempPendingDue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#f1f5f9] border border-amber-500/40 text-amber-400 rounded-lg p-2 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Showing: {formatCurrency(earnings.totalPending)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[9px] text-emerald-300 uppercase font-bold block mb-1">
                  Total sales count
                </label>
                <input
                  type="number"
                  min="0"
                  value={tempSalesCount}
                  onChange={(e) => setTempSalesCount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#f1f5f9] border border-emerald-500/40 text-emerald-400 rounded-lg p-2 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Showing: {earnings.salesCount} (auto: {earnings.autoSalesCount})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveTotals}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-slate-900 py-2.5 rounded-lg text-sm font-bold"
            >
              <Save size={16} /> Save total amounts
            </button>
          </div>

          <div className="bg-[#f1f5f9]/80 border border-emerald-500/20 p-3 rounded-xl">
            <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Plus size={16} className="text-emerald-400" />
              Add pending plot
            </h3>
            <form onSubmit={handleAddPendingPlot} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-600 uppercase font-bold block mb-1">
                    Plot no.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14"
                    value={newPlotNo}
                    onChange={(e) => {
                      setNewPlotNo(e.target.value);
                      setAddPlotError('');
                    }}
                    className="w-full bg-[#e2e8f0] border border-emerald-500/30 text-slate-900 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-600 uppercase font-bold block mb-1">
                    Pending amount
                  </label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newPlotAmount}
                    onChange={(e) => setNewPlotAmount(e.target.value)}
                    className="w-full bg-[#e2e8f0] border border-emerald-500/30 text-slate-900 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              {addPlotError && (
                <p className="text-[10px] text-red-400 font-bold">{addPlotError}</p>
              )}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 py-2.5 rounded-lg text-xs font-bold"
              >
                <Save size={14} /> Save pending plot
              </button>
            </form>
          </div>

          <div className="bg-[#f1f5f9]/80 border border-amber-500/20 p-3 rounded-xl">
            <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock size={16} className="text-amber-400" />
              Pending plots ({earnings.pendingItems.length})
            </h3>
            {earnings.pendingItems.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending plots for this employee.</p>
            ) : (
              <div className="space-y-3">
                {earnings.pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#e2e8f0] border border-amber-500/20 p-3 rounded-xl"
                  >
                    <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                      <div>
                        <p className="text-slate-600 uppercase font-bold">Plot no.</p>
                        <p className="text-slate-900 font-bold text-sm">{item.plotNo}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 uppercase font-bold">Pending amount</p>
                        {editPlotId === item.id ? (
                          <div className="flex gap-1 mt-1">
                            <input
                              type="number"
                              value={tempPlotAmount}
                              onChange={(e) => setTempPlotAmount(e.target.value)}
                              className="w-full bg-[#f1f5f9] border border-emerald-500/50 text-slate-900 rounded p-1 text-xs"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePlotAmount(item.id, item.source)}
                              className="bg-emerald-600 text-slate-900 px-2 rounded text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-amber-400 font-bold text-sm">
                              {formatCurrency(item.amount)}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditPlotId(item.id);
                                setTempPlotAmount(String(item.amount || ''));
                              }}
                              className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <Pencil size={10} /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.label && (
                      <p className="text-[9px] text-slate-500 mb-2">{item.label}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkCleared(item)}
                        disabled={!item.amount}
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase bg-green-600/90 hover:bg-green-600 text-slate-900 flex items-center justify-center gap-1 disabled:opacity-40"
                      >
                        <CheckCircle size={14} /> Mark earned
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePending(item)}
                        className="py-2 px-3 rounded-lg text-[10px] font-bold uppercase border border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#f1f5f9]/80 border border-green-500/20 p-3 rounded-xl">
            <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-400" />
              Earned plots (
              {earnings.earnedItems.filter((item) => {
                if (!item.earnedAt) return false;
                const earnedTime = new Date(item.earnedAt).getTime();
                return Date.now() - earnedTime < 24 * 60 * 60 * 1000;
              }).length}
              )
            </h3>
            {earnings.earnedItems.filter((item) => {
              if (!item.earnedAt) return false;
              const earnedTime = new Date(item.earnedAt).getTime();
              return Date.now() - earnedTime < 24 * 60 * 60 * 1000;
            }).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No recently earned plots.</p>
            ) : (
              <div className="space-y-2">
                {earnings.earnedItems
                  .filter((item) => {
                    if (!item.earnedAt) return false;
                    const earnedTime = new Date(item.earnedAt).getTime();
                    return Date.now() - earnedTime < 24 * 60 * 60 * 1000;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#e2e8f0]/60 border border-green-500/10 p-3 rounded-lg flex justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">Plot {item.plotNo}</p>
                        <p className="text-[9px] text-slate-600">{item.label}</p>
                      </div>
                      <p className="text-sm font-bold text-green-400">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
