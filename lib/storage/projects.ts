import { z } from "zod";
import { getFromStorage, setToStorage } from "./index";
import { STORAGE_KEYS, ProjectSchema } from "./schemas";
import type { Project } from "@/types";

const ProjectsArraySchema = z.array(ProjectSchema);

export function getProjects(): Project[] {
  const projects = getFromStorage<Project[]>(
    STORAGE_KEYS.PROJECTS,
    ProjectsArraySchema
  );
  return projects || [];
}

export function setProjects(projects: Project[]): boolean {
  return setToStorage(STORAGE_KEYS.PROJECTS, projects);
}

export function getProjectById(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function addProject(project: Project): boolean {
  const projects = getProjects();

  const existingIndex = projects.findIndex((p) => p.id === project.id);
  if (existingIndex !== -1) {
    return false;
  }

  projects.push(project);
  return setProjects(projects);
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, "id">>
): boolean {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return false;
  }

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return setProjects(projects);
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) {
    return false;
  }

  return setProjects(filtered);
}
