import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  linearTeamId: z.string().min(1, "Team ID is required"),
  linearTeamName: z.string().optional(),
  linearProjectId: z.string().optional(),
  linearProjectName: z.string().optional(),
  labelFilter: z.string().min(1, "Label filter is required"),
  createdAt: z.string(),
  updatedAt: z.string(),
  color: z.string().optional(),
});

export const IssuePositionSchema = z.object({
  issueId: z.string().min(1),
  projectId: z.string().uuid(),
  xPosition: z.number().min(0).max(100),
  lastUpdated: z.string(),
  notes: z.string().optional(),
});

export const STORAGE_KEYS = {
  API_KEY: "linear_api_key",
  PROJECTS: "projects",
  ISSUE_POSITIONS: "issue_positions",
  LAST_SYNC: "last_sync",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
