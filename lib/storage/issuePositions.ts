import { z } from "zod";
import { getFromStorage, setToStorage } from "./index";
import { STORAGE_KEYS, IssuePositionSchema } from "./schemas";
import type { IssuePosition } from "@/types";

const IssuePositionsArraySchema = z.array(IssuePositionSchema);

export function getIssuePositions(): IssuePosition[] {
  const positions = getFromStorage<IssuePosition[]>(
    STORAGE_KEYS.ISSUE_POSITIONS,
    IssuePositionsArraySchema
  );
  return positions || [];
}

export function setIssuePositions(positions: IssuePosition[]): boolean {
  return setToStorage(STORAGE_KEYS.ISSUE_POSITIONS, positions);
}

export function getIssuePositionsByProject(projectId: string): IssuePosition[] {
  const positions = getIssuePositions();
  return positions.filter((p) => p.projectId === projectId);
}

export function getIssuePosition(issueId: string): IssuePosition | null {
  const positions = getIssuePositions();
  return positions.find((p) => p.issueId === issueId) || null;
}

export function updateIssuePosition(position: IssuePosition): boolean {
  const positions = getIssuePositions();
  const index = positions.findIndex((p) => p.issueId === position.issueId);

  if (index === -1) {
    positions.push(position);
  } else {
    positions[index] = position;
  }

  return setIssuePositions(positions);
}

export function deleteIssuePosition(issueId: string): boolean {
  const positions = getIssuePositions();
  const filtered = positions.filter((p) => p.issueId !== issueId);

  if (filtered.length === positions.length) {
    return false;
  }

  return setIssuePositions(filtered);
}

export function deletePositionsByProject(projectId: string): boolean {
  const positions = getIssuePositions();
  const filtered = positions.filter((p) => p.projectId !== projectId);
  return setIssuePositions(filtered);
}

export function cleanupOrphanedPositions(validIssueIds: string[]): number {
  const positions = getIssuePositions();
  const validSet = new Set(validIssueIds);
  const filtered = positions.filter((p) => validSet.has(p.issueId));

  const removedCount = positions.length - filtered.length;

  if (removedCount > 0) {
    setIssuePositions(filtered);
  }

  return removedCount;
}
