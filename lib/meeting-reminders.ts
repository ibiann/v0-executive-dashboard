import { Meeting, NotificationPreference } from "@/lib/mock-data";

export type ReminderType = "1day" | "1hour" | "15min" | "at-time" | "daily-digest";

export interface ReminderTrigger {
  meetingId: string;
  meetingTitle: string;
  reminderType: ReminderType;
  triggerTime: Date;
  message: string;
}

/**
 * Calculate when a reminder should trigger based on meeting start time and reminder type
 */
export function calculateReminderTriggerTime(
  meeting: Meeting,
  reminderType: ReminderType
): Date {
  const meetingDate = new Date(`${meeting.startDate}T${meeting.startTime}:00`);

  switch (reminderType) {
    case "1day":
      return new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000);
    case "1hour":
      return new Date(meetingDate.getTime() - 60 * 60 * 1000);
    case "15min":
      return new Date(meetingDate.getTime() - 15 * 60 * 1000);
    case "at-time":
      return meetingDate;
    case "daily-digest":
      // 7:30 AM on the day of the meeting
      const digestDate = new Date(meetingDate);
      digestDate.setHours(7, 30, 0, 0);
      return digestDate;
    default:
      return meetingDate;
  }
}

/**
 * Check if a reminder should be triggered now
 */
export function shouldTriggerReminder(
  meeting: Meeting,
  reminderType: ReminderType,
  currentTime: Date = new Date()
): boolean {
  if (meeting.status === "Đã hủy" || meeting.status === "Đã kết thúc") {
    return false;
  }

  const triggerTime = calculateReminderTriggerTime(meeting, reminderType);
  const bufferMs = 60 * 1000; // 1 minute buffer
  return currentTime >= triggerTime && currentTime <= new Date(triggerTime.getTime() + bufferMs);
}

/**
 * Get all meetings for a specific date
 */
export function getMeetingsForDate(
  meetings: Meeting[],
  date: Date
): Meeting[] {
  const dateStr = date.toISOString().split("T")[0];
  return meetings.filter((m) => m.startDate === dateStr && m.status !== "Đã hủy");
}

/**
 * Get all meetings for today
 */
export function getMeetingsForToday(meetings: Meeting[]): Meeting[] {
  return getMeetingsForDate(meetings, new Date());
}

/**
 * Get all meetings for tomorrow
 */
export function getMeetingsForTomorrow(meetings: Meeting[]): Meeting[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getMeetingsForDate(meetings, tomorrow);
}

/**
 * Get meetings starting within the next N hours
 */
export function getMeetingsWithinHours(
  meetings: Meeting[],
  hours: number,
  currentTime: Date = new Date()
): Meeting[] {
  const targetTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000);
  return meetings.filter((m) => {
    if (m.status !== "Sắp diễn ra") return false;
    const meetingTime = new Date(`${m.startDate}T${m.startTime}:00`);
    return meetingTime >= currentTime && meetingTime <= targetTime;
  });
}

/**
 * Get next upcoming meeting
 */
export function getNextUpcomingMeeting(
  meetings: Meeting[],
  currentTime: Date = new Date()
): Meeting | null {
  const upcoming = meetings.filter((m) => {
    if (m.status !== "Sắp diễn ra") return false;
    const meetingTime = new Date(`${m.startDate}T${m.startTime}:00`);
    return meetingTime > currentTime;
  });

  if (upcoming.length === 0) return null;

  upcoming.sort((a, b) => {
    const timeA = new Date(`${a.startDate}T${a.startTime}:00`).getTime();
    const timeB = new Date(`${b.startDate}T${b.startTime}:00`).getTime();
    return timeA - timeB;
  });

  return upcoming[0];
}

/**
 * Get count of meetings happening today
 */
export function getTodayMeetingCount(meetings: Meeting[]): number {
  return getMeetingsForToday(meetings).length;
}

/**
 * Check if any meeting is starting within next hour
 */
export function hasUrgentMeeting(
  meetings: Meeting[],
  currentTime: Date = new Date()
): boolean {
  return getMeetingsWithinHours(meetings, 1, currentTime).length > 0;
}

/**
 * Format a daily digest of meetings
 */
