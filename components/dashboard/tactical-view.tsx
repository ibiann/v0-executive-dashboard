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
} from "lucide-react";
import type { ViewRole } from "@/components/dashboard/top-nav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200",   label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "Med"  },
  low:    { bg: "bg-blue-50",  text: "text-blue-500",  border: "border-blue-200",  label: "Low"  },
};

/**
 * Workflow columns differ by role:
 * - Engineer: New → In Progress → Waiting for Review  (cannot place in Done)
 * - PM/Lead:  New → In Progress → Waiting for Review → Done
 */
const ALL_STATUS_COLUMNS: TaskStatus[] = ["New", "In Progress", "Waiting for Review", "Done"];
const ENGINEER_STATUS_COLUMNS: TaskStatus[] = ["New", "In Progress", "Waiting for Review"];

const STATUS_COLORS: Record<TaskStatus, string> = {
  "New":                  "bg-slate-100 text-slate-600",
  "In Progress":          "bg-blue-100  text-blue-700",
  "Waiting for Review":   "bg-amber-100 text-amber-700",
  "Review":               "bg-amber-100 text-amber-700", // legacy compat
  "Done":                 "bg-green-100 text-green-700",
};

const PHASE_COLORS: Record<string, string> = {
  Survey:  "bg-violet-100 text-violet-700",
  "R&D":   "bg-blue-100   text-blue-700",
  Test:    "bg-amber-100  text-amber-700",
  Release: "bg-green-100  text-green-700",
};

const PHASE_ORDER: TaskStatus["phase"] extends never ? never : string[] = ["Survey", "R&D", "Test", "Release"];

function memberInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function isReviewerRole(role: ViewRole): boolean {
  return role === "PM" || role === "CTO";
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
  const totalHours = tactical.timesheets.reduce((s, t) => s + t.loggedHours, 0);
  const pendingTimesheets = tactical.timesheets.filter((t) => !t.approved).length;
  const reviewTasks = tactical.tasks.filter((t) => t.status === "Waiting for Review").length;

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
}: {
  tactical: TacticalProjectData;
  onPhaseSave: (phases: PhaseDefinition[]) => void;
}) {
  const [phases, setPhases] = useState<PhaseDefinition[]>(tactical.phases);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  function handleChange(idx: number, field: keyof PhaseDefinition, value: string | number) {
    setPhases((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }

  const totalWeight = phases.reduce((s, p) => s + p.weight, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Define phase start/end dates and their weight in total project progress. Weights must sum to 100%.
        </p>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            totalWeight === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          )}
        >
          Total: {totalWeight}%
        </span>
      </div>

      <div className="space-y-2">
        {phases.map((phase, idx) => {
          const isEditing = editingIdx === idx;
          return (
            <div
              key={phase.phase}
              className="bg-card border border-border rounded-lg px-4 py-3 grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-center"
            >
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PHASE_COLORS[phase.phase])}>
                  {phase.phase}
                </span>
              </div>

              {isEditing ? (
                <input
                  type="date"
                  value={phase.startDate}
                  onChange={(e) => handleChange(idx, "startDate", e.target.value)}
                  className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground/60 mr-1">Start:</span>{phase.startDate}
                </span>
              )}

              {isEditing ? (
                <input
                  type="date"
                  value={phase.endDate}
                  onChange={(e) => handleChange(idx, "endDate", e.target.value)}
                  className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground/60 mr-1">End:</span>{phase.endDate}
                </span>
              )}

              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={phase.weight}
                    onChange={(e) => handleChange(idx, "weight", parseInt(e.target.value) || 0)}
                    className="w-16 text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${phase.weight}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">{phase.weight}%</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (isEditing) { onPhaseSave(phases); setEditingIdx(null); }
                  else { setEditingIdx(idx); }
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={isEditing ? "Save phase" : "Edit phase"}
              >
                {isEditing
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  : <Pencil className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          );
        })}
      </div>

      {totalWeight !== 100 && (
        <p className="text-xs text-destructive">
          Phase weights must sum to exactly 100%. Current total: {totalWeight}%.
        </p>
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
  onClose,
  onApprove,
  onReject,
}: {
  task: TaskCard;
  role: ViewRole;
  lockedTaskIds: Set<string>;
  onClose: () => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string, reason: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_CHATTER);
  const [draft, setDraft] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState(false);

  const isLocked = lockedTaskIds.has(task.id);
  const isPM = isReviewerRole(role);
  const isAwaitingReview = task.status === "Waiting for Review";
  const priority = PRIORITY_CONFIG[task.priority];

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
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span>Kanban</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold truncate">{task.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs">
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title + meta */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground leading-snug">{task.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", PHASE_COLORS[task.phase])}>{task.phase}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", STATUS_COLORS[task.status])}>{task.status}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border", priority.bg, priority.text, priority.border)}>
                {priority.label} Priority
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Task ID",  task.id],
              ["Assignee", task.assigneeName],
              ["Due Date", task.dueDate],
              ["Phase",    task.phase],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted/30 rounded-md px-3 py-2">
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* PM Review Actions — only shown for PM on Waiting for Review tasks */}
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

          {/* Locked notice for timesheets */}
          {isLocked && (
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Timesheet entries for this task are locked after PM approval.
              </p>
            </div>
          )}

          {/* Chatter */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chatter</h4>
            </div>

            <div className="space-y-3 mb-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-start gap-2.5", msg.type === "rejection" && "")}>
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

            {/* Compose — disabled when task is locked */}
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                rows={2}
                placeholder={isLocked ? "Chatter is locked for approved tasks." : "Log a note or message…"}
                disabled={isLocked}
                className="flex-1 text-xs border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button size="sm" onClick={sendMessage} disabled={isLocked} className="self-end text-xs">
                Send
              </Button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

