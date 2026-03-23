"use client";

import { Project } from "@/lib/mock-data";
import { X, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MeetingSchedulerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSchedule?: (data: { time: string; participants: string[] }) => void;
}

export function MeetingSchedulerDrawer({
  open,
  onOpenChange,
  project,
  onSchedule,
}: MeetingSchedulerDrawerProps) {
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [participants, setParticipants] = useState<string[]>([project?.pm || ""]);

  if (!open || !project) {
    if (!open) console.log("[v0] Drawer closed, open=", open);
    if (!project) console.log("[v0] Drawer hidden, no project");
    return null;
  }

  console.log("[v0] Drawer rendering for project:", project.name);

  const handleSchedule = () => {
    onSchedule?.({ time: selectedTime, participants });
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Drawer */}
      <div
        className="relative w-full sm:w-96 bg-card border border-border rounded-b-lg sm:rounded-lg shadow-2xl sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Lên lịch duyệt chiến lược</h3>
            <p className="text-xs text-muted-foreground mt-1">{project.name}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Time Picker */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block">
              Thời gian
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-2 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Người tham dự
            </label>
            <div className="space-y-2">
              {[project.pm, "Chủ tịch", "Kỹ sư trưởng"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={participants.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setParticipants([...participants, p]);
                      } else {
                        setParticipants(participants.filter((x) => x !== p));
                      }
                    }}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Automation note */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2.5">
            <p className="text-xs text-blue-900">
              <strong>📅 Tự động:</strong> Link Google Meet & Telegram ping sẽ được gửi cho Chủ tịch
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleSchedule}
          >
            Lên lịch
          </Button>
        </div>
      </div>
    </div>
  );
}