export function formatDailyDigest(
  todayMeetings: Meeting[],
  tomorrowMeetings: Meeting[]
): string {
  let digest = "📅 Lịch họp của bạn:\n\n";

  if (todayMeetings.length > 0) {
    digest += "🔔 HÔM NAY:\n";
    todayMeetings.forEach((m) => {
      digest += `• ${m.startTime} - ${m.title} (${m.location || "TBD"})\n`;
    });
    digest += "\n";
  } else {
    digest += "Không có cuộc họp hôm nay\n\n";
  }

  if (tomorrowMeetings.length > 0) {
    digest += "📌 NGÀY MAI:\n";
    tomorrowMeetings.forEach((m) => {
      digest += `• ${m.startTime} - ${m.title} (${m.location || "TBD"})\n`;
    });
  }

  return digest;
}

/**
 * Format a reminder notification message
 */
export function formatReminderMessage(
  meeting: Meeting,
  reminderType: ReminderType
): string {
  const time = meeting.startTime;
  const title = meeting.title;

  switch (reminderType) {
    case "1day":
      return `Nhắc nhở: "${title}" diễn ra vào ngày mai lúc ${time}`;
    case "1hour":
      return `Nhắc nhở: "${title}" bắt đầu trong 1 giờ (${time})`;
    case "15min":
      return `Nhắc nhở: "${title}" bắt đầu trong 15 phút`;
    case "at-time":
      return `🔴 ${title} đang bắt đầu ngay bây giờ`;
    case "daily-digest":
      return "📅 Tóm tắt lịch họp hôm nay và ngày mai";
    default:
      return `Nhắc nhở về cuộc họp: ${title}`;
  }
}

/**
 * Get active reminders for a meeting based on user preferences
 */
export function getActiveReminders(
  meeting: Meeting,
  preferences?: NotificationPreference
): ReminderType[] {
  if (meeting.status === "Đã hủy" || meeting.status === "Đã kết thúc") {
    return [];
  }

  const reminders: ReminderType[] = [];

  if (!preferences) {
    // Default to all reminders if no preferences
    return ["1day", "1hour", "15min", "at-time"];
  }

  const prefs = preferences.meetingReminders;
  if (prefs.oneDay) reminders.push("1day");
  if (prefs.oneHour) reminders.push("1hour");
  if (prefs.fifteenMin) reminders.push("15min");
  if (prefs.atTime) reminders.push("at-time");

  return reminders;
}

/**
 * Get all triggered reminders for current time
 */
export function getTriggeredReminders(
  meetings: Meeting[],
  currentTime: Date = new Date(),
  preferences?: NotificationPreference
): ReminderTrigger[] {
  const triggers: ReminderTrigger[] = [];

  meetings.forEach((meeting) => {
    const activeReminders = getActiveReminders(meeting, preferences);
    activeReminders.forEach((reminderType) => {
      if (shouldTriggerReminder(meeting, reminderType, currentTime)) {
        triggers.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          reminderType,
          triggerTime: calculateReminderTriggerTime(meeting, reminderType),
          message: formatReminderMessage(meeting, reminderType),
        });
      }
    });
  });

  return triggers;
}

/**
 * Format meeting time display (e.g., "09:00 - 10:00")
 */
export function formatMeetingTime(meeting: Meeting): string {
  return `${meeting.startTime} - ${meeting.endTime}`;
}

/**
 * Get minutes until meeting starts
 */
export function getMinutesUntilMeeting(
  meeting: Meeting,
  currentTime: Date = new Date()
): number {
  const meetingTime = new Date(`${meeting.startDate}T${meeting.startTime}:00`);
  const diff = meetingTime.getTime() - currentTime.getTime();
  return Math.floor(diff / (1000 * 60));
}

/**
 * Check if meeting is happening right now (within 30 min buffer)
 */
export function isMeetingHappening(
  meeting: Meeting,
  currentTime: Date = new Date()
): boolean {
  const meetingStart = new Date(`${meeting.startDate}T${meeting.startTime}:00`);
  const meetingEnd = new Date(`${meeting.startDate}T${meeting.endTime}:00`);
  const startBuffer = new Date(meetingStart.getTime() - 30 * 60 * 1000);

  return currentTime >= startBuffer && currentTime <= meetingEnd;
}
