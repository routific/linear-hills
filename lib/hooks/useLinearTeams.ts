import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

export function useLinearTeams(enabled: boolean = true) {
  return useQuery({
    queryKey: ["linear-teams"],
    queryFn: async (): Promise<LinearTeam[]> => {
      const client = getLinearClient();
      const teamsConnection = await client.teams();

      return teamsConnection.nodes.map((team) => ({
        id: team.id,
        name: team.name,
        key: team.key,
      }));
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}
