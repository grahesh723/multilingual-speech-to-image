import { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../services/api';

/**
 * Custom hook for managing server status monitoring with automatic polling
 * @param {number} pollingInterval - Polling interval in milliseconds
 * @returns {Object} Server status state and functions
 */
export const useServerStatus = (pollingInterval = 10000) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    const interval = setInterval(fetchStatus, pollingInterval);
    
    return () => clearInterval(interval);
  }, [fetchStatus, pollingInterval]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch,
  };
}; 