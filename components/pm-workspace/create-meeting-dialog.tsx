"use client";

import { useState } from "react";
import { Meeting, MeetingType, MeetingAttendee, RecurrencePattern, TeamMember } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  phases: string[];
  teamMembers: TeamMember[];
  onCreateMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => void;
}

const MEETING_TYPES: MeetingType[] = [
  "Họp tiến độ",
  "Họp kỹ thuật",
  "Họp đánh giá",
  "Họp khẩn cấp",
  "Khác",
];

const REMINDER_OPTIONS = [
  { value: "15min", label: "15 phút trước" },
  { value: "1hour", label: "1 giờ trước" },
  { value: "1day", label: "1 ngày trước" },
  { value: "3days", label: "3 ngày trước" },
  { value: "1week", label: "1 tuần trước" },
];

export function CreateMeetingDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  phases,
  teamMembers,
  onCreateMeeting,
}: CreateMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [type, setType] = useState<MeetingType>("Họp tiến độ");
  const [importance, setImportance] = useState<"Normal" | "Quan trọng">("Normal");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(
    teamMembers.slice(0, 3).map((m) => m.id)
  );

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "bi-weekly" | "monthly">("weekly");
  const [recurringEndCondition, setRecurringEndCondition] = useState<"no-limit" | "after-count" | "on-date">("no-limit");
  const [recurringCount, setRecurringCount] = useState("4");

  const [reminders, setReminders] = useState<string[]>(["15min", "1hour"]);

  const toggleAttendee = (memberId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleReminder = (reminder: string) => {
    setReminders((prev) =>
      prev.includes(reminder) ? prev.filter((r) => r !== reminder) : [...prev, reminder]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề họp");
      return;
    }

    if (startTime >= endTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    const attendees: MeetingAttendee[] = selectedAttendees.map((id) => {
      const member = teamMembers.find((m) => m.id === id);
      return {
        memberId: id,
        memberName: member?.name || "Unknown",
        status: "pending",
      };
    });

    const recurring: RecurrencePattern | undefined = isRecurring
      ? {
          frequency: recurringFrequency,
          daysOfWeek: [1], // Monday
          endCondition: recurringEndCondition,
          endValue: recurringEndCondition === "after-count" ? parseInt(recurringCount) : undefined,
        }
      : undefined;

    const newMeeting: Omit<Meeting, "id" | "createdAt" | "updatedAt"> = {
      projectId,
      title: title.trim(),
      phase: (phase || undefined) as any,
      startDate: date,
      startTime,
      endTime,
      type,
      importance,
      attendees,
      location: location.trim() || undefined,
      agenda: agenda.trim() || undefined,
      recurring,
      reminders: reminders as any,
    };

    onCreateMeeting(newMeeting);

    // Reset form
    setTitle("");
    setPhase("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("10:00");
    setType("Họp tiến độ");
    setImportance("Normal");
    setLocation("");
    setAgenda("");
    setSelectedAttendees(teamMembers.slice(0, 3).map((m) => m.id));
    setIsRecurring(false);
    setReminders(["15min", "1hour"]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo lịch họp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Tiêu đề họp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Project and Phase */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project">Dự án</Label>
              <Input
                id="project"
                value={projectName}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phase">Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger id="phase" className="mt-1">
                  <SelectValue placeholder="Chọn phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Ngày *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endTime">Giờ kết thúc *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Type and Importance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Loại họp</Label>
              <Select value={type} onValueChange={(v) => setType(v as MeetingType)}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mức quan trọng</Label>
              <div className="flex gap-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={importance === "Normal"}
                    onChange={() => setImportance("Normal")}
                  />
                  <span className="text-sm">Bình thường</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={importance === "Quan trọng"}
                    onChange={() => setImportance("Quan trọng")}
                  />
                  <span className="text-sm">Quan trọng</span>
                </label>
              </div>
            </div>
          </div>

          {/* Location and Agenda */}
          <div>
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              placeholder="VD: Meeting Room A, Zoom link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="agenda">Nội dung/Agenda</Label>
            <Textarea
              id="agenda"
              placeholder="Mô tả nội dung họp"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Attendees */}
          <div>
            <Label>Người tham dự</Label>
            <Card className="p-3 mt-1">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedAttendees.includes(member.id)}
                      onCheckedChange={() => toggleAttendee(member.id)}
                    />
                    <span className="text-sm">
                      {member.name}
                      <span className="text-xs text-muted-foreground ml-2">({member.role})</span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Recurring */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-accent">
              <ChevronDown className="w-4 h-4" />
              Lặp lại lịch họp
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3 pl-4 border-l">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={isRecurring} onCheckedChange={setIsRecurring} />
                <span className="text-sm">Lặp lại họp này</span>
              </label>

              {isRecurring && (
                <>
                  <div>
                    <Label htmlFor="frequency">Tần suất</Label>
                    <Select value={recurringFrequency} onValueChange={(v: any) => setRecurringFrequency(v)}>
                      <SelectTrigger id="frequency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                        <SelectItem value="bi-weekly">Hai tuần một lần</SelectItem>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Kết thúc</Label>
                    <Select value={recurringEndCondition} onValueChange={(v: any) => setRecurringEndCondition(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-limit">Không giới hạn</SelectItem>
                        <SelectItem value="after-count">Sau số lần</SelectItem>
                        <SelectItem value="on-date">Đến ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurringEndCondition === "after-count" && (
                    <div>
                      <Label htmlFor="count">Số lần</Label>
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        value={recurringCount}
                        onChange={(e) => setRecurringCount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Reminders */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-accent">
              <ChevronDown className="w-4 h-4" />
              Nhắc nhở
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3 pl-4 border-l">
              {REMINDER_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors"
                >
                  <Checkbox
                    checked={reminders.includes(option.value)}
                    onCheckedChange={() => toggleReminder(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleCreate}>Tạo lịch họp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
