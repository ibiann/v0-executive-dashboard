"use client";

import { useState } from "react";
import { Meeting } from "@/lib/mock-data";
import { CalendarView } from "./calendar-view";
import { UpcomingMeetings } from "./upcoming-meetings";
import { MeetingEventPopup } from "./meeting-event-popup";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CalendarMeetingContainerProps {
  projectId: string;
  projectName: string;
  meetings: Meeting[];
  phases: string[];
  teamMembers: Array<{ id: string; name: string; initials: string; role: string; department: string; activeTasks: number }>;
  onCreateMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateMeeting: (projectId: string, meetingId: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting: (projectId: string, meetingId: string) => void;
}

export function CalendarMeetingContainer({
  projectId,
  projectName,
  meetings,
  phases,
  teamMembers,
  onCreateMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
}: CalendarMeetingContainerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const handleCreateMeeting = (newMeeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    onCreateMeeting(newMeeting);
    toast.success(`Lịch họp "${newMeeting.title}" đã được tạo thành công`);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    onDeleteMeeting(projectId, meetingId);
    toast.success("Lịch họp đã được xóa");
  };

  const handleEventClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowEventPopup(true);
  };

  const handleDateClick = (date: Date) => {
    // Pre-select date for new meeting
    setCurrentDate(date);
    setShowCreateDialog(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch họp</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo lịch họp
        </Button>
      </div>

      {/* View mode selector */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("month")}
        >
          Tháng
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("week")}
        >
          Tuần
        </Button>
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("day")}
        >
          Ngày
        </Button>
      </div>

      {/* Main content: 70/30 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Calendar view - 70% */}
        <CalendarView
          meetings={meetings}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          viewMode={viewMode}
        />

        {/* Upcoming meetings sidebar - 30% */}
        <div>
          <UpcomingMeetings
            meetings={meetings}
            onMeetingClick={handleEventClick}
          />
        </div>
      </div>

      {/* Event detail popup */}
      <MeetingEventPopup
        meeting={selectedMeeting}
        open={showEventPopup}
        onOpenChange={setShowEventPopup}
        onDelete={handleDeleteMeeting}
        onEdit={(meeting) => {
          // Edit functionality can be added later
          toast.info("Chức năng chỉnh sửa sẽ được cập nhật");
        }}
      />

      {/* Create meeting dialog */}
      <CreateMeetingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={projectId}
        projectName={projectName}
        phases={phases}
        teamMembers={teamMembers}
        onCreateMeeting={handleCreateMeeting}
      />
    </div>
  );
}
