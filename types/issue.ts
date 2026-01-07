export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    type: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  priority: number;
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssuePosition {
  issueId: string;
  projectId: string;
  xPosition: number;
  lastUpdated: string;
  notes?: string;
}
