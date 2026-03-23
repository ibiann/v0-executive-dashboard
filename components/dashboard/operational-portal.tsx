"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, BookOpen, MapPin, ClipboardList, Bell,
  Play, Pause, CheckCircle, AlertTriangle, Clock,
  ChevronRight, X, CalendarDays, Timer, FileEdit,
  SlidersHorizontal, LogOut, Plus, Check, Lock,
  Briefcase, ArrowLeft, Filter,
} from "lucide-react";
import {
  TACTICAL_DATA,
  ENGINEER_PROFILE,
  EngineerProfile,
  EngineerProjectMembership,
  EngNotification,
  LogWorkEntry,
  TaskCard,
  RAGStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { TaskDetailPanel } from "./task-detail-panel";
import { JustificationModal, JustificationData } from "./justification-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type RunState      = "idle" | "running" | "paused";
type ActiveSection = "home" | "projects" | "tasks" | "timesheets" | "documents";

interface TaskRunState    { [taskId: string]: RunState }
interface TaskProgress    { [taskId: string]: number }
interface TaskElapsed     { [taskId: string]: number }
interface TaskActualHours { [taskId: string]: number }

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

// ─── Constraint Helpers ───────────────────────────────────────────────────────

function isOverBudget(actualHours: number, plannedHours: number | undefined): boolean {
  return plannedHours ? actualHours > plannedHours : false;
}

function calculateSPI(
  progressPercent: number,
  elapsedSeconds: number,
  plannedHours: number | undefined
): number {
  if (!plannedHours || plannedHours === 0) return 1;
  const elapsedHours = elapsedSeconds / 3600;
  const plannedProgressHours = (plannedHours * progressPercent) / 100;
  return plannedProgressHours > 0 ? elapsedHours / plannedProgressHours : 1;
}

function isDailyHoursLow(todayLogs: LogWorkEntry[]): boolean {
  const dailyTotal = todayLogs.reduce((sum, log) => sum + log.loggedHours, 0);
  return dailyTotal < 8;
}

function isDescriptionTooShort(description: string): boolean {
  return description.trim().length < 20;
}

function getCurrentHourOfDay(): number {
  return new Date().getHours() + new Date().getMinutes() / 60;
}

function isEndOfDay(): boolean {
  return getCurrentHourOfDay() >= 17.5; // 5:30 PM
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
  prefillHours?: number;
  isFinalLog?: boolean;
  onSave: (entry: Omit<LogWorkEntry, "id">) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [date, setDate]               = useState(TODAY);
  const [hours, setHours]             = useState<number | "">(prefillHours ?? "");
  const [description, setDescription] = useState("");
  const [progress, setProgress]       = useState(isFinalLog ? 100 : currentProgress);

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", isFinalLog ? "bg-green-100" : "bg-primary/10")}>
              {isFinalLog
                ? <CheckCircle className="w-4 h-4 text-green-600" />
                : <FileEdit className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isFinalLog ? t("finishReview") : t("logWork")}
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

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Date
            </label>
            <input
              type="date" value={date} max={TODAY}
              onChange={(e) => setDate(e.target.value)} required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              {t("actualHours")}
              {prefillHours !== undefined && (
                <span className="ml-auto text-[10px] text-primary font-normal">(auto-filled from timer)</span>
              )}
            </label>
            <input
              type="number" min={0.5} max={24} step={0.5} value={hours}
              onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 4.5" required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {isFinalLog ? t("finishReview") : t("description")}
              <span className="text-destructive ml-0.5">*</span>
              <span className={cn(
                "ml-auto text-[10px] font-normal",
                isDescriptionTooShort(description) ? "text-red-600 font-semibold" : "text-muted-foreground"
              )}>
                {description.trim().length}/20 {isDescriptionTooShort(description) && `(${t("descriptionMin")})`}
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isFinalLog
                ? "Describe what was achieved, test results, known issues, and sign-off notes..."
                : "Describe the work completed, issues encountered, next steps..."}
              rows={4} required
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring",
                isDescriptionTooShort(description) ? "border-red-300 focus:ring-red-200" : "border-border focus:ring-ring"
              )}
            />
            {isDescriptionTooShort(description) && (
              <p className="text-[10px] text-red-600 font-medium">Description must be at least 20 characters to ensure quality documentation.</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                {t("progress")}
              </label>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5} value={progress}
              disabled={isFinalLog}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, var(--primary) ${progress}%, var(--secondary) ${progress}%)` }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span>
              <span className={cn(isFinalLog && "text-green-600 font-semibold")}>100%</span>
            </div>
            {isFinalLog && (
              <p className="text-[10px] text-green-600 font-medium">Progress locked to 100% for final completion.</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!hours || Number(hours) <= 0 || !description.trim() || isDescriptionTooShort(description)}
              title={
                isDescriptionTooShort(description)
                  ? "Description must be at least 20 characters"
                  : !description.trim()
                  ? "Description is required"
                  : undefined
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                !hours || Number(hours) <= 0 || !description.trim() || isDescriptionTooShort(description)
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : isFinalLog
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Check className="w-4 h-4" />
              {isFinalLog ? t("submit") : t("save")}
            </button>
            {!isFinalLog && (
              <button
                type="button" onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Live Timer Display ──────────────────────────────────────────────��────────

function TimerDisplay({ elapsed }: { elapsed: number }) {
  return (
    <span className="font-mono text-xs tabular-nums text-primary font-bold">
      {fmtSeconds(elapsed)}
    </span>
  );
}

// ─── Priority / Phase colour maps ─────────────────────────────────────────────

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

const RAG_DOT: Record<RAGStatus, string> = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  red:   "bg-red-500",
};

// ─── Task Card ────────────────────────────────────────────────────────────────

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
  onTaskClick,
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
  onTaskClick?: () => void;
}) {
  const isLocked  = task.status === "Waiting for Review" || task.status === "Done";
  const isWaiting = task.status === "Waiting for Review";
  const spi = calculateSPI(progress, elapsed, task.plannedHours);
  const isAtRisk = spi < 0.8 && progress > 0;
  const { t } = useLang();

  return (
    <div
      onClick={onTaskClick}
      className={cn(
        "bg-card border rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-all cursor-pointer",
        runState === "running"
          ? "border-primary/40 ring-1 ring-primary/20 shadow-md"
          : isWaiting
          ? "animate-pulse-border border-amber-400"
          : isAtRisk
          ? "border-orange-300 ring-1 ring-orange-100"
          : "border-border hover:shadow-md hover:border-primary/20",
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
            {isAtRisk && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-700 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                At Risk (SPI {spi.toFixed(2)})
              </span>
            )}
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

      {/* Planned / Actual hours with budget constraint indicator */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="text-muted-foreground">
          Planned: <span className="font-semibold text-foreground">{task.plannedHours ?? "—"}h</span>
        </span>
        <span className="text-muted-foreground">
          Actual: <span className={cn("font-semibold", actualHours > (task.plannedHours ?? Infinity) ? "text-red-600" : "text-foreground")}>{actualHours}h</span>
        </span>
        {isOverBudget(actualHours, task.plannedHours) && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
            <AlertTriangle className="w-2.5 h-2.5" />
            Over Budget
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
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Waiting chip */}
      {isWaiting && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Waiting for PM Review — task locked
        </div>
      )}

      {/* Action buttons */}
      {!isLocked && (
        <div className="flex flex-col gap-2">
          {!task.plannedHours && runState !== "running" && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>PM chua dat <strong>Thoi gian du kien</strong>. Khong the bat dau nhiem vu nay.</span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {runState !== "running" ? (
              <button
                onClick={onStart}
                disabled={!task.plannedHours}
                title={!task.plannedHours ? "Planned Hours not set — PM must configure this task first." : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors",
                  task.plannedHours
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                )}
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
              {t("logWork")}
            </button>
            <button
              onClick={onFinishReview}
              disabled={progress < 100}
              title={progress < 100 ? `${t("progress")}: ${progress}% — ${t("finishReview")}` : t("finishReview")}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors",
                progress >= 100
                  ? "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border border-muted bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
              )}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {t("finishReview")}
            </button>
          </div>
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
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count?: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 bg-card border rounded-xl p-5 transition-all group text-center",
        active
          ? "border-primary ring-1 ring-primary/30 shadow-md"
          : "border-border hover:shadow-md hover:border-primary/30"
      )}
    >
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={cn("text-sm font-semibold transition-colors", active ? "text-primary" : "text-foreground group-hover:text-primary")}>
          {label}
        </p>
        {count !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
        )}
      </div>
      <ChevronRight className={cn("w-3.5 h-3.5 transition-colors", active ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary")} />
    </button>
  );
}

// ─── Du an cua toi (My Projects View) ────────────────────────────────────────

function MyProjectsView({
  projects,
  onSelectProject,
  activeProjectId,
}: {
  projects: EngineerProjectMembership[];
  onSelectProject: (projectId: string) => void;
  activeProjectId: string | null;
}) {
  return (
    <div className="space-y-3">
      {projects.map((p) => {
        const pct = Math.round((p.overallProgress / p.plannedProgress) * 100);
        const isActive = p.projectId === activeProjectId;
        return (
          <button
            key={p.projectId}
            onClick={() => onSelectProject(p.projectId)}
            className={cn(
              "w-full text-left bg-card border rounded-xl p-4 hover:shadow-md transition-all group",
              isActive ? "border-primary ring-1 ring-primary/30 shadow-sm" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", RAG_DOT[p.ragStatus])} />
                  <p className={cn("text-sm font-semibold leading-tight group-hover:text-primary transition-colors", isActive && "text-primary")}>
                    {p.projectName}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {p.roleInProject}
                  </span>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", PHASE_COLOR[p.phase])}>
                    {p.phase}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-bold text-foreground">{p.overallProgress}%</span>
                <span className="text-[10px] text-muted-foreground">of {p.plannedProgress}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 space-y-1">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", p.ragStatus === "red" ? "bg-red-500" : p.ragStatus === "amber" ? "bg-amber-400" : "bg-green-500")}
                  style={{ width: `${p.overallProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                SPI: {(p.overallProgress / p.plannedProgress).toFixed(2)} &middot; {isActive ? "Viewing tasks" : "Click to filter tasks"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
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

// ─── Section Header with Back ─────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
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

  // All tasks from all projects this engineer is assigned to
  const [allTasks, setAllTasks] = useState<(TaskCard & { projectId: string; projectName: string })[]>(() => {
    const result: (TaskCard & { projectId: string; projectName: string })[] = [];
    profile.projects.forEach((proj) => {
      const td = TACTICAL_DATA[proj.projectId];
      if (td) {
        td.tasks
          .filter((t) => t.assigneeId === profile.memberId)
          .forEach((t) => result.push({ ...t, projectId: proj.projectId, projectName: proj.projectName }));
      }
    });
    return result;
  });

  // Active project filter (null = show all)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const tasks = activeProjectId
    ? allTasks.filter((t) => t.projectId === activeProjectId)
    : allTasks;

  // Progress per task
  const [taskProgress, setTaskProgress] = useState<TaskProgress>(() => {
    const init: TaskProgress = {};
    allTasks.forEach((t) => { init[t.id] = 0; });
    profile.logWorkHistory.forEach((lw) => { init[lw.taskId] = lw.progressPercent; });
    return init;
  });

  // Run state per task
  const [runState, setRunState] = useState<TaskRunState>(() => {
    const init: TaskRunState = {};
    allTasks.forEach((t) => { init[t.id] = "idle"; });
    return init;
  });

  // Elapsed time per task (seconds)
  const [elapsed, setElapsed] = useState<TaskElapsed>(() => {
    const init: TaskElapsed = {};
    allTasks.forEach((t) => { init[t.id] = 0; });
    return init;
  });

  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningTaskRef   = useRef<string | null>(null);

  // Actual hours logged per task
  const [actualHours, setActualHours] = useState<TaskActualHours>(() => {
    const init: TaskActualHours = {};
    allTasks.forEach((t) => { init[t.id] = 0; });
    profile.logWorkHistory.forEach((lw) => { init[lw.taskId] = (init[lw.taskId] ?? 0) + lw.loggedHours; });
    return init;
  });

  const [logWorkHistory, setLogWorkHistory] = useState<(LogWorkEntry & { approved?: boolean })[]>(
    profile.logWorkHistory.map((lw) => ({ ...lw, approved: false }))
  );

  const [notifications, setNotifications] = useState<EngNotification[]>(profile.notifications);
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [logModal, setLogModal] = useState<{ task: TaskCard; mode: "logwork" | "finish" } | null>(null);
  const [justifyModal, setJustifyModal] = useState<{ task: TaskCard } | null>(null);

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const runningId = Object.keys(runState).find((id) => runState[id] === "running") ?? null;
    runningTaskRef.current = runningId;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (runningId) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => ({ ...prev, [runningId]: (prev[runningId] ?? 0) + 1 }));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [runState]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleJustificationSubmit = useCallback((_data: JustificationData) => {
    // Justification accepted — proceed to the final log work modal
    if (!justifyModal) return;
    const task = justifyModal.task;
    setJustifyModal(null);
    setLogModal({ task, mode: "finish" });
  }, [justifyModal]);

  const handleStart = useCallback((taskId: string) => {
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

  const handleOpenLogWork = useCallback((task: TaskCard) => {
    setLogModal({ task, mode: "logwork" });
  }, []);

  const handleFinishReview = useCallback((task: TaskCard) => {
    setRunState((prev) => ({ ...prev, [task.id]: "paused" }));
    const actual  = actualHours[task.id] ?? 0;
    const planned = task.plannedHours;
    // Constraint: if over-budget, require justification before LogWork modal
    if (planned && actual > planned) {
      setJustifyModal({ task });
    } else {
      setLogModal({ task, mode: "finish" });
    }
  }, [actualHours]);

  const handleLogWorkSave = useCallback(
    (entry: Omit<LogWorkEntry, "id">, isFinal: boolean) => {
      const id   = `LW-${Date.now()}`;
      const full = { ...entry, id, approved: false };
      setLogWorkHistory((prev) => [...prev, full]);
      setTaskProgress((prev) => ({ ...prev, [entry.taskId]: entry.progressPercent }));
      setActualHours((prev) => ({ ...prev, [entry.taskId]: (prev[entry.taskId] ?? 0) + entry.loggedHours }));

      if (isFinal) {
        setAllTasks((prev) =>
          prev.map((t) => (t.id === entry.taskId ? { ...t, status: "Waiting for Review" } : t))
        );
        setRunState((prev) => ({ ...prev, [entry.taskId]: "idle" }));
        setElapsed((prev)  => ({ ...prev, [entry.taskId]: 0 }));
        onNotifyPM?.({
          type: "assigned",
          title: "Task Ready for Review",
          body: `${profile.name} submitted "${entry.taskTitle}" for your approval (100% complete).`,
          timestamp: new Date().toISOString(),
        });
      }

      onLogWorkSubmit?.(entry.taskId, entry);
      setLogModal(null);
    },
    [profile.name, onLogWorkSubmit, onNotifyPM]
  );

  const handleMarkRead    = useCallback((id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)), []);
  const handleMarkAllRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);

  const handleSelectProject = useCallback((projectId: string) => {
    setActiveProjectId((prev) => prev === projectId ? null : projectId);
    setActiveSection("tasks");
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeTasks   = tasks.filter((t) => t.status !== "Done");
  const unread        = notifications.filter((n) => !n.read).length;
  const pendingCount  = logWorkHistory.filter((e) => !e.approved).length;
  const approvedCount = logWorkHistory.filter((e) => e.approved).length;

  const prefillForModal      = logModal ? hoursFromSeconds(elapsed[logModal.task.id] ?? 0) : undefined;
  const hasMeaningfulElapsed = logModal ? (elapsed[logModal.task.id] ?? 0) > 30 : false;

  const activeProject = activeProjectId
    ? profile.projects.find((p) => p.projectId === activeProjectId)
    : null;

  // ── Render sections ──────────────────────────────────────────────────────────

  function renderHome() {
    return (
      <>
        {/* Workspace tiles */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            My Workspace
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <PortalTile
              icon={Briefcase}
              label="Du an cua toi"
              count={profile.projects.length}
              color="bg-indigo-100 text-indigo-700"
              active={activeSection === "projects"}
              onClick={() => setActiveSection("projects")}
            />
            <PortalTile
              icon={ClipboardList}
              label="Cong viec cua toi"
              count={activeTasks.length}
              color="bg-primary/10 text-primary"
              active={activeSection === "tasks"}
              onClick={() => { setActiveProjectId(null); setActiveSection("tasks"); }}
            />
            <PortalTile
              icon={Clock}
              label="Bang cham cong"
              count={logWorkHistory.length}
              color="bg-blue-100 text-blue-700"
              active={activeSection === "timesheets"}
              onClick={() => setActiveSection("timesheets")}
            />
            <PortalTile
              icon={FileText}
              label="Tai lieu"
              color="bg-teal-100 text-teal-700"
              active={activeSection === "documents"}
              onClick={() => setActiveSection("documents")}
            />
            <PortalTile icon={BookOpen} label="Kien thuc" color="bg-violet-100 text-violet-700" />
          </div>
        </section>

        {/* Quick-access: recent tasks */}
        <section>
          <SectionHeader
            title="Cong viec gan day"
            subtitle={`${activeTasks.length} active across ${profile.projects.length} projects`}
            action={
              <button
                onClick={() => setActiveSection("tasks")}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Xem tat ca <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          {activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl py-8 text-center gap-2">
              <CheckCircle className="w-7 h-7 text-green-500" />
              <p className="text-sm font-semibold text-foreground">All tasks complete</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeTasks.slice(0, 3).map((task) => (
                  <MyTaskCard
                    key={task.id}
                    task={task}
                    progress={taskProgress[task.id] ?? 0}
                    runState={runState[task.id] ?? "idle"}
                    elapsed={elapsed[task.id] ?? 0}
                    actualHours={actualHours[task.id] ?? 0}
                    projectName={task.projectName}
                    onStart={() => handleStart(task.id)}
                    onPause={() => handlePause(task.id)}
                    onFinishReview={() => handleFinishReview(task)}
                    onLogWork={() => handleOpenLogWork(task)}
                    onTaskClick={() => setSelectedTask(task)}
                  />
              ))}
            </div>
          )}
        </section>

        {/* Quick-access: recent timesheets */}
        <section>
          <SectionHeader
            title="Bang cham cong gan day"
            subtitle={`${pendingCount} pending · ${approvedCount} approved`}
            action={
              <button
                onClick={() => setActiveSection("timesheets")}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Xem tat ca <ChevronRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <BangChamCong history={logWorkHistory.slice(-5)} />
          </div>
        </section>
      </>
    );
  }

  function renderProjects() {
    return (
      <section>
        <SectionHeader
          title="Du an cua toi"
          subtitle={`${profile.projects.length} project${profile.projects.length !== 1 ? "s" : ""} — click a project to filter tasks`}
          onBack={() => setActiveSection("home")}
        />
        <MyProjectsView
          projects={profile.projects}
          onSelectProject={handleSelectProject}
          activeProjectId={activeProjectId}
        />
      </section>
    );
  }

  function renderTasks() {
    return (
      <section>
        <SectionHeader
          title="Cong viec cua toi"
          subtitle={
            activeProject
              ? `Filtered: ${activeProject.projectName} · ${activeTasks.length} active`
              : `${activeTasks.length} active across all projects`
          }
          onBack={() => setActiveSection("home")}
          action={
            activeProject ? (
              <button
                onClick={() => setActiveProjectId(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-secondary transition-colors"
              >
                <Filter className="w-3 h-3" />
                {activeProject.projectName}
                <X className="w-3 h-3" />
              </button>
            ) : undefined
          }
        />
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl py-10 text-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-sm font-semibold text-foreground">No active tasks{activeProject ? ` in ${activeProject.projectName}` : ""}</p>
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
                projectName={task.projectName}
                onStart={() => handleStart(task.id)}
                onPause={() => handlePause(task.id)}
                onFinishReview={() => handleFinishReview(task)}
                onLogWork={() => handleOpenLogWork(task)}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderTimesheets() {
    return (
      <section>
        <SectionHeader
          title="Bang cham cong"
          subtitle={`${logWorkHistory.length} entries · ${pendingCount} pending · ${approvedCount} approved`}
          onBack={() => setActiveSection("home")}
        />
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <BangChamCong history={logWorkHistory} />
        </div>
      </section>
    );
  }

  function renderDocuments() {
    return (
      <section>
        <SectionHeader
          title="Tai lieu"
          subtitle="Project documents and attachments"
          onBack={() => setActiveSection("home")}
        />
        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl py-14 text-center gap-2">
          <FileText className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground">Documents shared by your PM will appear here.</p>
        </div>
      </section>
    );
  }

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
                {profile.role} · {profile.department} · {profile.projects.length} project{profile.projects.length !== 1 ? "s" : ""}
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

      {/* ── Main content ── */}
      <div className="flex-1 px-4 py-5 md:px-6 space-y-6">
        {activeSection === "home"        && renderHome()}
        {activeSection === "projects"    && renderProjects()}
        {activeSection === "tasks"       && renderTasks()}
        {activeSection === "timesheets"  && renderTimesheets()}
        {activeSection === "documents"   && renderDocuments()}
      </div>

      {/* ── End-of-Day Banner (5:30 PM check) ── */}
      {isEndOfDay() && (() => {
        const todayLogs = logWorkHistory.filter((log) => log.date === TODAY);
        const dailyTotal = todayLogs.reduce((sum, log) => sum + log.loggedHours, 0);
        const isLow = dailyTotal < 8;
        return isLow ? (
          <div className="sticky bottom-0 left-0 right-0 z-40 bg-amber-50 border-t border-amber-200 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900">End of Day — Daily Hours Below 8</p>
                <p className="text-xs text-amber-700 mt-0.5">You have logged {dailyTotal.toFixed(1)}h so far today. Target is 8h per day.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection("timesheets")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0"
            >
              View Timesheets
            </button>
          </div>
        ) : null;
      })()}

      {/* ── Justification Modal (over-budget gate) ── */}
      {justifyModal && (
        <JustificationModal
          taskId={justifyModal.task.id}
          taskTitle={justifyModal.task.title}
          plannedHours={justifyModal.task.plannedHours ?? 0}
          actualHours={actualHours[justifyModal.task.id] ?? 0}
          onSubmit={handleJustificationSubmit}
          onCancel={() => setJustifyModal(null)}
        />
      )}

      {/* ── Log Work / Finish & Review Modal ── */}
      {logModal && (
        <LogWorkModal
          task={logModal.task}
          currentProgress={taskProgress[logModal.task.id] ?? 0}
          prefillHours={hasMeaningfulElapsed ? prefillForModal : undefined}
          isFinalLog={logModal.mode === "finish"}
          onSave={(entry) => handleLogWorkSave(entry, logModal.mode === "finish")}
          onClose={() => setLogModal(null)}
        />
      )}

      {/* ── Task Detail Panel (Slide-over Drawer) ── */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectName={profile.projectName}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onLogWork={() => {
            handleOpenLogWork(selectedTask);
            setSelectedTask(null);
          }}
          onFinishReview={() => {
            handleFinishReview(selectedTask);
            setSelectedTask(null);
          }}
          timerRunning={runState[selectedTask.id] === "running"}
          elapsedSeconds={elapsed[selectedTask.id] ?? 0}
          progress={taskProgress[selectedTask.id] ?? 0}
          actualHours={actualHours[selectedTask.id] ?? 0}
          onTimerStart={() => handleStart(selectedTask.id)}
          onTimerPause={() => handlePause(selectedTask.id)}
        />
      )}
    </div>
  );
}
