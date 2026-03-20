"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { useAuth } from "@/lib/auth";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PortfolioTable } from "@/components/dashboard/portfolio-table";
import { ResourceHeatmap } from "@/components/dashboard/resource-heatmap";
import { ProjectClosure } from "@/components/dashboard/project-closure";
import { ProjectInsightsDrawer } from "@/components/dashboard/project-insights-drawer";
import { getPortfolioHealth, getGlobalSPI, getResourceEfficiency, Project } from "@/lib/mock-data";
import { Activity, Layers, Gauge, Users } from "lucide-react";

export default function CtoPortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    projects,
    handleRagChange,
    handleCreateProject,
  } = useAppState();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const activeProjects = projects.filter((p) => !p.closed);
  const closedProjects = projects.filter((p) => p.closed);

  const portfolioHealth = getPortfolioHealth(projects);
  const activeSPI       = getGlobalSPI(activeProjects);
  const resourceEff     = getResourceEfficiency(projects);

  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount   = activeProjects.filter((p) => p.ragStatus === "red").length;

  return (
    <>
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">Portfolio Insights</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Read-only view derived from approved timesheets · CTO perspective
        </p>
      </div>

      {/* KPI row */}
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
          title="Schedule Health"
          value={`${Math.round(activeSPI * 100)}%`}
          subtitle={`${activeProjects.filter((p) => p.ragStatus !== "red").length}/${activeProjects.length} dự án đúng hạn`}
          trend={activeSPI >= 0.8 ? "up" : activeSPI >= 0.6 ? "neutral" : "down"}
          trendLabel={activeSPI >= 0.8 ? "— Good" : activeSPI >= 0.6 ? "— Moderate" : "— Critical"}
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
        projects={activeProjects}
        onProjectClick={(p) => router.push(`/cto/project/${p.id}`)}
        canCreateProject={user?.role === "CTO"}
        onCreateProject={(data) => {
          const newId = handleCreateProject(data);
          router.push(`/pm/${newId}/phases`);
        }}
      />

      <ResourceHeatmap />

      <ProjectClosure
        projects={closedProjects}
        onProjectClick={(p) => setSelectedProject(p)}
      />

      {selectedProject && (
        <ProjectInsightsDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSwitchToTactical={(p) => router.push(`/pm/${p.id}/phases`)}
          onRagChange={handleRagChange}
        />
      )}
    </>
  );
}
