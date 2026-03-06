// ─── Mock Data: Simulates Approved Timesheets from Tactical Level ───────────

export type RAGStatus = "green" | "amber" | "red";
export type Phase = "Survey" | "R&D" | "Test" | "Release";

// ─── Tactical Level Types ─────────────────────────────────────────────────────

export type TaskStatus = "New" | "In Progress" | "Waiting for Review" | "Review" | "Done";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: "FPGA" | "Software" | "Hardware" | "Mixed";
  activeTasks: number;
}

export interface TaskCard {
  id: string;
  title: string;
  phase: Phase;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  plannedHours?: number;  // mandatory for Engineer Start button; denominator for progress
  description?: string;  // rich description set in Task Creation form
}

export interface TimesheetEntry {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  taskId: string;
  taskTitle: string;
  description: string;
  loggedHours: number;
  progressPercent: number;
  approved: boolean;
}

export interface PhaseDefinition {
  phase: Phase;
  startDate: string;
  endDate: string;
  weight: number; // % of total project weight
}

export interface TacticalProjectData {
  projectId: string;
  phases: PhaseDefinition[];
  team: TeamMember[];
  tasks: TaskCard[];
  timesheets: TimesheetEntry[];
}

export interface OverdueTask {
  id: string;
  title: string;
  assignee: string;
  dueSince: string; // days overdue as string, e.g. "3 days"
  severity: "high" | "medium" | "low";
}

export interface HoursData {
  phase: Phase;
  planned: number;
  actual: number;
}

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
  category: "Software" | "Hardware" | "FPGA"; // Project category for closure requirements
  phases: PhaseProgress[];
  overallProgress: number;
  plannedProgress: number;
  department: "FPGA" | "Software" | "Hardware" | "Mixed";
  resourceEfficiency: number;
  startDate: string;
  endDate: string;
  closed: boolean;
  hoursData: HoursData[];
  overdueTasks: OverdueTask[];
  softwareMetrics?: {
    codeCoverage: number; // 0–100%
    bugDensity: number;   // bugs per KLOC
    finalVelocity: number; // story points per sprint
  };
}

