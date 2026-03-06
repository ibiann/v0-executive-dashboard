"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PhaseDefinition,
  TaskCard,
  TaskStatus,
  TimesheetEntry,
  TacticalProjectData,
  Project,
  TeamMember,
  Phase,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GripVertical,
  MessageSquare,
  Pencil,
  User,
  Users,
  AlertTriangle,
  CheckCheck,
  Lock,
  ArrowRight,
  Bell,
  XCircle,
  ThumbsDown,
  Plus,
  FileText,
  Link2,
  ListTree,
  ClipboardList,
} from "lucide-react";
import type { ViewRole } from "@/components/dashboard/top-nav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200",   label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "Med"  },
  low:    { bg: "bg-blue-50",  text: "text-blue-500",  border: "border-blue-200",  label: "Low"  },
};

const ALL_STATUS_COLUMNS: TaskStatus[] = ["New", "In Progress", "Waiting for Review", "Done"];
const ENGINEER_STATUS_COLUMNS: TaskStatus[] = ["New", "In Progress", "Waiting for Review"];

const STATUS_COLORS: Record<TaskStatus, string> = {
  "New":                "bg-slate-100 text-slate-600",
  "In Progress":        "bg-blue-100  text-blue-700",
  "Waiting for Review": "bg-amber-100 text-amber-700",
  "Review":             "bg-amber-100 text-amber-700",
  "Done":               "bg-green-100 text-green-700",
};

const PHASE_COLORS: Record<string, string> = {
  Survey:  "bg-violet-100 text-violet-700",
  "R&D":   "bg-blue-100   text-blue-700",
  Test:    "bg-amber-100  text-amber-700",
  Release: "bg-green-100  text-green-700",
};

const PHASE_ORDER = ["Survey", "R&D", "Test", "Release"];
const PHASES: Phase[] = ["Survey", "R&D", "Test", "Release"];

function memberInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function isReviewerRole(role: ViewRole): boolean {
  return role === "PM" || role === "CTO";
}

// ─── Task Creation Modal (Odoo-style form) ────────────────────────────────────

interface TaskCreateModalProps {
  project: Project;
  team: TeamMember[];
  onClose: () => void;
  onSave: (task: TaskCard) => void;
}

type FormTab = "description" | "timesheets" | "subtasks";

