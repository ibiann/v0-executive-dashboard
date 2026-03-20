"use client";

import { useParams } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { TacticalView } from "@/components/dashboard/tactical-view";

export default function ApprovalPage() {
  const params = useParams<{ projectId: string }>();
  const { projects, tacticalData, handleTimesheetApprove, handlePhaseSave, handleTasksChange } = useAppState();

  const project  = projects.find((p) => p.id === params.projectId);
  const tactical = tacticalData[params.projectId];

  if (!project || !tactical) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Project not found: {params.projectId}
      </div>
    );
  }

  return (
    <TacticalView
      project={project}
      tactical={tactical}
      role="PM"
      onTimesheetApprove={handleTimesheetApprove}
      onPhaseSave={handlePhaseSave}
      onTasksChange={handleTasksChange}
    />
  );
}
