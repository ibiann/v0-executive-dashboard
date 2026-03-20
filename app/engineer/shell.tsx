"use client";

import { useEffect } from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { useAuth, dashboardForRole } from "@/lib/auth";

const SEGMENT_LABELS: Record<string, string> = {
  engineer:  "My Dashboard",
  tasks:     "Cong viec cua toi",
  timesheet: "Bang cham cong",
  documents: "Tai lieu",
  knowledge: "Kien thuc",
  locations: "Dia chi",
};

export function EngineerShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const { user }  = useAuth();

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "Engineer") router.replace(dashboardForRole(user.role));
  }, [user, router]);

  if (!user || user.role !== "Engineer") {
    return <div className="min-h-screen bg-background" />;
  }

  const segment   = pathname.split("/").pop() ?? "engineer";
  const pageLabel = SEGMENT_LABELS[segment] ?? "Engineer Portal";

  const breadcrumbs = [
    { label: "My Portal" },
    { label: pageLabel },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mode="engineer" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav role="Engineer" breadcrumbs={breadcrumbs} />
        <main className="flex-1 px-4 py-5 md:px-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
