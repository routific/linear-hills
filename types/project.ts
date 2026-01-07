export interface Project {
  id: string;
  name: string;
  description?: string;
  linearTeamId: string;
  linearProjectId?: string;
  labelFilter: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}
