import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";
import type { LinearIssue } from "@/types";

interface UseLinearIssuesOptions {
  teamId: string;
  labelFilter: string;
  enabled?: boolean;
}

export function useLinearIssues({
  teamId,
  labelFilter,
  enabled = true,
}: UseLinearIssuesOptions) {
  return useQuery({
    queryKey: ["linear-issues", teamId, labelFilter],
    queryFn: async (): Promise<LinearIssue[]> => {
      const client = getLinearClient();
      const team = await client.team(teamId);

      const issuesConnection = await team.issues({
        filter: {
          labels: { name: { eq: labelFilter } },
        },
      });

      const issues = issuesConnection.nodes;

      return Promise.all(
        issues.map(async (issue) => {
          const state = await issue.state;
          const assignee = await issue.assignee;
          const labelsConnection = await issue.labels();

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
          };
        })
      );
    },
    enabled: enabled && !!teamId && !!labelFilter,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
