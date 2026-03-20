"use client";

import { useAppState } from "@/lib/app-state";
import { useAuth } from "@/lib/auth";
import { OperationalPortal } from "@/components/dashboard/operational-portal";

export default function EngineerDashboardPage() {
  const { handlePmNotify } = useAppState();
  const { user } = useAuth();

  return (
    <OperationalPortal
      onNotifyPM={handlePmNotify}
      engineerName={user?.engineerName}
    />
  );
}
