import { supabase } from '../lib/supabase';

const SUPABASE_ENABLED = supabase !== null;

export const exportAllData = async () => {
  if (!SUPABASE_ENABLED) {
    alert("Supabase is not connected. Exporting local cache only.");
    return fallbackExport();
  }

  try {
    const [
      { data: employees },
      { data: leads },
      { data: projects },
      { data: notifications },
      { data: offers },
      { data: adminSettings }
    ] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('offers').select('*'),
      supabase.from('admin_settings').select('*')
    ]);

    const data = {
      employees: employees || [],
      leads: leads || [],
      projects: projects || [],
      notifications: notifications || [],
      offers: offers || [],
      adminSettings: adminSettings ? adminSettings[0] : {},
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vsquare-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error("Export Error:", err);
    alert("Failed to export from Supabase. " + err.message);
  }
};

const fallbackExport = () => {
  const data = {
    employees: JSON.parse(localStorage.getItem('vsquare_employees') || '[]'),
    leads: JSON.parse(localStorage.getItem('vsquare_leads') || '[]'),
    projects: JSON.parse(localStorage.getItem('vsquare_projects') || '[]'),
    notifications: JSON.parse(localStorage.getItem('vsquare_notifications') || '[]'),
    offers: JSON.parse(localStorage.getItem('vsquare_offers') || '[]'),
    adminSettings: JSON.parse(localStorage.getItem('vsquare_admin_settings') || '{}'),
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vsquare-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Always save to localStorage as backup
        if (data.employees) localStorage.setItem('vsquare_employees', JSON.stringify(data.employees));
        if (data.leads) localStorage.setItem('vsquare_leads', JSON.stringify(data.leads));
        if (data.projects) localStorage.setItem('vsquare_projects', JSON.stringify(data.projects));
        if (data.notifications) localStorage.setItem('vsquare_notifications', JSON.stringify(data.notifications));
        if (data.offers) localStorage.setItem('vsquare_offers', JSON.stringify(data.offers));
        if (data.adminSettings) localStorage.setItem('vsquare_admin_settings', JSON.stringify(data.adminSettings));

        // Upload to Supabase if connected
        if (SUPABASE_ENABLED) {
          if (data.employees && data.employees.length > 0) await supabase.from('employees').upsert(data.employees);
          if (data.leads && data.leads.length > 0) await supabase.from('leads').upsert(data.leads);
          if (data.projects && data.projects.length > 0) await supabase.from('projects').upsert(data.projects);
          if (data.notifications && data.notifications.length > 0) await supabase.from('notifications').upsert(data.notifications);
          if (data.offers && data.offers.length > 0) await supabase.from('offers').upsert(data.offers);
          
          if (data.adminSettings && Object.keys(data.adminSettings).length > 0) {
            await supabase.from('admin_settings').upsert({ id: 1, ...data.adminSettings });
          }
        }
        
        resolve(data);
      } catch (err) {
        console.error("Import Error:", err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
