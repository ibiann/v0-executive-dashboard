"use client";

import { Meeting } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, MapPin, Users } from "lucide-react";

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export function UpcomingMeetings({ meetings, onMeetingClick }: UpcomingMeetingsProps) {
  // Get next 5 upcoming meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings
    .filter((m) => new Date(m.startDate) >= today)
    .sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);

  const getTypeColor = (type: string) => {
    if (type === "Họp khẩn cấp") return "bg-red-100 text-red-700";
    if (type === "Họp kỹ thuật") return "bg-blue-100 text-blue-700";
    if (type === "Họp đánh giá") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  const getRecurringBadge = (meeting: Meeting) => {
    if (meeting.recurring) {
      return (
        <Badge variant="secondary" className="text-xs">
          Lặp lại
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-lg font-bold mb-1">Lịch họp sắp tới</h3>
        <p className="text-sm text-muted-foreground">5 lịch họp tiếp theo</p>
      </div>

      <div className="space-y-3 flex-1">
        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map((meeting) => {
            const meetingDate = new Date(meeting.startDate);
            const timeDistance = formatDistance(meetingDate, today, { locale: vi, addSuffix: true });

            return (
              <Card
                key={meeting.id}
                onClick={() => onMeetingClick(meeting)}
                className="p-3 cursor-pointer hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-2">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(meetingDate, "dd/MM/yyyy", { locale: vi })} • {meeting.startTime}
                    </p>
                  </div>
                  {getRecurringBadge(meeting)}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(meeting.type)}`}>
                    {meeting.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {timeDistance}
                  </span>
                </div>

                {meeting.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {meeting.location}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {meeting.attendees.length} người tham dự
                </div>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Chưa có lịch họp nào</p>
            <p className="text-xs text-muted-foreground mt-1">Tạo lịch họp đầu tiên</p>
          </div>
        )}
      </div>
    </div>
  );
}
