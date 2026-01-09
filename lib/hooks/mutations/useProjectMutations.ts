/**
 * React Query mutation hooks for project operations
 * Create, update, and delete projects
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/types';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      return response.json();
    },

    onSuccess: () => {
      // Refetch workspace data to include new project
      queryClient.invalidateQueries({ queryKey: ['workspace-data'] });
    },

    onError: (err) => {
      console.error('Failed to create project:', err);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      return response.json();
    },

    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workspace-data'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['workspace-data']);

      // Optimistically update project in list
      queryClient.setQueryData(['workspace-data'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          projects: old.projects.map((p: Project) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['workspace-data'], context.previous);
      }
      console.error('Failed to update project:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-data'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      return response.json();
    },

    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workspace-data'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['workspace-data']);

      // Optimistically remove project from list
      queryClient.setQueryData(['workspace-data'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          projects: old.projects.filter((p: Project) => p.id !== id),
          // Also remove associated positions and orders
          issuePositions: Object.fromEntries(
            Object.entries(old.issuePositions).filter(
              ([_, pos]: [string, any]) => pos.projectId !== id
            )
          ),
          parkingLotOrders: Object.fromEntries(
            Object.entries(old.parkingLotOrders).filter(
              ([_, order]: [string, any]) => order.projectId !== id
            )
          ),
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['workspace-data'], context.previous);
      }
      console.error('Failed to delete project:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-data'] });
    },
  });
}
