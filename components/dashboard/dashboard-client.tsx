"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav, ViewRole, BreadcrumbItem } from "@/components/dashboard/top-nav";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PortfolioTable } from "@/components/dashboard/portfolio-table";
import { ResourceHeatmap } from "@/components/dashboard/resource-heatmap";
import { ProjectClosure } from "@/components/dashboard/project-closure";
import { ProjectInsightsDrawer } from "@/components/dashboard/project-insights-drawer";
import {
  PROJECTS,
  Project,
  RAGStatus,
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
  // focusedProjectId is set when "Switch to Tactical View" is clicked
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  const activeProjects = projects.filter((p) => !p.closed);
  const closedProjects = projects.filter((p) => p.closed);

  const portfolioHealth = getPortfolioHealth(projects);
  const activeSPI = getGlobalSPI(activeProjects);
  const resourceEff = getResourceEfficiency(projects);

  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount = activeProjects.filter((p) => p.ragStatus === "red").length;

  // Mutate RAG status directly in local state
  function handleRagChange(projectId: string, newRag: RAGStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ragStatus: newRag } : p))
    );
    // Keep the drawer open with updated data
    setSelectedProject((prev) =>
      prev?.id === projectId ? { ...prev, ragStatus: newRag } : prev
    );
  }

  // Switch to Tactical (PM) view focused on a specific project
  function handleSwitchToTactical(project: Project) {
    setRole("PM");
    setFocusedProjectId(project.id);
    setSelectedProject(null);
  }

  // Dynamic breadcrumbs
  const breadcrumbs: BreadcrumbItem[] =
    role === "PM" && focusedProjectId
      ? [
          {
            label: "Portfolio",
            onClick: () => {
              setRole("CTO");
              setFocusedProjectId(null);
            },
          },
          {
            label:
              projects.find((p) => p.id === focusedProjectId)?.name ??
              "Project",
          },
          { label: "Tactical View (PM)" },
        ]
      : [
          { label: "Dashboard", onClick: undefined },
          { label: "Portfolio Insights" },
        ];

  // Displayed projects — PM view scopes to the focused project
  const displayedProjects =
    role === "PM" && focusedProjectId
      ? activeProjects.filter((p) => p.id === focusedProjectId)
      : activeProjects;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role={role} setRole={setRole} breadcrumbs={breadcrumbs} />

        <main className="flex-1 px-4 py-5 md:px-6 space-y-6">
          {/* Page heading */}
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {role === "PM" && focusedProjectId
                ? `Tactical View — ${projects.find((p) => p.id === focusedProjectId)?.name}`
                : "Portfolio Insights"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {role === "PM" && focusedProjectId
                ? "PM-level drill-down. Click a row to open project insights."
                : "Read-only view derived from approved timesheets · " + role + " perspective"}
            </p>
          </div>

          {/* KPI Scorecards */}
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

          {/* Portfolio Status Table */}
          <PortfolioTable
            projects={displayedProjects}
            onProjectClick={(p) => setSelectedProject(p)}
          />

          {/* Resource Heatmap */}
          <ResourceHeatmap />

          {/* Project Closure */}
          <ProjectClosure
            projects={closedProjects}
            onProjectClick={(p) => setSelectedProject(p)}
          />
        </main>
      </div>

      {/* Project Insights Drawer */}
      {selectedProject && (
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
