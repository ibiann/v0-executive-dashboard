"use client";

import { useState, lazy, Suspense } from "react";
import { Sidebar, StrategicView } from "@/components/dashboard/sidebar";
import { TopNav, ViewRole, BreadcrumbItem } from "@/components/dashboard/top-nav";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StrategicProjectList } from "@/components/dashboard/strategic-project-list";
import { PortfolioPulse } from "@/components/dashboard/portfolio-pulse";
import { MeetingSchedulerDrawer } from "@/components/dashboard/meeting-scheduler-drawer";
import { ProjectInsightsDrawer } from "@/components/dashboard/project-insights-drawer";
import { TacticalView } from "@/components/dashboard/tactical-view";
import { OperationalPortal } from "@/components/dashboard/operational-portal";

// Lazy load heavy widgets
const QualityHealthWidget = lazy(() => import("@/components/dashboard/quality-health-widget").then(m => ({ default: m.QualityHealthWidget })));
const RiskManagementWidget = lazy(() => import("@/components/dashboard/risk-management-widget").then(m => ({ default: m.RiskManagementWidget })));
const TeamVelocityWidget = lazy(() => import("@/components/dashboard/team-velocity-widget").then(m => ({ default: m.TeamVelocityWidget })));
const ResourceHeatmap = lazy(() => import("@/components/dashboard/resource-heatmap").then(m => ({ default: m.ResourceHeatmap })));
const ProjectClosure = lazy(() => import("@/components/dashboard/project-closure").then(m => ({ default: m.ProjectClosure })));

import {
  PROJECTS,
  TACTICAL_DATA,
  Project,
  RAGStatus,
  PhaseDefinition,
  TaskCard,
  TacticalProjectData,
  EngNotification,
  DEFAULT_PHASE_WEIGHTS,
  getPortfolioHealth,
  getGlobalSPI,
  getResourceEfficiency,
  Meeting,
} from "@/lib/mock-data";
import { Activity, Layers, Gauge, Users } from "lucide-react";

// ─── Strategic page headings ──────────────────────────────────────────────────
const STRATEGIC_META: Record<StrategicView, { title: string; subtitle: string }> = {
  portfolio: {
    title: "Tổng quan danh mục",
    subtitle: "Dữ liệu tổng hợp từ chấm công đã duyệt · Góc nhìn CTO",
  },
  quality: {
    title: "Chất lượng kỹ thuật & Sức khỏe kỹ thuật",
    subtitle: "Mật độ lỗi, độ bao phủ kiểm thử, nợ kỹ thuật trên tất cả dự án hoạt động",
  },
  resource: {
    title: "Kế hoạch nguồn lực & Tốc độ nhóm",
    subtitle: "Bản đồ tận dụng và tốc độ sprint trên mỗi bộ phận kỹ thuật",
  },
  risk: {
    title: "Quản lý rủi ro",
    subtitle: "Cảnh báo nút thắt thời gian thực — bảo mật, thiếu hàng khó, chậm đường tới hạn",
  },
  archive: {
    title: "Lưu trữ dự án",
    subtitle: "Dự án hoàn thành sẵn sàng để xem xét cuối cùng và xuất",
  },
  budget: {
    title: "Ngân sách & Chi phí",
    subtitle: "Tổng hợp chi tiêu theo dự án — chỉ dành cho Chủ tịch",
  },
  people: {
    title: "Nhân sự tổng hợp",
    subtitle: "Tổng hợp công suất và hiệu suất theo phòng ban",
  },
};

