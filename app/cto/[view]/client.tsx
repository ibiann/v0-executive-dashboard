"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { QualityHealthWidget } from "@/components/dashboard/quality-health-widget";
import { RiskManagementWidget } from "@/components/dashboard/risk-management-widget";
import { TeamVelocityWidget } from "@/components/dashboard/team-velocity-widget";
import { ResourceHeatmap } from "@/components/dashboard/resource-heatmap";
import { ProjectClosure } from "@/components/dashboard/project-closure";

type StrategicViewParam = "quality" | "resource" | "risk" | "archive";

const META: Record<StrategicViewParam, { title: string; subtitle: string }> = {
  quality:  { title: "Engineering Quality & Technical Health",  subtitle: "Bug density, test coverage, technical debt across all active projects"            },
  resource: { title: "Resource Planning & Team Velocity",       subtitle: "Utilisation heatmap and sprint velocity per engineering department"               },
  risk:     { title: "Risk Management",                         subtitle: "Real-time bottleneck alerts — security, hardware shortages, critical path delays" },
  archive:  { title: "Project Archive",                         subtitle: "Completed projects ready for final review and export"                             },
};

export default function CtoViewClient({ view }: { view: string }) {
  const router = useRouter();
  const { projects } = useAppState();

  if (!META[view as StrategicViewParam]) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        View not found: {view}
      </div>
    );
  }

  const meta           = META[view as StrategicViewParam];
  const closedProjects = projects.filter((p) => p.closed);

  function renderContent() {
    switch (view as StrategicViewParam) {
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
            onProjectClick={(p) => router.push(`/cto/project/${p.id}`)}
          />
        );
    }
  }

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">{meta.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
      </div>
      {renderContent()}
    </>
  );
}
