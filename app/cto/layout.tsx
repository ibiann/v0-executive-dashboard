"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { usePathname } from "next/navigation";
import type { StrategicView } from "@/components/dashboard/sidebar";

const PATH_TO_VIEW: Record<string, StrategicView> = {
  "/cto":           "portfolio",
  "/cto/quality":   "quality",
  "/cto/resource":  "resource",
  "/cto/risk":      "risk",
  "/cto/archive":   "archive",
};

export default function CtoLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Determine active view from pathname (strip /project/... segments)
  const basePath = pathname.startsWith("/cto/project") ? "/cto" : pathname;
  const activeView: StrategicView = PATH_TO_VIEW[basePath] ?? "portfolio";

  const breadcrumbs = [
    { label: "Dashboard" },
    { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mode="strategic"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role="CTO" breadcrumbs={breadcrumbs} />
        <main className="flex-1 px-4 py-5 md:px-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
