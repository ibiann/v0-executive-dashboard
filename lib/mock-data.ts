// ─── Mock Data: Simulates Approved Timesheets from Tactical Level ───────────

export type RAGStatus = "green" | "amber" | "red";
export type Phase = "Survey" | "R&D" | "Test" | "Release";

export interface PhaseProgress {
  phase: Phase;
  progress: number; // 0–100
  color: string;
}

export interface Project {
  id: string;
  name: string;
  pm: string;
  ragStatus: RAGStatus;
  phases: PhaseProgress[];
  overallProgress: number; // derived from phases
  plannedProgress: number; // what should be done by today
  department: "FPGA" | "Software" | "Hardware" | "Mixed";
  resourceEfficiency: number; // 0–100 %
  startDate: string;
  endDate: string;
  closed: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "PRJ-001",
    name: "NavComm FPGA Core",
    pm: "Alice Morgan",
    ragStatus: "green",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 90, color: "#9b7b94" },
      { phase: "Test", progress: 60, color: "#c4a8be" },
      { phase: "Release", progress: 10, color: "#e7d9e4" },
    ],
    overallProgress: 65,
    plannedProgress: 60,
    department: "FPGA",
    resourceEfficiency: 88,
    startDate: "2025-01-10",
    endDate: "2026-06-30",
    closed: false,
  },
  {
    id: "PRJ-002",
    name: "Sentinel Gateway v3",
    pm: "Bob Chen",
    ragStatus: "amber",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 75, color: "#9b7b94" },
      { phase: "Test", progress: 30, color: "#c4a8be" },
      { phase: "Release", progress: 0, color: "#e7d9e4" },
    ],
    overallProgress: 51,
    plannedProgress: 65,
    department: "Software",
    resourceEfficiency: 74,
    startDate: "2025-03-01",
    endDate: "2026-04-15",
    closed: false,
  },
  {
    id: "PRJ-003",
    name: "Sigma Hardware Backplane",
    pm: "Carol Davies",
    ragStatus: "red",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 55, color: "#9b7b94" },
      { phase: "Test", progress: 10, color: "#c4a8be" },
      { phase: "Release", progress: 0, color: "#e7d9e4" },
    ],
    overallProgress: 41,
    plannedProgress: 70,
    department: "Hardware",
    resourceEfficiency: 55,
    startDate: "2024-11-01",
    endDate: "2026-03-01",
    closed: false,
  },
  {
    id: "PRJ-004",
    name: "ProtoLink Middleware",
    pm: "Dan Osei",
    ragStatus: "green",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 100, color: "#9b7b94" },
      { phase: "Test", progress: 85, color: "#c4a8be" },
      { phase: "Release", progress: 40, color: "#e7d9e4" },
    ],
    overallProgress: 81,
    plannedProgress: 78,
    department: "Software",
    resourceEfficiency: 92,
    startDate: "2025-02-14",
    endDate: "2026-07-31",
    closed: false,
  },
  {
    id: "PRJ-005",
    name: "TerraEdge IoT Platform",
    pm: "Eva Müller",
    ragStatus: "amber",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 80, color: "#9b7b94" },
      { phase: "Test", progress: 45, color: "#c4a8be" },
      { phase: "Release", progress: 5, color: "#e7d9e4" },
    ],
    overallProgress: 57,
    plannedProgress: 68,
    department: "Mixed",
    resourceEfficiency: 68,
    startDate: "2025-04-01",
    endDate: "2026-09-30",
    closed: false,
  },
  {
    id: "PRJ-006",
    name: "Xenon Signal Processor",
    pm: "Frank Li",
    ragStatus: "green",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 100, color: "#9b7b94" },
      { phase: "Test", progress: 100, color: "#c4a8be" },
      { phase: "Release", progress: 100, color: "#e7d9e4" },
    ],
    overallProgress: 100,
    plannedProgress: 100,
    department: "FPGA",
    resourceEfficiency: 96,
    startDate: "2024-06-01",
    endDate: "2025-12-31",
    closed: true,
  },
  {
    id: "PRJ-007",
    name: "Helios Power Module",
    pm: "Grace Kim",
    ragStatus: "green",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 100, color: "#9b7b94" },
      { phase: "Test", progress: 100, color: "#c4a8be" },
      { phase: "Release", progress: 100, color: "#e7d9e4" },
    ],
    overallProgress: 100,
    plannedProgress: 100,
    department: "Hardware",
    resourceEfficiency: 91,
    startDate: "2024-03-15",
    endDate: "2025-10-31",
    closed: true,
  },
  {
    id: "PRJ-008",
    name: "Vortex Firmware Suite",
    pm: "Harry Patel",
    ragStatus: "red",
    phases: [
      { phase: "Survey", progress: 100, color: "#714B67" },
      { phase: "R&D", progress: 65, color: "#9b7b94" },
      { phase: "Test", progress: 20, color: "#c4a8be" },
      { phase: "Release", progress: 0, color: "#e7d9e4" },
    ],
    overallProgress: 46,
    plannedProgress: 72,
    department: "Software",
    resourceEfficiency: 48,
    startDate: "2024-10-01",
    endDate: "2026-02-28",
    closed: false,
  },
];

// ─── Derived KPIs ────────────────────────────────────────────────────────────

export function getPortfolioHealth(projects: Project[]): number {
  const active = projects.filter((p) => !p.closed);
  if (active.length === 0) return 0;
  const avg =
    active.reduce((sum, p) => sum + p.overallProgress / p.plannedProgress, 0) /
    active.length;
  return Math.min(Math.round(avg * 100), 100);
}

export function getGlobalSPI(projects: Project[]): number {
  const active = projects.filter((p) => !p.closed);
  if (active.length === 0) return 0;
  const spi =
    active.reduce(
      (sum, p) => sum + p.overallProgress / p.plannedProgress,
      0
    ) / active.length;
  return Math.round(spi * 100) / 100;
}

export function getResourceEfficiency(projects: Project[]): number {
  if (projects.length === 0) return 0;
  return Math.round(
    projects.reduce((sum, p) => sum + p.resourceEfficiency, 0) / projects.length
  );
}

// ─── Resource Heatmap Data ────────────────────────────────────────────────────

export interface HeatmapCell {
  department: string;
  project: string;
  load: number; // 0–100 %
}

export const HEATMAP_DATA: HeatmapCell[] = [
  { department: "FPGA", project: "NavComm FPGA Core", load: 90 },
  { department: "FPGA", project: "Sentinel Gateway v3", load: 20 },
  { department: "FPGA", project: "Xenon Signal Processor", load: 5 },
  { department: "FPGA", project: "Vortex Firmware Suite", load: 35 },
  { department: "Software", project: "NavComm FPGA Core", load: 15 },
  { department: "Software", project: "Sentinel Gateway v3", load: 85 },
  { department: "Software", project: "ProtoLink Middleware", load: 78 },
  { department: "Software", project: "Vortex Firmware Suite", load: 60 },
  { department: "Hardware", project: "Sigma Hardware Backplane", load: 95 },
  { department: "Hardware", project: "TerraEdge IoT Platform", load: 50 },
  { department: "Hardware", project: "Helios Power Module", load: 10 },
  { department: "Hardware", project: "ProtoLink Middleware", load: 30 },
];

export const DEPARTMENTS = ["FPGA", "Software", "Hardware"];
export const HEATMAP_PROJECTS = [
  "NavComm FPGA Core",
  "Sentinel Gateway v3",
  "Sigma Hardware Backplane",
  "ProtoLink Middleware",
  "TerraEdge IoT Platform",
  "Xenon Signal Processor",
  "Vortex Firmware Suite",
];
