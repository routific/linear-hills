import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getLinearClient } from "../linear/client";

/**
 * Fetches Linear project states (e.g. "completed", "started") for the given
 * Linear project IDs in a single workspace-wide query, including archived
 * projects. Returns a map from Linear project ID to the project's state.
 *
 * Querying by ID instead of by team avoids missing projects whose team
 * association has changed and works regardless of how many teams are involved.
 */
export function useLinearProjectStates(
  linearProjectIds: string[],
  enabled: boolean = true
) {
  const ids = useMemo(
    () => Array.from(new Set(linearProjectIds.filter(Boolean))).sort(),
    [linearProjectIds]
  );

  const query = useQuery({
    queryKey: ["linear-project-states", ids],
    queryFn: async (): Promise<Record<string, string>> => {
      if (ids.length === 0) return {};
      const client = await getLinearClient();
      const projectNodes = await client.paginate(
        (vars) =>
          client.projects({
            ...vars,
            filter: { id: { in: ids } },
            includeArchived: true,
          }),
        { first: 100 }
      );
      const map: Record<string, string> = {};
      for (const project of projectNodes) {
        map[project.id] = project.state;
      }
      return map;
    },
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    stateByProjectId: query.data ?? {},
    isLoading: query.isLoading,
    isFetched: query.isFetched || ids.length === 0,
  };
}