export function DashboardClient() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<ViewRole>("CTO");
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const [strategicView, setStrategicView] = useState<StrategicView>("portfolio");

  // Tactical state keyed by project ID
  const [tacticalData, setTacticalData] = useState<Record<string, TacticalProjectData>>(TACTICAL_DATA);

  // PM notification inbox — receives cross-level signals from the Engineer portal
  const [pmNotifications, setPmNotifications] = useState<EngNotification[]>([]);

  const handlePmNotify = (notif: Omit<EngNotification, "id" | "read">) => {
    setPmNotifications((prev) => [
      { ...notif, id: `PN-${Date.now()}`, read: false },
      ...prev,
    ]);
  };

  // ─── Derived values ─────────────────────────────────────────────────────────
  const activeProjects = projects.filter((p) => !p.closed);
  const closedProjects = projects.filter((p) => p.closed);

  const portfolioHealth = getPortfolioHealth(projects);
  const activeSPI       = getGlobalSPI(activeProjects);
  const resourceEff     = getResourceEfficiency(projects);

  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount   = activeProjects.filter((p) => p.ragStatus === "red").length;

  // ─── Lịch sắp tới (static mock — delivery via ERPNext) ───────────────────────
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [meetingProject, setMeetingProject] = useState<Project | null>(null);
  const [filterRAG, setFilterRAG] = useState<"red" | "amber" | "green" | null>(null);

  // ─── Strategic-level mutations ───────────────────────────────────────────────
  function handleRagChange(projectId: string, newRag: RAGStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ragStatus: newRag } : p))
    );
    setSelectedProject((prev) =>
      prev?.id === projectId ? { ...prev, ragStatus: newRag } : prev
    );
  }

  function handleSwitchToTactical(project: Project) {
    setRole("PM");
    setFocusedProjectId(project.id);
    setSelectedProject(null);
  }

  // ─── Tactical-level mutations ────────────────────────────────────────────────
  function handleTimesheetApprove(projectId: string, entryId: string) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;

      const updated: TacticalProjectData = {
        ...td,
        timesheets: td.timesheets.map((ts) =>
          ts.id === entryId ? { ...ts, approved: true } : ts
        ),
      };

      const approved = updated.timesheets.filter((ts) => ts.approved);
      const totalApprovedHours  = approved.reduce((s, ts) => s + ts.loggedHours, 0);
      const totalPlannedHours   = projects
        .find((p) => p.id === projectId)
        ?.hoursData.reduce((s, h) => s + h.planned, 0) ?? 1;
      const newProgress = Math.min(
        Math.round((totalApprovedHours / totalPlannedHours) * 100),
        100
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, overallProgress: newProgress } : p
        )
      );

      return { ...prev, [projectId]: updated };
    });
  }

  function handlePhaseSave(projectId: string, phases: PhaseDefinition[]) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;
      return { ...prev, [projectId]: { ...td, phases } };
    });
  }

  function handleTasksChange(projectId: string, tasks: TaskCard[]) {
    setTacticalData((prev) => {
      const td = prev[projectId];
      if (!td) return prev;
      return { ...prev, [projectId]: { ...td, tasks } };
    });
  }

  // ─── Navigation state ────────────────────────────────────────────────────────
  const focusedProject  = focusedProjectId ? projects.find((p) => p.id === focusedProjectId) : null;
  const focusedTactical = focusedProjectId ? tacticalData[focusedProjectId] : null;

  const isTacticalMode = role === "PM" && !!focusedProjectId && !!focusedProject && !!focusedTactical;
  const isEngineerMode = role === "Engineer";

  const sidebarMode = isEngineerMode ? "engineer" : isTacticalMode ? "pm" : "strategic";

  // Dynamic breadcrumbs
  const breadcrumbs: BreadcrumbItem[] =
    role === "Engineer"
      ? [{ label: "Home" }, { label: "My Dashboard" }]
      : role === "PM" && focusedProjectId
        ? [
            {
              label: "Portfolio",
              onClick: () => { setRole("CTO"); setFocusedProjectId(null); },
            },
            { label: projects.find((p) => p.id === focusedProjectId)?.name ?? "Project" },
            { label: "Tactical View (PM)" },
          ]
        : [
            { label: "Dashboard" },
            { label: STRATEGIC_META[strategicView].title },
          ];

  const displayedProjects =
    role === "PM" && focusedProjectId
      ? activeProjects.filter((p) => p.id === focusedProjectId)
      : activeProjects;

  // ─── Strategic sub-view content ──────────────────────────────────────────────
  function renderStrategicView() {
    switch (strategicView) {
      case "quality":
        return <QualityHealthWidget />;

      case "resource":
        return (
          <div className="space-y-6">
            <TeamVelocityWidget />
            <ResourceHeatmap />
          </div>
        );

      case "risk":
        return <RiskManagementWidget />;

      case "archive":
        return (
          <ProjectClosure
            projects={closedProjects}
            onProjectClick={(p) => setSelectedProject(p)}
          />
        );

      case "people":
        return (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            Nhân sự tổng hợp — sẽ được cập nhật
          </div>
        );

      case "budget": {
        // Deterministic per-project budget data derived from project list
        const budgetRows = [...activeProjects, ...closedProjects].map((p) => {
          // Seed from project id char codes for deterministic values
          const seed = p.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
          const budgetB = 1.5 + ((seed * 17) % 150) / 100; // 1.5–3.0 tỷ
          const variance = 1 + (((seed * 31) % 30) - 15) / 100; // ±15%
          const spentB = budgetB * (p.overallProgress / 100) * variance;
          const ratio = spentB / budgetB;
          const status: "green" | "amber" | "red" =
            ratio > 1 ? "red" : ratio >= 0.9 ? "amber" : "green";
          return { project: p, budgetB, spentB, ratio, status };
        });
        budgetRows.sort((a, b) => {
          const order = { red: 0, amber: 1, green: 2 };
          return order[a.status] - order[b.status];
        });

        const totalBudget = budgetRows.reduce((s, r) => s + r.budgetB, 0);
        const totalSpent  = budgetRows.reduce((s, r) => s + r.spentB, 0);
        const totalLeft   = totalBudget - totalSpent;

        const alerts = budgetRows
          .filter((r) => r.status !== "green")
          .slice(0, 5)
          .map((r) => {
            if (r.ratio > 1)
              return `${r.project.name} — chi tiêu vượt ${Math.round((r.ratio - 1) * 100)}% so với kế hoạch`;
            return `${r.project.name} — đã dùng ${Math.round(r.ratio * 100)}% ngân sách nhưng mới hoàn thành ${r.project.overallProgress}%`;
          });

        return (
          <div className="space-y-6">
            {/* Row 1: 3 metric cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="Tổng ngân sách"
                value={`${totalBudget.toFixed(2)} tỷ`}
                subtitle="Toàn bộ danh mục"
                trend="neutral"
                trendLabel={`${budgetRows.length} dự án`}
                icon={<Layers className="w-4 h-4" />}
                highlight
              />
              <KpiCard
                title="Đã sử dụng"
                value={`${totalSpent.toFixed(2)} tỷ`}
                subtitle={`${Math.round((totalSpent / totalBudget) * 100)}% ngân sách`}
                trend={totalSpent / totalBudget <= 0.9 ? "up" : "down"}
                trendLabel={totalSpent / totalBudget <= 0.9 ? "Trong kế hoạch" : "Cận giới hạn"}
                icon={<Activity className="w-4 h-4" />}
              />
              <KpiCard
                title="Còn lại"
                value={`${totalLeft.toFixed(2)} tỷ`}
                subtitle={`${Math.round((totalLeft / totalBudget) * 100)}% còn lại`}
                trend={totalLeft / totalBudget >= 0.15 ? "up" : "down"}
                trendLabel={totalLeft / totalBudget >= 0.15 ? "Đủ dự phòng" : "Cần theo dõi"}
                icon={<Gauge className="w-4 h-4" />}
              />
            </section>

            {/* Row 2: Budget table */}
            <section className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Dự án</th>
                    <th className="px-4 py-2.5 font-medium">PM</th>
                    <th className="px-4 py-2.5 font-medium text-right">Ngân sách KH</th>
                    <th className="px-4 py-2.5 font-medium text-right">Chi tiêu TT</th>
                    <th className="px-4 py-2.5 font-medium text-right">Còn lại</th>
                    <th className="px-4 py-2.5 font-medium w-32">% Sử dụng</th>
                    <th className="px-4 py-2.5 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map(({ project: p, budgetB, spentB, ratio, status }) => {
                    const leftB = budgetB - spentB;
                    const pct   = Math.min(Math.round(ratio * 100), 120);
                    const barColor =
                      status === "red" ? "bg-danger" : status === "amber" ? "bg-warning" : "bg-success";
                    const badgeStyle =
                      status === "red"
                        ? "bg-danger/10 text-danger"
                        : status === "amber"
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success";
                    const badgeLabel =
                      status === "red" ? "Vượt KH" : status === "amber" ? "Cận KH" : "Trong KH";
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedProject(p)}
                      >
                        <td className="px-4 py-2.5 font-medium text-foreground truncate max-w-[160px]">
                          {p.name}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.pm}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{budgetB.toFixed(2)} tỷ</td>
                        <td className="px-4 py-2.5 text-right font-mono">{spentB.toFixed(2)} tỷ</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          <span className={leftB < 0 ? "text-danger" : "text-foreground"}>
                            {leftB.toFixed(2)} tỷ
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyle}`}>
                            {badgeLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* Row 3: Alerts */}
            {alerts.length > 0 && (
              <section className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Cảnh báo ngân sách</h3>
                <ul className="space-y-2">
                  {alerts.map((msg, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                      {msg}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        );
      }

      case "portfolio":
      default:
        return (
          <>
            {/* Welcome bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {user?.role === "Chairman" ? "Ban điều hành" : "Tổng quan danh mục"}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Chào {user?.name?.split(" ").pop()}, hôm nay có{" "}
                  <span className={redCount + amberCount > 0 ? "text-danger font-semibold" : "text-success font-semibold"}>
                    {redCount + amberCount} vấn đề
                  </span>{" "}
                  cần chú ý
                </p>
              </div>
            </div>

            {/* KPI row — role-aware */}
            <section
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
              aria-label="Key Performance Indicators"
            >
              {user?.role === "Chairman" ? (
                <>
                  <KpiCard
                    title="Tổng dự án"
                    value={activeProjects.length}
                    subtitle={`${greenCount} đúng hạn · ${amberCount} rủi ro · ${redCount} trễ hạn`}
                    trend="neutral"
                    trendLabel={`${closedProjects.length} đã đóng`}
                    icon={<Layers className="w-4 h-4" />}
                  />
                  <KpiCard
                    title="Ngân sách"
                    value="78%"
                    subtitle="9.36 / 12 tỷ VNĐ đã sử dụng"
                    trend={78 <= 80 ? "up" : "down"}
                    trendLabel={78 <= 80 ? "Trong kế hoạch" : "Vượt kế hoạch"}
                    icon={<Activity className="w-4 h-4" />}
                    highlight
                  />
                  <KpiCard
                    title="Nhân sự"
                    value="28/35"
                    subtitle="80% đang hoạt động"
                    trend="neutral"
                    trendLabel="3 cần chú ý"
                    icon={<Users className="w-4 h-4" />}
                  />
                  <KpiCard
                    title="Tiến độ chung"
                    value={`${portfolioHealth}%`}
                    subtitle={`${activeProjects.filter((p) => p.ragStatus !== "red").length}/${activeProjects.length} dự án đúng hạn`}
                    trend={portfolioHealth >= 80 ? "up" : "down"}
                    trendLabel={portfolioHealth >= 80 ? "Tốt" : "Cần chú ý"}
                    icon={<Gauge className="w-4 h-4" />}
                  />
                </>
              ) : (
                <>
                  <KpiCard
                    title="Sức khỏe danh mục"
                    value={`${portfolioHealth}%`}
                    subtitle="Tiến độ so với thời gian"
                    trend={portfolioHealth >= 90 ? "up" : portfolioHealth >= 75 ? "neutral" : "down"}
                    trendLabel={portfolioHealth >= 90 ? "Tốt" : portfolioHealth >= 75 ? "Trung bình" : "Cần chú ý"}
                    icon={<Activity className="w-4 h-4" />}
                    highlight
                  />
                  <KpiCard
                    title="Tổng dự án hoạt động"
                    value={activeProjects.length}
                    subtitle={`${greenCount} đúng hạn · ${amberCount} có rủi ro · ${redCount} trễ hạn`}
                    trend="neutral"
                    trendLabel={`${closedProjects.length} đã đóng`}
                    icon={<Layers className="w-4 h-4" />}
                  />
                  <KpiCard
                    title="Sức khỏe tiến độ"
                    value={`${Math.round(activeSPI * 100)}%`}
                    subtitle={`${activeProjects.filter((p) => p.ragStatus !== "red").length}/${activeProjects.length} dự án đúng hạn`}
                    trend={activeSPI >= 0.8 ? "up" : activeSPI >= 0.6 ? "neutral" : "down"}
                    trendLabel={
                      activeSPI >= 0.8
                        ? "— Tốt"
                        : activeSPI >= 0.6
                        ? "— Trung bình"
                        : "— Nghiêm trọng"
                    }
                    icon={<Gauge className="w-4 h-4" />}
                  />
                  <KpiCard
                    title="Hiệu suất nguồn lực"
                    value={`${resourceEff}%`}
                    subtitle="Tổng hợp từ chấm công kỹ sư"
                    trend={resourceEff >= 85 ? "up" : resourceEff >= 70 ? "neutral" : "down"}
                    trendLabel={resourceEff >= 85 ? "Hiệu quả" : "Cần xem xét"}
                    icon={<Users className="w-4 h-4" />}
                  />
                </>
              )}
            </section>

            {/* Portfolio Pulse */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Tình trạng:</span>
              <PortfolioPulse
                projects={activeProjects}
                onFilterClick={(status) => setFilterRAG(filterRAG === status ? null : status)}
              />
            </div>

            {/* Strategic Project List */}
            <StrategicProjectList
              projects={
                filterRAG
                  ? activeProjects.filter((p) => p.ragStatus === filterRAG)
                  : activeProjects
              }
              onProjectClick={(p) => setSelectedProject(p)}
              onScheduleMeeting={(p) => {
                console.log("[v0] Schedule meeting clicked:", p.id, p.name);
                setMeetingProject(p);
                setShowMeetingDialog(true);
              }}
              selectedProjectId={selectedProject?.id}
            />

            {/* Milestones */}
            <section className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Milestone sắp tới</h3>
              <div className="space-y-2">
                {activeProjects.slice(0, 5).map((p) => {
                  const currentPhase = p.phases.find((ph) => ph.progress < 100 && ph.progress > 0);
                  const variance = p.overallProgress - p.plannedProgress;
                  const phaseDisplay = currentPhase?.phase === "Survey" ? "Khảo sát" : currentPhase?.phase === "Test" ? "Kiểm thử" : currentPhase?.phase === "Release" ? "Phát hành" : currentPhase?.phase ?? "—";
                  return (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2" onClick={() => setSelectedProject(p)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${p.ragStatus === "green" ? "bg-success" : p.ragStatus === "amber" ? "bg-warning" : "bg-danger"}`} />
                        <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">Hoàn thành {phaseDisplay}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-muted-foreground">{p.endDate}</span>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${variance >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                          {variance >= 0 ? "+" : ""}{variance}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Lịch sắp tới */}
            <section className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Lịch sắp tới</h3>
                <button
                  onClick={() => setShowMeetingDialog(true)}
                  className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  + Đặt lịch họp
                </button>
              </div>
              <div className="space-y-0.5">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-center justify-between py-1.5 px-2 -mx-2 text-xs rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-muted-foreground w-24 shrink-0">{m.date} {m.startTime}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.type === "Họp khẩn cấp" ? "bg-danger" : "bg-primary"}`} />
                      <span className="font-medium text-foreground truncate">{m.title}</span>
                      <span className="text-muted-foreground hidden sm:inline truncate">· {m.projectName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                      <span>{m.attendees} người</span>
                      {m.location && <span className="hidden md:inline">· {m.location}</span>}
                    </div>
                  </div>
                ))}
                {upcomingMeetings.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">Không có cuộc họp sắp tới</p>
                )}
              </div>
            </section>

            {/* Top Risks */}
            <section className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Rủi ro hàng đầu</h3>
              <div className="space-y-2">
                {activeProjects
                  .filter((p) => p.ragStatus !== "green")
                  .sort((a, b) => (a.overallProgress - a.plannedProgress) - (b.overallProgress - b.plannedProgress))
                  .slice(0, 3)
                  .map((p) => {
                    const gap = p.plannedProgress - p.overallProgress;
                    return (
                      <div key={p.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${p.ragStatus === "red" ? "bg-danger" : "bg-warning"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground">
                            {p.name} — chênh lệch {gap}% so với kế hoạch
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Đề xuất: {p.ragStatus === "red"
                              ? `Họp khẩn với ${p.pm}, xem xét điều chỉnh scope hoặc bổ sung nguồn lực`
                              : `Theo dõi sát ${p.pm}, cập nhật tiến độ hàng ngày`
                            }
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {activeProjects.filter((p) => p.ragStatus === "green").length === activeProjects.length && (
                  <p className="text-xs text-success flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Tất cả dự án đang đúng hạn — không có rủi ro đáng kể
                  </p>
                )}
              </div>
            </section>

            {/* Create Meeting Dialog — opens from "+ Đặt lịch họp" */}
            {showMeetingDialog && activeProjects[0] && (
              <CreateMeetingDialog
                open={showMeetingDialog}
                onOpenChange={setShowMeetingDialog}
                projectId={activeProjects[0].id}
                projectName={activeProjects[0].name}
                phases={activeProjects[0].phases.map((ph) => ph.phase)}
                teamMembers={[]}
                onCreateMeeting={() => setShowMeetingDialog(false)}
              />
            )}
          </>
        );
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mode={sidebarMode}
        activeStrategicView={!isTacticalMode && !isEngineerMode ? strategicView : undefined}
        onNavigate={(view) => {
          setStrategicView(view);
          setSelectedProject(null);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role={role} setRole={setRole} breadcrumbs={breadcrumbs} />

        <main className="flex-1 px-4 py-5 md:px-6 space-y-6">

          {/* ── Level 3: Engineer Operational Portal ── */}
          {isEngineerMode ? (
            <OperationalPortal onNotifyPM={handlePmNotify} />
          ) : (
            <>
              {/* Page heading */}
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  {isTacticalMode
                    ? `Tactical Management — ${focusedProject!.name}`
                    : STRATEGIC_META[strategicView].title}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isTacticalMode
                    ? `PM: ${focusedProject!.pm} · Steps 2–6: Phase Plan, Kanban, Resources, Timesheets`
                    : STRATEGIC_META[strategicView].subtitle}
                </p>
              </div>

              {/* ── Level 2: Tactical View ── */}
              {isTacticalMode ? (
                <TacticalView
                  project={focusedProject!}
                  tactical={focusedTactical!}
                  role={role}
                  onTimesheetApprove={handleTimesheetApprove}
                  onPhaseSave={handlePhaseSave}
                  onTasksChange={handleTasksChange}
                />
              ) : (
                renderStrategicView()
              )}
            </>
          )}
        </main>
      </div>

      {/* Project Insights Drawer (strategic portfolio view only) */}
      {!isTacticalMode && !isEngineerMode && selectedProject && (
        <ProjectInsightsDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSwitchToTactical={handleSwitchToTactical}
          onRagChange={handleRagChange}
        />
      )}

      {/* Meeting Scheduler Drawer */}
      <MeetingSchedulerDrawer
        open={showMeetingDialog}
        onOpenChange={setShowMeetingDialog}
        project={meetingProject}
        onSchedule={(data) => {
          console.log("[v0] Meeting scheduled:", { project: meetingProject?.id, time: data.time, participants: data.participants });
        }}
      />
    </div>
  );
}
