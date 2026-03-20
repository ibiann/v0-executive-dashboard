"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { useAppState } from "@/lib/app-state";
import { useAuth, dashboardForRole } from "@/lib/auth";
import { CalendarRange, KanbanSquare, Users, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { label: "Phase Plan",          segment: "phases",    icon: CalendarRange },
  { label: "Task Kanban",         segment: "kanban",    icon: KanbanSquare  },
  { label: "Resource Allocation", segment: "resources", icon: Users         },
  { label: "Timesheet Approval",  segment: "approval",  icon: Clock         },
];

export function PmShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const params    = useParams<{ projectId: string }>();
  const pathname  = usePathname();
  const router    = useRouter();
  const { projects } = useAppState();
  const { user } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.replace("/login"); toast.error("Phien dang nhap da het han"); return; }
    if (user.role !== "PM") { router.replace(dashboardForRole(user.role, user)); return; }
    // PM can only access their own assigned projects
    if (user.projectIds.length > 0 && !user.projectIds.includes(params.projectId)) {
      const fallback = `/pm/${user.projectIds[0]}/phases`;
      toast.error("Ban khong duoc giao du an nay");
      router.replace(fallback);
    }
  }, [mounted, user, router, params.projectId]);

  // Show blank shell until client hydrates
  if (!mounted || !user || user.role !== "PM") {
    return <div className="min-h-screen bg-background" />;
  }

  const projectId     = params.projectId;
  const project       = projects.find((p) => p.id === projectId);
  const activeSegment = pathname.split("/").pop() ?? "phases";

  const breadcrumbs = [
    { label: "CTO Portfolio", onClick: () => router.push("/cto") },
    { label: project?.name ?? projectId },
    { label: TABS.find((t) => t.segment === activeSegment)?.label ?? "PM Workspace" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mode="pm" projectId={projectId} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role="PM" breadcrumbs={breadcrumbs} />

        {/* Project sub-header */}
        <div className="flex items-center justify-between gap-4 bg-card border-b border-border px-4 py-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/cto")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to portfolio"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="w-px h-4 bg-border" />
            <div>
              <p className="text-xs font-bold text-foreground leading-tight">{project?.name ?? projectId}</p>
              <p className="text-[10px] text-muted-foreground">PM: {project?.pm ?? "—"} &nbsp;·&nbsp; {project?.category}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1" aria-label="PM workspace tabs">
            {TABS.map(({ label, segment, icon: Icon }) => {
              const isActive = activeSegment === segment;
              return (
                <button
                  key={segment}
                  onClick={() => router.push(`/pm/${projectId}/${segment}`)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="flex-1 px-4 py-5 md:px-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
