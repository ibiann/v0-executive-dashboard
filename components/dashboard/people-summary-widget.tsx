"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";

const DEPT_ROWS = [
  { dept: "FPGA",     count: 8, capacity: 92, efficiency: 85, status: "Quá tải"        },
  { dept: "Software", count: 6, capacity: 45, efficiency: 72, status: "Dư nguồn lực"   },
  { dept: "Hardware", count: 4, capacity: 78, efficiency: 78, status: "Bình thường"     },
  { dept: "QA",       count: 3, capacity: 60, efficiency: 80, status: "Bình thường"     },
];

function statusStyle(status: string) {
  if (status === "Quá tải")      return "bg-amber-100 text-amber-700";
  if (status === "Dư nguồn lực") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

export function PeopleSummaryWidget() {
  const totalPeople = DEPT_ROWS.reduce((s, r) => s + r.count, 0);
  const avgCap  = Math.round(DEPT_ROWS.reduce((s, r) => s + r.capacity, 0)  / DEPT_ROWS.length);
  const avgEff  = Math.round(DEPT_ROWS.reduce((s, r) => s + r.efficiency, 0) / DEPT_ROWS.length);
  const alerts  = DEPT_ROWS.filter((r) => r.status !== "Bình thường").length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          title="Tổng nhân sự"
          value={`${totalPeople}/35`}
          subtitle={`${DEPT_ROWS.length} phòng ban`}
          trend="neutral"
          trendLabel="Biên chế"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Công suất TB"
          value={`${avgCap}%`}
          subtitle="Trung bình tất cả phòng ban"
          trend={avgCap >= 70 ? "up" : "down"}
          trendLabel={avgCap >= 70 ? "Đang sử dụng tốt" : "Dư nguồn lực"}
          icon={<Activity className="w-4 h-4" />}
        />
        <KpiCard
          title="Hiệu suất TB"
          value={`${avgEff}%`}
          subtitle="Giờ duyệt / Giờ kế hoạch"
          trend={avgEff >= 75 ? "up" : "neutral"}
          trendLabel={avgEff >= 75 ? "Tốt" : "Cần cải thiện"}
          icon={<TrendingUp className="w-4 h-4" />}
          highlight
        />
        <KpiCard
          title="Cảnh báo"
          value={alerts}
          subtitle="phòng ban cần chú ý"
          trend={alerts === 0 ? "up" : "down"}
          trendLabel={alerts === 0 ? "Ổn định" : `${alerts} phòng ban`}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Department table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Tổng hợp theo phòng ban</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Phòng ban</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Số người</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Công suất TB</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Hiệu suất</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {DEPT_ROWS.map((row) => {
                const barColor =
                  row.status === "Quá tải"      ? "bg-amber-500" :
                  row.status === "Dư nguồn lực" ? "bg-blue-400"  : "bg-green-500";
                return (
                  <tr key={row.dept} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.dept}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{row.count} người</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${row.capacity}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{row.capacity}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{row.efficiency}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert list */}
      {DEPT_ROWS.filter(r => r.status !== "Bình thường").length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Cảnh báo nhân sự</h3>
          <div className="space-y-1.5">
            {DEPT_ROWS.filter(r => r.status !== "Bình thường").map((row) => (
              <div key={row.dept} className="flex items-center gap-2 text-xs py-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${row.status === "Quá tải" ? "bg-amber-500" : "bg-blue-400"}`} />
                <span className="text-foreground">
                  {row.dept} — {row.status.toLowerCase()}, công suất {row.capacity}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
