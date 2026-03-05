import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
  groupName?: string;
}

export function useLinearLabels(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["linear-labels", teamId],
    queryFn: async (): Promise<LinearLabel[]> => {
      if (!teamId) return [];

      const client = await getLinearClient();

      // Fetch team labels
      const team = await client.team(teamId);
      const teamLabelsConnection = await team.labels();

      const labels: LinearLabel[] = [];
      const seenIds = new Set<string>();

      for (const label of teamLabelsConnection.nodes) {
        // Skip parent/group labels themselves — we only want leaf labels
        const children = await label.children();
        if (children.nodes.length > 0) {
          // This is a group label — add its children with the group name
          for (const child of children.nodes) {
            if (!seenIds.has(child.id)) {
              seenIds.add(child.id);
              labels.push({
                id: child.id,
                name: child.name,
                color: child.color,
                groupName: label.name,
              });
            }
          }
        } else {
          // Regular label (may or may not have a parent)
          if (!seenIds.has(label.id)) {
            seenIds.add(label.id);
            const parent = await label.parent;
            labels.push({
              id: label.id,
              name: label.name,
              color: label.color,
              groupName: parent?.name,
            });
          }
        }
      }

      // Also fetch workspace-level labels (not team-scoped)
      const workspaceLabels = await client.issueLabels({
        filter: {
          team: { null: true },
        },
      });

      for (const label of workspaceLabels.nodes) {
        const children = await label.children();
        if (children.nodes.length > 0) {
          // Group label — add children
          for (const child of children.nodes) {
            if (!seenIds.has(child.id)) {
              seenIds.add(child.id);
              labels.push({
                id: child.id,
                name: child.name,
                color: child.color,
                groupName: label.name,
              });
            }
          }
        } else {
          if (!seenIds.has(label.id)) {
            seenIds.add(label.id);
            const parent = await label.parent;
            labels.push({
              id: label.id,
              name: label.name,
              color: label.color,
              groupName: parent?.name,
            });
          }
        }
      }

      // Sort: grouped labels first (by group name), then ungrouped
      labels.sort((a, b) => {
        if (a.groupName && !b.groupName) return 1;
        if (!a.groupName && b.groupName) return -1;
        if (a.groupName && b.groupName) {
          const groupCmp = a.groupName.localeCompare(b.groupName);
          if (groupCmp !== 0) return groupCmp;
        }
        return a.name.localeCompare(b.name);
      });

      return labels;
    },
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
