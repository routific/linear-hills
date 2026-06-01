import { getFromStorage, setToStorage } from ".";
import {
  DEFAULT_WORKSPACE_SETTINGS,
  STORAGE_KEYS,
  WorkspaceSettingsSchema,
  type WorkspaceSettings,
} from "./schemas";

export function getWorkspaceSettings(): WorkspaceSettings {
  return (
    getFromStorage(STORAGE_KEYS.WORKSPACE_SETTINGS, WorkspaceSettingsSchema) ??
    DEFAULT_WORKSPACE_SETTINGS
  );
}

export function setWorkspaceSettings(settings: WorkspaceSettings): boolean {
  return setToStorage(STORAGE_KEYS.WORKSPACE_SETTINGS, settings);
}
