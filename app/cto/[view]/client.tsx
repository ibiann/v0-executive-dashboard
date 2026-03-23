"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { useAuth } from "@/lib/auth";
import { QualityHealthWidget } from "@/components/dashboard/quality-health-widget";
import { RiskManagementWidget } from "@/components/dashboard/risk-management-widget";
import { TeamVelocityWidget } from "@/components/dashboard/team-velocity-widget";
import { ResourcePlanningWidget } from "@/components/dashboard/resource-planning-widget";
import { PeopleSummaryWidget } from "@/components/dashboard/people-summary-widget";
import { ProjectClosure } from "@/components/dashboard/project-closure";

type StrategicViewParam = "quality" | "resource" | "risk" | "archive" | "budget" | "people";

const META: Record<StrategicViewParam, { title: string; subtitle: string }> = {
  quality:  { title: "Chất lượng kỹ thuật & Sức khỏe kỹ thuật",  subtitle: "Mật độ lỗi, độ bao phủ kiểm thử, nợ kỹ thuật trên tất cả dự án hoạt động" },
  resource: { title: "Kế hoạch nguồn lực & Tốc độ nhóm",          subtitle: "Bản đồ tận dụng và tốc độ sprint trên mỗi bộ phận kỹ thuật"               },
  risk:     { title: "Quản lý rủi ro",                             subtitle: "Cảnh báo nút thắt thời gian thực — bảo mật, thiếu hàng, chậm đường tới hạn" },
  archive:  { title: "Lưu trữ dự án",                              subtitle: "Dự án hoàn thành sẵn sàng để xem xét cuối cùng và xuất"                    },
  budget:   { title: "Ngân sách & Chi phí",                        subtitle: "Tổng hợp chi phí và ngân sách theo dự án"                                   },
  people:   { title: "Nhân sự tổng hợp",                           subtitle: "Tổng hợp công suất và hiệu suất theo phòng ban"                             },
};

export default function CtoViewClient({ view }: { view: string }) {
  const router = useRouter();
  const { projects } = useAppState();
  const { user } = useAuth();

  if (!META[view as StrategicViewParam]) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        View not found: {view}
      </div>
    );
  }

  const meta           = META[view as StrategicViewParam];
  const closedProjects = projects.filter((p) => p.closed);

  function renderContent() {
    switch (view as StrategicViewParam) {
      case "quality":
        return <QualityHealthWidget />;
      case "resource":
        return <ResourcePlanningWidget />;
      case "risk":
        return <RiskManagementWidget />;
      case "archive":
        return (
          <ProjectClosure
            projects={closedProjects}
            onProjectClick={(p) => router.push(`/cto/project/${p.id}`)}
          />
        );
      case "people":
        return <PeopleSummaryWidget />;
      case "budget":
        return (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            Ngân sách & Chi phí — sẽ được cập nhật
          </div>
        );
    }
  }

  return (
    <>
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">{meta.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
      </div>
      {renderContent()}
    </>
  );
}