function TaskCreateModal({ project, team, onClose, onSave }: TaskCreateModalProps) {
  const [title, setTitle]               = useState("");
  const [phase, setPhase]               = useState<Phase>("Survey");
  const [assigneeId, setAssigneeId]     = useState(team[0]?.id ?? "");
  const [plannedHours, setPlannedHours] = useState<string>("");
  const [dueDate, setDueDate]           = useState("");
  const [priority, setPriority]         = useState<"high" | "medium" | "low">("medium");
  const [description, setDescription]  = useState("");
  const [formTab, setFormTab]           = useState<FormTab>("description");
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const assignee = team.find((m) => m.id === assigneeId);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim())      e.title       = "Task title is required.";
    if (!assigneeId)        e.assigneeId  = "Please select an assignee.";
    if (!plannedHours || isNaN(Number(plannedHours)) || Number(plannedHours) <= 0)
                            e.plannedHours = "Thời gian dự kiến (planned hours) is required and must be > 0.";
    if (!dueDate)           e.dueDate     = "Deadline is required.";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const newTask: TaskCard = {
      id:           `T-${Date.now().toString().slice(-5)}`,
      title:        title.trim(),
      phase,
      status:       "New",
      assigneeId,
      assigneeName: assignee?.name ?? "",
      priority,
      dueDate,
      plannedHours: Number(plannedHours),
      description:  description.trim() || undefined,
    };
    onSave(newTask);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">

        {/* ── Dark header with breadcrumbs (Odoo-style) ── */}
        <div className="bg-sidebar px-5 py-3.5 shrink-0">
          <nav className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60 mb-1.5">
            <span>Du an</span>
            <ChevronRight className="w-3 h-3" />
            <span>{project.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Nhiem vu</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-sidebar-foreground font-semibold">Tao moi</span>
          </nav>
          <h2 className="text-sm font-bold text-white">
            {title.trim() || "Nhiem vu moi"}
          </h2>

          {/* Smart Buttons row */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFormTab("timesheets")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors",
                formTab === "timesheets"
                  ? "bg-white/20 border-white/30 text-white"
                  : "border-white/20 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Timesheets
              <span className="ml-1 bg-white/20 text-white rounded px-1 text-[10px] font-bold">0h</span>
            </button>
            <button
              onClick={() => setFormTab("subtasks")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors",
                formTab === "subtasks"
                  ? "bg-white/20 border-white/30 text-white"
                  : "border-white/20 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <ListTree className="w-3.5 h-3.5" />
              Sub-tasks
              <span className="ml-1 bg-white/20 text-white rounded px-1 text-[10px] font-bold">0</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-white/20 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white transition-colors">
              <Link2 className="w-3.5 h-3.5" />
              Parent Task
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Ten nhiem vu <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
              placeholder="Nhap ten nhiem vu ky thuat..."
              className={cn(
                "w-full text-sm border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                errors.title ? "border-red-400" : "border-border"
              )}
            />
            {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Grid: Phase | Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Pha <span className="text-red-500">*</span>
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as Phase)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Muc do uu tien</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Grid: Assignee | Planned Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nguoi phu trach <span className="text-red-500">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); setErrors((p) => ({ ...p, assigneeId: "" })); }}
                className={cn(
                  "w-full text-sm border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.assigneeId ? "border-red-400" : "border-border"
                )}
              >
                <option value="">-- Chon ky su --</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
              {errors.assigneeId && <p className="text-[11px] text-red-600 mt-1">{errors.assigneeId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Thoi gian du kien (gio) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={plannedHours}
                onChange={(e) => { setPlannedHours(e.target.value); setErrors((p) => ({ ...p, plannedHours: "" })); }}
                placeholder="e.g. 40"
                className={cn(
                  "w-full text-sm border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.plannedHours ? "border-red-400" : "border-border"
                )}
              />
              {errors.plannedHours && <p className="text-[11px] text-red-600 mt-1">{errors.plannedHours}</p>}
              {!errors.plannedHours && (
                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Required — engineer cannot start task without this value.
                </p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Han chot <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: "" })); }}
              className={cn(
                "w-full text-sm border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                errors.dueDate ? "border-red-400" : "border-border"
              )}
            />
            {errors.dueDate && <p className="text-[11px] text-red-600 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Form sub-tabs: Description | Timesheets | Sub-tasks */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex border-b border-border bg-muted/40">
              {([
                { id: "description", icon: <FileText className="w-3.5 h-3.5" />, label: "Mo ta nhiem vu" },
                { id: "timesheets",  icon: <Clock className="w-3.5 h-3.5" />,    label: "Timesheets" },
                { id: "subtasks",    icon: <ListTree className="w-3.5 h-3.5" />,  label: "Sub-tasks" },
              ] as { id: FormTab; icon: React.ReactNode; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFormTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors",
                    formTab === tab.id
                      ? "bg-card text-foreground border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {formTab === "description" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">
                    Mo ta chi tiet nhiem vu, muc tieu, tieu chi hoan thanh...
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Nhap mo ta ky thuat..."
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              {formTab === "timesheets" && (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">Chua co ban ghi thoi gian</p>
                  <p className="text-xs text-muted-foreground/60">Timesheet entries will appear here once work is logged by the assigned engineer.</p>
                </div>
              )}
              {formTab === "subtasks" && (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <ListTree className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">Chua co nhiem vu con</p>
                  <p className="text-xs text-muted-foreground/60">Sub-tasks can be added after the task is created.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview card */}
          {title.trim() && assignee && plannedHours && (
            <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Xem truoc the nhiem vu</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", PHASE_COLORS[phase])}>{phase}</span>
                <span className="text-xs font-semibold text-foreground truncate">{title}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{assignee.name}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plannedHours}h planned</span>
                {dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dueDate}</span>}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-border shrink-0 bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Huy
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
              Luu & Tao moi
            </Button>
            <Button size="sm" onClick={handleSave} className="text-xs gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Luu nhiem vu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Smart Buttons ────────────────────────────────────────────────────────────

function SmartButtons({
  project,
  tactical,
  onTabChange,
}: {
  project: Project;
  tactical: TacticalProjectData;
  onTabChange: (tab: Tab) => void;
}) {
  const totalHours       = tactical.timesheets.reduce((s, t) => s + t.loggedHours, 0);
  const pendingTimesheets = tactical.timesheets.filter((t) => !t.approved).length;
  const reviewTasks      = tactical.tasks.filter((t) => t.status === "Waiting for Review").length;

  const buttons = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Total Hours",
      value: `${totalHours}h`,
      tab: "timesheets" as Tab,
      badge: pendingTimesheets > 0 ? pendingTimesheets : null,
      badgeColor: "bg-destructive",
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Phase Plan",
      value: `${tactical.phases.length} phases`,
      tab: "phases" as Tab,
      badge: null,
      badgeColor: "",
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Team",
      value: `${tactical.team.length} members`,
      tab: "resources" as Tab,
      badge: null,
      badgeColor: "",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Awaiting Review",
      value: `${reviewTasks} task${reviewTasks !== 1 ? "s" : ""}`,
      tab: "kanban" as Tab,
      badge: reviewTasks > 0 ? reviewTasks : null,
      badgeColor: "bg-amber-500",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={() => onTabChange(btn.tab)}
          className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors group"
        >
          <span className="text-primary group-hover:scale-110 transition-transform">{btn.icon}</span>
          <span className="font-medium text-muted-foreground">{btn.label}</span>
          <span className="font-bold text-foreground">{btn.value}</span>
          {btn.badge !== null && (
            <span className={cn("absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] font-bold", btn.badgeColor)}>
              {btn.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Phase Completion Banner ──────────────────────────────────────────────────

function PhaseCompletionBanner({
  completedPhase,
  nextPhase,
  onStartNextPhase,
  onDismiss,
}: {
  completedPhase: string;
  nextPhase: string | null;
  onStartNextPhase: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 shrink-0">
        <Bell className="w-4 h-4 text-green-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-800">
          Phase &ldquo;{completedPhase}&rdquo; Complete
        </p>
        <p className="text-xs text-green-700 mt-0.5">
          All tasks in this phase have been approved and marked Done.
          {nextPhase ? ` Ready to start Phase "${nextPhase}"?` : " This was the final phase."}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {nextPhase && (
          <Button
            size="sm"
            onClick={onStartNextPhase}
            className="h-7 px-3 text-xs gap-1.5 bg-green-700 hover:bg-green-800 text-white"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Start {nextPhase}
          </Button>
        )}
        <button
          onClick={onDismiss}
          className="p-1 rounded text-green-600 hover:text-green-900 hover:bg-green-100 transition-colors"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Phase Plan Tab ───────────────────────────────────────────────────────────

function PhasePlanTab({
  tactical,
  onPhaseSave,
  onTaskClick,
}: {
  tactical: TacticalProjectData;
  onPhaseSave: (phases: PhaseDefinition[]) => void;
  onTaskClick?: (task: TaskCard) => void;
}) {
  const [phases, setPhases]        = useState<PhaseDefinition[]>(tactical.phases);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<Phase | null>(null);
  const [showGantt, setShowGantt]   = useState(false);
  const [lockedPhases, setLockedPhases] = useState<Set<Phase>>(new Set());
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseStart, setNewPhaseStart] = useState("");
  const [newPhaseEnd, setNewPhaseEnd] = useState("");
  const [newPhaseWeight, setNewPhaseWeight] = useState("15");

  function handleChange(idx: number, field: keyof PhaseDefinition, value: string | number) {
    setPhases((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }

  const totalWeight = phases.reduce((s, p) => s + p.weight, 0);
  const phaseTaskCounts: Record<Phase, number> = {
    Survey: tactical.tasks.filter((t) => t.phase === "Survey").length,
    "R&D": tactical.tasks.filter((t) => t.phase === "R&D").length,
    Test: tactical.tasks.filter((t) => t.phase === "Test").length,
    Release: tactical.tasks.filter((t) => t.phase === "Release").length,
  };

  // Calculate phase progress (average of task progress percentages)
  const phaseProgress: Record<Phase, number> = {
    Survey: 0,
    "R&D": 0,
    Test: 0,
    Release: 0,
  };
  Object.keys(phaseProgress).forEach((phase) => {
    const phaseTasks = tactical.tasks.filter((t) => t.phase === phase);
    if (phaseTasks.length > 0) {
      // This would come from timesheets in production; for now use task status heuristic
      const avgProgress = phaseTasks.reduce((sum, task) => {
        return sum + (task.status === "Done" ? 100 : task.status === "Waiting for Review" ? 80 : 40);
      }, 0) / phaseTasks.length;
      phaseProgress[phase as Phase] = Math.round(avgProgress);
    }
  });

  // Overall progress = weighted average of phase progress
  const overallProgress = Math.round(
    phases.reduce((sum, phase) => {
      return sum + (phaseProgress[phase.phase] * phase.weight) / 100;
    }, 0)
  );

  function lockPhase(phase: Phase) {
    setLockedPhases((prev) => new Set([...prev, phase]));
  }

  function handleAddPhase() {
    if (!newPhaseName.trim() || !newPhaseStart || !newPhaseEnd || !newPhaseWeight) return;
    const newWeight = parseInt(newPhaseWeight) || 0;
    if (totalWeight + newWeight > 100) return; // Validation: don't exceed 100%
    
    const newPhase: PhaseDefinition = {
      phase: newPhaseName.trim() as Phase,
      startDate: newPhaseStart,
      endDate: newPhaseEnd,
      weight: newWeight,
    };
    setPhases((prev) => [...prev, newPhase]);
    onPhaseSave([...phases, newPhase]);
    setShowAddPhaseModal(false);
    setNewPhaseName("");
    setNewPhaseStart("");
    setNewPhaseEnd("");
    setNewPhaseWeight("15");
  }

  return (
    <section className="space-y-4">
      {/* Header with validation and controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">
            Define phase start/end dates and their weight in total project progress.
          </p>
          {/* Overall progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">Overall: {overallProgress}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Gantt toggle */}
          <button
            onClick={() => setShowGantt(!showGantt)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
              showGantt
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
            title="Toggle Gantt timeline view"
          >
            <Calendar className="w-3.5 h-3.5" />
            Gantt
          </button>

          {/* Validation badge */}
          <span className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-full",
            totalWeight === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          )}>
            Total: {totalWeight}%
          </span>

          {/* Add Phase button */}
          <button
            onClick={() => setShowAddPhaseModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
            title="Add a new phase"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Phase
          </button>
        </div>
      </div>

      {/* Validation warning if weights don't sum to 100 */}
      {totalWeight !== 100 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Phase weights must sum to 100%</p>
            <p className="text-xs text-red-600 mt-0.5">Current total: {totalWeight}%. Please adjust phase weights.</p>
          </div>
        </div>
      )}

      {/* List or Gantt view */}
      {showGantt ? (
        // ─── Gantt Timeline View ───
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground mb-3">Project Timeline with Dependencies</p>
          <div className="space-y-4">
            {phases.map((phase, idx) => {
              const startDate = new Date(phase.startDate);
              const endDate = new Date(phase.endDate);
              const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div key={phase.phase} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-semibold text-foreground">{phase.phase}</div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                      <div
                        className={cn(
                          "h-full flex items-center px-2 text-[10px] font-semibold text-white",
                          PHASE_COLORS[phase.phase]
                        )}
                        style={{ width: `${Math.min((duration / 180) * 100, 100)}%` }}
                      >
                        {duration}d
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-24 text-right">{phase.startDate} → {phase.endDate}</span>
                  {idx < phases.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ─── List View (List) ───
        <div className="space-y-2">
          {phases.map((phase, idx) => {
            const isEditing = editingIdx === idx;
            const isExpanded = expandedPhase === phase.phase;
            const taskCount = phaseTaskCounts[phase.phase];
            const phaseTasks = tactical.tasks.filter((t) => t.phase === phase.phase);
            const allTasksComplete = phaseTasks.length > 0 && phaseTasks.every((t) => t.status === "Done");

            return (
              <div key={phase.phase} className="space-y-2">
                {/* Phase row */}
                <div className="bg-card border border-border rounded-lg px-4 py-3 grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 items-center">
                  {/* Expandable phase name */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                  </button>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full shrink-0", PHASE_COLORS[phase.phase])}>
                      {phase.phase}
                    </span>
                    <span className="text-xs text-muted-foreground">{taskCount} Tasks</span>
                  </div>

                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        value={phase.startDate}
                        onChange={(e) => handleChange(idx, "startDate", e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <input
                        type="date"
                        value={phase.endDate}
                        onChange={(e) => handleChange(idx, "endDate", e.target.value)}
                        className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={phase.weight}
                        onChange={(e) => handleChange(idx, "weight", parseInt(e.target.value) || 0)}
                        className="w-16 text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">{phase.startDate}</span>
                      <span className="text-xs text-muted-foreground">{phase.endDate}</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${phase.weight}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground shrink-0">{phase.weight}%</span>
                      </div>
                    </>
                  )}

                  {/* Edit/Save button */}
                  <button
                    onClick={() => {
                      if (isEditing) { onPhaseSave(phases); setEditingIdx(null); }
                      else { setEditingIdx(idx); }
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {isEditing
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      : <Pencil className="w-3.5 h-3.5" />
                    }
                  </button>

                  {/* Phase status lock button — enabled only if all tasks are Done */}
                  <button
                    onClick={() => allTasksComplete && lockPhase(phase.phase)}
                    disabled={!allTasksComplete}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      allTasksComplete
                        ? "text-green-600 hover:bg-green-50 cursor-pointer"
                        : "text-muted-foreground/40 cursor-not-allowed"
                    )}
                    title={allTasksComplete ? "Lock this phase (all tasks Done)" : "Complete all tasks to lock phase"}
                  >
                    {lockedPhases.has(phase.phase) ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expanded task table for this phase */}
                {isExpanded && (
                  <div className="bg-muted/30 border border-border rounded-lg overflow-hidden ml-8">
                    {phaseTasks.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/50">
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Task Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Assignee</th>
                            <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Status</th>
                            <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Logged Hours</th>
                            <th className="px-3 py-2 text-center font-semibold text-muted-foreground">Progress %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phaseTasks.map((task) => {
                            const taskLogs = tactical.timesheets.filter((t) => t.taskId === task.id);
                            const loggedHours = taskLogs.reduce((sum, t) => sum + t.loggedHours, 0);
                            const progressPct = taskLogs.length > 0 ? Math.round(taskLogs[0].progressPercent) : 0;
                            return (
                              <tr
                                key={task.id}
                                onClick={() => onTaskClick?.(task)}
                                className="border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors"
                              >
                                <td className="px-3 py-2 truncate font-medium text-foreground">{task.title}</td>
                                <td className="px-3 py-2 text-foreground">{task.assigneeName}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded inline-block",
                                    STATUS_COLORS[task.status]
                                  )}>
                                    {task.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="font-semibold">{loggedHours.toFixed(1)}h</span>
                                  {task.plannedHours && (
                                    <span className="text-muted-foreground"> / {task.plannedHours}h</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex items-center gap-2 justify-center">
                                    <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                                      <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <span className="font-semibold w-10 text-right">{progressPct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="px-4 py-3 text-xs text-muted-foreground italic">No tasks in this phase yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Phase Creation Modal */}
      {showAddPhaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddPhaseModal(false)} aria-hidden="true" />
          <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Add New Phase</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Phase Name</label>
                <input
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="e.g., Validation, Integration"
                  className="w-full text-xs border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newPhaseStart}
                    onChange={(e) => setNewPhaseStart(e.target.value)}
                    className="w-full text-xs border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newPhaseEnd}
                    onChange={(e) => setNewPhaseEnd(e.target.value)}
                    className="w-full text-xs border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Weight (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPhaseWeight}
                    onChange={(e) => setNewPhaseWeight(e.target.value)}
                    className="flex-1 text-xs border border-border rounded px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {totalWeight + (parseInt(newPhaseWeight) || 0)}% total
                  </span>
                </div>
                {totalWeight + (parseInt(newPhaseWeight) || 0) > 100 && (
                  <p className="text-xs text-destructive mt-1">
                    Total would exceed 100%. Reduce weight.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowAddPhaseModal(false)}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhase}
                disabled={totalWeight + (parseInt(newPhaseWeight) || 0) > 100 || !newPhaseName.trim()}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Phase
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Task Detail / Chatter ────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  type: "message" | "rejection";
}

const DEFAULT_CHATTER: ChatMessage[] = [
  { id: "c1", author: "Alice Morgan (PM)", initials: "AM", type: "message",   text: "Please prioritise the timing closure — it's blocking the Test phase gate.", time: "Yesterday 14:32" },
  { id: "c2", author: "James Hart",        initials: "JH", type: "message",   text: "On it. I've raised the clock frequency constraints. Should be resolved by EOD tomorrow.", time: "Yesterday 16:05" },
];

function TaskDetailPanel({
  task,
  role,
  lockedTaskIds,
  timesheets,
  onClose,
  onApprove,
  onReject,
}: {
  task: TaskCard;
  role: ViewRole;
  lockedTaskIds: Set<string>;
  timesheets: TimesheetEntry[];
  onClose: () => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string, reason: string) => void;
}) {
  const [messages,     setMessages]     = useState<ChatMessage[]>(DEFAULT_CHATTER);
  const [draft,        setDraft]        = useState("");
  const [rejectMode,   setRejectMode]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError,  setRejectError]  = useState(false);
  const [detailTab,    setDetailTab]    = useState<"chatter" | "timesheets" | "description">("chatter");

  const isLocked       = lockedTaskIds.has(task.id);
  const isPM           = isReviewerRole(role);
  const isAwaitingReview = task.status === "Waiting for Review";
  const priority       = PRIORITY_CONFIG[task.priority];

  // Logged hours on this task (approved + pending)
  const taskLogs       = timesheets.filter((t) => t.taskId === task.id);
  const approvedHours  = taskLogs.filter((t) => t.approved).reduce((s, t) => s + t.loggedHours, 0);
  const pendingHours   = taskLogs.filter((t) => !t.approved).reduce((s, t) => s + t.loggedHours, 0);
  const plannedHours   = task.plannedHours ?? 0;

  function sendMessage() {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, {
      id: `c${Date.now()}`,
      author: "Alice Morgan (PM)",
      initials: "AM",
      text: draft.trim(),
      time: "Just now",
      type: "message",
    }]);
    setDraft("");
  }

  function handleRejectSubmit() {
    if (!rejectReason.trim()) { setRejectError(true); return; }
    setMessages((prev) => [...prev, {
      id: `c${Date.now()}`,
      author: "Alice Morgan (PM)",
      initials: "AM",
      text: `[Rejected] ${rejectReason.trim()}`,
      time: "Just now",
      type: "rejection",
    }]);
    onReject?.(task.id, rejectReason.trim());
    setRejectMode(false);
    setRejectReason("");
    setRejectError(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col">

        {/* Dark header */}
        <div className="bg-sidebar px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 mb-1">
            <span>Du an</span>
            <ChevronRight className="w-3 h-3" />
            <span>Nhiem vu</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-sidebar-foreground font-semibold truncate">{task.id}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-white leading-snug flex-1">{task.title}</h3>
            <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-white text-xs shrink-0 mt-0.5">
              Close
            </button>
          </div>

          {/* Smart buttons inside detail panel header */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setDetailTab("timesheets")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors",
                detailTab === "timesheets"
                  ? "bg-white/20 border-white/30 text-white"
                  : "border-white/20 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Clock className="w-3 h-3" />
              Timesheets
              <span className="bg-white/20 text-white rounded px-1 text-[10px] font-bold">
                {approvedHours + pendingHours}h
              </span>
            </button>
            <button
              onClick={() => setDetailTab("description")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors",
                detailTab === "description"
                  ? "bg-white/20 border-white/30 text-white"
                  : "border-white/20 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <FileText className="w-3 h-3" />
              Mo ta
            </button>
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] text-sidebar-foreground/60 ml-auto">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Task ID",      task.id],
              ["Assignee",     task.assigneeName],
              ["Phase",        task.phase],
              ["Due Date",     task.dueDate],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted/30 rounded-md px-3 py-2">
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Planned vs Logged hours progress */}
          {plannedHours > 0 && (
            <div className="bg-muted/20 border border-border rounded-lg px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Hours Progress</span>
                <span className={cn(
                  "font-bold",
                  approvedHours + pendingHours > plannedHours ? "text-red-600" : "text-foreground"
                )}>
                  {approvedHours + pendingHours}h / {plannedHours}h
                </span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden flex">
                <div
                  className="h-full rounded-l-full bg-green-500 transition-all"
                  style={{ width: `${Math.min((approvedHours / plannedHours) * 100, 100)}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min((pendingHours / plannedHours) * 100, Math.max(0, 100 - (approvedHours / plannedHours) * 100))}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{approvedHours}h approved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{pendingHours}h pending</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-border inline-block" />{Math.max(0, plannedHours - approvedHours - pendingHours)}h remaining</span>
              </div>
            </div>
          )}

          {!plannedHours && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>Thoi gian du kien chua duoc dat.</strong> Engineer will not be able to start this task.
              </p>
            </div>
          )}

          {/* PM Review Actions */}
          {isPM && isAwaitingReview && !isLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                This task is awaiting your review
              </p>
              {!rejectMode ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => { onApprove?.(task.id); onClose(); }}
                    className="h-7 px-3 text-xs gap-1.5 bg-green-700 hover:bg-green-800 text-white flex-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Approve & Mark Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectMode(true)}
                    className="h-7 px-3 text-xs gap-1.5 border-red-300 text-red-600 hover:bg-red-50 flex-1"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-700 font-medium">
                    Rejection reason is required. The engineer will be notified via Chatter.
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => { setRejectReason(e.target.value); setRejectError(false); }}
                    rows={3}
                    placeholder="Describe what needs to be fixed before this can be approved…"
                    className={cn(
                      "w-full text-xs border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring",
                      rejectError ? "border-red-400" : "border-border"
                    )}
                  />
                  {rejectError && <p className="text-[10px] text-red-600">A rejection reason is required.</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleRejectSubmit} className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white flex-1">
                      Confirm Rejection
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectMode(false); setRejectError(false); }} className="h-7 px-3 text-xs flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Timesheet entries for this task are locked after PM approval.
              </p>
            </div>
          )}

          {/* Detail tab content */}
          {detailTab === "chatter" && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chatter</h4>
              </div>
              <div className="space-y-3 mb-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <div className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold shrink-0",
                      msg.type === "rejection" ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
                    )}>
                      {msg.initials}
                    </div>
                    <div className={cn(
                      "flex-1 min-w-0 rounded-lg px-3 py-2",
                      msg.type === "rejection" ? "bg-red-50 border border-red-200" : "bg-muted/30"
                    )}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-foreground">{msg.author}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className={cn("text-xs mt-0.5 leading-relaxed", msg.type === "rejection" ? "text-red-700 font-medium" : "text-muted-foreground")}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={2}
                  disabled={isLocked}
                  placeholder={isLocked ? "Locked — no further messages" : "Write a message… (Enter to send)"}
                  className={cn(
                    "flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                />
                {!isLocked && (
                  <Button size="sm" onClick={sendMessage} className="self-end h-7 px-2.5 text-xs">Send</Button>
                )}
              </div>
            </section>
          )}

          {detailTab === "timesheets" && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timesheet Logs</h4>
              {taskLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No timesheet entries for this task yet.</p>
              ) : (
                <div className="space-y-2">
                  {taskLogs.map((log) => (
                    <div key={log.id} className={cn(
                      "rounded-lg border px-3 py-2 text-xs space-y-1",
                      log.approved ? "bg-green-50/40 border-green-200" : "bg-muted/20 border-border"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{log.memberName}</span>
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          log.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>{log.approved ? "Approved" : "Pending"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{log.date}</span>
                        <span className="font-semibold text-foreground">{log.loggedHours}h</span>
                        <span>{log.progressPercent}% progress</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{log.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {detailTab === "description" && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mo ta nhiem vu</h4>
              {task.description ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">Chua co mo ta. PM co the them mo ta khi tao hoac chinh sua nhiem vu.</p>
              )}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanTab({
  tasks,
  timesheets,
  role,
  lockedTaskIds,
  onTasksChange,
  onApproveTask,
  onRejectTask,
  onCreateTask,
}: {
  tasks: TaskCard[];
  timesheets: TimesheetEntry[];
  role: ViewRole;
  lockedTaskIds: Set<string>;
  onTasksChange: (tasks: TaskCard[]) => void;
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
  onCreateTask: () => void;
}) {
  const [dragTaskId,   setDragTaskId]   = useState<string | null>(null);
  const [dragOverCol,  setDragOverCol]  = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);

  const isPM = isReviewerRole(role);
  const allowedColumns = isPM ? ALL_STATUS_COLUMNS : ENGINEER_STATUS_COLUMNS;

  function handleDragStart(taskId: string) { setDragTaskId(taskId); }

  function handleDrop(col: TaskStatus) {
    if (!dragTaskId) return;
    if (!isPM && col === "Done") return;
    onTasksChange(tasks.map((t) => (t.id === dragTaskId ? { ...t, status: col } : t)));
    setDragTaskId(null);
    setDragOverCol(null);
  }

  function handleDragOver(e: React.DragEvent, col: TaskStatus) {
    if (!isPM && col === "Done") return;
    e.preventDefault();
    setDragOverCol(col);
  }

  const tasksByStatus = ALL_STATUS_COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {} as Record<TaskStatus, TaskCard[]>);

  return (
    <>
      {/* Toolbar row */}
      <div className="flex items-center justify-between mb-3 gap-3">
        {!isPM && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 flex-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            As an Engineer, you can move tasks up to &ldquo;Waiting for Review&rdquo;. Only a PM can mark tasks as Done.
          </div>
        )}
        {isPM && (
          <div className="flex-1" />
        )}
        {isPM && (
          <Button
            size="sm"
            onClick={onCreateTask}
            className="h-8 px-3 text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tao nhiem vu moi
          </Button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {ALL_STATUS_COLUMNS.map((col) => {
          const isDoneCol       = col === "Done";
          const isReviewCol     = col === "Waiting for Review";
          const engineerBlocked = !isPM && isDoneCol;
          const columnTasks     = tasksByStatus[col];

          return (
            <div
              key={col}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col)}
              className={cn(
                "flex flex-col gap-2 min-w-[220px] max-w-[260px] flex-1 rounded-xl p-3 border transition-colors",
                isDoneCol
                  ? "bg-muted/20 border-border/50 opacity-90"
                  : dragOverCol === col && !engineerBlocked
                    ? "border-primary/50 bg-primary/5"
                    : "bg-muted/30 border-border",
                engineerBlocked && "cursor-not-allowed"
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[col])}>
                    {col}
                  </span>
                  {isDoneCol && <span className="text-[10px] text-muted-foreground italic">verified</span>}
                  {engineerBlocked && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{columnTasks.length}</span>
              </div>

              {/* Cards */}
              {columnTasks.map((task) => {
                const priority       = PRIORITY_CONFIG[task.priority];
                const isWaitingReview = task.status === "Waiting for Review";
                const isLocked       = lockedTaskIds.has(task.id);
                const plannedHours   = task.plannedHours ?? 0;
                const taskLogs       = timesheets.filter((t) => t.taskId === task.id);
                const loggedHours    = taskLogs.reduce((s, t) => s + t.loggedHours, 0);
                const isOverBudget   = plannedHours > 0 && loggedHours > plannedHours;
                const logPct         = plannedHours > 0 ? Math.min(Math.round((loggedHours / plannedHours) * 100), 100) : 0;

                return (
                  <div
                    key={task.id}
                    draggable={!isLocked}
                    onDragStart={() => !isLocked && handleDragStart(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "bg-card border rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2 group",
                      isWaitingReview && "border-amber-400 animate-pulse-border",
                      !isWaitingReview && !isLocked && "border-border hover:border-primary/40 cursor-grab active:cursor-grabbing",
                      isLocked && "border-border opacity-70 cursor-not-allowed",
                      dragTaskId === task.id && "opacity-50",
                      isDoneCol && "bg-muted/40"
                    )}
                    title={isLocked ? "Locked — task approved" : undefined}
                  >
                    {/* Drag handle + title */}
                    <div className="flex items-start gap-1.5">
                      {!isLocked
                        ? <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground mt-0.5 shrink-0" />
                        : <Lock className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                      }
                      <p className="text-xs font-medium text-foreground leading-snug flex-1">{task.title}</p>
                    </div>

                    {/* Phase + priority tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", PHASE_COLORS[task.phase])}>
                        {task.phase}
                      </span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium border", priority.bg, priority.text, priority.border)}>
                        {priority.label}
                      </span>
                      {isWaitingReview && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                          Pending
                        </span>
                      )}
                      {!task.plannedHours && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-50 text-red-500 border border-red-200 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> No plan
                        </span>
                      )}
                    </div>

                    {/* Planned vs Logged hours mini-bar */}
                    {plannedHours > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {loggedHours}h / {plannedHours}h
                          </span>
                          <span className={cn("font-semibold", isOverBudget ? "text-red-600" : "text-muted-foreground")}>
                            {logPct}%{isOverBudget ? " !" : ""}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", isOverBudget ? "bg-red-500" : "bg-primary")}
                            style={{ width: `${logPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Assignee + due */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold shrink-0">
                          {memberInitials(task.assigneeName)}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{task.assigneeName.split(" ")[0]}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{task.dueDate}</span>
                    </div>

                    {/* PM-only Approve / Reject inline buttons */}
                    {isPM && isWaitingReview && !isLocked && (
                      <div className="pt-1 border-t border-amber-200 flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onApproveTask(task.id); }}
                          className="flex-1 h-6 text-[10px] px-2 gap-1 bg-green-700 hover:bg-green-800 text-white"
                        >
                          <CheckCheck className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                          className="flex-1 h-6 text-[10px] px-2 gap-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <ThumbsDown className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <p className={cn(
                  "text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg",
                  engineerBlocked ? "border-muted/30 text-muted-foreground/30" : "border-border"
                )}>
                  {engineerBlocked ? "PM only" : col === "New" && isPM ? (
                    <span className="cursor-pointer hover:text-primary" onClick={onCreateTask}>+ Add task</span>
                  ) : "Drop here"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          role={role}
          lockedTaskIds={lockedTaskIds}
          timesheets={timesheets}
          onClose={() => setSelectedTask(null)}
          onApprove={(taskId) => { onApproveTask(taskId); setSelectedTask(null); }}
          onReject={(taskId, reason) => { onRejectTask(taskId, reason); setSelectedTask(null); }}
        />
      )}
    </>
  );
}

// ─── Resource Allocation Tab ──────────────────────────────────────────────────

function ResourceTab({ team, tasks }: { team: TeamMember[]; tasks: TaskCard[] }) {
  const memberTaskMap = team.reduce((acc, m) => {
    acc[m.id] = tasks.filter((t) => t.assigneeId === m.id && t.status !== "Done");
    return acc;
  }, {} as Record<string, TaskCard[]>);

  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Active task load per team member. Assign tasks from the Kanban board to balance workload.
      </p>
      <div className="space-y-2">
        {team.map((member) => {
          const activeTasks = memberTaskMap[member.id] ?? [];
          const loadPct = Math.min(Math.round((activeTasks.length / 5) * 100), 100);
          const loadColor =
            loadPct >= 80 ? "bg-red-500" : loadPct >= 50 ? "bg-amber-400" : "bg-green-500";

          return (
            <div key={member.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role} · {member.department}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-foreground">{activeTasks.length}</span>
                  <span className="text-xs text-muted-foreground">active tasks</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Workload</span>
                  <span>{loadPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", loadColor)} style={{ width: `${loadPct}%` }} />
                </div>
              </div>

              {activeTasks.length > 0 && (
                <div className="space-y-1.5">
                  {activeTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2.5 py-1.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        t.status === "In Progress" ? "bg-blue-500" :
                        t.status === "Waiting for Review" ? "bg-amber-400" : "bg-slate-400"
                      )} />
                      <span className="flex-1 text-foreground truncate">{t.title}</span>
                      {t.plannedHours && (
                        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{t.plannedHours}h
                        </span>
                      )}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", PHASE_COLORS[t.phase])}>
                        {t.phase}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Timesheet Approval Tab ───────────────────────────────────────────────────

function TimesheetTab({
  timesheets,
  lockedTaskIds,
  onApprove,
}: {
  timesheets: TimesheetEntry[];
  lockedTaskIds: Set<string>;
  onApprove: (id: string) => void;
}) {
  const pending  = timesheets.filter((t) => !t.approved);
  const approved = timesheets.filter((t) => t.approved);

  function renderRow(entry: TimesheetEntry) {
    const isLocked = lockedTaskIds.has(entry.taskId);
    return (
      <tr
        key={entry.id}
        className={cn(
          "border-b border-border/50 text-xs transition-colors",
          entry.approved ? "bg-green-50/30" : "hover:bg-muted/30",
          isLocked && "opacity-60"
        )}
      >
        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{entry.date}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold shrink-0">
              {memberInitials(entry.memberName)}
            </div>
            <span className="text-foreground font-medium whitespace-nowrap">{entry.memberName}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-foreground max-w-[140px]">
          <div className="flex items-center gap-1.5">
            <span className="truncate">{entry.taskTitle}</span>
            {isLocked && <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />}
          </div>
          <p className="text-muted-foreground text-[10px] truncate">{entry.taskId}</p>
        </td>
        <td className="px-3 py-2.5 text-muted-foreground max-w-[180px] hidden lg:table-cell">
          <p className="truncate">{entry.description}</p>
        </td>
        <td className="px-3 py-2.5 text-center font-semibold text-foreground whitespace-nowrap">{entry.loggedHours}h</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${entry.progressPercent}%` }} />
            </div>
            <span className="text-muted-foreground text-[10px] whitespace-nowrap">{entry.progressPercent}%</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-center">
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-[10px]">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : entry.approved ? (
            <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
              <CheckCheck className="w-3.5 h-3.5" /> Approved
            </span>
          ) : (
            <Button
              size="sm"
              onClick={() => onApprove(entry.id)}
              className="h-6 px-2.5 text-[10px] font-semibold bg-primary hover:bg-primary/90"
            >
              Approve
            </Button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-muted-foreground">{pending.length} pending approval</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCheck className="w-3.5 h-3.5 text-green-600" />
          <span className="text-muted-foreground">{approved.length} approved</span>
        </span>
        <span className="text-muted-foreground ml-auto italic">
          Only approved logs update project progress in the Strategic View.
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs">
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Date</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Member</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Task</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground hidden lg:table-cell">Description</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground whitespace-nowrap">Hours</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Progress</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.length > 0 && (
              <>
                <tr className="bg-amber-50/40">
                  <td colSpan={7} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Pending Approval
                  </td>
                </tr>
                {pending.map(renderRow)}
              </>
            )}
            {approved.length > 0 && (
              <>
                <tr className="bg-green-50/30">
                  <td colSpan={7} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                    Approved
                  </td>
                </tr>
                {approved.map(renderRow)}
              </>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Main TacticalView ────────────────────────────────────────────────────────

type Tab = "phases" | "kanban" | "resources" | "timesheets";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "phases",     label: "Phase Plan",         icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: "kanban",     label: "Task Kanban",         icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { id: "resources",  label: "Resource Allocation", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "timesheets", label: "Timesheet Approval",  icon: <Clock className="w-3.5 h-3.5" /> },
];

interface TacticalViewProps {
  project: Project;
  tactical: TacticalProjectData;
  role: ViewRole;
  onTimesheetApprove: (projectId: string, entryId: string) => void;
  onPhaseSave: (projectId: string, phases: PhaseDefinition[]) => void;
  onTasksChange: (projectId: string, tasks: TaskCard[]) => void;
}

export function TacticalView({
  project,
  tactical,
  role,
  onTimesheetApprove,
  onPhaseSave,
  onTasksChange,
}: TacticalViewProps) {
  const [activeTab,      setActiveTab]      = useState<Tab>("phases");
  const [lockedTaskIds,  setLockedTaskIds]  = useState<Set<string>>(new Set());
  const [phaseBanners,   setPhaseBanners]   = useState<string[]>([]);
  const [selectedTask,   setSelectedTask]   = useState<TaskCard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pendingCount = tactical.timesheets.filter((t) => !t.approved).length;
  const reviewCount  = tactical.tasks.filter((t) => t.status === "Waiting for Review").length;

  function checkPhaseCompletion(tasks: TaskCard[]) {
    PHASE_ORDER.forEach((phase) => {
      const phaseTasks = tasks.filter((t) => t.phase === phase);
      if (phaseTasks.length === 0) return;
      const allDone = phaseTasks.every((t) => t.status === "Done");
      if (allDone && !phaseBanners.includes(phase)) {
        setPhaseBanners((prev) => [...prev, phase]);
      }
    });
  }

  function handleApproveTask(taskId: string) {
    const updatedTasks = tactical.tasks.map((t) =>
      t.id === taskId ? { ...t, status: "Done" as TaskStatus } : t
    );
    onTasksChange(project.id, updatedTasks);
    setLockedTaskIds((prev) => new Set([...prev, taskId]));
    checkPhaseCompletion(updatedTasks);
  }

  function handleRejectTask(taskId: string, _reason: string) {
    const updatedTasks = tactical.tasks.map((t) =>
      t.id === taskId ? { ...t, status: "In Progress" as TaskStatus } : t
    );
    onTasksChange(project.id, updatedTasks);
  }

  function handleStartNextPhase(completedPhase: string) {
    const idx = PHASE_ORDER.indexOf(completedPhase);
    if (idx < 0 || idx >= PHASE_ORDER.length - 1) return;
    const nextPhase = PHASE_ORDER[idx + 1];
    const updatedTasks = tactical.tasks.map((t) =>
      t.phase === nextPhase && t.status === "New"
        ? { ...t, status: "In Progress" as TaskStatus }
        : t
    );
    onTasksChange(project.id, updatedTasks);
    dismissBanner(completedPhase);
    setActiveTab("kanban");
  }

  function dismissBanner(phase: string) {
    setPhaseBanners((prev) => prev.filter((p) => p !== phase));
  }

  function handleCreateTask(newTask: TaskCard) {
    onTasksChange(project.id, [...tactical.tasks, newTask]);
  }

  return (
    <div className="space-y-5">
      {/* Phase completion banners */}
      {phaseBanners.map((phase) => {
        const nextPhaseIdx = PHASE_ORDER.indexOf(phase) + 1;
        const nextPhase = nextPhaseIdx < PHASE_ORDER.length ? PHASE_ORDER[nextPhaseIdx] : null;
        return (
          <PhaseCompletionBanner
            key={phase}
            completedPhase={phase}
            nextPhase={nextPhase}
            onStartNextPhase={() => handleStartNextPhase(phase)}
            onDismiss={() => dismissBanner(phase)}
          />
        );
      })}

      {/* Project header bar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">{project.id}</span>
              <span className="text-xs text-muted-foreground">{project.department}</span>
            </div>
            <h2 className="text-base font-bold text-foreground">{project.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">PM: {project.pm} · {project.startDate} &rarr; {project.endDate}</p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Overall</span>
              <span className="font-bold text-foreground text-sm">{project.overallProgress}%</span>
            </div>
            <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${project.overallProgress}%` }} />
            </div>
          </div>
        </div>

        <SmartButtons project={project} tactical={tactical} onTabChange={setActiveTab} />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border w-full overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap relative",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "timesheets" && pendingCount > 0 && (
              <span className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                {pendingCount}
              </span>
            )}
            {tab.id === "kanban" && reviewCount > 0 && (
              <span className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                {reviewCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "phases" && (
          <PhasePlanTab
            tactical={tactical}
            onPhaseSave={(phases) => onPhaseSave(project.id, phases)}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        )}
        {activeTab === "kanban" && (
          <KanbanTab
            tasks={tactical.tasks}
            timesheets={tactical.timesheets}
            role={role}
            lockedTaskIds={lockedTaskIds}
            onTasksChange={(tasks) => onTasksChange(project.id, tasks)}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onCreateTask={() => { setShowCreateModal(true); setActiveTab("kanban"); }}
          />
        )}
        {activeTab === "resources" && (
          <ResourceTab team={tactical.team} tasks={tactical.tasks} />
        )}
        {activeTab === "timesheets" && (
          <TimesheetTab
            timesheets={tactical.timesheets}
            lockedTaskIds={lockedTaskIds}
            onApprove={(entryId) => onTimesheetApprove(project.id, entryId)}
          />
        )}
      </div>

      {/* Task Creation Modal */}
      {showCreateModal && (
        <TaskCreateModal
          project={project}
          team={tactical.team}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTask}
        />
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          role={role}
          lockedTaskIds={lockedTaskIds}
          timesheets={tactical.timesheets}
          onClose={() => setSelectedTask(null)}
          onApprove={handleApproveTask}
          onReject={handleRejectTask}
        />
      )}
    </div>
  );
}
