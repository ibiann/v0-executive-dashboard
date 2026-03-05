"use client";

import { TEAM_VELOCITY, HEATMAP_DATA, DEPARTMENTS, HEATMAP_PROJECTS } from "@/lib/mock-data";
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
import { cn } from "@/lib/utils";

const DEPT_COLORS: Record<string, string> = {
  FPGA:     "#714B67",
  Software: "#4f8ef7",
  Hardware: "#f59e0b",
};

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
          {p.name}: <strong>{p.value} SP</strong>
        </p>
      ))}
    </div>
  );
};

function loadColor(load: number): string {
  if (load === 0) return "bg-muted/40 text-muted-foreground/40";
  if (load <= 25) return "bg-green-100 text-green-700";
  if (load <= 50) return "bg-amber-100 text-amber-700";
  if (load <= 75) return "bg-orange-200 text-orange-800";
  return "bg-red-200 text-red-800";
}

function getLoad(dept: string, project: string): number {
  const cell = HEATMAP_DATA.find(
    (c) => c.department === dept && c.project === project
  );
  return cell?.load ?? 0;
}

// ─── Per-department velocity summary ─────────────────────────────────────────
function VelocitySummary() {
  const latest = TEAM_VELOCITY[TEAM_VELOCITY.length - 1];
  const prev   = TEAM_VELOCITY[TEAM_VELOCITY.length - 2];

  const depts: { key: "fpga" | "software" | "hardware"; label: string }[] = [
    { key: "fpga",     label: "FPGA" },
    { key: "software", label: "Software" },
    { key: "hardware", label: "Hardware" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {depts.map(({ key, label }) => {
        const curr  = latest[key];
        const prior = prev[key];
        const delta = curr - prior;
        const color = DEPT_COLORS[label];
        return (
          <div key={key} className="bg-muted/40 rounded-lg px-3 py-3 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
            <p className="text-xl font-bold" style={{ color }}>
              {curr}
              <span className="text-xs font-normal text-muted-foreground ml-1">SP/{latest.sprint}</span>
            </p>
            <p
              className={cn(
                "text-xs font-medium",
                delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {delta > 0 ? `+${delta}` : delta} vs prev sprint
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function TeamVelocityWidget() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Resource & Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Team velocity (story points per sprint) and resource utilisation heatmap
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Velocity summary gauges */}
        <VelocitySummary />

        {/* Velocity bar chart */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            7-Sprint Velocity Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TEAM_VELOCITY} margin={{ top: 4, right: 12, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="sprint" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="fpga"     name="FPGA"     fill={DEPT_COLORS.FPGA}     radius={[3, 3, 0, 0]} />
              <Bar dataKey="software" name="Software" fill={DEPT_COLORS.Software} radius={[3, 3, 0, 0]} />
              <Bar dataKey="hardware" name="Hardware" fill={DEPT_COLORS.Hardware} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource utilisation heatmap (compact inline) */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Resource Utilisation Heatmap
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-100 inline-block border border-green-300" />
              Low (&lt;25%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-100 inline-block border border-amber-300" />
              Med (26–50%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-orange-200 inline-block border border-orange-300" />
              High (51–75%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-200 inline-block border border-red-300" />
              Critical (&gt;75%)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 pr-3 font-semibold text-muted-foreground w-20 uppercase tracking-wide">
                    Dept
                  </th>
                  {HEATMAP_PROJECTS.map((p) => (
                    <th
                      key={p}
                      className="text-center py-1.5 px-1 font-medium text-muted-foreground min-w-[56px]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      <span className="inline-block" style={{ transform: "rotate(180deg)", fontSize: 10 }}>
                        {p.length > 12 ? p.slice(0, 11) + "…" : p}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept) => (
                  <tr key={dept} className="border-t border-border/50">
                    <td className="py-1.5 pr-3 font-semibold text-foreground text-xs">{dept}</td>
                    {HEATMAP_PROJECTS.map((project) => {
                      const load = getLoad(dept, project);
                      return (
                        <td key={project} className="py-1 px-1 text-center">
                          <div
                            className={cn(
                              "rounded-md px-1 py-1.5 font-semibold tabular-nums",
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
      </div>
    </div>
  );
}
