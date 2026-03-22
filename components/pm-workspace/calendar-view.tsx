"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Meeting } from "@/lib/mock-data";
import { MeetingStatusIndicator, CompactMeetingStatus } from "@/components/pm-workspace/meeting-status-indicator";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { vi } from "date-fns/locale";

interface CalendarViewProps {
  meetings: Meeting[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onEventClick: (meeting: Meeting) => void;
  viewMode: "month" | "week" | "day";
}

export function CalendarView({
  meetings,
  currentDate,
  onDateChange,
  onDateClick,
  onEventClick,
  viewMode,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return meetings.filter((m) => m.startDate === dateStr);
  };

  // Get color for event based on importance and type
  const getEventColor = (meeting: Meeting) => {
    if (meeting.importance === "Quan trọng") return "bg-orange-500";
    if (meeting.recurring) return "bg-green-500";
    if (new Date(meeting.startDate) < new Date()) return "bg-gray-400";
    return "bg-blue-600";
  };

  const handlePrev = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNext = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy", { locale: vi })}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={`
                  min-h-24 p-1 rounded border cursor-pointer transition-colors
                  ${isDayToday ? "border-accent-500 bg-accent/10" : "border-border"}
                  ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                  hover:bg-accent/5
                `}
              >
                <div className={`text-xs font-semibold mb-1 ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(meeting);
                      }}
                      className={`
                        w-full text-left text-xs px-1 py-0.5 rounded text-white truncate
                        ${getEventColor(meeting)} hover:opacity-90 transition-opacity
                      `}
                      title={meeting.title}
                    >
                      {meeting.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
