"use client";

import {
  QUALITY_TREND,
  PROJECT_QUALITY,
  QualityTrendPoint,
  ProjectQuality,
} from "@/lib/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Bug, ShieldCheck, AlertTriangle } from "lucide-react";

function SparkGauge({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function BugDensityColor(v: number) {
  if (v <= 2) return "text-green-600";
  if (v <= 4) return "text-amber-600";
  return "text-red-600";
}

function CoverageColor(v: number) {
  if (v >= 75) return "text-green-600";
  if (v >= 55) return "text-amber-600";
  return "text-red-600";
}

function DebtColor(v: number) {
  if (v <= 40) return "text-green-600";
  if (v <= 80) return "text-amber-600";
  return "text-red-600";
}

const CUSTOM_TOOLTIP = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Portfolio-level summary gauges ──────────────────────────────────────────
function PortfolioSummary() {
  const avgBugDensity =
    Math.round(
      (PROJECT_QUALITY.reduce((s, p) => s + p.bugDensity, 0) /
        PROJECT_QUALITY.length) *
        10
    ) / 10;
  const avgCoverage = Math.round(
    PROJECT_QUALITY.reduce((s, p) => s + p.testCoverage, 0) /
      PROJECT_QUALITY.length
  );
  const totalDebt = PROJECT_QUALITY.reduce(
    (s, p) => s + p.technicalDebt,
    0
  );
  const totalCriticalBugs = PROJECT_QUALITY.reduce(
    (s, p) => s + p.openCriticalBugs,
    0
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Bug Density */}
      <div className="bg-muted/40 rounded-lg px-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bug className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wide font-semibold">Bug Density</span>
        </div>
        <p className={cn("text-2xl font-bold", BugDensityColor(avgBugDensity))}>
          {avgBugDensity}
          <span className="text-xs font-normal text-muted-foreground ml-1">bugs/KLOC</span>
        </p>
        <SparkGauge value={avgBugDensity} max={10} color="#ef4444" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">Portfolio avg (active projects)</p>
      </div>

      {/* Test Coverage */}
      <div className="bg-muted/40 rounded-lg px-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wide font-semibold">Test Coverage</span>
        </div>
        <p className={cn("text-2xl font-bold", CoverageColor(avgCoverage))}>
          {avgCoverage}
          <span className="text-xs font-normal text-muted-foreground ml-1">%</span>
        </p>
        <SparkGauge value={avgCoverage} max={100} color="#22c55e" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">Target: 80% per project</p>
      </div>

      {/* Technical Debt */}
      <div className="bg-muted/40 rounded-lg px-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wide font-semibold">Tech Debt</span>
        </div>
        <p className={cn("text-2xl font-bold", DebtColor(totalDebt / PROJECT_QUALITY.length))}>
          {totalDebt}
          <span className="text-xs font-normal text-muted-foreground ml-1">SP</span>
        </p>
        <SparkGauge value={totalDebt} max={600} color="#f59e0b" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">Total across {PROJECT_QUALITY.length} active projects</p>
      </div>

      {/* Open Critical Bugs */}
      <div className="bg-muted/40 rounded-lg px-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bug className="w-3.5 h-3.5 text-red-500" />
          <span className="uppercase tracking-wide font-semibold">Critical Bugs</span>
        </div>
        <p className={cn("text-2xl font-bold", totalCriticalBugs > 10 ? "text-red-600" : totalCriticalBugs > 5 ? "text-amber-600" : "text-green-600")}>
          {totalCriticalBugs}
          <span className="text-xs font-normal text-muted-foreground ml-1">open</span>
        </p>
        <SparkGauge value={totalCriticalBugs} max={30} color="#ef4444" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">Unresolved P1/P2 across portfolio</p>
      </div>
    </div>
  );
}

// ─── Per-project quality table ────────────────────────────────────────────────
function QualityTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bug Density</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coverage</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tech Debt</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Critical</th>
          </tr>
        </thead>
        <tbody>
          {PROJECT_QUALITY.map((pq, i) => (
            <tr
              key={pq.projectId}
              className={cn(
                "border-b border-border/50",
                i % 2 === 0 ? "bg-card" : "bg-muted/10"
              )}
            >
              <td className="px-4 py-2.5">
                <p className="font-medium text-sm text-foreground leading-tight">{pq.projectName}</p>
                <p className="text-xs text-muted-foreground">{pq.department}</p>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className={cn("text-sm font-semibold", BugDensityColor(pq.bugDensity))}>
                  {pq.bugDensity}
                </span>
                <div className="mt-1 w-16 mx-auto">
                  <SparkGauge value={pq.bugDensity} max={10} color="#ef4444" />
                </div>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className={cn("text-sm font-semibold", CoverageColor(pq.testCoverage))}>
                  {pq.testCoverage}%
                </span>
                <div className="mt-1 w-16 mx-auto">
                  <SparkGauge value={pq.testCoverage} max={100} color="#22c55e" />
                </div>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className={cn("text-sm font-semibold", DebtColor(pq.technicalDebt))}>
                  {pq.technicalDebt} SP
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    pq.openCriticalBugs === 0
                      ? "bg-green-100 text-green-700"
                      : pq.openCriticalBugs <= 3
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {pq.openCriticalBugs}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function QualityHealthWidget() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quality & Technical Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Bug density, test coverage, and technical debt trends across portfolio</p>
        </div>
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
      </div>

      <div className="p-4 space-y-5">
        <PortfolioSummary />

        {/* Trend Chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            10-Week Portfolio Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={QUALITY_TREND} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left"  type="monotone" dataKey="bugDensity"    stroke="#ef4444" strokeWidth={2} dot={false} name="Bug Density" />
              <Line yAxisId="right" type="monotone" dataKey="testCoverage"  stroke="#22c55e" strokeWidth={2} dot={false} name="Coverage %" />
              <Line yAxisId="left"  type="monotone" dataKey="technicalDebt" stroke="#f59e0b" strokeWidth={2} dot={false} name="Tech Debt SP" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Per-project table */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Per-Project Breakdown
          </p>
          <QualityTable />
        </div>
      </div>
    </div>
  );
}
