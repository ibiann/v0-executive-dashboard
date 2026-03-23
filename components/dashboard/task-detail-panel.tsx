"use client";

import { useState, useEffect } from "react";
import {
  X, Clock, Play, Pause, CheckCircle2, AlertTriangle, Upload,
  MessageCircle, FileText, ChevronRight, Lock, AlertCircle,
  AlertOctagon,
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
import { TaskCard, Phase } from "@/lib/mock-data";

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
}: TaskDetailPanelProps) {
  const [localProgress, setLocalProgress] = useState(progress);
  const [comments, setComments] = useState<Array<{ author: string; text: string; timestamp: string; isRejection?: boolean }>>([]);
  const [newComment, setNewComment] = useState("");

  // Sync progress from props
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  // Add rejection comment if provided
  useEffect(() => {
    if (rejectionComment && !comments.some((c) => c.isRejection)) {
      setComments((prev) => [
        {
          author: "Project Manager",
          text: rejectionComment,
          timestamp: new Date().toLocaleTimeString(),
          isRejection: true,
        },
        ...prev,
      ]);
    }
  }, [rejectionComment]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments((prev) => [
        {
          author: "You",
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
                <p className="text-xs text-muted-foreground mb-1">Task ID: {task.id}</p>
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
            {/* Rejection Alert - Top Priority */}
            {isRejected && rejectionComment && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">Task Rejected</p>
                    <p className="text-xs text-red-700 mt-2 bg-white rounded p-2 border border-red-200 italic">
                      "{rejectionComment}"
                    </p>
                    <p className="text-[10px] text-red-600 mt-2">Please address the feedback and resubmit.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description Section */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Nhiệm vụ chi tiết (Task Description)
              </h3>
              <div className="bg-muted/30 rounded-lg p-3 border border-border text-xs text-muted-foreground">
                {task.description || <span className="italic">No description provided yet.</span>}
              </div>
            </div>

            {/* Definition of Done */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Tiêu chí hoàn thành (Definition of Done)
              </h3>
              <div className="space-y-2">
                {[
                  "Code passes all unit tests",
                  "Technical documentation completed",
                  "Peer review approved",
                  "No new defects introduced",
                ].map((criterion, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" defaultChecked={idx < 2} className="rounded border-border" />
                    <span className="text-muted-foreground">{criterion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                Tài liệu (Attachments)
              </h3>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Drag and drop files or click to upload</p>
                <button className="text-xs font-semibold text-primary hover:underline">Upload Evidence</button>
              </div>
            </div>

            {/* Communication / Comments */}
            <div>
              <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                Bình luận (Comments &amp; Activity)
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded-lg text-xs",
                      comment.isRejection
                        ? "bg-red-50 border border-red-200"
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
                  placeholder="Add a comment..."
                  className="flex-1 text-xs border border-border rounded px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Send
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
                Live Timer
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
                Start
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
                Pause
              </button>
            </div>
          </div>

          {/* Planned vs Actual Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Time Consumption</span>
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
                Over Budget
              </p>
            )}
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Progress</span>
              <span className="text-xs font-bold text-primary">{localProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localProgress}
              onChange={(e) => setLocalProgress(parseInt(e.target.value))}
              className="w-full"
            />
            {localProgress < 100 && (
              <p className="text-[10px] text-amber-600 font-semibold">
                Must reach 100% to submit for review
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between text-xs bg-muted/30 rounded-lg p-2.5 border border-border">
            <span className="text-muted-foreground">Hạn chót (Due Date)</span>
            <span className="font-semibold text-foreground">{task.dueDate}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onLogWork}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-border rounded-lg py-2.5 hover:bg-muted transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Log Work
            </button>
            <button
              onClick={onFinishReview}
              disabled={!canFinish}
              title={canFinish ? "Submit for PM review" : "Vui lòng hoàn thành 100% để gửi phê duyệt"}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2.5 transition-colors",
                canFinish
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Finish &amp; Review
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