export const PROJECTS: Project[] = [
  {
    id: "PRJ-001",
    name: "NavComm FPGA Core",
    pm: "Alice Morgan",
    category: "FPGA",
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
    hoursData: [
      { phase: "Survey", planned: 120, actual: 115 },
      { phase: "R&D", planned: 400, actual: 380 },
      { phase: "Test", planned: 240, actual: 190 },
      { phase: "Release", planned: 80, actual: 20 },
    ],
    overdueTasks: [
      { id: "T-012", title: "FPGA synthesis timing closure", assignee: "J. Hart", dueSince: "5 days", severity: "high" },
      { id: "T-019", title: "Signal integrity report", assignee: "M. Russo", dueSince: "2 days", severity: "medium" },
    ],
  },
  {
    id: "PRJ-002",
    name: "Sentinel Gateway v3",
    pm: "Bob Chen",
    category: "Software",
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
    hoursData: [
      { phase: "Survey", planned: 100, actual: 98 },
      { phase: "R&D", planned: 360, actual: 310 },
      { phase: "Test", planned: 200, actual: 95 },
      { phase: "Release", planned: 100, actual: 0 },
    ],
    overdueTasks: [
      { id: "T-031", title: "API gateway auth module review", assignee: "L. Tan", dueSince: "8 days", severity: "high" },
      { id: "T-038", title: "Load test environment setup", assignee: "S. Brooks", dueSince: "4 days", severity: "high" },
      { id: "T-041", title: "Documentation update", assignee: "B. Chen", dueSince: "1 day", severity: "low" },
    ],
    softwareMetrics: { codeCoverage: 54, bugDensity: 4.8, finalVelocity: 42 },
  },
  {
    id: "PRJ-003",
    name: "Sigma Hardware Backplane",
    pm: "Carol Davies",
    category: "Hardware",
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
    hoursData: [
      { phase: "Survey", planned: 160, actual: 158 },
      { phase: "R&D", planned: 500, actual: 390 },
      { phase: "Test", planned: 280, actual: 70 },
      { phase: "Release", planned: 120, actual: 0 },
    ],
    overdueTasks: [
      { id: "T-055", title: "PCB layout sign-off", assignee: "C. Davies", dueSince: "12 days", severity: "high" },
      { id: "T-062", title: "Thermal analysis review", assignee: "P. Newton", dueSince: "9 days", severity: "high" },
      { id: "T-067", title: "BOM finalisation", assignee: "A. Obi", dueSince: "6 days", severity: "medium" },
      { id: "T-071", title: "Supplier lead time confirmation", assignee: "C. Davies", dueSince: "3 days", severity: "medium" },
    ],
  },
  {
    id: "PRJ-004",
    name: "ProtoLink Middleware",
    pm: "Dan Osei",
    category: "Software",
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
    hoursData: [
      { phase: "Survey", planned: 80, actual: 78 },
      { phase: "R&D", planned: 320, actual: 325 },
      { phase: "Test", planned: 260, actual: 240 },
      { phase: "Release", planned: 140, actual: 85 },
    ],
    overdueTasks: [
      { id: "T-088", title: "Release candidate smoke test", assignee: "D. Osei", dueSince: "1 day", severity: "low" },
    ],
    softwareMetrics: { codeCoverage: 61, bugDensity: 3.5, finalVelocity: 48 },
  },
  {
    id: "PRJ-005",
    name: "TerraEdge IoT Platform",
    pm: "Eve Nkosi",
    category: "Software",
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
    hoursData: [
      { phase: "Survey", planned: 140, actual: 138 },
      { phase: "R&D", planned: 440, actual: 390 },
      { phase: "Test", planned: 300, actual: 175 },
      { phase: "Release", planned: 120, actual: 10 },
    ],
    overdueTasks: [
      { id: "T-101", title: "Device driver regression suite", assignee: "E. Müller", dueSince: "7 days", severity: "high" },
      { id: "T-108", title: "Cloud connector integration test", assignee: "R. Kaur", dueSince: "4 days", severity: "medium" },
    ],
  },
  {
    id: "PRJ-006",
    name: "Xenon Signal Processor",
    pm: "Fatima Hassan",
    category: "FPGA",
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
    hoursData: [
      { phase: "Survey", planned: 100, actual: 97 },
      { phase: "R&D", planned: 380, actual: 362 },
      { phase: "Test", planned: 220, actual: 210 },
      { phase: "Release", planned: 100, actual: 98 },
    ],
    overdueTasks: [],
  },
  {
    id: "PRJ-007",
    name: "Vortex Firmware Suite",
    pm: "George Ikoro",
    category: "Software",
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
    hoursData: [
      { phase: "Survey", planned: 120, actual: 118 },
      { phase: "R&D", planned: 460, actual: 445 },
      { phase: "Test", planned: 260, actual: 252 },
      { phase: "Release", planned: 80, actual: 78 },
    ],
    overdueTasks: [],
    softwareMetrics: { codeCoverage: 78, bugDensity: 2.1, finalVelocity: 58 },
  },
  {
    id: "PRJ-008",
    name: "Vortex Firmware Suite",
    pm: "Helen Li",
    category: "Software",
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
    hoursData: [
      { phase: "Survey", planned: 90, actual: 88 },
      { phase: "R&D", planned: 420, actual: 340 },
      { phase: "Test", planned: 280, actual: 105 },
      { phase: "Release", planned: 110, actual: 0 },
    ],
    overdueTasks: [
      { id: "T-142", title: "Bootloader security patch", assignee: "H. Patel", dueSince: "14 days", severity: "high" },
      { id: "T-148", title: "Memory map validation", assignee: "O. Mensah", dueSince: "10 days", severity: "high" },
      { id: "T-153", title: "Code coverage report", assignee: "H. Patel", dueSince: "6 days", severity: "medium" },
      { id: "T-157", title: "Static analysis remediation", assignee: "V. Singh", dueSince: "4 days", severity: "medium" },
      { id: "T-162", title: "Regression baseline update", assignee: "O. Mensah", dueSince: "2 days", severity: "low" },
    ],
    softwareMetrics: { codeCoverage: 38, bugDensity: 6.1, finalVelocity: 35 },
  },
];

// ─── Quality & Technical Health Data ─────────────────────────────────────────

export interface QualityTrendPoint {
  week: string;
  bugDensity: number;      // bugs per KLOC
  testCoverage: number;    // 0–100 %
  technicalDebt: number;   // story points
}

export interface ProjectQuality {
  projectId: string;
  projectName: string;
  department: string;
  bugDensity: number;
  testCoverage: number;
  technicalDebt: number;   // story points
  openCriticalBugs: number;
}

export const QUALITY_TREND: QualityTrendPoint[] = [
  { week: "W48",  bugDensity: 3.8, testCoverage: 61, technicalDebt: 142 },
  { week: "W49",  bugDensity: 3.5, testCoverage: 63, technicalDebt: 138 },
  { week: "W50",  bugDensity: 3.9, testCoverage: 62, technicalDebt: 145 },
  { week: "W51",  bugDensity: 4.2, testCoverage: 60, technicalDebt: 151 },
  { week: "W52",  bugDensity: 3.6, testCoverage: 64, technicalDebt: 139 },
  { week: "W01",  bugDensity: 3.1, testCoverage: 67, technicalDebt: 128 },
  { week: "W02",  bugDensity: 2.8, testCoverage: 69, technicalDebt: 122 },
  { week: "W03",  bugDensity: 2.5, testCoverage: 71, technicalDebt: 115 },
  { week: "W04",  bugDensity: 2.9, testCoverage: 70, technicalDebt: 120 },
  { week: "W05",  bugDensity: 2.6, testCoverage: 73, technicalDebt: 112 },
];

