export interface Project {
  id: string;
  name: string;
  description?: string;
  linearTeamId: string;
  linearTeamName?: string;
  linearProjectId?: string;
  linearProjectName?: string;
  labelFilter: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
}
