"use client";

import { useEffect } from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { useAuth, dashboardForRole } from "@/lib/auth";
import type { StrategicView } from "@/components/dashboard/sidebar";

const PATH_TO_VIEW: Record<string, StrategicView> = {
  "/cto":          "portfolio",
  "/cto/quality":  "quality",
  "/cto/resource": "resource",
  "/cto/risk":     "risk",
  "/cto/archive":  "archive",
};

export function CtoShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "CTO") router.replace(dashboardForRole(user.role));
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== "CTO") {
    return <div className="min-h-screen bg-background" />;
  }

  const basePath  = pathname.startsWith("/cto/project") ? "/cto" : pathname.split("?")[0];
  const activeView: StrategicView = PATH_TO_VIEW[basePath] ?? "portfolio";

  const breadcrumbs = [
    { label: "Dashboard", onClick: () => router.push("/cto") },
    { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mode="strategic" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role="CTO" breadcrumbs={breadcrumbs} />
        <main className="flex-1 px-4 py-5 md:px-6 space-y-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