// ─── Kanban Board Tab ─────────────────────────────────────────────────────────

function KanbanTab({
  tasks,
  role,
  lockedTaskIds,
  onTasksChange,
  onApproveTask,
  onRejectTask,
}: {
  tasks: TaskCard[];
  role: ViewRole;
  lockedTaskIds: Set<string>;
  onTasksChange: (tasks: TaskCard[]) => void;
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string, reason: string) => void;
}) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);

  const isPM = isReviewerRole(role);
  const allowedColumns = isPM ? ALL_STATUS_COLUMNS : ENGINEER_STATUS_COLUMNS;

  function handleDragStart(taskId: string) {
    setDragTaskId(taskId);
  }

  function handleDrop(col: TaskStatus) {
    if (!dragTaskId) return;
    // Engineers cannot drop into Done
    if (!isPM && col === "Done") return;
    onTasksChange(tasks.map((t) => (t.id === dragTaskId ? { ...t, status: col } : t)));
    setDragTaskId(null);
    setDragOverCol(null);
  }

  function handleDragOver(e: React.DragEvent, col: TaskStatus) {
    // Prevent drop visual if engineer tries to drag to Done
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
      {/* Engineer guidance bar */}
      {!isPM && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          As an Engineer, you can move tasks up to &ldquo;Waiting for Review&rdquo;. Only a PM can mark tasks as Done.
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {ALL_STATUS_COLUMNS.map((col) => {
          const isDoneCol = col === "Done";
          const isReviewCol = col === "Waiting for Review";
          const engineerBlocked = !isPM && isDoneCol;
          const columnTasks = tasksByStatus[col];

          return (
            <div
              key={col}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col)}
              className={cn(
                "flex flex-col gap-2 min-w-[220px] max-w-[260px] flex-1 rounded-xl p-3 border transition-colors",
                // Done column is visually muted = "verified zone"
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
                  {isDoneCol && (
                    <span className="text-[10px] text-muted-foreground italic">verified</span>
                  )}
                  {engineerBlocked && (
                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{columnTasks.length}</span>
              </div>

              {/* Cards */}
              {columnTasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority];
                const isWaitingReview = task.status === "Waiting for Review";
                const isLocked = lockedTaskIds.has(task.id);

                return (
                  <div
                    key={task.id}
                    draggable={!isLocked}
                    onDragStart={() => !isLocked && handleDragStart(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "bg-card border rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2 group",
                      // Pulsing amber border for "Waiting for Review"
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
                    </div>

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

                    {/* PM-only Approve button directly on the card (Waiting for Review only) */}
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
                  {engineerBlocked ? "PM only" : "Drop here"}
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
  const pending = timesheets.filter((t) => !t.approved);
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
  { id: "phases",     label: "Phase Plan",          icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: "kanban",     label: "Task Kanban",          icon: <GripVertical className="w-3.5 h-3.5" /> },
  { id: "resources",  label: "Resource Allocation",  icon: <Users className="w-3.5 h-3.5" /> },
  { id: "timesheets", label: "Timesheet Approval",   icon: <Clock className="w-3.5 h-3.5" /> },
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
  const [activeTab, setActiveTab] = useState<Tab>("phases");
  // Track which task IDs are locked (PM approved → timesheets locked + task fixed to Done)
  const [lockedTaskIds, setLockedTaskIds] = useState<Set<string>>(new Set());
  // Phase completion banner state
  const [phaseBanners, setPhaseBanners] = useState<string[]>([]);

  const pendingCount = tactical.timesheets.filter((t) => !t.approved).length;
  const reviewCount  = tactical.tasks.filter((t) => t.status === "Waiting for Review").length;

  // ── Phase completion check ─────────────────────────────────────────────────
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

  // ── Approve a Kanban task (PM/CTO only) ────────────────────────────────────
  function handleApproveTask(taskId: string) {
    // Move task to Done
    const updatedTasks = tactical.tasks.map((t) =>
      t.id === taskId ? { ...t, status: "Done" as TaskStatus } : t
    );
    onTasksChange(project.id, updatedTasks);

    // Lock the task (no more edits to timesheets)
    setLockedTaskIds((prev) => new Set([...prev, taskId]));

    // Check for phase completion
    checkPhaseCompletion(updatedTasks);
  }

  // ── Reject a Kanban task — sends back to In Progress ──────────────────────
  function handleRejectTask(taskId: string, _reason: string) {
    const updatedTasks = tactical.tasks.map((t) =>
      t.id === taskId ? { ...t, status: "In Progress" as TaskStatus } : t
    );
    onTasksChange(project.id, updatedTasks);
  }

  // ── Start Next Phase smart button ─────────────────────────────────────────
  function handleStartNextPhase(completedPhase: string) {
    const idx = PHASE_ORDER.indexOf(completedPhase);
    if (idx < 0 || idx >= PHASE_ORDER.length - 1) return;
    const nextPhase = PHASE_ORDER[idx + 1];
    // Activate next-phase tasks: move any "New" tasks for next phase to "In Progress"
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
            <p className="text-xs text-muted-foreground mt-0.5">PM: {project.pm} · {project.startDate} → {project.endDate}</p>
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
          />
        )}
        {activeTab === "kanban" && (
          <KanbanTab
            tasks={tactical.tasks}
            role={role}
            lockedTaskIds={lockedTaskIds}
            onTasksChange={(tasks) => onTasksChange(project.id, tasks)}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
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
    </div>
  );
}
