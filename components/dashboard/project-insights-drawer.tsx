"use client";

import { useState } from "react";
import {
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project, RAGStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── RAG Badge ───────────────────────────────────────────────────────────────

const RAG_CONFIG: Record<RAGStatus, { bg: string; text: string; dot: string; label: string }> = {
  green: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "On Track" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400", label: "At Risk" },
  red:   { bg: "bg-red-100",   text: "text-red-600",   dot: "bg-red-500",   label: "Delayed" },
};

const SEVERITY_CONFIG = {
  high:   { bg: "bg-red-50",   text: "text-red-600",   label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", label: "Medium" },
  low:    { bg: "bg-blue-50",  text: "text-blue-600",  label: "Low" },
};

// ─── PDF Report Modal ─────────────────────────────────────────────────────────

function PdfReportModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="opacity-70">Portfolio</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="opacity-70">{project.name}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="font-semibold">Final Report</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PDF body */}
        <div className="p-6 space-y-6 text-sm text-foreground overflow-y-auto">
          <div className="text-center border-b border-border pb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Lancsnetworks Ltd. — Confidential
            </p>
            <h3 className="text-xl font-bold mt-1">Project Closure Report</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Generated:{" "}
              {new Date().toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Project Charter */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Project Charter
            </h4>
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
                  [
                    "Final SPI",
                    (project.overallProgress / project.plannedProgress).toFixed(2),
                  ],
                  ["Status", "Closed / Completed"],
                ].map(([key, val]) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="px-3 py-1.5 font-medium bg-muted/30 w-44">{key}</td>
                    <td className="px-3 py-1.5">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Phase Breakdown */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Phase Breakdown
            </h4>
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

          {/* Resource Usage */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Resource Usage (Planned vs. Actual Hours)
            </h4>
            <table className="w-full text-xs border border-border rounded-md overflow-hidden">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-1.5 text-left font-semibold">Phase</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Planned</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Actual</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Variance</th>
                </tr>
              </thead>
              <tbody>
                {project.hoursData.map(({ phase, planned, actual }) => {
                  const variance = actual - planned;
                  return (
                    <tr key={phase} className="border-b border-border/50">
                      <td className="px-3 py-1.5 font-medium">{phase}</td>
                      <td className="px-3 py-1.5 text-right">{planned}h</td>
                      <td className="px-3 py-1.5 text-right">{actual}h</td>
                      <td
                        className={cn(
                          "px-3 py-1.5 text-right font-semibold",
                          variance > 0 ? "text-red-600" : "text-green-600"
                        )}
                      >
                        {variance > 0 ? `+${variance}h` : `${variance}h`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Lessons Learned */}
          <section>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Lessons Learned
            </h4>
            <div className="bg-muted/30 rounded-md px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-1.5">
              <p>All phase milestones completed within approved scope and budget.</p>
              <p>Engineer timesheets approved and logged through the tactical workflow.</p>
              <p>
                Resource allocation peaked during R&D; consider staggered resourcing
                for future cycles.
              </p>
              <p>Client sign-off received. No open action items remain.</p>
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
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

// ─── Main Drawer ──────────────────────────────────────────────────────────────

interface ProjectInsightsDrawerProps {
  project: Project;
  onClose: () => void;
  onSwitchToTactical: (project: Project) => void;
  onRagChange: (projectId: string, newRag: RAGStatus) => void;
}

export function ProjectInsightsDrawer({
  project,
  onClose,
  onSwitchToTactical,
  onRagChange,
}: ProjectInsightsDrawerProps) {
  const [showReport, setShowReport] = useState(false);
  const [ragMenuOpen, setRagMenuOpen] = useState(false);

  const rag = RAG_CONFIG[project.ragStatus];
  const spi =
    project.plannedProgress > 0
      ? (project.overallProgress / project.plannedProgress).toFixed(2)
      : "N/A";
  const spiNum = parseFloat(spi);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col"
        role="complementary"
        aria-label="Project Insights"
      >
        {/* Drawer header with breadcrumbs */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-card shrink-0">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground min-w-0" aria-label="Breadcrumb">
            <button
              onClick={onClose}
              className="hover:text-foreground transition-colors"
            >
              Portfolio
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-semibold truncate">{project.name}</span>
          </nav>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Project title + meta */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground leading-tight">{project.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PM: {project.pm} · {project.department} · {project.startDate} → {project.endDate}
                </p>
              </div>

              {/* Clickable RAG badge */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setRagMenuOpen((o) => !o)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border",
                    rag.bg,
                    rag.text,
                    "border-current/20 hover:opacity-80"
                  )}
                  aria-label="Change RAG status"
                  aria-haspopup="true"
                  aria-expanded={ragMenuOpen}
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", rag.dot)} />
                  {rag.label}
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </button>

                {ragMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-32">
                    {(["green", "amber", "red"] as RAGStatus[]).map((r) => {
                      const cfg = RAG_CONFIG[r];
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            onRagChange(project.id, r);
                            setRagMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-secondary transition-colors",
                            r === project.ragStatus && "font-semibold"
                          )}
                        >
                          <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* KPI pills */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-muted text-muted-foreground text-xs rounded-md px-2.5 py-1">
                Progress: <strong className="text-foreground">{project.overallProgress}%</strong>
              </span>
              <span className="bg-muted text-muted-foreground text-xs rounded-md px-2.5 py-1">
                Planned: <strong className="text-foreground">{project.plannedProgress}%</strong>
              </span>
              <span
                className={cn(
                  "text-xs rounded-md px-2.5 py-1 font-semibold",
                  spiNum >= 1
                    ? "bg-green-100 text-green-700"
                    : spiNum >= 0.85
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-600"
                )}
              >
                SPI: {spi}
              </span>
              <span className="bg-muted text-muted-foreground text-xs rounded-md px-2.5 py-1">
                Efficiency: <strong className="text-foreground">{project.resourceEfficiency}%</strong>
              </span>
            </div>
          </div>

          {/* Phase Summary (Step 2) */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Phase Progress Summary
            </h3>
            <div className="space-y-2.5">
              {project.phases.map(({ phase, progress, color }) => (
                <div key={phase} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{phase}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hours Chart */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Planned vs. Actual Hours (Approved by PM)
            </h3>
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={project.hoursData}
                  margin={{ top: 4, right: 4, left: -16, bottom: 4 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="phase"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                    iconType="square"
                    iconSize={8}
                  />
                  <Bar dataKey="planned" name="Planned" fill="#9b7b94" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#714B67" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top Risks */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Top Risks — Overdue Tasks (Level 3)
            </h3>
            {project.overdueTasks.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                No overdue tasks. All Level 3 tasks are on track.
              </div>
            ) : (
              <div className="space-y-2">
                {project.overdueTasks.map((task) => {
                  const sev = SEVERITY_CONFIG[task.severity];
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 bg-card border border-border rounded-lg px-3 py-2.5"
                    >
                      <AlertTriangle
                        className={cn(
                          "w-4 h-4 shrink-0 mt-0.5",
                          task.severity === "high"
                            ? "text-red-500"
                            : task.severity === "medium"
                            ? "text-amber-500"
                            : "text-blue-500"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-tight">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.id} · {task.assignee} · Overdue by {task.dueSince}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded shrink-0",
                          sev.bg,
                          sev.text
                        )}
                      >
                        {sev.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Project Closure Section */}
          <section className={cn(
            "rounded-lg border p-4 space-y-3",
            project.closed
              ? "border-green-200 bg-green-50/40"
              : "border-border bg-muted/20"
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "w-4 h-4",
                  project.closed ? "text-green-600" : "text-muted-foreground"
                )}
              />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Project Closure (Step 7)
              </h3>
            </div>

            {project.closed ? (
              <>
                <p className="text-xs text-green-700">
                  This project is 100% complete and formally closed. Generate the
                  final report for CTO sign-off and archiving.
                </p>
                <Button
                  size="sm"
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowReport(true)}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate Final Report
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Project is{" "}
                <strong className="text-foreground">{project.overallProgress}%</strong>{" "}
                complete. Closure report will be available once all phases reach 100%.
              </p>
            )}
          </section>

          {/* Smart Button: Switch to Tactical View */}
          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onSwitchToTactical(project)}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Switch to Tactical View (PM) — {project.name}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-1.5">
              Transitions the dashboard to Level 2 (PM perspective) focused on this project.
            </p>
          </div>
        </div>
      </aside>

      {showReport && (
        <PdfReportModal project={project} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
