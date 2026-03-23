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
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export type StrategicView = "portfolio" | "quality" | "resource" | "risk" | "archive" | "budget" | "people";

function getStrategicNav(role: string) {
  if (role === "Chairman") {
    return [
      { icon: LayoutDashboard, label: "Tổng quan",           view: "portfolio" as StrategicView, href: "/cto"          },
      { icon: DollarSign,      label: "Ngân sách & Chi phí", view: "budget" as StrategicView,    href: "/cto/budget"   },
      { icon: Users,           label: "Nhân sự tổng hợp",    view: "people" as StrategicView,    href: "/cto/people"   },
      { icon: AlertTriangle,   label: "Quản lý rủi ro",      view: "risk" as StrategicView,      href: "/cto/risk"     },
      { icon: Archive,         label: "Lưu trữ dự án",       view: "archive" as StrategicView,   href: "/cto/archive"  },
    ];
  }
  return [
    { icon: LayoutDashboard, label: "Danh mục dự án",       view: "portfolio" as StrategicView, href: "/cto"          },
    { icon: ShieldCheck,     label: "Chất lượng kỹ thuật",  view: "quality" as StrategicView,   href: "/cto/quality"  },
    { icon: Users,           label: "Kế hoạch nguồn lực",   view: "resource" as StrategicView,  href: "/cto/resource" },
    { icon: AlertTriangle,   label: "Quản lý rủi ro",       view: "risk" as StrategicView,      href: "/cto/risk"     },
    { icon: Archive,         label: "Lưu trữ dự án",        view: "archive" as StrategicView,   href: "/cto/archive"  },
  ];
}

const STRATEGIC_NAV = getStrategicNav("CTO"); // Default, will be overridden in component

const PM_NAV: { icon: typeof LayoutDashboard; label: string; segment: string }[] = [
  { icon: CalendarRange, label: "Kế hoạch Phase",      segment: "phases"    },
  { icon: KanbanSquare,  label: "Bảng công việc",      segment: "kanban"    },
  { icon: Users,         label: "Phân bổ nguồn lực",   segment: "resources" },
  { icon: Clock,         label: "Duyệt chấm công",     segment: "approval"  },
];

const ENGINEER_NAV: { icon: typeof LayoutDashboard; label: string; href: string }[] = [
  { icon: LayoutDashboard, label: "Bảng điều khiển",   href: "/engineer"           },
  { icon: ClipboardList,   label: "Công việc của tôi",  href: "/engineer/tasks"     },
  { icon: Clock,           label: "Bảng chấm công",    href: "/engineer/timesheet" },
  { icon: FileText,        label: "Tài liệu",          href: "/engineer/documents" },
  { icon: BookOpen,        label: "Kiến thức",         href: "/engineer/knowledge" },
  { icon: MapPin,          label: "Địa chỉ",           href: "/engineer/locations" },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  mode = "strategic",
  // Legacy props kept for backward compat with DashboardClient
  activeStrategicView,
  onNavigate,
  projectId,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mode?: "strategic" | "pm" | "engineer";
  activeStrategicView?: StrategicView;
  onNavigate?: (view: StrategicView) => void;
  projectId?: string;
}) {
  const router  = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const label =
    mode === "pm" ? "PM Workspace" : mode === "engineer" ? "My Portal" : "Lancsnetworks";
  const levelLabel =
    mode === "pm" ? "Level 2 — PM" : mode === "engineer" ? "Level 3 — Engineer" : "Level 1 — Strategic";

  // Get role-aware strategic nav
  const strategicNav = getStrategicNav(user?.role || "CTO");

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen shrink-0",
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
            {levelLabel === "LEVEL 1 — STRATEGIC" ? "CẤP 1 — CHIẾN LƯỢC" : levelLabel}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-1 space-y-0.5 px-2">
        {mode === "strategic" ? (
          strategicNav.map(({ icon: Icon, label: navLabel, view, href }) => {
            const isActive = onNavigate
              ? activeStrategicView === view
              : pathname === href || (href !== "/cto" && pathname.startsWith(href));
            return (
              <button
                key={view}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(view);
                  } else {
                    router.push(href);
                  }
                }}
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
          PM_NAV.map(({ icon: Icon, label: navLabel, segment }) => {
            const href = projectId ? `/pm/${projectId}/${segment}` : "#";
            const isActive = pathname === href || pathname.endsWith(`/${segment}`);
            return (
              <button
                key={segment}
                onClick={() => href !== "#" && router.push(href)}
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
        ) : (
          ENGINEER_NAV.map(({ icon: Icon, label: navLabel, href }) => {
            const isActive = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
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
