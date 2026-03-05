"use client";

import { RISK_REGISTER, RiskItem, RiskSeverity, RiskCategory } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Package, Clock, Users, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const SEVERITY_CONFIG: Record<RiskSeverity, { label: string; badge: string; dot: string }> = {
  critical: { label: "Critical",  badge: "bg-red-100 text-red-700 border border-red-200",   dot: "bg-red-500"   },
  high:     { label: "High",      badge: "bg-orange-100 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
  medium:   { label: "Medium",    badge: "bg-amber-100 text-amber-700 border border-amber-200",   dot: "bg-amber-400"  },
};

const CATEGORY_CONFIG: Record<RiskCategory, { label: string; icon: typeof Shield; color: string }> = {
  security: { label: "Security",  icon: Shield,  color: "text-red-600" },
  hardware: { label: "Hardware",  icon: Package, color: "text-orange-600" },
  schedule: { label: "Schedule",  icon: Clock,   color: "text-amber-600" },
  resource: { label: "Resource",  icon: Users,   color: "text-blue-600" },
};

const STATUS_CONFIG = {
  open:        { label: "Open",       classes: "bg-red-50 text-red-700 border border-red-200" },
  mitigating:  { label: "Mitigating", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  resolved:    { label: "Resolved",   classes: "bg-green-50 text-green-700 border border-green-200" },
};

function RiskCard({ risk }: { risk: RiskItem }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[risk.severity];
  const cat = CATEGORY_CONFIG[risk.category];
  const CatIcon = cat.icon;
  const sta = STATUS_CONFIG[risk.status];

  return (
    <div
      className={cn(
        "rounded-lg border p-3 bg-card shadow-sm transition-all",
        risk.severity === "critical" ? "border-red-200" : risk.severity === "high" ? "border-orange-200" : "border-amber-200"
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Severity dot */}
        <span className={cn("w-2.5 h-2.5 rounded-full mt-1 shrink-0", sev.dot)} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground leading-tight">{risk.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", sev.badge)}>
                {sev.label}
              </span>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", sta.classes)}>
                {sta.label}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={cn("flex items-center gap-1 text-xs font-medium", cat.color)}>
              <CatIcon className="w-3 h-3" />
              {cat.label}
            </span>
            <span className="text-xs text-muted-foreground">{risk.projectName}</span>
            <span className="text-xs text-muted-foreground">Owner: {risk.mitigationOwner}</span>
            <span className="text-xs text-muted-foreground">Detected: {risk.detectedDate}</span>
          </div>

          {/* Expandable description */}
          {expanded && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
              {risk.description}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function RiskManagementWidget() {
  const [filterCat, setFilterCat] = useState<RiskCategory | "all">("all");

  const openRisks    = RISK_REGISTER.filter((r) => r.status !== "resolved");
  const criticalCount = openRisks.filter((r) => r.severity === "critical").length;
  const highCount     = openRisks.filter((r) => r.severity === "high").length;

  const filtered =
    filterCat === "all"
      ? RISK_REGISTER
      : RISK_REGISTER.filter((r) => r.category === filterCat);

  // Sort: critical first, then high, then open before mitigating
  const sorted = [...filtered].sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, medium: 2 };
    const staOrder = { open: 0, mitigating: 1, resolved: 2 };
    return (
      sevOrder[a.severity] - sevOrder[b.severity] ||
      staOrder[a.status] - staOrder[b.status]
    );
  });

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Risk Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time bottleneck alerts — security, hardware shortages, critical path
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" />
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 rounded-full">
              {highCount} High
            </span>
          )}
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto">
        {(["all", "security", "hardware", "schedule", "resource"] as const).map((cat) => {
          const count =
            cat === "all"
              ? RISK_REGISTER.filter((r) => r.status !== "resolved").length
              : RISK_REGISTER.filter((r) => r.category === cat && r.status !== "resolved").length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors shrink-0",
                filterCat === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat === "all" ? "All" : CATEGORY_CONFIG[cat].label}
              {count > 0 && (
                <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  filterCat === cat ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Risk list */}
      <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No risks in this category.</p>
        ) : (
          sorted.map((risk) => <RiskCard key={risk.id} risk={risk} />)
        )}
      </div>
    </div>
  );
}
