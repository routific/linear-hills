import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

export interface LinearProject {
  id: string;
  name: string;
  key: string;
  url: string;
  state: string;
}

export function useLinearProjects(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["linear-projects", teamId],
    queryFn: async (): Promise<LinearProject[]> => {
      if (!teamId) return [];

      const client = await getLinearClient();
      const team = await client.team(teamId);
      const projectNodes = await client.paginate(
        (vars) => team.projects(vars),
        { first: 100 }
      );

      return projectNodes.map((project) => ({
        id: project.id,
        name: project.name,
        key: project.id,
        url: project.url,
        state: project.state,
      }));
    },
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
