/**
 * React Query mutation hook for updating issue positions
 * Implements optimistic updates with rollback on error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IssuePosition } from '@/types';

export function useUpdateIssuePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (position: IssuePosition) => {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update position');
      }

      return response.json();
    },

    onMutate: async (newPosition) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['workspace-data'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['workspace-data']);

      // Optimistically update UI
      queryClient.setQueryData(['workspace-data'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          issuePositions: {
            ...old.issuePositions,
            [newPosition.issueId]: newPosition,
          },
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['workspace-data'], context.previous);
      }
      console.error('Failed to update issue position:', err);
    },

    onSettled: () => {
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ['workspace-data'] });
    },
  });
}