export const PROJECT_QUALITY: ProjectQuality[] = [
  { projectId: "PRJ-001", projectName: "NavComm FPGA Core",      department: "FPGA",     bugDensity: 2.1, testCoverage: 78, technicalDebt: 35,  openCriticalBugs: 2 },
  { projectId: "PRJ-002", projectName: "Sentinel Gateway v3",    department: "Software", bugDensity: 4.8, testCoverage: 54, technicalDebt: 89,  openCriticalBugs: 6 },
  { projectId: "PRJ-003", projectName: "Sigma Hardware Backplane",department: "Hardware", bugDensity: 5.3, testCoverage: 41, technicalDebt: 112, openCriticalBugs: 8 },
  { projectId: "PRJ-004", projectName: "ProtoLink Middleware",    department: "Software", bugDensity: 1.8, testCoverage: 84, technicalDebt: 28,  openCriticalBugs: 1 },
  { projectId: "PRJ-005", projectName: "TerraEdge IoT Platform",  department: "Mixed",    bugDensity: 3.5, testCoverage: 61, technicalDebt: 67,  openCriticalBugs: 4 },
  { projectId: "PRJ-008", projectName: "Vortex Firmware Suite",   department: "Software", bugDensity: 6.1, testCoverage: 38, technicalDebt: 134, openCriticalBugs: 11 },
];

// ─── Team Velocity Data ───────────────────────────────────────────────────────

export interface VelocityPoint {
  sprint: string;
  fpga: number;
  software: number;
  hardware: number;
}

export const TEAM_VELOCITY: VelocityPoint[] = [
  { sprint: "S-18", fpga: 32, software: 44, hardware: 28 },
  { sprint: "S-19", fpga: 35, software: 40, hardware: 31 },
  { sprint: "S-20", fpga: 30, software: 48, hardware: 26 },
  { sprint: "S-21", fpga: 38, software: 42, hardware: 33 },
  { sprint: "S-22", fpga: 36, software: 50, hardware: 30 },
  { sprint: "S-23", fpga: 40, software: 46, hardware: 35 },
  { sprint: "S-24", fpga: 37, software: 52, hardware: 32 },
];

// ─── Risk Management Data ─────────────────────────────────────────────────────

export type RiskSeverity = "critical" | "high" | "medium";
export type RiskCategory = "security" | "hardware" | "schedule" | "resource";

export interface RiskItem {
  id: string;
  projectId: string;
  projectName: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  detectedDate: string;
  mitigationOwner: string;
  status: "open" | "mitigating" | "resolved";
}

