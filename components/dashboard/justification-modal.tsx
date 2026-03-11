"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JustificationData {
  taskId: string;
  taskTitle: string;
  plannedHours: number;
  actualHours: number;
  category: string;
  detail: string;
}

interface JustificationModalProps {
  taskId: string;
  taskTitle: string;
  plannedHours: number;
  actualHours: number;
  onSubmit: (data: JustificationData) => void;
  onCancel: () => void;
}

const CAUSE_CATEGORIES = [
  { value: "scope_change",    label: "Thay đổi phạm vi / yêu cầu" },
  { value: "tech_complexity", label: "Độ phức tạp kỹ thuật cao hơn dự kiến" },
  { value: "blockers",        label: "Vướng mắc từ bên ngoài / phụ thuộc" },
  { value: "estimation_err",  label: "Lỗi ước lượng ban đầu" },
  { value: "rework",          label: "Cần làm lại / sửa lỗi phát sinh" },
  { value: "other",           label: "Nguyên nhân khác" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function JustificationModal({
  taskId,
  taskTitle,
  plannedHours,
  actualHours,
  onSubmit,
  onCancel,
}: JustificationModalProps) {
  const [category, setCategory] = useState("");
  const [detail, setDetail]     = useState("");

  const variance    = parseFloat((actualHours - plannedHours).toFixed(1));
  const canSubmit   = category !== "" && detail.trim().length >= 20;
  const detailShort = detail.trim().length < 20 && detail.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ taskId, taskTitle, plannedHours, actualHours, category, detail: detail.trim() });
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{ backgroundColor: "rgba(227, 108, 37, 0.10)" }}
        >
          <AlertTriangle
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "#E36C25" }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-foreground leading-tight font-sans">
              Báo cáo giải trình vượt định mức
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1"
               title={taskTitle}>
              {taskTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-black/10 transition-colors text-muted-foreground shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Hours Comparison ──────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2 grid grid-cols-3 gap-3">
          {/* Planned */}
          <div className="flex flex-col items-center rounded-lg border border-border bg-muted/40 px-3 py-2.5 gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Kế hoạch
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {plannedHours}h
            </span>
          </div>

          {/* Actual */}
          <div className="flex flex-col items-center rounded-lg border border-border bg-muted/40 px-3 py-2.5 gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Thực tế
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {actualHours}h
            </span>
          </div>

          {/* Variance — highlighted in red */}
          <div
            className="flex flex-col items-center rounded-lg border px-3 py-2.5 gap-0.5"
            style={{
              borderColor: "#fca5a5",
              backgroundColor: "rgba(239, 68, 68, 0.06)",
            }}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: "#ef4444" }}>
              Vượt định mức
            </span>
            <span
              className="font-mono text-base font-bold"
              style={{ color: "#ef4444" }}
            >
              +{variance}h
            </span>
          </div>
        </div>

        {/* ── Form Fields ───────────────────────────────────────────────── */}
        <div className="px-5 pt-3 pb-5 flex flex-col gap-4">
          {/* Category select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground font-sans">
              Phân loại nguyên nhân
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={cn(
                "w-full rounded-lg border bg-background text-sm px-3 py-2 text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                category === "" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <option value="" disabled>
                -- Chọn nguyên nhân --
              </option>
              {CAUSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detail textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground font-sans flex items-center justify-between">
              <span>
                Giải trình chi tiết
                <span className="text-red-500 ml-0.5">*</span>
              </span>
              <span className={cn(
                "font-normal text-[10px]",
                detailShort ? "text-red-500" : "text-muted-foreground"
              )}>
                {detail.trim().length}/20 ký tự tối thiểu
              </span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Mô tả chi tiết nguyên nhân vượt định mức, các hành động đã thực hiện và đề xuất cải tiến..."
              rows={4}
              required
              className={cn(
                "w-full rounded-lg border bg-background text-sm px-3 py-2 text-foreground resize-none",
                "focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                detailShort ? "border-red-300 focus:ring-red-200" : "border-border"
              )}
            />
            {detailShort && (
              <p className="text-[10px] text-red-500 font-medium">
                Vui lòng nhập ít nhất 20 ký tự để đảm bảo chất lượng báo cáo.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {/* Ghost cancel */}
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 text-sm font-semibold rounded-lg border border-border px-4 py-2.5 text-foreground hover:bg-muted/60 transition-colors"
            >
              Hủy
            </button>

            {/* Brand orange submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex-1 text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors",
                canSubmit
                  ? "text-white hover:opacity-90"
                  : "opacity-40 cursor-not-allowed text-white"
              )}
              style={{ backgroundColor: "#E36C25" }}
            >
              Gửi báo cáo
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
