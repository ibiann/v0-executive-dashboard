"use client";

import { Meeting } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, X, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface UpcomingMeetingBannerProps {
  meeting: Meeting & { projectName?: string };
  projectName?: string;
  onDismiss?: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
}

export function UpcomingMeetingBanner({
  meeting,
  projectName,
  onDismiss,
  onMeetingClick,
}: UpcomingMeetingBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const meetingTime = new Date(`${meeting.startDate}T${meeting.startTime}:00`);
      const diff = meetingTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("đang diễn ra");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`còn ${hours} giờ ${minutes} phút`);
      } else {
        setTimeLeft(`còn ${minutes} phút`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [meeting]);

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
                📅 Tiếp theo: {meeting.title}
              </h3>
              {meeting.importance === "Quan trọng" && (
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  Quan trọng
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-xs text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  Lúc {meeting.startTime} tại {meeting.location || "TBD"} – {timeLeft}
                </span>
              </div>

              {meeting.agenda && (
                <p className="text-xs text-gray-600 line-clamp-1">
                  {meeting.agenda}
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => onMeetingClick?.(meeting)}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>

        <button
          onClick={() => onDismiss?.()}
          className="mt-0.5 p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
          aria-label="Đóng"
        >
          <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </Card>
  );
}