export const RISK_REGISTER: RiskItem[] = [
  {
    id: "R-001",
    projectId: "PRJ-008",
    projectName: "Vortex Firmware Suite",
    category: "security",
    severity: "critical",
    title: "Bootloader Secure Boot Bypass Vulnerability",
    description: "CVE-equivalent: unsigned firmware can be loaded via JTAG without PIN protection. Affects all deployed units.",
    detectedDate: "2026-02-18",
    mitigationOwner: "H. Patel",
    status: "open",
  },
  {
    id: "R-002",
    projectId: "PRJ-003",
    projectName: "Sigma Hardware Backplane",
    category: "hardware",
    severity: "critical",
    title: "Critical Component Shortage: STM32H755 MCU",
    description: "Primary MCU on 16-week lead time. Current stock covers only 3 prototypes. Production will be blocked without alt sourcing.",
    detectedDate: "2026-02-25",
    mitigationOwner: "C. Davies",
    status: "mitigating",
  },
  {
    id: "R-003",
    projectId: "PRJ-002",
    projectName: "Sentinel Gateway v3",
    category: "schedule",
    severity: "high",
    title: "API Auth Module on Critical Path — 8 Days Overdue",
    description: "No completed auth module means test phase cannot start. 3 dependent tasks blocked. SPI degrading to 0.78.",
    detectedDate: "2026-02-28",
    mitigationOwner: "L. Tan",
    status: "open",
  },
  {
    id: "R-004",
    projectId: "PRJ-003",
    projectName: "Sigma Hardware Backplane",
    category: "schedule",
    severity: "high",
    title: "PCB Layout 12 Days Overdue — EMC Pre-Compliance Blocked",
    description: "PCB sign-off delay cascades into EMC test. Hardware team at 95% utilisation with no slack capacity.",
    detectedDate: "2026-02-20",
    mitigationOwner: "P. Newton",
    status: "open",
  },
  {
    id: "R-005",
    projectId: "PRJ-005",
    projectName: "TerraEdge IoT Platform",
    category: "resource",
    severity: "high",
    title: "FPGA Team Overallocation — 90% Load on Single Project",
    description: "NavComm absorbing 90% of FPGA team bandwidth. Any slip cascades directly to TerraEdge IoT milestones.",
    detectedDate: "2026-03-01",
    mitigationOwner: "E. Müller",
    status: "open",
  },
  {
    id: "R-006",
    projectId: "PRJ-001",
    projectName: "NavComm FPGA Core",
    category: "schedule",
    severity: "medium",
    title: "Timing Closure Delay Risk",
    description: "1 unresolved critical path violation in FPGA synthesis. If not resolved by end of sprint, Test phase entry delayed by ≥2 weeks.",
    detectedDate: "2026-03-03",
    mitigationOwner: "J. Hart",
    status: "mitigating",
  },
  {
    id: "R-007",
    projectId: "PRJ-008",
    projectName: "Vortex Firmware Suite",
    category: "security",
    severity: "high",
    title: "18 Open MISRA-C Violations in Safety-Critical Module",
    description: "Static analysis found 18 MISRA-C violations in the motor control module. Functional Safety review blocked.",
    detectedDate: "2026-03-02",
    mitigationOwner: "V. Singh",
    status: "mitigating",
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

// ─── Engineer Level 3 Types ───────────────────────────────────────────────────

export interface EngNotification {
  id: string;
  type: "overdue" | "rejected" | "assigned";
  title: string;
  body: string;
  timestamp: string; // ISO date string
  read: boolean;
}

export interface LogWorkEntry {
  id: string;
  taskId: string;
  taskTitle: string; // for timesheet table display
  date: string;
  loggedHours: number;
  description: string;
  progressPercent: number;
}

export interface EngineerProjectMembership {
  projectId: string;
  projectName: string;
  roleInProject: string;
  ragStatus: RAGStatus;
  overallProgress: number;
  plannedProgress: number;
  phase: Phase;          // current active phase
}

export interface EngineerProfile {
  memberId: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  projectId: string;       // primary project
  projectName: string;
  projects: EngineerProjectMembership[];  // all project memberships
  notifications: EngNotification[];
  logWorkHistory: LogWorkEntry[];
}

// Pre-seeded engineer profile: James Hart on PRJ-001
// ─── Default Phase Weights by Category ────────────────────────────────────────

export const DEFAULT_PHASE_WEIGHTS: Record<"Software" | "Hardware" | "FPGA", PhaseDefinition[]> = {
  Software: [
    { phase: "Survey", startDate: "", endDate: "", weight: 10 },
    { phase: "R&D", startDate: "", endDate: "", weight: 45 },
    { phase: "Test", startDate: "", endDate: "", weight: 30 },
    { phase: "Release", startDate: "", endDate: "", weight: 15 },
  ],
  Hardware: [
    { phase: "Survey", startDate: "", endDate: "", weight: 15 },
    { phase: "R&D", startDate: "", endDate: "", weight: 50 },
    { phase: "Test", startDate: "", endDate: "", weight: 25 },
    { phase: "Release", startDate: "", endDate: "", weight: 10 },
  ],
  FPGA: [
    { phase: "Survey", startDate: "", endDate: "", weight: 12 },
    { phase: "R&D", startDate: "", endDate: "", weight: 52 },
    { phase: "Test", startDate: "", endDate: "", weight: 28 },
    { phase: "Release", startDate: "", endDate: "", weight: 8 },
  ],
};

export const ENGINEER_PROFILE: EngineerProfile = {
  memberId: "M-01",
  name: "James Hart",
  initials: "JH",
  role: "FPGA Engineer",
  department: "FPGA",
  projectId: "PRJ-001",
  projectName: "NavComm FPGA Core",
  projects: [
    {
      projectId: "PRJ-001",
      projectName: "NavComm FPGA Core",
      roleInProject: "FPGA Engineer",
      ragStatus: "amber",
      overallProgress: 62,
      plannedProgress: 74,
      phase: "R&D",
    },
    {
      projectId: "PRJ-005",
      projectName: "TerraEdge IoT Platform",
      roleInProject: "FPGA Reviewer",
      ragStatus: "amber",
      overallProgress: 55,
      plannedProgress: 70,
      phase: "Test",
    },
  ],
  notifications: [
    {
      id: "N-001",
      type: "overdue",
      title: "Task Overdue",
      body: "FPGA synthesis timing closure is 5 days overdue.",
      timestamp: "2026-03-01T09:00:00Z",
      read: false,
    },
    {
      id: "N-002",
      type: "rejected",
      title: "Timesheet Rejected",
      body: "PM rejected TS-001: 'Please add more detail on the timing violations.'",
      timestamp: "2026-03-02T14:30:00Z",
      read: false,
    },
    {
      id: "N-003",
      type: "assigned",
      title: "New Task Assigned",
      body: "You have been assigned: 'Release package preparation' in PRJ-001.",
      timestamp: "2026-03-03T10:15:00Z",
      read: true,
    },
  ],
  logWorkHistory: [
    { id: "LW-001", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", date: "2026-03-01", loggedHours: 6, description: "Completed timing analysis pass 1, 3 violations remain", progressPercent: 45 },
    { id: "LW-002", taskId: "T-003", taskTitle: "FPGA synthesis timing closure", date: "2026-03-04", loggedHours: 8, description: "Resolved 2 of 3 critical path violations", progressPercent: 65 },
  ],
};

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

// ─── Tactical Data per Project ────────────────────────────────────────────────

export const TACTICAL_DATA: Record<string, TacticalProjectData> = {
  "PRJ-001": {
    projectId: "PRJ-001",
    phases: [
      { phase: "Survey",  startDate: "2025-01-10", endDate: "2025-03-15", weight: 15 },
      { phase: "R&D",     startDate: "2025-03-16", endDate: "2025-10-31", weight: 50 },
      { phase: "Test",    startDate: "2025-11-01", endDate: "2026-04-30", weight: 25 },
      { phase: "Release", startDate: "2026-05-01", endDate: "2026-06-30", weight: 10 },
    ],
    team: [
      { id: "M-01", name: "James Hart",    initials: "JH", role: "FPGA Engineer",    department: "FPGA",     activeTasks: 3 },
      { id: "M-02", name: "Maria Russo",   initials: "MR", role: "Signal Engineer",  department: "FPGA",     activeTasks: 2 },
      { id: "M-03", name: "Kwame Asante",  initials: "KA", role: "Verification Eng", department: "FPGA",     activeTasks: 1 },
      { id: "M-04", name: "Priya Nair",    initials: "PN", role: "Test Engineer",    department: "FPGA",     activeTasks: 2 },
    ],
    tasks: [
      { id: "T-001", title: "Requirements capture",          phase: "Survey",  status: "Done",        assigneeId: "M-01", assigneeName: "James Hart",   priority: "medium", dueDate: "2025-02-28", plannedHours: 40  },
      { id: "T-002", title: "Architecture design",           phase: "R&D",     status: "Done",        assigneeId: "M-01", assigneeName: "James Hart",   priority: "high",   dueDate: "2025-05-30", plannedHours: 120 },
      { id: "T-003", title: "FPGA synthesis timing closure", phase: "R&D",     status: "In Progress", assigneeId: "M-01", assigneeName: "James Hart",   priority: "high",   dueDate: "2025-12-01", plannedHours: 80  },
      { id: "T-004", title: "Signal integrity report",       phase: "R&D",     status: "Waiting for Review", assigneeId: "M-02", assigneeName: "Maria Russo",  priority: "medium", dueDate: "2025-11-15", plannedHours: 40  },
      { id: "T-005", title: "IP core integration",           phase: "R&D",     status: "In Progress", assigneeId: "M-03", assigneeName: "Kwame Asante", priority: "high",   dueDate: "2025-12-20", plannedHours: 60  },
      { id: "T-006", title: "Functional simulation",         phase: "Test",    status: "New",         assigneeId: "M-04", assigneeName: "Priya Nair",   priority: "medium", dueDate: "2026-02-01", plannedHours: 60  },
      { id: "T-007", title: "Hardware test bench setup",     phase: "Test",    status: "New",         assigneeId: "M-04", assigneeName: "Priya Nair",   priority: "medium", dueDate: "2026-02-28", plannedHours: 50  },
      { id: "T-008", title: "Release package preparation",   phase: "Release", status: "New",         assigneeId: "M-02", assigneeName: "Maria Russo",  priority: "low",    dueDate: "2026-06-01", plannedHours: 30  },
    ],
    timesheets: [
      { id: "TS-001", date: "2026-03-01", memberId: "M-01", memberName: "James Hart",   taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Completed timing analysis pass 1, 3 violations remain", loggedHours: 6, progressPercent: 45, approved: false },
      { id: "TS-002", date: "2026-03-02", memberId: "M-02", memberName: "Maria Russo",  taskId: "T-004", taskTitle: "Signal integrity report",       description: "Ran SI simulation on critical nets",                   loggedHours: 4, progressPercent: 70, approved: false },
      { id: "TS-003", date: "2026-03-03", memberId: "M-03", memberName: "Kwame Asante", taskId: "T-005", taskTitle: "IP core integration",           description: "Integrated DDR4 controller IP, awaiting review",       loggedHours: 7, progressPercent: 60, approved: true  },
      { id: "TS-004", date: "2026-03-04", memberId: "M-01", memberName: "James Hart",   taskId: "T-003", taskTitle: "FPGA synthesis timing closure", description: "Resolved 2 of 3 critical path violations",             loggedHours: 8, progressPercent: 65, approved: true  },
      { id: "TS-005", date: "2026-03-05", memberId: "M-04", memberName: "Priya Nair",   taskId: "T-006", taskTitle: "Functional simulation",         description: "Set up testbench framework, first smoke test passed",  loggedHours: 5, progressPercent: 15, approved: false },
    ],
  },
  "PRJ-002": {
    projectId: "PRJ-002",
    phases: [
      { phase: "Survey",  startDate: "2025-03-01", endDate: "2025-05-01", weight: 10 },
      { phase: "R&D",     startDate: "2025-05-02", endDate: "2025-11-30", weight: 45 },
      { phase: "Test",    startDate: "2025-12-01", endDate: "2026-03-01", weight: 30 },
      { phase: "Release", startDate: "2026-03-02", endDate: "2026-04-15", weight: 15 },
    ],
    team: [
      { id: "M-05", name: "Linda Tan",    initials: "LT", role: "Backend Engineer",  department: "Software", activeTasks: 4 },
      { id: "M-06", name: "Sam Brooks",   initials: "SB", role: "QA Engineer",       department: "Software", activeTasks: 3 },
      { id: "M-07", name: "Ben Carter",   initials: "BC", role: "DevOps Engineer",   department: "Software", activeTasks: 2 },
    ],
    tasks: [
      { id: "T-020", title: "API auth module review",    phase: "R&D",     status: "In Progress", assigneeId: "M-05", assigneeName: "Linda Tan",  priority: "high",   dueDate: "2025-12-15" },
      { id: "T-021", title: "Load test environment",     phase: "Test",    status: "In Progress", assigneeId: "M-06", assigneeName: "Sam Brooks", priority: "high",   dueDate: "2025-12-20" },
      { id: "T-022", title: "Documentation update",      phase: "R&D",     status: "Review",      assigneeId: "M-07", assigneeName: "Ben Carter", priority: "low",    dueDate: "2025-12-05" },
      { id: "T-023", title: "API rate limiting",         phase: "R&D",     status: "Done",        assigneeId: "M-05", assigneeName: "Linda Tan",  priority: "medium", dueDate: "2025-11-15" },
      { id: "T-024", title: "CI/CD pipeline setup",      phase: "R&D",     status: "Done",        assigneeId: "M-07", assigneeName: "Ben Carter", priority: "medium", dueDate: "2025-10-30" },
      { id: "T-025", title: "Security penetration test", phase: "Test",    status: "New",         assigneeId: "M-06", assigneeName: "Sam Brooks", priority: "high",   dueDate: "2026-01-15" },
      { id: "T-026", title: "Release deployment plan",   phase: "Release", status: "New",         assigneeId: "M-07", assigneeName: "Ben Carter", priority: "medium", dueDate: "2026-03-10" },
    ],
    timesheets: [
      { id: "TS-010", date: "2026-03-01", memberId: "M-05", memberName: "Linda Tan",  taskId: "T-020", taskTitle: "API auth module review",    description: "OAuth2 token refresh flow reviewed and documented",          loggedHours: 6, progressPercent: 55, approved: false },
      { id: "TS-011", date: "2026-03-02", memberId: "M-06", memberName: "Sam Brooks", taskId: "T-021", taskTitle: "Load test environment",     description: "K6 scripts written for 500 concurrent user simulation",      loggedHours: 5, progressPercent: 30, approved: false },
      { id: "TS-012", date: "2026-03-03", memberId: "M-07", memberName: "Ben Carter", taskId: "T-022", taskTitle: "Documentation update",      description: "Updated Swagger spec for 14 new endpoints",                  loggedHours: 3, progressPercent: 80, approved: true  },
      { id: "TS-013", date: "2026-03-04", memberId: "M-05", memberName: "Linda Tan",  taskId: "T-020", taskTitle: "API auth module review",    description: "Fixed token expiry edge case, added unit tests",             loggedHours: 7, progressPercent: 75, approved: true  },
    ],
  },
  "PRJ-003": {
    projectId: "PRJ-003",
    phases: [
      { phase: "Survey",  startDate: "2024-11-01", endDate: "2025-01-31", weight: 15 },
      { phase: "R&D",     startDate: "2025-02-01", endDate: "2025-10-31", weight: 40 },
      { phase: "Test",    startDate: "2025-11-01", endDate: "2026-01-31", weight: 30 },
      { phase: "Release", startDate: "2026-02-01", endDate: "2026-03-01", weight: 15 },
    ],
    team: [
      { id: "M-08", name: "Carol Davies",  initials: "CD", role: "Hardware Lead",   department: "Hardware", activeTasks: 3 },
      { id: "M-09", name: "Paul Newton",   initials: "PN", role: "PCB Designer",    department: "Hardware", activeTasks: 2 },
      { id: "M-10", name: "Aisha Obi",     initials: "AO", role: "Systems Analyst", department: "Hardware", activeTasks: 2 },
    ],
    tasks: [
      { id: "T-050", title: "PCB layout sign-off",            phase: "R&D",     status: "In Progress", assigneeId: "M-09", assigneeName: "Paul Newton",  priority: "high",   dueDate: "2025-11-01" },
      { id: "T-051", title: "Thermal analysis review",        phase: "Test",    status: "In Progress", assigneeId: "M-08", assigneeName: "Carol Davies", priority: "high",   dueDate: "2025-12-01" },
      { id: "T-052", title: "BOM finalisation",               phase: "R&D",     status: "Review",      assigneeId: "M-10", assigneeName: "Aisha Obi",    priority: "medium", dueDate: "2025-11-20" },
      { id: "T-053", title: "Supplier lead time check",       phase: "R&D",     status: "New",         assigneeId: "M-08", assigneeName: "Carol Davies", priority: "medium", dueDate: "2025-12-10" },
      { id: "T-054", title: "EMC pre-compliance test",        phase: "Test",    status: "New",         assigneeId: "M-09", assigneeName: "Paul Newton",  priority: "high",   dueDate: "2026-01-15" },
      { id: "T-055", title: "Backplane power validation",     phase: "Test",    status: "New",         assigneeId: "M-10", assigneeName: "Aisha Obi",    priority: "medium", dueDate: "2026-01-20" },
    ],
    timesheets: [
      { id: "TS-020", date: "2026-03-01", memberId: "M-09", memberName: "Paul Newton",  taskId: "T-050", taskTitle: "PCB layout sign-off",      description: "Layer stack finalised, sent for DRC",                          loggedHours: 8, progressPercent: 60, approved: false },
      { id: "TS-021", date: "2026-03-02", memberId: "M-08", memberName: "Carol Davies", taskId: "T-051", taskTitle: "Thermal analysis review",   description: "Simulated hot spot at J7 connector, mitigation proposed",       loggedHours: 6, progressPercent: 35, approved: false },
      { id: "TS-022", date: "2026-03-03", memberId: "M-10", memberName: "Aisha Obi",    taskId: "T-052", taskTitle: "BOM finalisation",          description: "Verified alternates for 4 obsolete components",                loggedHours: 4, progressPercent: 75, approved: true  },
    ],
  },
  "PRJ-004": {
    projectId: "PRJ-004",
    phases: [
      { phase: "Survey",  startDate: "2025-02-14", endDate: "2025-04-14", weight: 10 },
      { phase: "R&D",     startDate: "2025-04-15", endDate: "2025-10-31", weight: 40 },
      { phase: "Test",    startDate: "2025-11-01", endDate: "2026-05-31", weight: 35 },
      { phase: "Release", startDate: "2026-06-01", endDate: "2026-07-31", weight: 15 },
    ],
    team: [
      { id: "M-11", name: "Dan Osei",     initials: "DO", role: "Software Architect", department: "Software", activeTasks: 2 },
      { id: "M-12", name: "Fatima Diallo", initials: "FD", role: "Backend Developer", department: "Software", activeTasks: 3 },
      { id: "M-13", name: "Chris Webb",   initials: "CW", role: "QA Engineer",       department: "Software", activeTasks: 1 },
    ],
    tasks: [
      { id: "T-080", title: "Middleware core API",        phase: "R&D",     status: "Done",        assigneeId: "M-11", assigneeName: "Dan Osei",      priority: "high",   dueDate: "2025-09-30" },
      { id: "T-081", title: "Plugin architecture design", phase: "R&D",     status: "Done",        assigneeId: "M-12", assigneeName: "Fatima Diallo", priority: "medium", dueDate: "2025-10-31" },
      { id: "T-082", title: "Integration test suite",     phase: "Test",    status: "In Progress", assigneeId: "M-13", assigneeName: "Chris Webb",    priority: "high",   dueDate: "2026-04-30" },
      { id: "T-083", title: "Performance benchmarking",   phase: "Test",    status: "Review",      assigneeId: "M-12", assigneeName: "Fatima Diallo", priority: "medium", dueDate: "2026-04-15" },
      { id: "T-084", title: "Release notes preparation",  phase: "Release", status: "New",         assigneeId: "M-11", assigneeName: "Dan Osei",      priority: "low",    dueDate: "2026-06-15" },
    ],
    timesheets: [
      { id: "TS-030", date: "2026-03-01", memberId: "M-13", memberName: "Chris Webb",    taskId: "T-082", taskTitle: "Integration test suite",    description: "Completed 47/80 integration test cases, 5 failures",           loggedHours: 7, progressPercent: 58, approved: false },
      { id: "TS-031", date: "2026-03-02", memberId: "M-12", memberName: "Fatima Diallo", taskId: "T-083", taskTitle: "Performance benchmarking",  description: "P95 latency 12ms, within SLA. Memory usage nominal.",          loggedHours: 5, progressPercent: 85, approved: true  },
      { id: "TS-032", date: "2026-03-03", memberId: "M-11", memberName: "Dan Osei",      taskId: "T-082", taskTitle: "Integration test suite",    description: "Fixed test harness config, re-ran failing batch",               loggedHours: 4, progressPercent: 62, approved: true  },
    ],
  },
  "PRJ-005": {
    projectId: "PRJ-005",
    phases: [
      { phase: "Survey",  startDate: "2025-04-01", endDate: "2025-06-30", weight: 12 },
      { phase: "R&D",     startDate: "2025-07-01", endDate: "2026-01-31", weight: 48 },
      { phase: "Test",    startDate: "2026-02-01", endDate: "2026-07-31", weight: 28 },
      { phase: "Release", startDate: "2026-08-01", endDate: "2026-09-30", weight: 12 },
    ],
    team: [
      { id: "M-14", name: "Eva Müller",  initials: "EM", role: "IoT Architect",   department: "Mixed",    activeTasks: 3 },
      { id: "M-15", name: "Ravi Kaur",   initials: "RK", role: "Embedded Eng",   department: "Hardware", activeTasks: 2 },
      { id: "M-16", name: "Yuki Tanaka", initials: "YT", role: "Cloud Engineer",  department: "Software", activeTasks: 2 },
    ],
    tasks: [
      { id: "T-100", title: "Device driver regression suite", phase: "Test",    status: "In Progress", assigneeId: "M-14", assigneeName: "Eva Müller", priority: "high",   dueDate: "2026-03-15" },
      { id: "T-101", title: "Cloud connector integration",    phase: "Test",    status: "In Progress", assigneeId: "M-16", assigneeName: "Yuki Tanaka", priority: "medium", dueDate: "2026-03-20" },
      { id: "T-102", title: "OTA update mechanism",           phase: "R&D",     status: "Review",      assigneeId: "M-15", assigneeName: "Ravi Kaur",   priority: "high",   dueDate: "2026-02-28" },
      { id: "T-103", title: "Firmware build pipeline",        phase: "R&D",     status: "Done",        assigneeId: "M-14", assigneeName: "Eva Müller",  priority: "medium", dueDate: "2026-01-31" },
      { id: "T-104", title: "Platform release packaging",     phase: "Release", status: "New",         assigneeId: "M-16", assigneeName: "Yuki Tanaka", priority: "low",    dueDate: "2026-08-15" },
    ],
    timesheets: [
      { id: "TS-040", date: "2026-03-01", memberId: "M-14", memberName: "Eva Müller",  taskId: "T-100", taskTitle: "Device driver regression suite", description: "UART & SPI driver tests complete, I2C 40% done",               loggedHours: 7, progressPercent: 40, approved: false },
      { id: "TS-041", date: "2026-03-02", memberId: "M-16", memberName: "Yuki Tanaka", taskId: "T-101", taskTitle: "Cloud connector integration",    description: "AWS IoT Core connected, MQTT topics mapped",                  loggedHours: 6, progressPercent: 55, approved: false },
      { id: "TS-042", date: "2026-03-03", memberId: "M-15", memberName: "Ravi Kaur",   taskId: "T-102", taskTitle: "OTA update mechanism",           description: "Secure boot chain verified, delta update tested on dev board", loggedHours: 8, progressPercent: 80, approved: true  },
    ],
  },
  "PRJ-008": {
    projectId: "PRJ-008",
    phases: [
      { phase: "Survey",  startDate: "2024-10-01", endDate: "2024-12-31", weight: 10 },
      { phase: "R&D",     startDate: "2025-01-01", endDate: "2025-09-30", weight: 45 },
      { phase: "Test",    startDate: "2025-10-01", endDate: "2026-01-31", weight: 35 },
      { phase: "Release", startDate: "2026-02-01", endDate: "2026-02-28", weight: 10 },
    ],
    team: [
      { id: "M-17", name: "Harry Patel",  initials: "HP", role: "Firmware Lead",    department: "Software", activeTasks: 4 },
      { id: "M-18", name: "Obafemi Mensah", initials: "OM", role: "Systems Eng",   department: "Software", activeTasks: 3 },
      { id: "M-19", name: "Vera Singh",   initials: "VS", role: "Security Analyst", department: "Software", activeTasks: 2 },
    ],
    tasks: [
      { id: "T-140", title: "Bootloader security patch",     phase: "Test",    status: "In Progress", assigneeId: "M-17", assigneeName: "Harry Patel",    priority: "high",   dueDate: "2026-01-15" },
      { id: "T-141", title: "Memory map validation",         phase: "Test",    status: "In Progress", assigneeId: "M-18", assigneeName: "Obafemi Mensah",  priority: "high",   dueDate: "2026-01-20" },
      { id: "T-142", title: "Code coverage report",          phase: "Test",    status: "Review",      assigneeId: "M-17", assigneeName: "Harry Patel",    priority: "medium", dueDate: "2026-01-25" },
      { id: "T-143", title: "Static analysis remediation",   phase: "Test",    status: "New",         assigneeId: "M-19", assigneeName: "Vera Singh",     priority: "medium", dueDate: "2026-02-05" },
      { id: "T-144", title: "Regression baseline update",    phase: "Test",    status: "New",         assigneeId: "M-18", assigneeName: "Obafemi Mensah",  priority: "low",    dueDate: "2026-02-10" },
      { id: "T-145", title: "Release package sign-off",      phase: "Release", status: "New",         assigneeId: "M-17", assigneeName: "Harry Patel",    priority: "high",   dueDate: "2026-02-20" },
    ],
    timesheets: [
      { id: "TS-050", date: "2026-03-01", memberId: "M-17", memberName: "Harry Patel",    taskId: "T-140", taskTitle: "Bootloader security patch",   description: "Applied secure key provisioning, flash write protection enabled", loggedHours: 8, progressPercent: 50, approved: false },
      { id: "TS-051", date: "2026-03-02", memberId: "M-18", memberName: "Obafemi Mensah", taskId: "T-141", taskTitle: "Memory map validation",       description: "Verified linker script regions, found 1 overlap in SRAM2",        loggedHours: 6, progressPercent: 35, approved: false },
      { id: "TS-052", date: "2026-03-03", memberId: "M-19", memberName: "Vera Singh",     taskId: "T-143", taskTitle: "Static analysis remediation", description: "Resolved 12 of 18 MISRA-C violations",                            loggedHours: 7, progressPercent: 40, approved: false },
      { id: "TS-053", date: "2026-03-04", memberId: "M-17", memberName: "Harry Patel",    taskId: "T-142", taskTitle: "Code coverage report",        description: "Line coverage at 71%, branch coverage 58%",                      loggedHours: 5, progressPercent: 70, approved: true  },
    ],
  },
};
