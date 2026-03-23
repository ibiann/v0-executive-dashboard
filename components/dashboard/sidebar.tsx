"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  AlertTriangle,
  Archive,
  ChevronRight,
  Network,
  CalendarRange,
  KanbanSquare,
  Clock,
  ClipboardList,
  FileText,
  BookOpen,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StrategicView = "portfolio" | "quality" | "resource" | "risk" | "archive";

const STRATEGIC_NAV: { icon: typeof LayoutDashboard; label: string; view: StrategicView }[] = [
  { icon: LayoutDashboard, label: "Portfolio",            view: "portfolio" },
  { icon: ShieldCheck,     label: "Engineering Quality",  view: "quality"   },
  { icon: Users,           label: "Resource Planning",    view: "resource"  },
  { icon: AlertTriangle,   label: "Risk Management",      view: "risk"      },
  { icon: Archive,         label: "Project Archives",     view: "archive"   },
];

const PM_NAV = [
  { icon: CalendarRange,  label: "Phase Planning" },
  { icon: KanbanSquare,   label: "Task Kanban" },
  { icon: Users,          label: "Resource Allocation" },
  { icon: Clock,          label: "Timesheet Approval" },
];

const ENGINEER_NAV = [
  { icon: LayoutDashboard, label: "My Dashboard" },
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
  activeStrategicView,
  onNavigate,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mode?: "strategic" | "pm" | "engineer";
  activeStrategicView?: StrategicView;
  onNavigate?: (view: StrategicView) => void;
}) {
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
        {mode === "strategic" ? (
          STRATEGIC_NAV.map(({ icon: Icon, label: navLabel, view }) => {
            const isActive = activeStrategicView === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate?.(view)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
                title={collapsed ? navLabel : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{navLabel}</span>}
              </button>
            );
          })
        ) : mode === "pm" ? (
          PM_NAV.map(({ icon: Icon, label: navLabel }, idx) => (
            <button
              key={navLabel}
              className={cn(
                "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors",
                idx === 0
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              )}
              title={collapsed ? navLabel : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{navLabel}</span>}
            </button>
          ))
        ) : (
          ENGINEER_NAV.map(({ icon: Icon, label: navLabel }, idx) => (
            <button
              key={navLabel}
              className={cn(
                "flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm font-medium transition-colors",
                idx === 0
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              )}
              title={collapsed ? navLabel : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{navLabel}</span>}
            </button>
          ))
        )}
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
