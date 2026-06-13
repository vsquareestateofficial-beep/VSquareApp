export const parseAmount = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const n = parseFloat(String(value).replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(parseAmount(amount));

export const getPlotNo = (item) =>
  (item.plotNo || item.project || '').trim() || 'N/A';

/** Pending plot rows stored on employee (admin-managed) */
export const getEmployeeEarningPlots = (employee) =>
  Array.isArray(employee?.earningPlots) ? employee.earningPlots : [];

export const isPendingLead = (lead) =>
  lead.status !== 'Approved' &&
  lead.status !== 'Rejected' &&
  (lead.status === 'Sold' ||
    lead.status === 'Success' ||
    lead.status === 'Pending' ||
    parseAmount(lead.earningAmount) > 0);

export function buildEmployeeEarnings(employee, leads = []) {
  if (!employee) {
    return {
      totalEarned: 0,
      totalPending: 0,
      allItems: [],
      earnedItems: [],
      pendingItems: [],
      salesCount: 0,
      autoSalesCount: 0,
    };
  }

  const myLeads = leads.filter((l) => l.assignedTo === employee.id);
  const storedPlots = getEmployeeEarningPlots(employee);

  const allFromPlots = storedPlots.map((p) => ({
    id: p.id,
    plotNo: getPlotNo(p),
    amount: parseAmount(p.amount),
    source: 'plot',
    label: p.label || 'Plot',
    status: p.status || 'pending',
    earnedAt: p.earnedAt,
    saleCount: p.saleCount,
    stage: p.stage,
  }));

  const allFromLeads = myLeads.map((l) => ({
    id: l.id,
    plotNo: getPlotNo(l),
    amount: parseAmount(l.earningAmount),
    source: 'lead',
    label: l.name,
    status: l.status,
    lead: l,
    earnedAt: l.earnedAt,
    saleCount: 1,
  }));

  const allItems = [...allFromPlots, ...allFromLeads];
  const earnedItems = allItems.filter(i => i.status === 'earned' || i.status === 'Approved');
  const pendingItems = allItems.filter(i => i.status !== 'earned' && i.status !== 'Approved');
  
  let totalEarned = earnedItems.reduce((s, i) => s + i.amount, 0);
  let totalPending = pendingItems.reduce((s, i) => s + i.amount, 0);
  const autoSalesCount = earnedItems.reduce((sum, item) => {
    const count = item.saleCount ? parseInt(item.saleCount, 10) : 1;
    return sum + (Number.isNaN(count) ? 1 : count);
  }, 0);

  let salesCount = autoSalesCount;
  if (employee.manualSalesCount !== undefined && employee.manualSalesCount !== '') {
    const n = parseInt(String(employee.manualSalesCount), 10);
    salesCount = Number.isNaN(n) ? autoSalesCount : n;
  }

  if (employee.manualTotalEarned !== undefined && employee.manualTotalEarned !== '') {
    totalEarned = parseAmount(employee.manualTotalEarned);
  }
  if (employee.manualPendingDue !== undefined && employee.manualPendingDue !== '') {
    totalPending = parseAmount(employee.manualPendingDue);
  }

  return {
    totalEarned,
    totalPending,
    allItems,
    earnedItems,
    pendingItems,
    salesCount,
    autoSalesCount,
  };
}

/** Sum earned + pending from plots and leads (ignores manual overrides). */
export function computeEarningsTotals(employee, leads = []) {
  const { totalEarned, totalPending, autoSalesCount } = buildEmployeeEarnings(
    { ...employee, manualTotalEarned: '', manualPendingDue: '', manualSalesCount: '' },
    leads,
  );
  return {
    manualTotalEarned: String(totalEarned),
    manualPendingDue: String(totalPending),
    manualSalesCount: String(autoSalesCount),
  };
}

/** Parse "14, 15, 101-120" into display chips */
export const parsePlotNumberList = (text) =>
  String(text || '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Calculate combined team earnings (lead + all team members) */
export function buildTeamEarnings(teamLead, teamMembers, leads = []) {
  const leadEarnings = buildEmployeeEarnings(teamLead, leads);
  
  let teamTotalEarned = leadEarnings.totalEarned;
  let teamTotalPending = leadEarnings.totalPending;
  let teamSalesCount = leadEarnings.salesCount;
  let teamAutoSalesCount = leadEarnings.autoSalesCount;

  const memberEarnings = teamMembers.map(member => {
    const earnings = buildEmployeeEarnings(member, leads);
    teamTotalEarned += earnings.totalEarned;
    teamTotalPending += earnings.totalPending;
    teamSalesCount += earnings.salesCount;
    teamAutoSalesCount += earnings.autoSalesCount;
    return { member, earnings };
  });

  return {
    leadEarnings,
    memberEarnings,
    teamTotalEarned,
    teamTotalPending,
    teamSalesCount,
    teamAutoSalesCount,
  };
}
