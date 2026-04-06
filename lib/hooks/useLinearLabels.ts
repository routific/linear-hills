import type { IssueLabel, LinearClient } from "@linear/sdk";
import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
  groupName?: string;
}

/** Label groups omitted from the picker (large/noisy groups; also saves API work). */
const EXCLUDED_LABEL_GROUP_NAMES = new Set([
  "Completed Release",
  "Release",
]);

async function addLabelsFromRoots(
  client: LinearClient,
  roots: IssueLabel[],
  labels: LinearLabel[],
  seenIds: Set<string>
) {
  for (const label of roots) {
    if (EXCLUDED_LABEL_GROUP_NAMES.has(label.name)) continue;

    const childNodes = await client.paginate(
      (vars) => label.children(vars),
      { first: 100 }
    );

    if (childNodes.length > 0) {
      for (const child of childNodes) {
        if (EXCLUDED_LABEL_GROUP_NAMES.has(child.name)) continue;
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
        const parent = await label.parent;
        if (parent && EXCLUDED_LABEL_GROUP_NAMES.has(parent.name)) continue;
        seenIds.add(label.id);
        labels.push({
          id: label.id,
          name: label.name,
          color: label.color,
          groupName: parent?.name,
        });
      }
    }
  }
}

export function useLinearLabels(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["linear-labels", teamId],
    queryFn: async (): Promise<LinearLabel[]> => {
      if (!teamId) return [];

      const client = await getLinearClient();

      const labels: LinearLabel[] = [];
      const seenIds = new Set<string>();

      const team = await client.team(teamId);
      const teamLabelNodes = await client.paginate(
        (vars) => team.labels(vars),
        { first: 100 }
      );
      await addLabelsFromRoots(client, teamLabelNodes, labels, seenIds);

      const workspaceLabelNodes = await client.paginate(
        (vars) =>
          client.issueLabels({
            ...vars,
            filter: { team: { null: true } },
          }),
        { first: 100 }
      );
      await addLabelsFromRoots(client, workspaceLabelNodes, labels, seenIds);

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
