import { useState, useEffect } from 'react';
import { firestoreDataService } from '../services/firestoreDataService';
import { Event, Club, LeadershipMember } from '../types';

/**
 * Hook for lazy-loading section data (events, clubs, leadership)
 * Used on home page to avoid fetching all data upfront
 */
export const useLazyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    firestoreDataService.getEvents()
      .then(data => {
        console.log('✅ Events data received:', data?.length || 0, 'events');
        if (data && Array.isArray(data)) {
          setEvents(data);
        } else {
          console.warn('⚠️ Events data is not an array:', data);
          setEvents([]);
        }
      })
      .catch(error => {
        console.error('❌ Error loading events:', error);
        setError(error);
        setEvents([]); // Ensure state is cleared on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { events, isLoading, error };
};

export const useLazyClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    firestoreDataService.getClubs()
      .then(data => {
        console.log('✅ Clubs data received:', data?.length || 0, 'clubs');
        if (data && Array.isArray(data)) {
          setClubs(data);
        } else {
          console.warn('⚠️ Clubs data is not an array:', data);
          setClubs([]);
        }
      })
      .catch(error => {
        console.error('❌ Error loading clubs:', error);
        setError(error);
        setClubs([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { clubs, isLoading, error };
};

export const useLazyLeadership = () => {
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    firestoreDataService.getLeadership()
      .then(data => {
        console.log('✅ Leadership data received:', data?.length || 0, 'members');
        if (data && Array.isArray(data)) {
          setLeadership(data);
        } else {
          console.warn('⚠️ Leadership data is not an array:', data);
          setLeadership([]);
        }
      })
      .catch(error => {
        console.error('❌ Error loading leadership:', error);
        setError(error);
        setLeadership([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { leadership, isLoading, error };
};

