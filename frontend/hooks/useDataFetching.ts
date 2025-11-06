import { useState, useEffect, useRef, useCallback } from 'react';
import { firestoreDataService } from '../services/firestoreDataService';
import { setupRealtimeListeners } from '../services/realtimeDataService';
import { Event, Club, User, LeadershipMember, AnnualEvent, NewsArticle, ExternalEvent, Notification, Application } from '../types';

interface DataState {
  events: Event[];
  clubs: Club[];
  leadership: LeadershipMember[];
  annualEvents: AnnualEvent[];
  news: NewsArticle[];
  externalEvents: ExternalEvent[];
  users: User[];
  notifications: Notification[];
  applications: Application[];
}

interface UseDataFetchingOptions {
  user: User | null;
  enableRealtime?: boolean;
  fetchEvents?: boolean;
  fetchClubs?: boolean;
  fetchLeadership?: boolean;
  fetchUsers?: boolean;
}

export const useDataFetching = ({ 
  user, 
  enableRealtime = true,
  fetchEvents = true,
  fetchClubs = true,
  fetchLeadership = true,
  fetchUsers = false
}: UseDataFetchingOptions) => {
  const [data, setData] = useState<DataState>({
    events: [],
    clubs: [],
    leadership: [],
    annualEvents: [],
    news: [],
    externalEvents: [],
    users: [], // Will be loaded only when needed
    notifications: [],
    applications: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSecondaryLoading, setIsSecondaryLoading] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  
  // Refs to prevent duplicate calls
  const hasInitialized = useRef(false);
  const hasSecondaryLoaded = useRef(false);
  const hasUserDataLoaded = useRef(false);
  const realtimeCleanup = useRef<(() => void) | null>(null);

  // Track what data has been fetched to handle route changes
  const fetchedFlags = useRef({ fetchEvents: false, fetchClubs: false, fetchLeadership: false, fetchUsers: false });

  // Initial data loading (critical data only) - conditional based on options
  // Also refetches when flags change from false to true (route changes)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Determine what needs to be fetched
      const needsEvents = fetchEvents && !fetchedFlags.current.fetchEvents;
      const needsClubs = fetchClubs && !fetchedFlags.current.fetchClubs;
      const needsLeadership = fetchLeadership && !fetchedFlags.current.fetchLeadership;
      const needsUsers = fetchUsers && !fetchedFlags.current.fetchUsers;

      // If nothing needs to be fetched, skip
      if (!needsEvents && !needsClubs && !needsLeadership && !needsUsers) {
        // Mark as initialized if not already
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const promises: Promise<any>[] = [];
        const dataKeys: string[] = [];

        // Only fetch what's needed and requested
        if (needsEvents) {
          promises.push(firestoreDataService.getEvents());
          dataKeys.push('events');
        }
        if (needsClubs) {
          promises.push(firestoreDataService.getClubs());
          dataKeys.push('clubs');
        }
        if (needsLeadership) {
          promises.push(firestoreDataService.getLeadership());
          dataKeys.push('leadership');
        }
        if (needsUsers) {
          promises.push(firestoreDataService.getUsers());
          dataKeys.push('users');
        }

        if (promises.length === 0) {
          hasInitialized.current = true;
          setIsLoading(false);
          return;
        }

        const results = await Promise.all(promises);
        
        const updates: any = {};
        results.forEach((result, index) => {
          updates[dataKeys[index]] = result;
        });
        
        // Update flags to track what we've fetched
        if (needsEvents) fetchedFlags.current.fetchEvents = true;
        if (needsClubs) fetchedFlags.current.fetchClubs = true;
        if (needsLeadership) fetchedFlags.current.fetchLeadership = true;
        if (needsUsers) fetchedFlags.current.fetchUsers = true;
        
        setData(prev => ({
          ...prev,
          ...updates,
        }));
        
        hasInitialized.current = true;
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        // Don't update data state if there's a network error - preserve existing data
        // This prevents data loss when Firebase is unreachable
        if (error.message?.includes('Network connection failed')) {
          console.warn("Network error detected - preserving existing data");
          // Optionally show a user notification here
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchEvents, fetchClubs, fetchLeadership, fetchUsers]);

  // Secondary data loading - only load when needed
  const loadSecondaryData = useCallback(async () => {
    if (hasSecondaryLoaded.current) return;
    
    setIsSecondaryLoading(true);
    try {
      const [annualEventsData, newsData, externalEventsData] = await Promise.all([
        firestoreDataService.getAnnualEvents(),
        firestoreDataService.getNews(),
        firestoreDataService.getExternalEvents()
      ]);
      
      setData(prev => ({
        ...prev,
        annualEvents: annualEventsData,
        news: newsData,
        externalEvents: externalEventsData,
      }));
      
      hasSecondaryLoaded.current = true;
    } catch (error: any) {
      console.error("Failed to fetch secondary data:", error);
      // Don't update data state if there's a network error - preserve existing data
      if (error.message?.includes('Network connection failed')) {
        console.warn("Network error detected - preserving existing secondary data");
      }
    } finally {
      setIsSecondaryLoading(false);
    }
  }, []);

  // Load secondary data only when needed (lazy loading)
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    // Load secondary data after initial data is loaded
    const timer = setTimeout(loadSecondaryData, 2000); // 2 second delay
    return () => clearTimeout(timer);
  }, [hasInitialized.current, loadSecondaryData]);

  // User-specific data loading - only load when user logs in
  useEffect(() => {
    if (!user || hasUserDataLoaded.current) return;
    
    const fetchUserData = async () => {
      setIsUserDataLoading(true);
      try {
        // Only load essential user data
        const [notificationsData, applicationsData] = await Promise.all([
          firestoreDataService.getNotifications(),
          firestoreDataService.getApplications()
        ]);
        
        setData(prev => ({
          ...prev,
          notifications: notificationsData,
          applications: applicationsData,
        }));
        
        hasUserDataLoaded.current = true;
      } catch (error: any) {
        console.error("Failed to fetch user data:", error);
        // Don't update data state if there's a network error - preserve existing data
        if (error.message?.includes('Network connection failed')) {
          console.warn("Network error detected - preserving existing user data");
        }
      } finally {
        setIsUserDataLoading(false);
      }
    };

    // Delay user data loading to not block initial render
    const timer = setTimeout(fetchUserData, 1000);
    return () => clearTimeout(timer);
  }, [user?.id]);

  // Clear user data when user logs out
  useEffect(() => {
    if (!user && hasUserDataLoaded.current) {
      setData(prev => ({
        ...prev,
        users: [],
        notifications: [],
        applications: [],
      }));
      hasUserDataLoaded.current = false;
    }
  }, [user]);

  // Real-time listeners setup - only for critical data that changes frequently
  useEffect(() => {
    if (!user || !enableRealtime || !hasInitialized.current) return;

    // Clean up existing listeners
    if (realtimeCleanup.current) {
      realtimeCleanup.current();
    }

    // Only set up listeners for data that actually changes frequently
    const cleanup = setupRealtimeListeners({
      onEventsUpdate: (events) => {
        setData(prev => ({ ...prev, events }));
      },
      onClubsUpdate: (clubs) => {
        setData(prev => ({ ...prev, clubs }));
      },
      // Only add other listeners if they're actually needed
      onNotificationsUpdate: user ? (notifications) => {
        setData(prev => ({ ...prev, notifications }));
      } : undefined,
      onApplicationsUpdate: user ? (applications) => {
        setData(prev => ({ ...prev, applications }));
      } : undefined,
    }, user.id, user.role === 'admin');

    realtimeCleanup.current = cleanup;

    return () => {
      if (cleanup) cleanup();
      realtimeCleanup.current = null;
    };
  }, [user?.id, user?.role, enableRealtime, hasInitialized.current]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeCleanup.current) {
        realtimeCleanup.current();
      }
    };
  }, []);

  // Memoized update functions to prevent unnecessary re-renders
  const updateEvents = useCallback((events: Event[]) => {
    setData(prev => ({ ...prev, events }));
  }, []);

  const updateClubs = useCallback((clubs: Club[]) => {
    setData(prev => ({ ...prev, clubs }));
  }, []);

  const updateApplications = useCallback((applications: Application[]) => {
    setData(prev => ({ ...prev, applications }));
  }, []);

  return {
    ...data,
    isLoading,
    isSecondaryLoading,
    isUserDataLoading,
    updateEvents,
    updateClubs,
    updateApplications,
  };
};
