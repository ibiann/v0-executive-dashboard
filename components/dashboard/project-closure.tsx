"use client";

import { useState } from "react";
import { Project, RISK_REGISTER } from "@/lib/mock-data";
import { CheckCircle2, FileText, X, Download, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Export Modal ─────────────────────────────────────────────────────────────

function ExportModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const totalPlanned = project.hoursData.reduce((s, h) => s + h.planned, 0);
  const totalActual  = project.hoursData.reduce((s, h) => s + h.actual,  0);
  const variance     = totalActual - totalPlanned;
  const variancePct  = totalPlanned > 0 ? ((variance / totalPlanned) * 100).toFixed(1) : "0.0";

  const projectRisks = RISK_REGISTER.filter((r) => r.projectId === project.id);

  function handleExportSheets() {
    // Build a tab-separated content string simulating a spreadsheet export
    const rows: string[] = [
      ["Lancsnetworks — Project Closure Report", "", "", ""].join("\t"),
      ["Project:", project.name, "", ""].join("\t"),
      ["PM:", project.pm, "", ""].join("\t"),
      ["Department:", project.department, "", ""].join("\t"),
      ["Period:", project.startDate, "→", project.endDate].join("\t"),
      ["", "", "", ""].join("\t"),
      ["=== FINAL ROADMAP vs ACTUAL ===", "", "", ""].join("\t"),
      ["Phase", "Planned Hours", "Actual Hours", "Variance"].join("\t"),
      ...project.hoursData.map((h) =>
        [h.phase, h.planned, h.actual, h.actual - h.planned].join("\t")
      ),
      ["TOTAL", totalPlanned, totalActual, variance].join("\t"),
      ["", "", "", ""].join("\t"),
      ["=== RESOURCE EFFICIENCY ===", "", "", ""].join("\t"),
      ["Resource Efficiency Score:", `${project.resourceEfficiency}%`, "", ""].join("\t"),
      ["Overall Progress:", `${project.overallProgress}%`, "", ""].join("\t"),
      ["SPI:", (project.overallProgress / project.plannedProgress).toFixed(2), "", ""].join("\t"),
      ["", "", "", ""].join("\t"),
      ["=== RISK MITIGATION REPORT ===", "", "", ""].join("\t"),
      ["Risk ID", "Title", "Severity", "Status"].join("\t"),
      ...projectRisks.map((r) =>
        [r.id, r.title, r.severity, r.status].join("\t")
      ),
      ...(projectRisks.length === 0
        ? [["No risks recorded for this project.", "", "", ""].join("\t")]
        : []),
    ];
    const tsvContent = rows.join("\n");
    const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${project.name.replace(/\s+/g, "_")}_Closure_Report.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Project Closure Export"
    >
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-base text-foreground">Final Report Preview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{project.name} · PM: {project.pm}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 font-sans text-sm">

          {/* Section 1: Final Roadmap vs Actual */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              1. Final Roadmap vs Actual
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phase</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Planned h</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actual h</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variance</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</th>
                </tr>
              </thead>
              <tbody>
                {project.hoursData.map((h, i) => {
                  const v = h.actual - h.planned;
                  const phaseProgress = project.phases.find((p) => p.phase === h.phase);
                  return (
                    <tr key={h.phase} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card" : "bg-muted/10")}>
                      <td className="px-3 py-2 font-medium text-foreground">{h.phase}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.planned}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{h.actual}</td>
                      <td className={cn("px-3 py-2 text-right tabular-nums font-semibold", v > 0 ? "text-red-600" : v < 0 ? "text-green-600" : "text-muted-foreground")}>
                        {v > 0 ? `+${v}` : v}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-xs font-semibold text-foreground">
                          {phaseProgress?.progress ?? 100}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="bg-muted/30 border-t border-border font-semibold">
                  <td className="px-3 py-2 text-foreground">Total</td>
                  <td className="px-3 py-2 text-right tabular-nums">{totalPlanned}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{totalActual}</td>
                  <td className={cn("px-3 py-2 text-right tabular-nums font-bold", variance > 0 ? "text-red-600" : variance < 0 ? "text-green-600" : "text-muted-foreground")}>
                    {variance > 0 ? `+${variance}` : variance}h ({variancePct}%)
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-xs font-bold text-green-600">100%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 2: Resource Efficiency Summary */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              2. Resource Efficiency Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Resource Efficiency",  value: `${project.resourceEfficiency}%`, good: project.resourceEfficiency >= 85 },
                { label: "Overall Progress",      value: `${project.overallProgress}%`,    good: project.overallProgress === 100 },
                { label: "SPI",                   value: (project.overallProgress / project.plannedProgress).toFixed(2), good: project.overallProgress / project.plannedProgress >= 1 },
                { label: "Department",            value: project.department, good: true },
              ].map(({ label, value, good }) => (
                <div key={label} className="bg-muted/40 rounded-lg px-3 py-2.5 flex flex-col gap-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className={cn("text-lg font-bold leading-tight", good ? "text-green-600" : "text-amber-600")}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-muted/30 rounded-lg px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Period:</span> {project.startDate} → {project.endDate} &nbsp;·&nbsp;
                <span className="font-semibold text-foreground">Total hours delta:</span>{" "}
                <span className={cn(variance > 0 ? "text-red-600" : "text-green-600")}>
                  {variance > 0 ? `+${variance}h (${variancePct}% over budget)` : `${variance}h (${Math.abs(parseFloat(variancePct))}% under budget)`}
                </span>
              </p>
            </div>
          </section>

          {/* Section 3: Risk Mitigation Report */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              3. Risk Mitigation Report
            </h3>
            {projectRisks.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-3">
                No risks were registered for this project. All milestones completed within scope.
              </p>
            ) : (
              <div className="space-y-2">
                {projectRisks.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 bg-muted/30 rounded-lg px-3 py-2.5">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5",
                      r.severity === "critical" ? "bg-red-100 text-red-700" : r.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {r.severity.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Owner: {r.mitigationOwner} · Detected: {r.detectedDate} ·{" "}
                        <span className={cn(
                          "font-semibold",
                          r.status === "resolved" ? "text-green-600" : r.status === "mitigating" ? "text-amber-600" : "text-red-600"
                        )}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Report generated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={handleExportSheets}
            >
              <Sheet className="w-3.5 h-3.5" />
              Export to Sheets
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => window.print()}
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Project Closure section ──────────────────────────────────────────────────

interface ProjectClosureProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export function ProjectClosure({ projects, onProjectClick }: ProjectClosureProps) {
  const [exportProject, setExportProject] = useState<Project | null>(null);

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

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => onProjectClick(project)}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Insights
                </Button>
                {/* Export is only active once project is marked closed (closed === true) */}
                <Button
                  size="sm"
                  className={cn(
                    "flex-1 gap-1.5 text-xs border-0",
                    project.closed
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  disabled={!project.closed}
                  onClick={() => project.closed && setExportProject(project)}
                  title={project.closed ? "Export final report" : "Only available once PM closes the project"}
                >
                  <Sheet className="w-3.5 h-3.5" />
                  Export Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {exportProject && (
        <ExportModal project={exportProject} onClose={() => setExportProject(null)} />
      )}
    </section>
  );
}
