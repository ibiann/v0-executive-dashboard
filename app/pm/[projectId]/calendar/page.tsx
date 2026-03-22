"use client";

import { CalendarMeetingContainer } from "@/components/pm-workspace/calendar-meeting-container";
import { useAppState } from "@/lib/app-state";

export default function CalendarPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const {
    projects,
    tacticalData,
    handleCreateMeeting,
    handleUpdateMeeting,
    handleDeleteMeeting,
    handleCancelMeeting,
    handleAddMeetingNotes,
  } = useAppState();

  const project = projects.find((p) => p.id === projectId);
  const data = tacticalData[projectId];

  if (!project || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const phases = data.phases.map((p) => p.phase);
  const meetings = data.meetings ?? [];

  return (
    <div className="p-4 space-y-4">
      <CalendarMeetingContainer
        projectId={projectId}
        projectName={project.name}
        meetings={meetings}
        phases={phases}
        teamMembers={data.team}
        onCreateMeeting={(meeting) => handleCreateMeeting(projectId, meeting)}
        onUpdateMeeting={(pId, mId, updates) => handleUpdateMeeting(pId, mId, updates)}
        onDeleteMeeting={(pId, mId) => handleDeleteMeeting(pId, mId)}
        onCancelMeeting={(pId, mId, by) => handleCancelMeeting(pId, mId, by)}
        onAddMeetingNotes={(pId, mId, notes) => handleAddMeetingNotes(pId, mId, notes)}
      />
    </div>
  );
}
