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
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { bg: "bg-red-50",   text: "text-red-600",   border: "border-red-200",   label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "Med"  },
  low:    { bg: "bg-blue-50",  text: "text-blue-500",  border: "border-blue-200",  label: "Low"  },
};

const STATUS_COLUMNS: TaskStatus[] = ["New", "In Progress", "Review", "Done"];

const STATUS_COLORS: Record<TaskStatus, string> = {
  "New":         "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100  text-blue-700",
  "Review":      "bg-amber-100 text-amber-700",
  "Done":        "bg-green-100 text-green-700",
};

const PHASE_COLORS: Record<string, string> = {
  Survey:  "bg-violet-100 text-violet-700",
  "R&D":   "bg-blue-100   text-blue-700",
  Test:    "bg-amber-100  text-amber-700",
  Release: "bg-green-100  text-green-700",
};

function memberInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

  const buttons = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Total Hours",
      value: `${totalHours}h`,
      tab: "timesheets" as Tab,
      badge: pendingTimesheets > 0 ? pendingTimesheets : null,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Phase Plan",
      value: `${tactical.phases.length} phases`,
      tab: "phases" as Tab,
      badge: null,
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Team",
      value: `${tactical.team.length} members`,
      tab: "resources" as Tab,
      badge: null,
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
          <span className="text-primary group-hover:scale-110 transition-transform">
            {btn.icon}
          </span>
          <span className="font-medium text-muted-foreground">{btn.label}</span>
          <span className="font-bold text-foreground">{btn.value}</span>
          {btn.badge !== null && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold">
              {btn.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Phase Plan Tab ───────────────────────────────────────────────────────────

function PhasePlanTab({ tactical, onPhaseSave }: {
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
              {/* Phase name */}
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PHASE_COLORS[phase.phase])}>
                  {phase.phase}
                </span>
              </div>

              {/* Start date */}
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

              {/* End date */}
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

              {/* Weight */}
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
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${phase.weight}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">{phase.weight}%</span>
                  </div>
                )}
              </div>

              {/* Edit/Save button */}
              <button
                onClick={() => {
                  if (isEditing) {
                    onPhaseSave(phases);
                    setEditingIdx(null);
                  } else {
                    setEditingIdx(idx);
                  }
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={isEditing ? "Save phase" : "Edit phase"}
              >
                {isEditing ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Pencil className="w-3.5 h-3.5" />
                )}
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
}

const DEFAULT_CHATTER: ChatMessage[] = [
  { id: "c1", author: "Alice Morgan (PM)", initials: "AM", text: "Please prioritise the timing closure — it's blocking the Test phase gate.", time: "Yesterday 14:32" },
  { id: "c2", author: "James Hart",        initials: "JH", text: "On it. I've raised the clock frequency constraints. Should be resolved by EOD tomorrow.", time: "Yesterday 16:05" },
];

function TaskDetailPanel({ task, onClose }: { task: TaskCard; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_CHATTER);
  const [draft, setDraft] = useState("");

  function sendMessage() {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `c${Date.now()}`,
        author: "Alice Morgan (PM)",
        initials: "AM",
        text: draft.trim(),
        time: "Just now",
      },
    ]);
    setDraft("");
  }

  const priority = PRIORITY_CONFIG[task.priority];

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
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 text-xs"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title + meta */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground leading-snug">{task.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", PHASE_COLORS[task.phase])}>
                {task.phase}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", STATUS_COLORS[task.status])}>
                {task.status}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border", priority.bg, priority.text, priority.border)}>
                {priority.label} Priority
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Task ID", task.id],
              ["Assignee", task.assigneeName],
              ["Due Date", task.dueDate],
              ["Phase", task.phase],
            ].map(([label, value]) => (
              <div key={label} className="bg-muted/30 rounded-md px-3 py-2">
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Chatter */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Chatter
              </h4>
            </div>

            <div className="space-y-3 mb-3">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    {msg.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-foreground">{msg.author}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compose */}
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                placeholder="Log a note or message…"
                className="flex-1 text-xs border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="sm" onClick={sendMessage} className="self-end text-xs">
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
  onTasksChange,
}: {
  tasks: TaskCard[];
  onTasksChange: (tasks: TaskCard[]) => void;
}) {
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);

  function handleDragStart(taskId: string) {
    setDragTaskId(taskId);
  }

  function handleDrop(col: TaskStatus) {
    if (!dragTaskId) return;
    onTasksChange(
      tasks.map((t) => (t.id === dragTaskId ? { ...t, status: col } : t))
    );
    setDragTaskId(null);
    setDragOverCol(null);
  }

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {} as Record<TaskStatus, TaskCard[]>);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUS_COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col); }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col)}
            className={cn(
              "flex flex-col gap-2 min-w-[220px] max-w-[260px] flex-1 bg-muted/30 rounded-xl p-3 border transition-colors",
              dragOverCol === col ? "border-primary/50 bg-primary/5" : "border-border"
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_COLORS[col])}>
                {col}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {tasksByStatus[col].length}
              </span>
            </div>

            {/* Cards */}
            {tasksByStatus[col].map((task) => {
              const priority = PRIORITY_CONFIG[task.priority];
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onClick={() => setSelectedTask(task)}
                  className={cn(
                    "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-primary/40 transition-all space-y-2 group",
                    dragTaskId === task.id && "opacity-50"
                  )}
                >
                  {/* Drag handle + priority */}
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground mt-0.5 shrink-0" />
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
                </div>
              );
            })}

            {tasksByStatus[col].length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                Drop here
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  );
}

