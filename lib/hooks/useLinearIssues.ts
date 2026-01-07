import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";
import type { LinearIssue } from "@/types";

interface UseLinearIssuesOptions {
  teamId: string;
  projectId?: string;
  labelFilter: string;
  enabled?: boolean;
}

export function useLinearIssues({
  teamId,
  projectId,
  labelFilter,
  enabled = true,
}: UseLinearIssuesOptions) {
  return useQuery({
    queryKey: ["linear-issues", teamId, projectId, labelFilter],
    queryFn: async (): Promise<LinearIssue[]> => {
      const client = getLinearClient();
      const team = await client.team(teamId);

      const filter: any = {
        labels: { name: { eq: labelFilter } },
      };

      // Add project filter if provided
      if (projectId) {
        filter.project = { id: { eq: projectId } };
      }

      const issuesConnection = await team.issues({ filter });

      const issues = issuesConnection.nodes;

      return Promise.all(
        issues.map(async (issue) => {
          const state = await issue.state;
          const assignee = await issue.assignee;
          const labelsConnection = await issue.labels();

          // Fetch child issues (subtasks)
          let subtaskCount = 0;
          let completedSubtaskCount = 0;

          try {
            const childrenConnection = await issue.children();
            const children = childrenConnection?.nodes || [];
            subtaskCount = children.length;

            if (children.length > 0) {
              const completedStatuses = await Promise.all(
                children.map(async (child) => {
                  const childState = await child.state;
                  return childState?.type === "completed" || childState?.type === "canceled";
                })
              );

              completedSubtaskCount = completedStatuses.filter(Boolean).length;
            }
          } catch (error) {
            console.error("Error fetching children for issue:", issue.identifier, error);
          }

          return {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            description: issue.description || undefined,
            state: {
              id: state?.id || "",
              name: state?.name || "",
              type: state?.type || "",
            },
            assignee: assignee
              ? {
                  id: assignee.id,
                  name: assignee.name,
                  avatarUrl: assignee.avatarUrl || undefined,
                }
              : undefined,
            priority: issue.priority,
            labels: (labelsConnection?.nodes || []).map((label) => ({
              id: label.id,
              name: label.name,
              color: label.color,
            })),
            url: issue.url,
            createdAt: issue.createdAt.toISOString(),
            updatedAt: issue.updatedAt.toISOString(),
            subtaskCount: subtaskCount,
            completedSubtaskCount: completedSubtaskCount,
          };
        })
      );
    },
    enabled: enabled && !!teamId && !!labelFilter,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
