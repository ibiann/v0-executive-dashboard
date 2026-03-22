"use client";

import { Meeting } from "@/lib/mock-data";
import { getNextUpcomingMeeting, getMinutesUntilMeeting } from "@/lib/meeting-reminders";
import { MeetingStatusIndicator } from "@/components/pm-workspace/meeting-status-indicator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MeetingTodayWidgetProps {
  meetings: Meeting[];
  projectName?: string;
  onClick?: (meeting: Meeting) => void;
}

export function MeetingTodayWidget({
  meetings,
  projectName = "Project",
  onClick,
}: MeetingTodayWidgetProps) {
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(null);
  const [minutesUntil, setMinutesUntil] = useState<number | null>(null);

  useEffect(() => {
    const updateMeeting = () => {
      const meeting = getNextUpcomingMeeting(meetings);
      setNextMeeting(meeting);
      if (meeting) {
        setMinutesUntil(getMinutesUntilMeeting(meeting));
      }
    };

    updateMeeting();
    const interval = setInterval(updateMeeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [meetings]);

  if (!nextMeeting) {
    return (
      <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">Lịch họp hôm nay</p>
          <p className="text-sm text-gray-500">Không có cuộc họp sắp tới</p>
        </div>
      </Card>
    );
  }

  const formatTimeUntil = (minutes: number | null) => {
    if (!minutes) return "Bắt đầu ngay";
    if (minutes < 0) return "Đã bắt đầu";
    if (minutes < 60) return `Còn ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `Còn ${hours}h ${mins}m`;
  };

  const isUrgent = minutesUntil !== null && minutesUntil <= 60;

  return (
    <Card
      className={cn(
        "p-4 border cursor-pointer transition-all hover:shadow-md",
        isUrgent
          ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
          : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      )}
      onClick={() => onClick?.(nextMeeting)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">Cuộc họp tiếp theo</p>
          {isUrgent && (
            <Badge className="bg-orange-500 text-white text-xs">Sắp bắt đầu</Badge>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">
            {nextMeeting.title}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {nextMeeting.startTime} — {formatTimeUntil(minutesUntil)}
            </span>
          </div>

          {nextMeeting.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{nextMeeting.location}</span>
            </div>
          )}

          {nextMeeting.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>{nextMeeting.attendees.length} người tham dự</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-300/30">
          <MeetingStatusIndicator meeting={nextMeeting} size="sm" />
          <span className="text-xs text-gray-500 font-medium">{projectName}</span>
        </div>
      </div>
    </Card>
  );
}
