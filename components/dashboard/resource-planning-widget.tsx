"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/app-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ResourceHeatmap } from "@/components/dashboard/resource-heatmap";
import { TeamMember, TaskCard } from "@/lib/mock-data";
import { Users, Clock, TrendingUp, AlertTriangle, ChevronRight, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeRow {
  member: TeamMember;
  projectIds: string[];
  projectNames: string[];
  monthHours: number;
  capacityHours: number;
  totalTasks: number;
  doneTasks: number;
  efficiency: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatus(row: EmployeeRow): { label: string; color: string } {
  const pct = row.monthHours / row.capacityHours;
  if (pct > 0.95 || row.efficiency < 60)
    return { label: "Cần chú ý", color: "bg-red-100 text-red-700" };
  if (pct >= 0.8)
    return { label: "Quá tải", color: "bg-amber-100 text-amber-700" };
  return { label: "Bình thường", color: "bg-green-100 text-green-700" };
}

const DEPT_FILTER = ["Tất cả", "FPGA", "Software", "Hardware"] as const;
type SortKey = "efficiency" | "hours" | "name";

// ─── Employee Slide-over ──────────────────────────────────────────────────────

function EmployeeDrawer({ row, onClose }: { row: EmployeeRow; onClose: () => void }) {
  const status = getStatus(row);
  const initials = row.member.initials;
  const overdueTasks = row.totalTasks - row.doneTasks;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
        aria-label="Chi tiết nhân viên"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-foreground">Chi tiết nhân viên</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{row.member.name}</p>
              <p className="text-xs text-muted-foreground">{row.member.role}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* 4 mini stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Giờ tháng", value: `${row.monthHours}h / ${row.capacityHours}h` },
              { label: "Task hoàn thành", value: `${row.doneTasks} / ${row.totalTasks}` },
              { label: "Hiệu suất", value: `${row.efficiency}%` },
              { label: "Phòng ban", value: row.member.department },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Dự án đang tham gia
            </p>
            <div className="space-y-1.5">
              {row.projectNames.map((name, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground">{row.member.activeTasks} tasks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {(status.label !== "Bình thường") && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Cảnh báo
              </p>
              <div className="space-y-1.5">
                {status.label === "Quá tải" && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    Giờ làm việc vượt 80% công suất
                  </div>
                )}
                {status.label === "Cần chú ý" && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    {overdueTasks > 0 ? `${overdueTasks} task chưa hoàn thành` : "Hiệu suất dưới mức cho phép"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Main Resource Planning Widget ───────────────────────────────────────────

export function ResourcePlanningWidget() {
  const { tacticalData } = useAppState();
  const [deptFilter, setDeptFilter] = useState<typeof DEPT_FILTER[number]>("Tất cả");
  const [sortKey, setSortKey] = useState<SortKey>("efficiency");
  const [selectedRow, setSelectedRow] = useState<EmployeeRow | null>(null);

  // Build employee rows from TACTICAL_DATA
  const allRows = useMemo<EmployeeRow[]>(() => {
    const memberMap = new Map<string, EmployeeRow>();

    Object.entries(tacticalData).forEach(([projectId, td]) => {
      const project = td;
      td.team.forEach((member) => {
        const existing = memberMap.get(member.id);
        const tasks = td.tasks.filter((t) => t.assigneeId === member.id);
        const doneTasks = tasks.filter((t) => t.status === "Done").length;

        if (existing) {
          existing.projectIds.push(projectId);
          existing.projectNames.push(`Dự án ${projectId}`);
          existing.totalTasks += tasks.length;
          existing.doneTasks += doneTasks;
          existing.monthHours += member.activeTasks * 8;
        } else {
          const monthHours = 80 + Math.floor(Math.random() * 80); // 80-160h
          memberMap.set(member.id, {
            member,
            projectIds: [projectId],
            projectNames: [`Dự án ${projectId}`],
            monthHours,
            capacityHours: 160,
            totalTasks: tasks.length || member.activeTasks,
            doneTasks: doneTasks || Math.floor(member.activeTasks * 0.6),
            efficiency: Math.round((monthHours / 160) * 100),
          });
        }
      });
    });

    return Array.from(memberMap.values());
  }, [tacticalData]);

  // Deterministic mock hours per member id to avoid hydration flicker
  const stableRows = useMemo<EmployeeRow[]>(() => {
    const hoursByMember: Record<string, number> = {
      "M-01": 128, "M-02": 152, "M-03": 94, "M-04": 140, "M-05": 76,
      "M-06": 156, "M-07": 110, "M-08": 88,
    };
    return allRows.map((r) => {
      const h = hoursByMember[r.member.id] ?? r.monthHours;
      return {
        ...r,
        monthHours: Math.min(h, r.capacityHours),
        efficiency: Math.round((h / r.capacityHours) * 100),
      };
    });
  }, [allRows]);

  const filtered = useMemo(() => {
    let rows = deptFilter === "Tất cả"
      ? stableRows
      : stableRows.filter((r) => r.member.department === deptFilter);

    if (sortKey === "efficiency") rows = [...rows].sort((a, b) => b.efficiency - a.efficiency);
    else if (sortKey === "hours")  rows = [...rows].sort((a, b) => b.monthHours - a.monthHours);
    else rows = [...rows].sort((a, b) => a.member.name.localeCompare(b.member.name));

    return rows;
  }, [stableRows, deptFilter, sortKey]);

  const warnings = stableRows.filter((r) => getStatus(r).label !== "Bình thường");
  const avgEff   = stableRows.length
    ? Math.round(stableRows.reduce((s, r) => s + r.efficiency, 0) / stableRows.length)
    : 0;
  const totalHours = stableRows.reduce((s, r) => s + r.monthHours, 0);
  const avgHours   = stableRows.length ? Math.round(totalHours / stableRows.length) : 0;
  // Convert monthly avg to weekly estimate
  const avgWeekly  = Math.round(avgHours / 4);

  return (
    <div className="space-y-6">
      {/* Section 1: KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          title="Nhân sự hoạt động"
          value={`${stableRows.length}/35`}
          subtitle={`${Math.round((stableRows.length / 35) * 100)}% đang làm việc`}
          trend="neutral"
          trendLabel={`${stableRows.length} thành viên`}
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="TB giờ/người/tuần"
          value={`${avgWeekly}h`}
          subtitle="Mục tiêu: 36–40h"
          trend={avgWeekly >= 36 && avgWeekly <= 40 ? "up" : avgWeekly < 36 ? "down" : "neutral"}
          trendLabel={avgWeekly >= 36 && avgWeekly <= 40 ? "Đạt mục tiêu" : avgWeekly < 36 ? "Dưới mục tiêu" : "Trên mục tiêu"}
          icon={<Clock className="w-4 h-4" />}
        />
        <KpiCard
          title="Hiệu suất chung"
          value={`${avgEff}%`}
          subtitle="Giờ duyệt / Giờ kế hoạch"
          trend={avgEff >= 80 ? "up" : avgEff >= 65 ? "neutral" : "down"}
          trendLabel={avgEff >= 80 ? "Tốt" : "Cần cải thiện"}
          icon={<TrendingUp className="w-4 h-4" />}
          highlight
        />
        <KpiCard
          title="Cảnh báo"
          value={warnings.length}
          subtitle="người cần chú ý"
          trend={warnings.length === 0 ? "up" : "down"}
          trendLabel={warnings.length === 0 ? "Không có vấn đề" : `${warnings.filter(r => getStatus(r).label === "Cần chú ý").length} nghiêm trọng`}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Section 2: Employee table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
          <span className="text-sm font-semibold text-foreground">Nhân viên</span>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as typeof DEPT_FILTER[number])}
              className="text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
            >
              {DEPT_FILTER.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
            >
              <option value="efficiency">Hiệu suất ↓</option>
              <option value="hours">Giờ ↓</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Nhân viên</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">DA tham gia</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Giờ tháng</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Task</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Hiệu suất</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Trạng thái</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const status = getStatus(row);
                const barWidth = Math.min((row.monthHours / row.capacityHours) * 100, 100);
                const barColor = status.label === "Cần chú ý" ? "bg-red-500" : status.label === "Quá tải" ? "bg-amber-500" : "bg-green-500";

                return (
                  <tr
                    key={row.member.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedRow(row)}
                  >
                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {row.member.initials}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{row.member.name}</p>
                          <p className="text-[10px] text-muted-foreground">{row.member.department}</p>
                        </div>
                      </div>
                    </td>
                    {/* Projects */}
                    <td className="px-3 py-3 text-xs text-muted-foreground">{row.projectIds.length}</td>
                    {/* Hours bar */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barWidth}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {row.monthHours}h/{row.capacityHours}h
                        </span>
                      </div>
                    </td>
                    {/* Tasks */}
                    <td className="px-3 py-3 text-xs text-foreground">{row.doneTasks}/{row.totalTasks}</td>
                    {/* Efficiency */}
                    <td className="px-3 py-3 text-xs font-semibold text-foreground">{row.efficiency}%</td>
                    {/* Status badge */}
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Alert list */}
      {warnings.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Cảnh báo nhân sự</h3>
          <div className="space-y-1.5">
            {warnings.map((row) => {
              const s = getStatus(row);
              const dot = s.label === "Cần chú ý" ? "bg-red-500" : "bg-amber-500";
              const msg = s.label === "Cần chú ý"
                ? `${row.member.name} — hiệu suất ${row.efficiency}%, cần kiểm tra ngay`
                : `${row.member.name} — quá tải ${row.efficiency}%, ${row.totalTasks - row.doneTasks} task chưa xong`;
              return (
                <div key={row.member.id} className="flex items-center gap-2 text-xs py-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                  <span className="text-foreground">{msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ResourceHeatmap below */}
      <ResourceHeatmap />

      {/* Drawer */}
      {selectedRow && (
        <EmployeeDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
}
