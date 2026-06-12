export const normalizeTeamName = (name) => (name || '').trim();

export const teamNamesMatch = (a, b) =>
  normalizeTeamName(a).toLowerCase() === normalizeTeamName(b).toLowerCase();

/** Team name is taken if another team lead already uses it */
export const isTeamNameTaken = (employees, teamName, excludeEmployeeId = null) => {
  const normalized = normalizeTeamName(teamName).toLowerCase();
  if (!normalized) return false;
  return employees.some(
    (e) =>
      e.id !== excludeEmployeeId &&
      e.isLead &&
      teamNamesMatch(e.team, normalized),
  );
};

export const getTeamLeads = (employees) =>
  employees.filter((e) => e.isLead && normalizeTeamName(e.team) && !e.isBlocked);

export const getJoinableTeams = (employees, excludeEmployeeId = null) =>
  getTeamLeads(employees)
    .filter((lead) => lead.id !== excludeEmployeeId)
    .map((lead) => ({
      teamName: normalizeTeamName(lead.team),
      leadId: lead.id,
      leadName: lead.name,
    }));

export const getTeamLeadForEmployee = (employees, employee) => {
  if (!employee || employee.isLead) return null;
  if (employee.teamLeadId) {
    return employees.find((e) => e.id === employee.teamLeadId) || null;
  }
  return (
    getTeamLeads(employees).find((lead) => teamNamesMatch(lead.team, employee.team)) || null
  );
};

/** Get Team Heads who selected this ED/CEO as their "Under Executive Director" */
export const getReportingTeamHeads = (employees, director) => {
  if (!director || !director.id) return [];
  return employees.filter(
    (e) =>
      e.role === 'Team Head' &&
      e.underExecutiveDirector === director.id &&
      !e.isBlocked
  );
};

/** Get regular employees who selected this ED/CEO as their "Under Executive Director" */
export const getReportingEmployees = (employees, director) => {
  if (!director || !director.id) return [];
  return employees.filter(
    (e) =>
      e.role !== 'Team Head' &&
      !e.isLead &&
      e.underExecutiveDirector === director.id &&
      !e.isBlocked
  );
};

/** Members who joined this team lead (not leads themselves) */
export const getTeamMembersForLead = (employees, teamLead) => {
  if (!teamLead?.isLead || !normalizeTeamName(teamLead.team)) return [];
  return employees.filter(
    (e) =>
      e.id !== teamLead.id &&
      !e.isLead &&
      !e.isBlocked &&
      teamNamesMatch(e.team, teamLead.team),
  );
};

export const buildEmployeeTeamFields = (empForm, employees, editingEmpId) => {
  const team = normalizeTeamName(empForm.team);

  if (empForm.department === 'Executive Director' || empForm.department === 'MD' || empForm.department === 'CEO') {
    return {
      team,
      teamLeadId: editingEmpId || empForm.id,
      isLead: true,
      role: empForm.department,
    };
  }

  if (empForm.isLead) {
    return {
      team,
      teamLeadId: editingEmpId || empForm.id,
      isLead: true,
    };
  }

  if (empForm.teamLeadId) {
    const lead = employees.find((e) => e.id === empForm.teamLeadId);
    return {
      team: lead ? normalizeTeamName(lead.team) : team,
      teamLeadId: empForm.teamLeadId,
      isLead: false,
    };
  }

  return { team: '', teamLeadId: '', isLead: false };
};
