import { useState, useEffect, useCallback } from 'react';
import { imageGenerationAPI } from '../services/api';
import { ServerStatus } from '../types';

interface UseServerStatusReturn {
  status: ServerStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useServerStatus = (pollingInterval: number = 10000): UseServerStatusReturn => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await imageGenerationAPI.getStatus();
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