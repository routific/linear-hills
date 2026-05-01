import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchLinearProjects,
  linearProjectsQueryKey,
} from "./useLinearProjects";

/**
 * Fetches Linear project states (e.g. "completed", "started") for the given team IDs
 * by reusing the same query cache as `useLinearProjects`. Returns a map from
 * Linear project ID to the project's state string.
 */
export function useLinearProjectStates(teamIds: string[], enabled: boolean = true) {
  const uniqueTeamIds = useMemo(
    () => Array.from(new Set(teamIds.filter(Boolean))),
    [teamIds]
  );

  const queries = useQueries({
    queries: uniqueTeamIds.map((teamId) => ({
      queryKey: linearProjectsQueryKey(teamId),
      queryFn: () => fetchLinearProjects(teamId),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const stateByProjectId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const query of queries) {
      const projects = query.data;
      if (!projects) continue;
      for (const project of projects) {
        map[project.id] = project.state;
      }
    }
    return map;
  }, [queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const isFetched = queries.length > 0 && queries.every((q) => q.isFetched);

  return { stateByProjectId, isLoading, isFetched };
}
