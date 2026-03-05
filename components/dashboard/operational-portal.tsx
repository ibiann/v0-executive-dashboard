"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, BookOpen, MapPin, ClipboardList, Bell,
  Play, Pause, CheckCircle, AlertTriangle, Clock,
  ChevronRight, X, CalendarDays, Timer, FileEdit,
  SlidersHorizontal, LogOut, Plus, Check, Lock,
} from "lucide-react";
import {
  TACTICAL_DATA,
  ENGINEER_PROFILE,
  EngineerProfile,
  EngNotification,
  LogWorkEntry,
  TaskCard,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RunState = "idle" | "running" | "paused";

interface TaskRunState   { [taskId: string]: RunState }
interface TaskProgress   { [taskId: string]: number }
interface TaskElapsed    { [taskId: string]: number }   // seconds accumulated
interface TaskActualHours { [taskId: string]: number }  // total logged hours per task

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function hoursFromSeconds(secs: number): number {
  return Math.max(0.5, parseFloat((secs / 3600).toFixed(1)));
}

const TODAY = new Date().toISOString().split("T")[0];

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: EngNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const iconMap = {
    overdue:  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    rejected: <X className="w-3.5 h-3.5 text-amber-500" />,
    assigned: <Plus className="w-3.5 h-3.5 text-primary" />,
  };
  const bgMap = {
    overdue:  "bg-red-50 border-red-200",
    rejected: "bg-amber-50 border-amber-200",
    assigned: "bg-primary/5 border-primary/20",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold leading-none">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={onMarkAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={cn(
                    "flex gap-2.5 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className={cn("mt-0.5 p-1.5 rounded-md border shrink-0", bgMap[n.type])}>
                    {iconMap[n.type]}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold leading-tight", !n.read ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Log Work Modal ───────────────────────────────────────────────────────────

function LogWorkModal({
  task,
  currentProgress,
  prefillHours,
  isFinalLog,
  onSave,
  onClose,
}: {
  task: TaskCard;
  currentProgress: number;
  prefillHours?: number;  // from timer
  isFinalLog?: boolean;   // Finish & Review flow
  onSave: (entry: Omit<LogWorkEntry, "id">) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(TODAY);
  const [hours, setHours] = useState<number | "">(prefillHours ?? "");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(isFinalLog ? 100 : currentProgress);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hours || Number(hours) <= 0) return;
    if (!description.trim()) return;
    onSave({
      taskId: task.id,
      taskTitle: task.title,
      date,
      loggedHours: Number(hours),
      description: description.trim(),
      progressPercent: progress,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", isFinalLog ? "bg-green-100" : "bg-primary/10")}>
              {isFinalLog
                ? <CheckCircle className="w-4 h-4 text-green-600" />
                : <FileEdit className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isFinalLog ? "Final Log — Finish & Review" : "Log Work"}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-52">{task.title}</p>
            </div>
          </div>
          {!isFinalLog && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isFinalLog && (
          <div className="mx-5 mt-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
            This will lock the task and send it for PM review. Please complete all fields.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Date
            </label>
            <input
              type="date"
              value={date}
              max={TODAY}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              Hours Logged
              {prefillHours !== undefined && (
                <span className="ml-auto text-[10px] text-primary font-normal">
                  (auto-filled from timer)
                </span>
              )}
            </label>
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 4.5"
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Work Content / Technical Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {isFinalLog ? "Technical Details / Results" : "Technical Description"}
              <span className="text-destructive ml-0.5">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isFinalLog
                  ? "Describe what was achieved, test results, known issues, and sign-off notes..."
                  : "Describe the work completed, issues encountered, next steps..."
              }
              rows={4}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                Task Progress
              </label>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              disabled={isFinalLog}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span>
              <span className={cn(isFinalLog && "text-green-600 font-semibold")}>100%</span>
            </div>
            {isFinalLog && (
              <p className="text-[10px] text-green-600 font-medium">
                Progress locked to 100% for final completion.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                isFinalLog
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Check className="w-4 h-4" />
              {isFinalLog ? "Submit & Send for Review" : "Save Log Entry"}
            </button>
            {!isFinalLog && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Live Timer Display ───────────────────────────────────────────────────────

function TimerDisplay({ elapsed }: { elapsed: number }) {
  return (
    <span className="font-mono text-xs tabular-nums text-primary font-bold">
      {fmtSeconds(elapsed)}
    </span>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

const PRIORITY_COLOR = {
  high:   "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low:    "text-green-600 bg-green-50 border-green-200",
};

const PHASE_COLOR: Record<string, string> = {
  Survey:  "bg-violet-100 text-violet-700",
  "R&D":   "bg-blue-100 text-blue-700",
  Test:    "bg-teal-100 text-teal-700",
  Release: "bg-orange-100 text-orange-700",
};

function MyTaskCard({
  task,
  progress,
  runState,
  elapsed,
  actualHours,
  projectName,
  onStart,
  onPause,
  onFinishReview,
  onLogWork,
}: {
  task: TaskCard;
  progress: number;
  runState: RunState;
  elapsed: number;
  actualHours: number;
  projectName: string;
  onStart: () => void;
  onPause: () => void;
  onFinishReview: () => void;
  onLogWork: () => void;
}) {
  const isLocked = task.status === "Waiting for Review" || task.status === "Done";
  const isWaiting = task.status === "Waiting for Review";

  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-all",
      runState === "running"
        ? "border-primary/40 ring-1 ring-primary/20 shadow-md"
        : isWaiting
        ? "animate-pulse-border border-amber-400"
        : "border-border hover:shadow-md",
      isLocked && runState !== "running" && "opacity-80"
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isLocked && <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />}
            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{task.title}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border", PRIORITY_COLOR[task.priority])}>
              {task.priority.toUpperCase()}
            </span>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", PHASE_COLOR[task.phase])}>
              {task.phase}
            </span>
          </div>
        </div>
        {runState === "running" && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="flex items-center gap-1 text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Running
            </span>
            <TimerDisplay elapsed={elapsed} />
          </div>
        )}
      </div>

      {/* Planned / Actual hours row */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          Planned: <span className="font-semibold text-foreground">{task.plannedHours ?? "—"}h</span>
        </span>
        <span className="text-muted-foreground">
          Actual: <span className={cn("font-semibold", actualHours > (task.plannedHours ?? Infinity) ? "text-red-600" : "text-foreground")}>{actualHours}h</span>
        </span>
      </div>

      {/* Project + due */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="truncate">{projectName}</span>
        <span className="shrink-0 flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {task.dueDate}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">Progress</span>
          <span className="text-[11px] font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Waiting for review status chip */}
      {isWaiting && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Waiting for PM Review — task locked
        </div>
      )}

      {/* Action buttons — hidden when locked */}
      {!isLocked && (
        <div className="flex items-center gap-2 flex-wrap">
          {runState !== "running" ? (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Bat dau
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg px-3 py-1.5 hover:bg-amber-600 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Tam dung
            </button>
          )}
          <button
            onClick={onLogWork}
            className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-secondary text-foreground rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Log Work
          </button>
          <button
            onClick={onFinishReview}
            className="flex items-center gap-1.5 text-xs font-semibold border border-green-300 bg-green-50 text-green-700 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Finish &amp; Review
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Portal Module Tile ───────────────────────────────────────────────────────

function PortalTile({
  icon: Icon,
  label,
  count,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count?: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group text-center"
    >
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
        {count !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
        )}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
    </button>
  );
}

// ─── Bang Cham Cong (Timesheet Table) ────────────────────────────────────────

function BangChamCong({ history }: { history: (LogWorkEntry & { approved?: boolean })[] }) {
  if (history.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-6">No timesheet entries yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-secondary/60 border-b border-border">
            <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Date</th>
            <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Task</th>
            <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Hours</th>
            <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Progress</th>
            <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {[...history].reverse().map((entry) => (
            <tr key={entry.id} className="bg-card hover:bg-muted/20 transition-colors">
              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{entry.date}</td>
              <td className="px-3 py-2.5 max-w-[200px]">
                <p className="font-medium text-foreground truncate">{entry.taskTitle}</p>
                <p className="text-muted-foreground/70 line-clamp-1 mt-0.5">{entry.description}</p>
              </td>
              <td className="px-3 py-2.5 text-center font-semibold text-foreground">{entry.loggedHours}h</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden min-w-[40px]">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${entry.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{entry.progressPercent}%</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-center">
                {(entry as any).approved ? (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" />
                    Pending
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Operational Portal (Level 3) ────────────────────────────────────────────

export function OperationalPortal({
  onLogWorkSubmit,
  onNotifyPM,
}: {
  onLogWorkSubmit?: (taskId: string, entry: Omit<LogWorkEntry, "id">) => void;
  onNotifyPM?: (notification: Omit<EngNotification, "id" | "read">) => void;
}) {
  const [profile] = useState<EngineerProfile>({ ...ENGINEER_PROFILE });

  const tacticalProject = TACTICAL_DATA[profile.projectId];
  const [tasks, setTasks] = useState<TaskCard[]>(
    tacticalProject
      ? tacticalProject.tasks.filter((t) => t.assigneeId === profile.memberId)
      : []
  );

  // Progress per task (0–100)
  const [taskProgress, setTaskProgress] = useState<TaskProgress>(() => {
    const init: TaskProgress = {};
    tasks.forEach((t) => { init[t.id] = 0; });
    profile.logWorkHistory.forEach((lw) => { init[lw.taskId] = lw.progressPercent; });
    return init;
  });

  // Run state per task
  const [runState, setRunState] = useState<TaskRunState>(() => {
    const init: TaskRunState = {};
    tasks.forEach((t) => { init[t.id] = "idle"; });
    return init;
  });

  // Elapsed time per task (seconds) — accumulated across pause/resume
  const [elapsed, setElapsed] = useState<TaskElapsed>(() => {
    const init: TaskElapsed = {};
    tasks.forEach((t) => { init[t.id] = 0; });
    return init;
  });

  // Which task is currently ticking (only one at a time)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningTaskRef = useRef<string | null>(null);

  // Actual hours logged per task (sum of log entries)
  const [actualHours, setActualHours] = useState<TaskActualHours>(() => {
    const init: TaskActualHours = {};
    tasks.forEach((t) => { init[t.id] = 0; });
    profile.logWorkHistory.forEach((lw) => {
      init[lw.taskId] = (init[lw.taskId] ?? 0) + lw.loggedHours;
    });
    return init;
  });

  // Log work history — combined: pre-seeded + new entries, carries approval flag
  const [logWorkHistory, setLogWorkHistory] = useState<(LogWorkEntry & { approved?: boolean })[]>(
    profile.logWorkHistory.map((lw) => ({ ...lw, approved: false }))
  );

  const [notifications, setNotifications] = useState<EngNotification[]>(profile.notifications);
  const [activeSection, setActiveSection] = useState<"home" | "tasks" | "timesheets">("home");

  // Modal state: "logwork" = normal log, "finish" = final mandatory log
  const [logModal, setLogModal] = useState<{ task: TaskCard; mode: "logwork" | "finish" } | null>(null);

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const runningId = Object.keys(runState).find((id) => runState[id] === "running") ?? null;
    runningTaskRef.current = runningId;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (runningId) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => ({
          ...prev,
          [runningId]: (prev[runningId] ?? 0) + 1,
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runState]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStart = useCallback((taskId: string) => {
    // Pause any currently running task first
    setRunState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => { if (next[id] === "running") next[id] = "paused"; });
      next[taskId] = "running";
      return next;
    });
  }, []);

  const handlePause = useCallback((taskId: string) => {
    setRunState((prev) => ({ ...prev, [taskId]: "paused" }));
  }, []);

  // Normal Log Work — prefill hours from timer if task is running/paused
  const handleOpenLogWork = useCallback((task: TaskCard) => {
    setLogModal({ task, mode: "logwork" });
  }, []);

  // Finish & Review — opens mandatory final log modal
  const handleFinishReview = useCallback((task: TaskCard) => {
    // Pause the timer first
    setRunState((prev) => ({ ...prev, [task.id]: "paused" }));
    setLogModal({ task, mode: "finish" });
  }, []);

  const handleLogWorkSave = useCallback(
    (entry: Omit<LogWorkEntry, "id">, isFinal: boolean) => {
      const id = `LW-${Date.now()}`;
      const full = { ...entry, id, approved: false };
      setLogWorkHistory((prev) => [...prev, full]);
      setTaskProgress((prev) => ({ ...prev, [entry.taskId]: entry.progressPercent }));
      setActualHours((prev) => ({
        ...prev,
        [entry.taskId]: (prev[entry.taskId] ?? 0) + entry.loggedHours,
      }));

      // If final: lock task, reset timer, notify PM
      if (isFinal) {
        setTasks((prev) =>
          prev.map((t) => (t.id === entry.taskId ? { ...t, status: "Waiting for Review" } : t))
        );
        setRunState((prev) => ({ ...prev, [entry.taskId]: "idle" }));
        setElapsed((prev) => ({ ...prev, [entry.taskId]: 0 }));

        // Fire PM notification
        const pmNotif: Omit<EngNotification, "id" | "read"> = {
          type: "assigned",
          title: "Task Ready for Review",
          body: `${profile.name} submitted "${entry.taskTitle}" for your approval (100% complete).`,
          timestamp: new Date().toISOString(),
        };
        onNotifyPM?.(pmNotif);
      }

      onLogWorkSubmit?.(entry.taskId, entry);
      setLogModal(null);
    },
    [profile.name, onLogWorkSubmit, onNotifyPM]
  );

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeTasks   = tasks.filter((t) => t.status !== "Done");
  const unread        = notifications.filter((n) => !n.read).length;
  const pendingCount  = logWorkHistory.filter((e) => !e.approved).length;
  const approvedCount = logWorkHistory.filter((e) => e.approved).length;

  // For modal: compute prefill hours from elapsed seconds
  const prefillForModal =
    logModal
      ? hoursFromSeconds(elapsed[logModal.task.id] ?? 0)
      : undefined;
  // Only prefill if elapsed > 0 (timer was actually used)
  const hasMeaningfulElapsed =
    logModal ? (elapsed[logModal.task.id] ?? 0) > 30 : false;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Portal Header ── */}
      <div className="bg-card border-b border-border px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {profile.initials}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">LancsNet — {profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.role} · {profile.department} · {profile.projectName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-secondary transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 md:px-6 space-y-6">
        {/* ── Portal Grid (Odoo-style tiles) ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            My Workspace
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PortalTile
              icon={ClipboardList}
              label="Cong viec cua toi"
              count={activeTasks.length}
              color="bg-primary/10 text-primary"
              onClick={() => setActiveSection("tasks")}
            />
            <PortalTile
              icon={ClipboardList}
              label="Bang cham cong"
              count={logWorkHistory.length}
              color="bg-blue-100 text-blue-700"
              onClick={() => setActiveSection("timesheets")}
            />
            <PortalTile icon={FileText} label="Tai lieu"    color="bg-teal-100 text-teal-700" />
            <PortalTile icon={BookOpen} label="Kien thuc"   color="bg-violet-100 text-violet-700" />
            <PortalTile icon={MapPin}   label="Dia chi"     color="bg-orange-100 text-orange-700" />
          </div>
        </section>

        {/* ── My Active Tasks ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Cong viec cua toi</h2>
            <span className="text-xs text-muted-foreground">{activeTasks.length} active</span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl py-10 text-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <p className="text-sm font-semibold text-foreground">All tasks complete</p>
              <p className="text-xs text-muted-foreground">No active tasks at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeTasks.map((task) => (
                <MyTaskCard
                  key={task.id}
                  task={task}
                  progress={taskProgress[task.id] ?? 0}
                  runState={runState[task.id] ?? "idle"}
                  elapsed={elapsed[task.id] ?? 0}
                  actualHours={actualHours[task.id] ?? 0}
                  projectName={profile.projectName}
                  onStart={() => handleStart(task.id)}
                  onPause={() => handlePause(task.id)}
                  onFinishReview={() => handleFinishReview(task)}
                  onLogWork={() => handleOpenLogWork(task)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Bang Cham Cong (Timesheet) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Bang cham cong</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {logWorkHistory.length} entries ·{" "}
                <span className="text-amber-600 font-medium">{pendingCount} pending</span>
                {" · "}
                <span className="text-green-600 font-medium">{approvedCount} approved</span>
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <BangChamCong history={logWorkHistory} />
          </div>
        </section>
      </div>

      {/* ── Log Work / Finish & Review Modal ── */}
      {logModal && (
        <LogWorkModal
          task={logModal.task}
          currentProgress={taskProgress[logModal.task.id] ?? 0}
          prefillHours={hasMeaningfulElapsed ? prefillForModal : undefined}
          isFinalLog={logModal.mode === "finish"}
          onSave={(entry) => handleLogWorkSave(entry, logModal.mode === "finish")}
          onClose={() => {
            // If closing a finish modal without saving, re-set status (still in progress)
            setLogModal(null);
          }}
        />
      )}
    </div>
  );
}
