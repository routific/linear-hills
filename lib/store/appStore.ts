import { create } from "zustand";
import type { Project, IssuePosition, ParkingLotOrder } from "@/types";
import {
  getApiKey,
  setApiKey as saveApiKey,
  removeApiKey as deleteApiKey,
} from "../storage/apiKey";
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

interface AppState {
  apiKey: string | null;
  projects: Project[];
  activeProjectId: string | null;
  issuePositions: Record<string, IssuePosition>;
  parkingLotOrders: Record<string, ParkingLotOrder>;
  isSyncing: boolean;
  lastSync: string | null;

  setApiKey: (key: string) => void;
  clearApiKey: () => void;

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

  setSyncing: (syncing: boolean) => void;
  setLastSync: (timestamp: string) => void;

  hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  apiKey: null,
  projects: [],
  activeProjectId: null,
  issuePositions: {},
  parkingLotOrders: {},
  isSyncing: false,
  lastSync: null,

  setApiKey: (key: string) => {
    saveApiKey(key);
    set({ apiKey: key });
  },

  clearApiKey: () => {
    deleteApiKey();
    set({ apiKey: null });
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

  setSyncing: (syncing: boolean) => {
    set({ isSyncing: syncing });
  },

  setLastSync: (timestamp: string) => {
    set({ lastSync: timestamp });
  },

  hydrate: () => {
    const apiKey = getApiKey();
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
      apiKey,
      projects,
      issuePositions: positionsRecord,
      parkingLotOrders: ordersRecord,
    });
  },
}));
