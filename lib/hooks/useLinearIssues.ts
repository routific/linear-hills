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
      const client = await getLinearClient();

      // Build filter
      const labelFilterObj = {
        labels: { name: { eq: labelFilter } },
        team: { id: { eq: teamId } },
      } as any;

      // Add project filter if provided
      if (projectId) {
        labelFilterObj.project = { id: { eq: projectId } };
      }

      // Use GraphQL query to fetch issues with children counts in one request
      const query = `
        query Issues($filter: IssueFilter!) {
          issues(filter: $filter) {
            nodes {
              id
              identifier
              title
              description
              priority
              url
              createdAt
              updatedAt
              state {
                id
                name
                type
              }
              assignee {
                id
                name
                avatarUrl
              }
              labels {
                nodes {
                  id
                  name
                  color
                }
              }
              children {
                nodes {
                  id
                  state {
                    type
                  }
                }
              }
            }
          }
        }
      `;

      const response = await client.client.rawRequest(query, {
        filter: labelFilterObj,
      });

      const issuesData = (response.data as any)?.issues?.nodes || [];

      return issuesData.map((issue: any) => {
        const children = issue.children?.nodes || [];
        const subtaskCount = children.length;
        const completedSubtaskCount = children.filter(
          (child: any) =>
            child.state?.type === "completed" ||
            child.state?.type === "canceled"
        ).length;

        return {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description || undefined,
          state: {
            id: issue.state?.id || "",
            name: issue.state?.name || "",
            type: issue.state?.type || "",
          },
          assignee: issue.assignee
            ? {
                id: issue.assignee.id,
                name: issue.assignee.name,
                avatarUrl: issue.assignee.avatarUrl || undefined,
              }
            : undefined,
          priority: issue.priority,
          labels: (issue.labels?.nodes || []).map((label: any) => ({
            id: label.id,
            name: label.name,
            color: label.color,
          })),
          url: issue.url,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          subtaskCount,
          completedSubtaskCount,
        };
      });
    },
    enabled: enabled && !!teamId && !!labelFilter,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
