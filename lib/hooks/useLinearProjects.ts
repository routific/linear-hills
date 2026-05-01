import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

export interface LinearProject {
  id: string;
  name: string;
  key: string;
  url: string;
  state: string;
}

export function linearProjectsQueryKey(teamId: string) {
  return ["linear-projects", teamId] as const;
}

export async function fetchLinearProjects(teamId: string): Promise<LinearProject[]> {
  if (!teamId) return [];

  const client = await getLinearClient();
  const team = await client.team(teamId);
  const projectsConnection = await team.projects();

  return projectsConnection.nodes.map((project) => ({
    id: project.id,
    name: project.name,
    key: project.id,
    url: project.url,
    state: project.state,
  }));
}

export function useLinearProjects(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: linearProjectsQueryKey(teamId),
    queryFn: () => fetchLinearProjects(teamId),
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
