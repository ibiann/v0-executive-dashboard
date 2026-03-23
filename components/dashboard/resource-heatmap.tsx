"use client";

import { HEATMAP_DATA, DEPARTMENTS, HEATMAP_PROJECTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function getLoad(dept: string, project: string): number {
  const cell = HEATMAP_DATA.find(
    (c) => c.department === dept && c.project === project
  );
  return cell?.load ?? 0;
}

function loadColor(load: number): string {
  if (load === 0) return "bg-muted/40 text-muted-foreground/40";
  if (load <= 25) return "bg-green-100 text-green-700";
  if (load <= 50) return "bg-amber-100 text-amber-700";
  if (load <= 75) return "bg-orange-200 text-orange-800";
  return "bg-red-200 text-red-800";
}

export function ResourceHeatmap() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Resource Heatmap</h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-100 inline-block border border-green-300" />
            Low (&lt;25%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-amber-100 inline-block border border-amber-300" />
            Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-orange-200 inline-block border border-orange-300" />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-200 inline-block border border-red-300" />
            Critical
          </span>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-24 uppercase tracking-wide">
                Dept / Project
              </th>
              {HEATMAP_PROJECTS.map((p) => (
                <th
                  key={p}
                  className="text-center py-2 px-1 font-medium text-muted-foreground min-w-20"
                  style={{ writingMode: "vertical-rl", maxHeight: 80 }}
                >
                  <span className="inline-block" style={{ transform: "rotate(180deg)", fontSize: "10px" }}>
                    {p.length > 14 ? p.slice(0, 13) + "…" : p}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((dept) => (
              <tr key={dept} className="border-t border-border/50">
                <td className="py-2 pr-3 font-semibold text-foreground text-xs">
                  {dept}
                </td>
                {HEATMAP_PROJECTS.map((project) => {
                  const load = getLoad(dept, project);
                  return (
                    <td key={project} className="py-1 px-1 text-center">
                      <div
                        className={cn(
                          "rounded-md px-1 py-2 font-semibold tabular-nums",
                          loadColor(load)
                        )}
                        title={`${dept} → ${project}: ${load}%`}
                      >
                        {load > 0 ? `${load}%` : "–"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
