"use client";

import { useState, useEffect } from "react";
import {
  X, Clock, Play, Pause, CheckCircle2, AlertTriangle, Upload,
  MessageCircle, FileText, ChevronRight, AlertCircle,
  ClipboardList, ChevronDown, ChevronUp, Lock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { TaskCard, Phase, LogWorkEntry } from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";

interface TaskDetailPanelProps {
  task: TaskCard;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onLogWork: () => void;
  onFinishReview: () => void;
  timerRunning?: boolean;
  elapsedSeconds?: number;
  progress?: number;
  actualHours?: number;
  onTimerStart?: () => void;
  onTimerPause?: () => void;
  rejectionComment?: string;
  workLogs?: LogWorkEntry[];
}

const PHASE_COLORS: Record<Phase, string> = {
  Survey: "bg-slate-100 text-slate-700 border-slate-300",
  "R&D": "bg-blue-100 text-blue-700 border-blue-300",
  Test: "bg-amber-100 text-amber-700 border-amber-300",
  Release: "bg-green-100 text-green-700 border-green-300",
};

const STATUS_COLORS: Record<string, string> = {
  "New": "bg-slate-100 text-slate-700 border-slate-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "Waiting for Review": "bg-amber-100 text-amber-700 border-amber-300",
  "Review": "bg-purple-100 text-purple-700 border-purple-300",
  "Done": "bg-green-100 text-green-700 border-green-300",
  "Rejected": "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "bg-red-100 text-red-700 border-red-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
  low: "bg-green-100 text-green-700 border-green-300",
};

function fmtSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TaskDetailPanel({
  task,
  projectName,
  isOpen,
  onClose,
  onLogWork,
  onFinishReview,
  timerRunning = false,
  elapsedSeconds = 0,
  progress = 0,
  actualHours = 0,
  onTimerStart,
  onTimerPause,
  rejectionComment,
  workLogs = [],
}: TaskDetailPanelProps) {
  const { t, lang } = useLang();
  const [localProgress, setLocalProgress] = useState(progress);
  const [comments, setComments] = useState<Array<{ author: string; text: string; timestamp: string; isRejection?: boolean; isWorkLog?: boolean }>>([]);
  const [newComment, setNewComment] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);

  // Sync progress from props
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  // Add rejection comment if provided
  useEffect(() => {
    if (rejectionComment && !comments.some((c) => c.isRejection)) {
      setComments((prev) => [
        {
          author: lang === "vi" ? "Quản lý dự án" : "Project Manager",
          text: rejectionComment,
          timestamp: new Date().toLocaleTimeString(),
          isRejection: true,
        },
        ...prev,
      ]);
    }
  }, [rejectionComment, lang]);

  // Inject work logs into chatter
  useEffect(() => {
    if (!workLogs.length) return;
    const logEntries = workLogs
      .filter((log) => log.taskId === task.id)
      .map((log) => ({
        author: lang === "vi" ? "Kỹ sư" : "Engineer",
        text: `[${lang === "vi" ? "Ghi nhận công việc" : "Work Log"}] ${log.description} — ${log.loggedHours}h (${log.date})`,
        timestamp: log.date,
        isWorkLog: true,
      }));
    if (logEntries.length) {
      setComments((prev) => {
        const nonLogs = prev.filter((c) => !c.isWorkLog);
        return [...logEntries, ...nonLogs];
      });
    }
  }, [workLogs, task.id, lang]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments((prev) => [
        {
          author: lang === "vi" ? "Bạn" : "You",
          text: newComment,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      setNewComment("");
    }
  };

  const isRejected = task.status === "Rejected" || rejectionComment;
  const canFinish = localProgress >= 100;
  const plannedHours = task.plannedHours ?? 0;
  const isOverBudget = actualHours > plannedHours;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[600px] md:w-[750px] max-w-4xl flex flex-col p-0">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <SheetHeader className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{t("taskId")}: {task.id}</p>
                <SheetTitle className="text-lg font-bold text-foreground line-clamp-2">{task.title}</SheetTitle>
                <SheetDescription className="sr-only">
                  Task detail panel for {task.id} — {task.phase} phase, {task.status} status.
                </SheetDescription>
              </div>
              <SheetClose className="shrink-0">
                <X className="w-4 h-4" />
              </SheetClose>
            </div>

            {/* Status & Breadcrumbs */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", STATUS_COLORS[task.status])}>
                  {task.status}
                </span>
                <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full border", PRIORITY_COLORS[task.priority])}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{projectName}</span>
                <ChevronRight className="w-3 h-3" />
                <span className={cn("font-semibold px-2 py-0.5 rounded border", PHASE_COLORS[task.phase])}>
                  {task.phase}
                </span>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4">
            {/* Rejection Alert */}
            {isRejected && rejectionComment && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">
                      {lang === "vi" ? "Nhiệm vụ bị từ chối" : "Task Rejected"}
                    </p>
                    <p className="text-xs text-red-700 mt-2 bg-white rounded p-2 border border-red-200 italic">
                      "{rejectionComment}"
                    </p>
                    <p className="text-[10px] text-red-600 mt-2">
                      {lang === "vi"
                        ? "Vui lòng xử lý phản hồi và gửi lại."
                        : "Please address the feedback and resubmit."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                {lang === "vi" ? "Nhiệm vụ chi tiết" : "Task Description"}
              </h3>
              <div className="bg-muted/30 rounded-lg p-3 border border-border text-xs text-muted-foreground leading-relaxed">
                {task.description || (
                  <span className="italic">
                    {lang === "vi" ? "Chưa có mô tả." : "No description provided yet."}
                  </span>
                )}
              </div>
            </div>

            {/* Sub-tasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <button
                  onClick={() => setShowSubtasks((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-bold text-foreground mb-2"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    {lang === "vi" ? "Công việc con" : "Sub-tasks"}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">
                      ({task.subtasks.filter((s) => s.done).length}/{task.subtasks.length})
                    </span>
                  </span>
                  {showSubtasks ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {showSubtasks && (
                  <div className="space-y-1.5 pl-1">
                    {task.subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 text-xs p-2 rounded border border-border bg-muted/20">
                        <input
                          type="checkbox"
                          defaultChecked={sub.done}
                          className="rounded border-border accent-primary"
                          readOnly
                        />
                        <span className={cn("flex-1", sub.done && "line-through text-muted-foreground")}>
                          {sub.title}
                        </span>
                        {sub.assignee && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {sub.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Definition of Done */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                {lang === "vi" ? "Tiêu chí hoàn thành" : "Definition of Done"}
              </h3>
              <div className="space-y-2">
                {(lang === "vi"
                  ? ["Mã nguồn vượt qua kiểm tra đơn vị", "Tài liệu kỹ thuật hoàn chỉnh", "Đánh giá ngang hàng được phê duyệt", "Không có lỗi mới phát sinh"]
                  : ["Code passes all unit tests", "Technical documentation completed", "Peer review approved", "No new defects introduced"]
                ).map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" defaultChecked={idx < 2} className="rounded border-border accent-primary" />
                    <span className="text-muted-foreground">{criterion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                {lang === "vi" ? "Tài liệu đính kèm" : "Attachments"}
              </h3>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {lang === "vi" ? "Kéo thả hoặc nhấn để tải lên" : "Drag and drop files or click to upload"}
                </p>
                <button className="text-xs font-semibold text-primary hover:underline">
                  {lang === "vi" ? "Tải lên bằng chứng" : "Upload Evidence"}
                </button>
              </div>
            </div>

            {/* Chatter / Comments */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                {lang === "vi" ? "Bình luận & Hoạt động" : "Comments & Activity"}
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    {lang === "vi" ? "Chưa có hoạt động nào." : "No activity yet."}
                  </p>
                )}
                {comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded-lg text-xs",
                      comment.isRejection
                        ? "bg-red-50 border border-red-200"
                        : comment.isWorkLog
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/50 border border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn("font-semibold", comment.isRejection ? "text-red-700" : "text-foreground")}>
                        {comment.author}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    <p className={comment.isRejection ? "text-red-600" : "text-muted-foreground"}>{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={lang === "vi" ? "Thêm bình luận..." : "Add a comment..."}
                  className="flex-1 text-xs border border-border rounded px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {lang === "vi" ? "Gửi" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-40 border-t border-border bg-card p-4 space-y-4">
          {/* Timer Control */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {lang === "vi" ? "Bộ đếm giờ" : "Live Timer"}
              </span>
              <span className="text-lg font-mono font-bold text-primary">{fmtSeconds(elapsedSeconds)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onTimerStart}
                disabled={timerRunning}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition-colors",
                  timerRunning
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                <Play className="w-3.5 h-3.5" />
                {lang === "vi" ? "Bắt đầu" : "Start"}
              </button>
              <button
                onClick={onTimerPause}
                disabled={!timerRunning}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition-colors",
                  !timerRunning
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                )}
              >
                <Pause className="w-3.5 h-3.5" />
                {lang === "vi" ? "Dừng" : "Pause"}
              </button>
            </div>
          </div>

          {/* Planned vs Actual Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {lang === "vi" ? "Thời gian sử dụng" : "Time Consumption"}
              </span>
              <span className={cn("font-bold", isOverBudget ? "text-red-600" : "text-green-600")}>
                {actualHours.toFixed(1)}h of {plannedHours}h
              </span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", isOverBudget ? "bg-red-500" : "bg-primary")}
                style={{ width: `${Math.min((actualHours / plannedHours) * 100, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lang === "vi" ? "Vượt ngân sách" : "Over Budget"}
              </p>
            )}
          </div>

          {/* Progress Slider — with validation constraints */}
          {(() => {
            // --- Rule 3: Auto-calc from subtasks ---
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const subtaskTotal = task.subtasks?.length ?? 0;
            const subtaskDone  = task.subtasks?.filter((s) => s.done).length ?? 0;
            const subtaskProgress = hasSubtasks
              ? Math.round((subtaskDone / subtaskTotal) * 100)
              : null;

            // --- Rule 4: Criteria gate at 90% ---
            const criteriaItems = lang === "vi"
              ? ["Mã nguồn vượt qua kiểm tra đơn vị", "Tài liệu kỹ thuật hoàn chỉnh", "Đánh giá ngang hàng được phê duyệt", "Không có lỗi mới phát sinh"]
              : ["Code passes all unit tests", "Technical documentation completed", "Peer review approved", "No new defects introduced"];
            // Mirrors the defaultChecked={idx < 2} from the DoD section — first 2 checked
            const criteriaCheckedCount = 2;
            const allCriteriaDone = criteriaCheckedCount >= criteriaItems.length;

            // --- Rule 1: Only increase — slider min = saved progress ---
            const savedProgress = progress; // prop = last saved value
            const sliderMin = hasSubtasks ? 0 : savedProgress;

            // --- Rule 2: Max +20% per update ---
            const rawMax = hasSubtasks ? 100 : Math.min(savedProgress + 20, 100);
            // --- Rule 4: Cap at 90% if criteria incomplete ---
            const sliderMax = (!allCriteriaDone && rawMax > 90) ? 90 : rawMax;

            const isSliderDisabled = hasSubtasks;
            const displayValue = hasSubtasks ? subtaskProgress! : localProgress;

            // Clamp localProgress into valid range whenever rules change
            const clampedDisplay = Math.min(Math.max(displayValue, sliderMin), sliderMax);

            // Determine color of filled track
            const trackPct = sliderMax > sliderMin
              ? ((clampedDisplay - sliderMin) / (sliderMax - sliderMin)) * 100
              : 100;

            return (
              <div className="space-y-2">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {lang === "vi" ? "Tiến độ" : "Progress"}
                    {isSliderDisabled && (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    )}
                  </span>
                  <span className="text-xs font-bold text-primary">{clampedDisplay}%</span>
                </div>

                {/* Slider track wrapper — shows grayed-out zone beyond sliderMax */}
                <div className="relative w-full">
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={5}
                    value={clampedDisplay}
                    disabled={isSliderDisabled}
                    title={isSliderDisabled ? "Tiến độ chỉ có thể tăng" : undefined}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      // Rule 1: enforce only-increase
                      if (v >= savedProgress) setLocalProgress(v);
                    }}
                    className={cn(
                      "w-full h-2 rounded-full appearance-none transition-all",
                      isSliderDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    )}
                    style={{
                      background: isSliderDisabled
                        ? `linear-gradient(to right, hsl(var(--muted-foreground)/0.3) ${trackPct}%, hsl(var(--secondary)) ${trackPct}%)`
                        : `linear-gradient(to right, var(--primary) ${trackPct}%, ${sliderMax < 100 ? "hsl(var(--secondary)) " + trackPct + "%, hsl(var(--border)/0.4) " + trackPct + "%" : "hsl(var(--secondary)) " + trackPct + "%"})`,
                    }}
                  />
                  {/* Grayed-out cap zone: from sliderMax to 100 */}
                  {!isSliderDisabled && sliderMax < 100 && (
                    <div
                      className="absolute top-0 right-0 h-2 rounded-r-full bg-border/60 pointer-events-none"
                      style={{ width: `${100 - sliderMax}%` }}
                      title={lang === "vi" ? "Vùng bị khóa" : "Locked zone"}
                    />
                  )}
                </div>

                {/* Scale ticks */}
                <div className="flex justify-between text-[10px] text-muted-foreground select-none">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span className={allCriteriaDone ? "text-green-600 font-semibold" : ""}>100%</span>
                </div>

                {/* Rule 1 hint: lock icon tooltip text */}
                {!isSliderDisabled && savedProgress > 0 && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {lang === "vi" ? "Tiến độ chỉ có thể tăng" : "Progress can only increase"}
                  </p>
                )}

                {/* Rule 2 hint: +20% cap */}
                {!isSliderDisabled && sliderMax < 100 && allCriteriaDone && (
                  <p className="text-[10px] text-amber-600 font-semibold">
                    {lang === "vi"
                      ? `Tối đa +20% mỗi lần cập nhật (tối đa ${sliderMax}%)`
                      : `Max +20% per update (up to ${sliderMax}%)`}
                  </p>
                )}

                {/* Rule 3 hint: auto-calc from subtasks */}
                {isSliderDisabled && (
                  <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" />
                    {lang === "vi"
                      ? `Tự động tính từ công việc con (${subtaskDone}/${subtaskTotal} = ${subtaskProgress}%)`
                      : `Auto-calculated from sub-tasks (${subtaskDone}/${subtaskTotal} = ${subtaskProgress}%)`}
                  </p>
                )}

                {/* Rule 4 hint: criteria gate */}
                {!isSliderDisabled && !allCriteriaDone && (
                  <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {lang === "vi"
                      ? "Hoàn thành tiêu chí để đạt 100%"
                      : "Complete all criteria to reach 100%"}
                  </p>
                )}

                {/* Generic 100% nudge (only when no other hint is shown) */}
                {!isSliderDisabled && allCriteriaDone && clampedDisplay >= sliderMax && sliderMax === 100 && clampedDisplay < 100 && (
                  <p className="text-[10px] text-amber-600 font-semibold">
                    {lang === "vi" ? "Phải đạt 100% để gửi phê duyệt" : "Must reach 100% to submit for review"}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Due Date */}
          <div className="flex items-center justify-between text-xs bg-muted/30 rounded-lg p-2.5 border border-border">
            <span className="text-muted-foreground">
              {lang === "vi" ? "Hạn chót" : "Due Date"}
            </span>
            <span className="font-semibold text-foreground">{task.dueDate}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onLogWork}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-border rounded-lg py-2.5 hover:bg-muted transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {t("logWork")}
            </button>
            <button
              onClick={onFinishReview}
              disabled={!canFinish}
              title={canFinish ? t("finishReview") : (lang === "vi" ? "Vui lòng hoàn thành 100% để gửi phê duyệt" : "Complete 100% to submit for review")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2.5 transition-colors",
                canFinish
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("finishReview")}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
