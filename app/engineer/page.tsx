"use client";

import { useAppState } from "@/lib/app-state";
import { OperationalPortal } from "@/components/dashboard/operational-portal";

export default function EngineerDashboardPage() {
  const { handlePmNotify } = useAppState();

  return (
    <OperationalPortal
      onNotifyPM={handlePmNotify}
    />
  );
}
