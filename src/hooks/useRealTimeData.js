import { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * Hook to enable real-time data synchronization for components
 * Automatically refreshes data and keeps UI in sync with database changes
 * 
 * Usage:
 *   useRealTimeData('all'); // Refresh all data every 4 seconds
 *   useRealTimeData(['employees', 'leads']); // Refresh specific tables
 *   useRealTimeData('employees'); // Refresh just employees data
 */
export const useRealTimeData = (dataType = 'all') => {
  const { 
    refreshAll,
    fetchEmployees,
    fetchLeads, 
    fetchOffers,
    fetchNotifications,
    fetchProjects
  } = useAppContext();

  const refresh = useCallback(async () => {
    try {
      if (dataType === 'all') {
        await refreshAll();
      } else if (Array.isArray(dataType)) {
        await Promise.all(
          dataType.map(type => {
            switch (type) {
              case 'employees': return fetchEmployees();
              case 'leads': return fetchLeads();
              case 'offers': return fetchOffers();
              case 'notifications': return fetchNotifications();
              case 'projects': return fetchProjects();
              default: return Promise.resolve();
            }
          })
        );
      } else {
        switch (dataType) {
          case 'employees': return fetchEmployees();
          case 'leads': return fetchLeads();
          case 'offers': return fetchOffers();
          case 'notifications': return fetchNotifications();
          case 'projects': return fetchProjects();
          default: return refreshAll();
        }
      }
    } catch (error) {
      console.warn('Error refreshing data:', error);
    }
  }, [dataType, refreshAll, fetchEmployees, fetchLeads, fetchOffers, fetchNotifications, fetchProjects]);

  // Set up aggressive polling for this component
  useEffect(() => {
    // Initial refresh
    refresh();

    // Set interval for continuous updates (3 seconds for aggressive real-time feel)
    const interval = setInterval(refresh, 3000);

    return () => clearInterval(interval);
  }, [refresh]);

  return { refresh };
};
