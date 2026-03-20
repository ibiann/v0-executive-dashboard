"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  PROJECTS,
  TACTICAL_DATA,
  Project,
  RAGStatus,
  PhaseDefinition,
  TaskCard,
  TacticalProjectData,
  EngNotification,
  DEFAULT_PHASE_WEIGHTS,
} from "@/lib/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  projects: Project[];
  tacticalData: Record<string, TacticalProjectData>;
  pmNotifications: EngNotification[];
  handleRagChange: (projectId: string, newRag: RAGStatus) => void;
  handleTimesheetApprove: (projectId: string, entryId: string) => void;
  handlePhaseSave: (projectId: string, phases: PhaseDefinition[]) => void;
  handleTasksChange: (projectId: string, tasks: TaskCard[]) => void;
  handlePmNotify: (notif: Omit<EngNotification, "id" | "read">) => void;
  handleCreateProject: (data: { name: string; pm: string; category: "Software" | "Hardware" | "FPGA" }) => string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    // Return a safe no-op default during SSR / before provider mounts
    return {
      projects:        [],
      tacticalData:    {},
      pmNotifications: [],
      handleRagChange:         () => {},
      handleTimesheetApprove:  () => {},
      handlePhaseSave:         () => {},
      handleTasksChange:       () => {},
      handlePmNotify:          () => {},
      handleCreateProject:     () => "",
    };
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [projects,        setProjects]        = useState<Project[]>(PROJECTS);
  const [tacticalData,    setTacticalData]    = useState<Record<string, TacticalProjectData>>(TACTICAL_DATA);
  const [pmNotifications, setPmNotifications] = useState<EngNotification[]>([]);

  function handleRagChange(projectId: string, newRag: RAGStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ragStatus: newRag } : p))
    );
  }

  function handleTimesheetApprove(projectId: string, entryId: string) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;

      const updated: TacticalProjectData = {
        ...td,
        timesheets: td.timesheets.map((ts) =>
          ts.id === entryId ? { ...ts, approved: true } : ts
        ),
      };

      const approved = updated.timesheets.filter((ts) => ts.approved);
      const totalApprovedHours = approved.reduce((s, ts) => s + ts.loggedHours, 0);
      const totalPlannedHours  =
        projects.find((p) => p.id === projectId)?.hoursData.reduce((s, h) => s + h.planned, 0) ?? 1;
      const newProgress = Math.min(Math.round((totalApprovedHours / totalPlannedHours) * 100), 100);

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, overallProgress: newProgress } : p))
      );

      return { ...prev, [projectId]: updated };
    });
  }

  function handlePhaseSave(projectId: string, phases: PhaseDefinition[]) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;
      return { ...prev, [projectId]: { ...td, phases } };
    });
  }

  function handleTasksChange(projectId: string, tasks: TaskCard[]) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;
      return { ...prev, [projectId]: { ...td, tasks } };
    });
  }

  function handlePmNotify(notif: Omit<EngNotification, "id" | "read">) {
    setPmNotifications((prev) => [
      { ...notif, id: `PN-${Date.now()}`, read: false },
      ...prev,
    ]);
  }

  function handleCreateProject(data: { name: string; pm: string; category: "Software" | "Hardware" | "FPGA" }): string {
    const newProjectId = `PRJ-${String(projects.length + 1).padStart(3, "0")}`;
    const newProject: Project = {
      id: newProjectId,
      name: data.name,
      pm: data.pm,
      category: data.category,
      ragStatus: "green",
      phases: [],
      overallProgress: 0,
      plannedProgress: 0,
      department: data.category === "Software" ? "Software" : data.category === "Hardware" ? "Hardware" : "FPGA",
      resourceEfficiency: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      closed: false,
      hoursData: [],
      overdueTasks: [],
    };

    const defaultPhases = DEFAULT_PHASE_WEIGHTS[data.category];
    const newTacticalData: TacticalProjectData = {
      projectId: newProjectId,
      phases: defaultPhases,
      tasks: [],
      team: [],
      timesheets: [],
    };

    setProjects((prev) => [...prev, newProject]);
    setTacticalData((prev) => ({ ...prev, [newProjectId]: newTacticalData }));
    return newProjectId;
  }

  return (
    <AppStateContext.Provider
      value={{
        projects,
        tacticalData,
        pmNotifications,
        handleRagChange,
        handleTimesheetApprove,
        handlePhaseSave,
        handleTasksChange,
        handlePmNotify,
        handleCreateProject,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
