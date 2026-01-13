import { useQuery } from "@tanstack/react-query";
import { getLinearClient } from "../linear/client";

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export function useLinearLabels(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["linear-labels", teamId],
    queryFn: async (): Promise<LinearLabel[]> => {
      if (!teamId) return [];

      const client = await getLinearClient();
      const team = await client.team(teamId);
      const labelsConnection = await team.labels();

      return labelsConnection.nodes.map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      }));
    },
    enabled: enabled && !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}
