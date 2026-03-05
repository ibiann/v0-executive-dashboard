"use client";

import { Project, RAGStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const RAG_CONFIG: Record<RAGStatus, { color: string; label: string }> = {
  green: { color: "bg-green-500", label: "On Track" },
  amber: { color: "bg-amber-400", label: "At Risk" },
  red: { color: "bg-red-500", label: "Delayed" },
};

function PhaseProgressBar({ phases }: { phases: Project["phases"] }) {
  return (
    <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5" role="progressbar" aria-label="Phase progress">
      {phases.map(({ phase, progress, color }) => (
        <div key={phase} className="flex-1 rounded-sm overflow-hidden bg-border/40 relative" title={`${phase}: ${progress}%`}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      ))}
    </div>
  );
}

function PhaseLegend({ phases }: { phases: Project["phases"] }) {
  return (
    <div className="flex gap-3 flex-wrap mt-1">
      {phases.map(({ phase, progress, color }) => (
        <span key={phase} className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ backgroundColor: color }} />
          {phase}: <strong className="text-foreground">{progress}%</strong>
        </span>
      ))}
    </div>
  );
}

interface PortfolioTableProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export function PortfolioTable({ projects, onProjectClick }: PortfolioTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Portfolio Status</h2>
        <span className="text-xs text-muted-foreground">{projects.length} projects</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project / PM</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">RAG</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-64">Phase Progress</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Progress</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">SPI</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, i) => {
              const rag = RAG_CONFIG[project.ragStatus];
              const spi =
                project.plannedProgress > 0
                  ? (project.overallProgress / project.plannedProgress).toFixed(2)
                  : "N/A";
              const spiNum = parseFloat(spi);
              return (
                <tr
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className={cn(
                    "border-b border-border/50 hover:bg-primary/5 cursor-pointer transition-colors group",
                    i % 2 === 0 ? "bg-card" : "bg-muted/10"
                  )}
                >
                  {/* Project / PM */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{project.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.pm}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-auto" />
                    </div>
                  </td>

                  {/* RAG */}
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={cn("w-2.5 h-2.5 rounded-full shrink-0", rag.color)}
                        aria-label={rag.label}
                      />
                      <span className="text-xs text-muted-foreground hidden lg:block">{rag.label}</span>
                    </div>
                  </td>

                  {/* Phase progress */}
                  <td className="px-4 py-3">
                    <PhaseProgressBar phases={project.phases} />
                    <PhaseLegend phases={project.phases} />
                  </td>

                  {/* Overall progress */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-foreground">{project.overallProgress}%</span>
                    <div className="mt-1 h-1 rounded-full bg-border w-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${project.overallProgress}%` }}
                      />
                    </div>
                  </td>

                  {/* SPI */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded",
                        spiNum >= 1
                          ? "bg-green-100 text-green-700"
                          : spiNum >= 0.85
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {spi}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
