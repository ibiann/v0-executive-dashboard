"use client";

import { useState, useCallback } from "react";
import {
  FileText, BookOpen, MapPin, ClipboardList, Bell,
  Play, Pause, CheckCircle, AlertTriangle, Clock,
  ChevronRight, X, CalendarDays, Timer, FileEdit,
  SlidersHorizontal, LogOut, Plus, Check,
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

interface TaskRunState {
  [taskId: string]: "idle" | "running" | "paused";
}

interface TaskProgress {
  [taskId: string]: number; // 0–100
}

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
    overdue: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    rejected: <X className="w-3.5 h-3.5 text-amber-500" />,
    assigned: <Plus className="w-3.5 h-3.5 text-primary" />,
  };

  const bgMap = {
    overdue: "bg-red-50 border-red-200",
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
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
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
                  className={cn(
                    "flex gap-2.5 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => onMarkRead(n.id)}
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
  onSave,
  onClose,
}: {
  task: TaskCard;
  currentProgress: number;
  onSave: (entry: Omit<LogWorkEntry, "id">) => void;
  onClose: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(currentProgress);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hours || hours <= 0) return;
    onSave({
      taskId: task.id,
      date,
      loggedHours: Number(hours),
      description,
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
            <div className="p-1.5 rounded-md bg-primary/10">
              <FileEdit className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Log Work</p>
              <p className="text-xs text-muted-foreground truncate max-w-48">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

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
              max={today}
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

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Technical Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work completed, issues encountered, next steps..."
              rows={3}
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
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Log Entry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

const PRIORITY_COLOR = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-green-600 bg-green-50 border-green-200",
};

const PHASE_COLOR: Record<string, string> = {
  Survey: "bg-violet-100 text-violet-700",
  "R&D": "bg-blue-100 text-blue-700",
  Test: "bg-teal-100 text-teal-700",
  Release: "bg-orange-100 text-orange-700",
};

function MyTaskCard({
  task,
  progress,
  runState,
  projectName,
  onStart,
  onPause,
  onFinishReview,
  onLogWork,
}: {
  task: TaskCard;
  progress: number;
  runState: "idle" | "running" | "paused";
  projectName: string;
  onStart: () => void;
  onPause: () => void;
  onFinishReview: () => void;
  onLogWork: () => void;
}) {
  const isDone = task.status === "Done" || task.status === "Waiting for Review";

  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow",
      runState === "running" ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
      isDone && "opacity-70"
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{task.title}</p>
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
          <span className="flex items-center gap-1 text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Running
          </span>
        )}
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

      {/* Status chip */}
      {(task.status === "Waiting for Review") && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Waiting for PM Review
        </div>
      )}

      {/* Action buttons */}
      {!isDone && (
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
      {task.status === "Waiting for Review" && (
        <button
          onClick={onLogWork}
          className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-secondary text-foreground rounded-lg px-3 py-1.5 hover:bg-muted transition-colors w-fit"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Log Work
        </button>
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

// ─── Log Work History ─────────────────────────────────────────────────────────

function LogWorkHistory({ history }: { history: LogWorkEntry[] }) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">No log entries yet.</p>
    );
  }
  return (
    <div className="space-y-2">
      {[...history].reverse().map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 bg-secondary/40 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{entry.date}</p>
              <span className="text-xs font-bold text-primary shrink-0">{entry.loggedHours}h</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.description}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${entry.progressPercent}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{entry.progressPercent}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Operational Portal (Level 3) ────────────────────────────────────────────

export function OperationalPortal({
  onLogWorkSubmit,
}: {
  onLogWorkSubmit?: (taskId: string, entry: Omit<LogWorkEntry, "id">) => void;
}) {
  const [profile, setProfile] = useState<EngineerProfile>({ ...ENGINEER_PROFILE });

  // Pull this engineer's tasks from TACTICAL_DATA
  const tacticalProject = TACTICAL_DATA[profile.projectId];
  const [tasks, setTasks] = useState<TaskCard[]>(
    tacticalProject ? tacticalProject.tasks.filter((t) => t.assigneeId === profile.memberId) : []
  );

  const [taskProgress, setTaskProgress] = useState<TaskProgress>(() => {
    const init: TaskProgress = {};
    tasks.forEach((t) => { init[t.id] = 0; });
    // Pre-seed progress from log history
    profile.logWorkHistory.forEach((lw) => { init[lw.taskId] = lw.progressPercent; });
    return init;
  });

  const [runState, setRunState] = useState<TaskRunState>(() => {
    const init: TaskRunState = {};
    tasks.forEach((t) => { init[t.id] = "idle"; });
    return init;
  });

  const [logWorkTask, setLogWorkTask] = useState<TaskCard | null>(null);
  const [logWorkHistory, setLogWorkHistory] = useState<LogWorkEntry[]>(profile.logWorkHistory);
  const [notifications, setNotifications] = useState<EngNotification[]>(profile.notifications);
  const [activeSection, setActiveSection] = useState<"home" | "tasks" | "timesheets">("home");

  const handleStart = useCallback((taskId: string) => {
    setRunState((prev) => ({ ...prev, [taskId]: "running" }));
  }, []);

  const handlePause = useCallback((taskId: string) => {
    setRunState((prev) => ({ ...prev, [taskId]: "paused" }));
  }, []);

  const handleFinishReview = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "Waiting for Review" } : t))
    );
    setRunState((prev) => ({ ...prev, [taskId]: "idle" }));
  }, []);

  const handleLogWorkSave = useCallback((entry: Omit<LogWorkEntry, "id">) => {
    const id = `LW-${Date.now()}`;
    const full: LogWorkEntry = { ...entry, id };
    setLogWorkHistory((prev) => [...prev, full]);
    setTaskProgress((prev) => ({ ...prev, [entry.taskId]: entry.progressPercent }));
    onLogWorkSubmit?.(entry.taskId, entry);
    setLogWorkTask(null);
  }, [onLogWorkSubmit]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== "Done");
  const unread = notifications.filter((n) => !n.read).length;

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
              <p className="text-base font-bold text-foreground">LancsNet, {profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.role} · {profile.department} · {profile.projectName}</p>
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">My Workspace</h2>
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
            <PortalTile
              icon={FileText}
              label="Tai lieu"
              color="bg-teal-100 text-teal-700"
            />
            <PortalTile
              icon={BookOpen}
              label="Kien thuc"
              color="bg-violet-100 text-violet-700"
            />
            <PortalTile
              icon={MapPin}
              label="Dia chi"
              color="bg-orange-100 text-orange-700"
            />
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
                  projectName={profile.projectName}
                  onStart={() => handleStart(task.id)}
                  onPause={() => handlePause(task.id)}
                  onFinishReview={() => handleFinishReview(task.id)}
                  onLogWork={() => setLogWorkTask(task)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Log Work History ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Bang cham cong — Log History</h2>
            <span className="text-xs text-muted-foreground">{logWorkHistory.length} entries</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <LogWorkHistory history={logWorkHistory} />
          </div>
        </section>
      </div>

      {/* ── Log Work Modal ── */}
      {logWorkTask && (
        <LogWorkModal
          task={logWorkTask}
          currentProgress={taskProgress[logWorkTask.id] ?? 0}
          onSave={handleLogWorkSave}
          onClose={() => setLogWorkTask(null)}
        />
      )}
    </div>
  );
}
