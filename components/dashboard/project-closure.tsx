"use client";

import { Project } from "@/lib/mock-data";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectClosureProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export function ProjectClosure({ projects, onProjectClick }: ProjectClosureProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <h2 className="text-sm font-semibold text-foreground">Project Closure</h2>
        <span className="text-xs text-muted-foreground">(Step 7 – Final Review)</span>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-6 text-center">
          No projects at 100% completion yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card border border-green-200 rounded-lg p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-foreground leading-tight">
                    {project.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.pm} · {project.department}
                  </p>
                </div>
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  100%
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Ended: {project.endDate}</span>
                <span>·</span>
                <span>Efficiency: {project.resourceEfficiency}%</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => onProjectClick(project)}
              >
                <FileText className="w-3.5 h-3.5" />
                Review &amp; Export Final Report
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
