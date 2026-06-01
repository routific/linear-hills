import { create } from "zustand";
import type { Project, IssuePosition, ParkingLotOrder } from "@/types";
import {
  getProjects,
  setProjects as saveProjects,
  addProject as addProjectToStorage,
  updateProject as updateProjectInStorage,
  deleteProject as deleteProjectFromStorage,
} from "../storage/projects";
import {
  getIssuePositions,
  updateIssuePosition as updatePositionInStorage,
  deletePositionsByProject,
} from "../storage/issuePositions";
import {
  getParkingLotOrders,
  updateParkingLotOrder as updateOrderInStorage,
  deleteOrdersByProject,
} from "../storage/parkingLotOrder";
import { clearAppStorage } from "../storage/schemas";
import {
  getWorkspaceSettings,
  setWorkspaceSettings,
} from "../storage/workspaceSettings";
import {
  DEFAULT_WORKSPACE_SETTINGS,
  type WorkspaceSettings,
} from "../storage/schemas";

interface AppState {
  isAuthenticated: boolean;
  projects: Project[];
  activeProjectId: string | null;
  issuePositions: Record<string, IssuePosition>;
  parkingLotOrders: Record<string, ParkingLotOrder>;
  workspaceSettings: WorkspaceSettings;
  isSyncing: boolean;
  lastSync: string | null;

  setAuthenticated: (authenticated: boolean) => void;
  logout: () => Promise<void>;

  setActiveProject: (id: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, "id">>) => void;
  deleteProject: (id: string) => void;

  updateIssuePosition: (issueId: string, position: IssuePosition) => void;
  updateParkingLotOrder: (
    projectId: string,
    side: "left" | "right",
    issueIds: string[]
  ) => void;

  setWorkspaceSettings: (settings: WorkspaceSettings) => void;
  updateDefaultLabelFilter: (label: string) => Promise<void>;

