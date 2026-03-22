"use client";

import { Meeting } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, MapPin, Users, FileText, Trash2, Edit2 } from "lucide-react";

interface MeetingEventPopupProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

export function MeetingEventPopup({
  meeting,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: MeetingEventPopupProps) {
  if (!meeting) return null;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(meeting.id);
      onOpenChange(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(meeting);
      onOpenChange(false);
    }
  };

  const meetingDate = new Date(meeting.startDate);
  const dateStr = format(meetingDate, "EEEE, dd MMMM yyyy", { locale: vi });

  const getImportanceBadgeColor = () => {
    return meeting.importance === "Quan trọng" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{meeting.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type and Importance */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {meeting.type}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getImportanceBadgeColor()}`}>
              {meeting.importance}
            </Badge>
            {meeting.recurring && (
              <Badge variant="secondary" className="text-xs">
                Lặp lại
              </Badge>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">{dateStr}</p>
                <p className="text-xs text-muted-foreground">
                  {meeting.startTime} - {meeting.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">Địa điểm</p>
                <p className="text-xs text-muted-foreground">{meeting.location}</p>
              </div>
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-start gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Người tham dự ({meeting.attendees.length})</p>
              <div className="mt-2 space-y-1">
                {meeting.attendees.map((attendee) => (
                  <div key={attendee.memberId} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs">{attendee.memberName}</span>
                    <span className="text-xs text-muted-foreground">({attendee.status})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda */}
          {meeting.agenda && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Nội dung</p>
                <p className="text-xs text-muted-foreground mt-1">{meeting.agenda}</p>
              </div>
            </div>
          )}

          {/* Phase */}
          {meeting.phase && (
            <div className="text-sm">
              <p className="font-semibold">Phase</p>
              <p className="text-xs text-muted-foreground">{meeting.phase}</p>
            </div>
          )}

          {/* Reminders */}
          {meeting.reminders.length > 0 && (
            <div className="text-sm">
              <p className="font-semibold">Nhắc nhở</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {meeting.reminders.map((reminder) => (
                  <Badge key={reminder} variant="secondary" className="text-xs">
                    {reminder === "15min" && "15 phút trước"}
                    {reminder === "1hour" && "1 giờ trước"}
                    {reminder === "1day" && "1 ngày trước"}
                    {reminder === "3days" && "3 ngày trước"}
                    {reminder === "1week" && "1 tuần trước"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete()}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Chỉnh sửa
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
