"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Archive,
  ChevronRight,
  Network,
  CalendarRange,
  KanbanSquare,
  Clock,
  Users,
  ClipboardList,
  FileText,
  BookOpen,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STRATEGIC_NAV = [
  { icon: LayoutDashboard, label: "Portfolio",          active: true },
  { icon: Map,             label: "Resource Map" },
  { icon: BarChart3,       label: "Strategic Reports" },
  { icon: Archive,         label: "Project Archives" },
];

const PM_NAV = [
  { icon: CalendarRange,  label: "Phase Planning",      active: true },
  { icon: KanbanSquare,   label: "Task Kanban" },
  { icon: Users,          label: "Resource Allocation" },
  { icon: Clock,          label: "Timesheet Approval" },
];

const ENGINEER_NAV = [
  { icon: LayoutDashboard, label: "My Dashboard",      active: true },
  { icon: ClipboardList,   label: "Cong viec cua toi" },
  { icon: Clock,           label: "Bang cham cong" },
  { icon: FileText,        label: "Tai lieu" },
  { icon: BookOpen,        label: "Kien thuc" },
  { icon: MapPin,          label: "Dia chi" },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  mode = "strategic",
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mode?: "strategic" | "pm" | "engineer";
}) {
  const navItems =
    mode === "pm" ? PM_NAV : mode === "engineer" ? ENGINEER_NAV : STRATEGIC_NAV;
  const label =
    mode === "pm" ? "PM Workspace" : mode === "engineer" ? "My Portal" : "Lancsnetworks";
  const levelLabel =
    mode === "pm" ? "Level 2 — PM" : mode === "engineer" ? "Level 3 — Engineer" : "Level 1 — Strategic";

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-white/10 shrink-0">
          <Network className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-white tracking-wide truncate">
            {label}
          </span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {levelLabel}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-1 space-y-0.5 px-2">
        {navItems.map(({ icon: Icon, label: navLabel, active }) => (
          <button
            key={navLabel}
            className={cn(
              "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
            )}
            title={collapsed ? navLabel : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{navLabel}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-md text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              !collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}

