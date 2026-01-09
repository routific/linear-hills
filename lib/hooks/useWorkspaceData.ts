/**
 * React Query hook for fetching workspace data
 * Implements polling for real-time collaboration
 */

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store/appStore';

interface WorkspaceData {
  projects: any[];
  issuePositions: Record<string, any>;
  parkingLotOrders: Record<string, any>;
  lastSync: string;
}

export function useWorkspaceData() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return useQuery<WorkspaceData>({
    queryKey: ['workspace-data'],
    queryFn: async () => {
      const response = await fetch('/api/data/sync');

      if (!response.ok) {
        throw new Error('Failed to sync workspace data');
      }

      return response.json();
    },
    // Poll every 20 seconds for updates from other users
    refetchInterval: 20000,
    // Consider data stale after 15 seconds
    staleTime: 15000,
    // Refetch when user returns to tab
    refetchOnWindowFocus: true,
    // Only fetch if authenticated
    enabled: isAuthenticated,
  });
}
