export interface Project {
  id: string;
  name: string;
  description?: string;
  linearTeamId: string;
  labelFilter: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}
