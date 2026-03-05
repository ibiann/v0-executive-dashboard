"use client";

import { useState } from "react";
import { Project } from "@/lib/mock-data";
import { CheckCircle2, FileText, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectClosureProps {
  projects: Project[];
}

function PdfPreviewModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
          <h2 id="pdf-modal-title" className="text-base font-semibold">
            Final Report Preview – {project.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mock PDF body */}
        <div className="p-6 space-y-6 font-sans text-sm text-foreground">
          {/* Title block */}
          <div className="text-center border-b border-border pb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Lancsnetworks Ltd.</p>
            <h3 className="text-xl font-bold mt-1">Project Closure Report</h3>
            <p className="text-muted-foreground text-xs mt-1">Generated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          {/* Summary table */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Project Summary</h4>
            <table className="w-full text-xs border border-border rounded-md overflow-hidden">
              <tbody>
                {[
                  ["Project ID", project.id],
                  ["Project Name", project.name],
                  ["Project Manager", project.pm],
                  ["Department", project.department],
                  ["Start Date", project.startDate],
                  ["End Date", project.endDate],
                  ["Final Progress", `${project.overallProgress}%`],
                  ["Resource Efficiency", `${project.resourceEfficiency}%`],
                  ["Final SPI", (project.overallProgress / project.plannedProgress).toFixed(2)],
                ].map(([key, val]) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="px-3 py-1.5 font-medium bg-muted/30 w-40">{key}</td>
                    <td className="px-3 py-1.5">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Phase completion */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Phase Completion</h4>
            <div className="space-y-2">
              {project.phases.map(({ phase, progress, color }) => (
                <div key={phase} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-muted-foreground">{phase}</span>
                  <div className="flex-1 h-3 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{progress}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Lessons learned */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Lessons Learned</h4>
            <div className="bg-muted/30 rounded-md px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-1">
              <p>• All phase milestones completed within approved scope and budget.</p>
              <p>• Engineer timesheets approved and logged through the tactical workflow.</p>
              <p>• Resource allocation peaked at Sprint 3; consider staggered resourcing for future cycles.</p>
              <p>• Client sign-off received. No open action items.</p>
            </div>
          </section>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectClosure({ projects }: ProjectClosureProps) {
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

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
                  <p className="font-semibold text-sm text-foreground leading-tight">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{project.pm} · {project.department}</p>
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

              {/* Smart Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setPreviewProject(project)}
              >
                <FileText className="w-3.5 h-3.5" />
                Review &amp; Export Final Report
              </Button>
            </div>
          ))}
        </div>
      )}

      {previewProject && (
        <PdfPreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </section>
  );
}