  setSyncing: (syncing: boolean) => void;
  setLastSync: (timestamp: string) => void;

  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  projects: [],
  activeProjectId: null,
  issuePositions: {},
  parkingLotOrders: {},
  workspaceSettings: DEFAULT_WORKSPACE_SETTINGS,
  isSyncing: false,
  lastSync: null,

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ isAuthenticated: false });
      window.location.href = '/setup';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  setActiveProject: (id: string | null) => {
    set({ activeProjectId: id });
  },

  addProject: (project: Project) => {
    const success = addProjectToStorage(project);
    if (success) {
      const projects = getProjects();
      set({ projects });
    }
  },

  updateProject: (id: string, updates: Partial<Omit<Project, "id">>) => {
    const success = updateProjectInStorage(id, updates);
    if (success) {
      const projects = getProjects();
      set({ projects });
    }
  },

  deleteProject: (id: string) => {
    const success = deleteProjectFromStorage(id);
    if (success) {
      deletePositionsByProject(id);
      deleteOrdersByProject(id);

      const projects = getProjects();
      const { activeProjectId } = get();

      set({
        projects,
        activeProjectId: activeProjectId === id ? null : activeProjectId,
      });
    }
  },

  updateIssuePosition: (issueId: string, position: IssuePosition) => {
    const success = updatePositionInStorage(position);
    if (success) {
      const positions = getIssuePositions();
      const positionsRecord = positions.reduce(
        (acc, pos) => {
          acc[pos.issueId] = pos;
          return acc;
        },
        {} as Record<string, IssuePosition>
      );

      set({ issuePositions: positionsRecord });
    }
  },

  updateParkingLotOrder: (
    projectId: string,
    side: "left" | "right",
    issueIds: string[]
  ) => {
    const order: ParkingLotOrder = {
      projectId,
      side,
      issueIds,
      lastUpdated: new Date().toISOString(),
    };

    const success = updateOrderInStorage(order);
    if (success) {
      const orders = getParkingLotOrders();
      const ordersRecord = orders.reduce(
        (acc, ord) => {
          const key = `${ord.projectId}-${ord.side}`;
          acc[key] = ord;
          return acc;
        },
        {} as Record<string, ParkingLotOrder>
      );

      set({ parkingLotOrders: ordersRecord });
    }
  },

  setWorkspaceSettings: (settings: WorkspaceSettings) => {
    set({ workspaceSettings: settings });
  },

  updateDefaultLabelFilter: async (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const { isAuthenticated, projects } = get();
    const next: WorkspaceSettings = { defaultLabelFilter: trimmed };

    if (isAuthenticated) {
      const response = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        throw new Error("Failed to update workspace settings");
      }
      const data = await response.json();
      set({
        workspaceSettings: { defaultLabelFilter: data.defaultLabelFilter },
        // Backfill projects in store so UI updates immediately
        projects: projects.map((p) => ({
          ...p,
          labelFilter: data.defaultLabelFilter,
        })),
      });
    } else {
      setWorkspaceSettings(next);
      set({ workspaceSettings: next });
    }
  },

  setSyncing: (syncing: boolean) => {
    set({ isSyncing: syncing });
  },

  setLastSync: (timestamp: string) => {
    set({ lastSync: timestamp });
  },

  hydrate: async () => {
    // Check authentication status first
    let isAuthenticated = false;
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      isAuthenticated = data.authenticated;
    } catch (error) {
      console.error('Failed to check authentication:', error);
    }

    // Unauthenticated: load from localStorage (existing behavior)
    if (!isAuthenticated) {
      const projects = getProjects();
      const positions = getIssuePositions();
      const orders = getParkingLotOrders();

      const positionsRecord = positions.reduce(
        (acc, pos) => {
          acc[pos.issueId] = pos;
          return acc;
        },
        {} as Record<string, IssuePosition>
      );

      const ordersRecord = orders.reduce(
        (acc, ord) => {
          const key = `${ord.projectId}-${ord.side}`;
          acc[key] = ord;
          return acc;
        },
        {} as Record<string, ParkingLotOrder>
      );

      set({
        isAuthenticated: false,
        projects,
        issuePositions: positionsRecord,
        parkingLotOrders: ordersRecord,
        workspaceSettings: getWorkspaceSettings(),
      });
      return;
    }

    // Authenticated: check for localStorage data to migrate
    const localProjects = getProjects();
    const hasLocalData = localProjects.length > 0;
    const migrationAttempted = localStorage.getItem('migration_attempted');

    if (hasLocalData && !migrationAttempted) {
      try {
        // Mark migration as attempted to prevent retries on failure
        localStorage.setItem('migration_attempted', 'true');

        // Migrate localStorage data to database
        console.log('Migrating localStorage data to database...');
        const localPositions = getIssuePositions();
        const localOrders = getParkingLotOrders();

        const response = await fetch('/api/migrate/localStorage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projects: localProjects,
            issuePositions: localPositions,
            parkingLotOrders: localOrders,
          }),
        });

        if (response.ok) {
          // Clear app-specific localStorage after successful migration
          clearAppStorage();
          console.log('Migration successful, app localStorage cleared');
        } else {
          console.error('Migration failed:', await response.text());
          // Keep migration_attempted flag to prevent infinite retries
        }
      } catch (error) {
        console.error('Migration error:', error);
        // Keep migration_attempted flag to prevent infinite retries
      }
    }

    // Load data from database
    try {
      const response = await fetch('/api/data/sync');
      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          projects: data.projects,
          issuePositions: data.issuePositions,
          parkingLotOrders: data.parkingLotOrders,
          workspaceSettings: data.workspaceSettings ?? DEFAULT_WORKSPACE_SETTINGS,
          lastSync: data.lastSync,
        });
      } else {
        console.error('Failed to load workspace data');
        set({ isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to sync workspace data:', error);
      set({ isAuthenticated: true });
    }
  },
}));
