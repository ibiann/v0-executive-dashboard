import { Meeting, MeetingStatus } from "@/lib/mock-data";
import { calculateMeetingStatus } from "@/lib/meeting-reminders";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react";

interface MeetingStatusIndicatorProps {
  meeting: Meeting;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function MeetingStatusIndicator({
  meeting,
  size = "md",
  showIcon = true,
  className = "",
}: MeetingStatusIndicatorProps) {
  const status = calculateMeetingStatus(meeting);

  const getStatusStyle = () => {
    switch (status) {
      case "Sắp diễn ra":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Đang diễn ra":
        return "bg-green-100 text-green-700 border-green-200 animate-pulse";
      case "Đã kết thúc":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Đã hủy":
        return "bg-red-100 text-red-700 border-red-200 line-through";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Đang diễn ra":
        return <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />;
      case "Đã kết thúc":
        return <CheckCircle className="w-3 h-3" />;
      case "Đã hủy":
        return <X className="w-3 h-3" />;
      case "Sắp diễn ra":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const sizeClass = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  }[size];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 ${getStatusStyle()} ${sizeClass} ${className}`}
    >
      {showIcon && getStatusIcon()}
      <span>{status}</span>
    </Badge>
  );
}

/**
 * Compact status indicator - just the colored dot
 */
interface CompactStatusIndicatorProps {
  meeting: Meeting;
  className?: string;
}

export function CompactMeetingStatus({ meeting, className = "" }: CompactStatusIndicatorProps) {
  const status = calculateMeetingStatus(meeting);

  const getStatusColor = () => {
    switch (status) {
      case "Sắp diễn ra":
        return "bg-blue-500";
      case "Đang diễn ra":
        return "bg-green-500 animate-pulse";
      case "Đã kết thúc":
        return "bg-gray-400";
      case "Đã hủy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${className}`} />;
}
