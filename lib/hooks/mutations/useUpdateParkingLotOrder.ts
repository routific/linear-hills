/**
 * React Query mutation hook for updating parking lot orders
 * Implements optimistic updates with rollback on error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParkingLotOrder } from '@/types';

export function useUpdateParkingLotOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: ParkingLotOrder) => {
      const response = await fetch('/api/parking-lot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update parking lot order');
      }

      return response.json();
    },

    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workspace-data'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['workspace-data']);

      // Optimistically update UI
      queryClient.setQueryData(['workspace-data'], (old: any) => {
        if (!old) return old;

        const key = `${newOrder.projectId}-${newOrder.side}`;
        return {
          ...old,
          parkingLotOrders: {
            ...old.parkingLotOrders,
            [key]: newOrder,
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
      console.error('Failed to update parking lot order:', err);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['workspace-data'] });
    },
  });
}
