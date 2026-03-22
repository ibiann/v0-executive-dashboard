"use client";

import { Meeting } from "@/lib/mock-data";
import { getMeetingsWithinHours } from "@/lib/meeting-reminders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface UpcomingMeetingBannerProps {
  meetings: Meeting[];
  onMeetingClick?: (meeting: Meeting) => void;
  hoursWindow?: number;
}

export function UpcomingMeetingBanner({
  meetings,
  onMeetingClick,
  hoursWindow = 2,
}: UpcomingMeetingBannerProps) {
  const [upcomingMeeting, setUpcomingMeeting] = useState<Meeting | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const upcomingMeetings = getMeetingsWithinHours(meetings, hoursWindow);
    if (upcomingMeetings.length > 0) {
      setUpcomingMeeting(upcomingMeetings[0]);
    }
  }, [meetings, hoursWindow]);

  if (!upcomingMeeting || dismissed) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {upcomingMeeting.title}
              </h3>
              {upcomingMeeting.importance === "Quan trọng" && (
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  Quan trọng
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-xs text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {upcomingMeeting.startTime} -{" "}
                  {upcomingMeeting.endTime}
                </span>
              </div>

              {upcomingMeeting.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>{upcomingMeeting.location}</span>
                </div>
              )}
            </div>

            {upcomingMeeting.agenda && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {upcomingMeeting.agenda}
              </p>
            )}

            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => onMeetingClick?.(upcomingMeeting)}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="mt-0.5 p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
          aria-label="Đóng"
        >
          <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </Card>
  );
}
