"use client";

import { HEATMAP_DATA, DEPARTMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DeptAlert {
  dept: string;
  utilization: number;
  topProject: string;
  severity: "critical" | "high";
}

function buildAlerts(): DeptAlert[] {
  return DEPARTMENTS.flatMap((dept) => {
    const rows = HEATMAP_DATA.filter((c) => c.department === dept);
    const total = rows.reduce((sum, c) => sum + c.load, 0);
    const utilization = rows.length > 0 ? Math.round(total / rows.length) : 0;
    if (utilization <= 80) return [];
    const topProject = rows.reduce((a, b) => (a.load >= b.load ? a : b)).project;
    const severity: "critical" | "high" = utilization > 95 ? "critical" : "high";
    return [{ dept, utilization, topProject, severity }];
  });
}

export function ResourceHeatmap() {
  const alerts = buildAlerts();

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Resource Alerts</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Critical (&gt;95%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            High (80–95%)
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-green-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            All departments within capacity
          </p>
        ) : (
          <ul className="space-y-2.5">
            {alerts.map((alert) => (
              <li
                key={alert.dept}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm border",
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                )}
              >
                {/* Colored dot */}
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    alert.severity === "critical" ? "bg-red-500" : "bg-amber-400"
                  )}
                />

                {/* Department + utilization */}
                <span
                  className={cn(
                    "font-semibold w-20 shrink-0",
                    alert.severity === "critical" ? "text-red-700" : "text-amber-700"
                  )}
                >
                  {alert.dept}:
                </span>

                {/* Utilization % */}
                <span
                  className={cn(
                    "font-bold tabular-nums w-12 shrink-0",
                    alert.severity === "critical" ? "text-red-700" : "text-amber-700"
                  )}
                >
                  {alert.utilization}%
                </span>

                {/* Project name */}
                <span className="text-muted-foreground text-xs flex-1 truncate">
                  capacity — {alert.topProject}
                </span>

                {/* Severity badge */}
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                    alert.severity === "critical"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {alert.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
