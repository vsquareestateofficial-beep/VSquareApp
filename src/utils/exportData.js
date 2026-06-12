import { supabase } from '../lib/supabase';

const SUPABASE_ENABLED = supabase !== null;

export const exportAllData = async () => {
  if (!SUPABASE_ENABLED) {
    alert("Supabase is not connected.");
    return;
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



export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Upload to Supabase if connected
        if (!SUPABASE_ENABLED) {
          reject(new Error("Supabase is not connected."));
          return;
        }
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