// ─── Resource Allocation Tab ──────────────────────────────────────────────────

function ResourceTab({
  team,
  tasks,
}: {
  team: TeamMember[];
  tasks: TaskCard[];
}) {
  const memberTaskMap = team.reduce((acc, m) => {
    acc[m.id] = tasks.filter(
      (t) => t.assigneeId === m.id && t.status !== "Done"
    );
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
              {/* Member header */}
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

              {/* Load bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Workload</span>
                  <span>{loadPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", loadColor)}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Active tasks */}
              {activeTasks.length > 0 && (
                <div className="space-y-1.5">
                  {activeTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2.5 py-1.5"
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        t.status === "In Progress" ? "bg-blue-500" :
                        t.status === "Review" ? "bg-amber-400" : "bg-slate-400"
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
  onApprove,
}: {
  timesheets: TimesheetEntry[];
  onApprove: (id: string) => void;
}) {
  const pending = timesheets.filter((t) => !t.approved);
  const approved = timesheets.filter((t) => t.approved);

  function renderRow(entry: TimesheetEntry) {
    return (
      <tr
        key={entry.id}
        className={cn(
          "border-b border-border/50 text-xs transition-colors",
          entry.approved ? "bg-green-50/30" : "hover:bg-muted/30"
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
          <p className="truncate">{entry.taskTitle}</p>
          <p className="text-muted-foreground text-[10px] truncate">{entry.taskId}</p>
        </td>
        <td className="px-3 py-2.5 text-muted-foreground max-w-[180px] hidden lg:table-cell">
          <p className="truncate">{entry.description}</p>
        </td>
        <td className="px-3 py-2.5 text-center font-semibold text-foreground whitespace-nowrap">
          {entry.loggedHours}h
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${entry.progressPercent}%` }}
              />
            </div>
            <span className="text-muted-foreground text-[10px] whitespace-nowrap">{entry.progressPercent}%</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-center">
          {entry.approved ? (
            <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
              <CheckCheck className="w-3.5 h-3.5" />
              Approved
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
      <div className="flex items-center gap-4 text-xs">
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
  onTimesheetApprove: (projectId: string, entryId: string) => void;
  onPhaseSave: (projectId: string, phases: PhaseDefinition[]) => void;
  onTasksChange: (projectId: string, tasks: TaskCard[]) => void;
}

export function TacticalView({
  project,
  tactical,
  onTimesheetApprove,
  onPhaseSave,
  onTasksChange,
}: TacticalViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("phases");

  const pendingCount = tactical.timesheets.filter((t) => !t.approved).length;

  return (
    <div className="space-y-5">
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

          {/* Overall progress pill */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Overall</span>
              <span className="font-bold text-foreground text-sm">{project.overallProgress}%</span>
            </div>
            <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${project.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Smart Buttons */}
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
            onTasksChange={(tasks) => onTasksChange(project.id, tasks)}
          />
        )}
        {activeTab === "resources" && (
          <ResourceTab team={tactical.team} tasks={tactical.tasks} />
        )}
        {activeTab === "timesheets" && (
          <TimesheetTab
            timesheets={tactical.timesheets}
            onApprove={(entryId) => onTimesheetApprove(project.id, entryId)}
          />
        )}
      </div>
    </div>
  );
}
