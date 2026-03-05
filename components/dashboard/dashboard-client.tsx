"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav, ViewRole, BreadcrumbItem } from "@/components/dashboard/top-nav";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PortfolioTable } from "@/components/dashboard/portfolio-table";
import { ResourceHeatmap } from "@/components/dashboard/resource-heatmap";
import { ProjectClosure } from "@/components/dashboard/project-closure";
import { ProjectInsightsDrawer } from "@/components/dashboard/project-insights-drawer";
import { TacticalView } from "@/components/dashboard/tactical-view";
import { OperationalPortal } from "@/components/dashboard/operational-portal";
import {
  PROJECTS,
  TACTICAL_DATA,
  Project,
  RAGStatus,
  PhaseDefinition,
  TaskCard,
  TacticalProjectData,
  getPortfolioHealth,
  getGlobalSPI,
  getResourceEfficiency,
} from "@/lib/mock-data";
import { Activity, Layers, Gauge, Users } from "lucide-react";

export function DashboardClient() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<ViewRole>("CTO");
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  // Tactical state keyed by project ID
  const [tacticalData, setTacticalData] = useState<Record<string, TacticalProjectData>>(TACTICAL_DATA);

  // ─── Derived values ──────────────────────────────────────────────────────
  const activeProjects = projects.filter((p) => !p.closed);
  const closedProjects = projects.filter((p) => p.closed);

  const portfolioHealth = getPortfolioHealth(projects);
  const activeSPI = getGlobalSPI(activeProjects);
  const resourceEff = getResourceEfficiency(projects);

  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount   = activeProjects.filter((p) => p.ragStatus === "red").length;

  // ─── Strategic-level mutations ───────────────────────────────────────────
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

  // ─── Tactical-level mutations ────────────────────────────────────────────

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
      const totalApprovedHours = approved.reduce((s, ts) => s + ts.loggedHours, 0);
      const totalPlannedHours = projects
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

  // ─── Navigation state ────────────────────────────────────────────────────
  const breadcrumbs: BreadcrumbItem[] =
    role === "Engineer"
      ? [{ label: "Home" }, { label: "My Dashboard" }]
      : role === "PM" && focusedProjectId
        ? [
            {
              label: "Portfolio",
              onClick: () => {
                setRole("CTO");
                setFocusedProjectId(null);
              },
            },
            {
              label: projects.find((p) => p.id === focusedProjectId)?.name ?? "Project",
            },
            { label: "Tactical View (PM)" },
          ]
        : [
            { label: "Dashboard" },
            { label: "Portfolio Insights" },
          ];

  const displayedProjects =
    role === "PM" && focusedProjectId
      ? activeProjects.filter((p) => p.id === focusedProjectId)
      : activeProjects;

  const focusedProject =
    focusedProjectId ? projects.find((p) => p.id === focusedProjectId) : null;
  const focusedTactical =
    focusedProjectId ? tacticalData[focusedProjectId] : null;

  const isTacticalMode = role === "PM" && !!focusedProjectId && !!focusedProject && !!focusedTactical;
  const isEngineerMode = role === "Engineer";

  const sidebarMode = isEngineerMode ? "engineer" : isTacticalMode ? "pm" : "strategic";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mode={sidebarMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role={role} setRole={setRole} breadcrumbs={breadcrumbs} />

        <main className="flex-1 px-4 py-5 md:px-6 space-y-6">

          {/* ── Level 3: Engineer Operational Portal ── */}
          {isEngineerMode ? (
            <OperationalPortal />
          ) : (
            <>
              {/* Page heading */}
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  {isTacticalMode
                    ? `Tactical Management — ${focusedProject!.name}`
                    : "Portfolio Insights"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isTacticalMode
                    ? `PM: ${focusedProject!.pm} · Steps 2–6: Phase Plan, Kanban, Resources, Timesheets`
                    : `Read-only view derived from approved timesheets · ${role} perspective`}
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
                <>
                  {/* ── Level 1: Strategic View ── */}
                  <section
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
                    aria-label="Key Performance Indicators"
                  >
                    <KpiCard
                      title="Portfolio Health"
                      value={`${portfolioHealth}%`}
                      subtitle="Progress vs. Time Spent"
                      trend={portfolioHealth >= 90 ? "up" : portfolioHealth >= 75 ? "neutral" : "down"}
                      trendLabel={portfolioHealth >= 90 ? "Healthy" : portfolioHealth >= 75 ? "Moderate" : "Needs attention"}
                      icon={<Activity className="w-4 h-4" />}
                      highlight
                    />
                    <KpiCard
                      title="Total Active Projects"
                      value={activeProjects.length}
                      subtitle={`${greenCount} on track · ${amberCount} at risk · ${redCount} delayed`}
                      trend="neutral"
                      trendLabel={`${closedProjects.length} closed`}
                      icon={<Layers className="w-4 h-4" />}
                    />
                    <KpiCard
                      title="Global SPI"
                      value={activeSPI.toFixed(2)}
                      subtitle="Schedule Performance Index"
                      trend={activeSPI >= 1 ? "up" : activeSPI >= 0.85 ? "neutral" : "down"}
                      trendLabel={
                        activeSPI >= 1
                          ? "Ahead of schedule"
                          : activeSPI >= 0.85
                          ? "Slightly behind"
                          : "Behind schedule"
                      }
                      icon={<Gauge className="w-4 h-4" />}
                    />
                    <KpiCard
                      title="Resource Efficiency"
                      value={`${resourceEff}%`}
                      subtitle="Aggregated from engineer log works"
                      trend={resourceEff >= 85 ? "up" : resourceEff >= 70 ? "neutral" : "down"}
                      trendLabel={resourceEff >= 85 ? "Efficient" : "Review needed"}
                      icon={<Users className="w-4 h-4" />}
                    />
                  </section>

                  <PortfolioTable
                    projects={displayedProjects}
                    onProjectClick={(p) => setSelectedProject(p)}
                  />

                  <ResourceHeatmap />

                  <ProjectClosure
                    projects={closedProjects}
                    onProjectClick={(p) => setSelectedProject(p)}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Project Insights Drawer (strategic only) */}
      {!isTacticalMode && !isEngineerMode && selectedProject && (
        <ProjectInsightsDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSwitchToTactical={handleSwitchToTactical}
          onRagChange={handleRagChange}
        />
      )}
    </div>
  );
}
