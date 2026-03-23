"use client";

import { Project } from "@/lib/mock-data";

interface PortfolioPulseProps {
  projects: Project[];
  onFilterClick?: (status: "red" | "amber" | "green") => void;
}

export function PortfolioPulse({ projects, onFilterClick }: PortfolioPulseProps) {
  const red = projects.filter((p) => p.ragStatus === "red").length;
  const amber = projects.filter((p) => p.ragStatus === "amber").length;
  const green = projects.filter((p) => p.ragStatus === "green").length;

  return (
    <div className="flex items-center gap-6">
      <div
        onClick={() => onFilterClick?.("red")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
      >
        <span className="text-lg">🔴</span>
        <span className="font-mono font-bold text-red-700">{red}</span>
      </div>
      <div
        onClick={() => onFilterClick?.("amber")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors"
      >
        <span className="text-lg">🟡</span>
        <span className="font-mono font-bold text-amber-700">{amber}</span>
      </div>
      <div
        onClick={() => onFilterClick?.("green")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
      >
        <span className="text-lg">🟢</span>
        <span className="font-mono font-bold text-green-700">{green}</span>
      </div>
    </div>
  );
}
