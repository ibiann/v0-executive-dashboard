"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "vi" | "en";

// ─── Full terminology map ─────────────────────────────────────────────────────
export const T = {
  vi: {
    // Navigation / header
    viewAs: "Xem với tư cách",
    search: "Tìm kiếm dự án, PM…",
    // Core nouns
    project: "Dự án",
    phase: "Giai đoạn",
    task: "Nhiệm vụ",
    subTask: "Nhiệm vụ phụ",
    weight: "Trọng số chiến lược",
    progress: "Tiến độ (%)",
    plannedHours: "Định mức giờ",
    actualHours: "Giờ thực tế",
    variance: "Chênh lệch",
    // Actions
    logWork: "Ghi nhận công việc",
    finishReview: "Hoàn thành & Gửi phê duyệt",
    justificationForm: "Báo cáo giải trình vượt định mức",
    chatter: "Luồng trao đổi kỹ thuật",
    save: "Lưu",
    cancel: "Hủy",
    submit: "Gửi báo cáo",
    close: "Đóng",
    addSubTask: "Thêm nhiệm vụ phụ",
    // Status labels
    statusNew: "Mới",
    statusInProgress: "Đang thực hiện",
    statusWaitingReview: "Chờ phê duyệt",
    statusReview: "Đang xét duyệt",
    statusDone: "Hoàn thành",
    statusRejected: "Bị từ chối",
    // Phase labels
    phaseSurvey: "Khảo sát",
    phaseRnd: "Nghiên cứu & Phát triển",
    phaseTest: "Kiểm thử",
    phaseRelease: "Ra mắt",
    // Tactical view headings
    phaseWeightTotal: "Tổng trọng số giai đoạn",
    weightMustBe100: "Tổng trọng số phải bằng 100%",
    // Portfolio labels
    portfolio: "Danh mục dự án",
    quality: "Chất lượng kỹ thuật",
    resource: "Kế hoạch nguồn lực",
    risk: "Quản lý rủi ro",
    archive: "Kho lưu trữ",
    // Engineer home
    myTasks: "Nhiệm vụ của tôi",
    timesheets: "Bảng công",
    notifications: "Thông báo",
    // Log work modal
    logWorkTitle: "Ghi nhận công việc",
    hoursWorked: "Số giờ thực hiện",
    description: "Mô tả kỹ thuật",
    descriptionMin: "Tối thiểu 20 ký tự",
    startTimer: "Bắt đầu",
    pauseTimer: "Tạm dừng",
    // Justification modal
    justTitle: "Báo cáo giải trình vượt định mức",
    justCause: "Phân loại nguyên nhân",
    justDetail: "Giải trình chi tiết",
    // Chatter
    noLogs: "Chưa có nhật ký công việc.",
    // Misc
    overBudget: "Vượt định mức",
    atRisk: "Có rủi ro",
    dueDate: "Hạn chót",
    priority: "Độ ưu tiên",
    priorityHigh: "Cao",
    priorityMedium: "Trung bình",
    priorityLow: "Thấp",
  },
  en: {
    viewAs: "View As",
    search: "Search projects, PMs…",
    project: "Project",
    phase: "Phase",
    task: "Task",
    subTask: "Sub-task",
    weight: "Strategic Weight",
    progress: "Progress (%)",
    plannedHours: "Planned Hours",
    actualHours: "Actual Hours",
    variance: "Variance",
    logWork: "Log Work",
    finishReview: "Finish & Review",
    justificationForm: "Over-budget Justification",
    chatter: "Technical Chatter",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit Report",
    close: "Close",
    addSubTask: "Add Sub-task",
    statusNew: "New",
    statusInProgress: "In Progress",
    statusWaitingReview: "Waiting for Review",
    statusReview: "Review",
    statusDone: "Done",
    statusRejected: "Rejected",
    phaseSurvey: "Survey",
    phaseRnd: "R&D",
    phaseTest: "Test",
    phaseRelease: "Release",
    phaseWeightTotal: "Total Phase Weight",
    weightMustBe100: "Total weight must equal 100%",
    portfolio: "Portfolio Insights",
    quality: "Engineering Quality",
    resource: "Resource Planning",
    risk: "Risk Management",
    archive: "Project Archive",
    myTasks: "My Tasks",
    timesheets: "Timesheets",
    notifications: "Notifications",
    logWorkTitle: "Log Work",
    hoursWorked: "Hours Worked",
    description: "Technical Description",
    descriptionMin: "Minimum 20 characters",
    startTimer: "Start",
    pauseTimer: "Pause",
    justTitle: "Over-budget Justification Report",
    justCause: "Cause Category",
    justDetail: "Detailed Explanation",
    noLogs: "No work logs yet.",
    overBudget: "Over Budget",
    atRisk: "At Risk",
    dueDate: "Due Date",
    priority: "Priority",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
  },
} as const;

export type TranslationKey = keyof typeof T.vi;

// ─── Context ──────────────────────────────────────────────────────────────────
interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "vi",
  setLang: () => {},
  t: (key) => T.vi[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi");
  const t = (key: TranslationKey): string => T[lang][key] as string;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
