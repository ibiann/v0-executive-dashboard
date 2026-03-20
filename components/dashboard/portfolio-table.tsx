"use client";

import { useState } from "react";
import { Project, RAGStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Plus, Cpu, Zap, Package,
  Grid2x2, Circle, AlignLeft, Grid3x3, Layers,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const RAG_BORDER: Record<RAGStatus, string> = {
  green: "#22c55e",
  amber: "#f59e0b",
  red:   "#ef4444",
};

const RAG_CONFIG: Record<RAGStatus, { color: string; label: string }> = {
  green: { color: "bg-green-500",  label: "On Track" },
  amber: { color: "bg-amber-400",  label: "At Risk"  },
  red:   { color: "bg-red-500",    label: "Delayed"  },
};

const PHASE_COLORS: Record<string, string> = {
  "Survey":  "#534AB7",
  "R&D":     "#185FA5",
  "Test":    "#0F6E56",
  "Release": "#BA7517",
};

const PHASE_WEIGHTS: Record<string, number> = {
  "Survey":  10,
  "R&D":     45,
  "Test":    30,
  "Release": 15,
};

const PHASE_LABELS: Record<string, string> = {
  "Survey":  "Khảo sát",
  "R&D":     "R&D",
  "Test":    "Kiểm thử",
  "Release": "Phát hành",
};

const FILTER_CHIPS = [
  { key: "all",      label: "Tất cả"  },
  { key: "FPGA",     label: "FPGA"    },
  { key: "Software", label: "SW"      },
  { key: "Hardware", label: "HW"      },
];

type ViewMode = 1 | 2 | 3 | 4 | 5;

const VIEW_ICONS = [
  { id: 1 as ViewMode, Icon: Grid2x2,   tooltip: "Thẻ dự án"      },
  { id: 2 as ViewMode, Icon: Circle,    tooltip: "Vòng tiến độ"   },
  { id: 3 as ViewMode, Icon: AlignLeft, tooltip: "Tiến độ Phase"  },
  { id: 4 as ViewMode, Icon: Grid3x3,   tooltip: "Ma trận giờ"    },
  { id: 5 as ViewMode, Icon: Layers,    tooltip: "Bản đồ dự án"   },
];

const AVAILABLE_PMS = [
  "Alice Morgan", "Bob Chen", "Carol Davies", "Dan Osei",
  "Eve Nkosi", "Fatima Hassan", "George Ikoro", "Helen Li",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: "Software" | "Hardware" | "FPGA" }) {
  const p = { className: "w-3.5 h-3.5" };
  if (category === "Software") return <Package {...p} />;
  if (category === "Hardware") return <Zap {...p} />;
  return <Cpu {...p} />;
}

function ProjectAvatar({ name, ragStatus }: { name: string; ragStatus: RAGStatus }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const bg: Record<RAGStatus, string> = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red:   "bg-red-100 text-red-700",
  };
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0", bg[ragStatus])}>
      {initials}
    </div>
  );
}

function MultiPhaseBar({ phases }: { phases: Project["phases"] }) {
  const totalWeight = phases.reduce((acc, ph) => acc + (PHASE_WEIGHTS[ph.phase] ?? 25), 0);
  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden gap-px" role="progressbar" aria-label="Phase progress">
      {phases.map(({ phase, progress }) => {
        const weight = PHASE_WEIGHTS[phase] ?? 25;
        const widthPct = (weight / totalWeight) * 100;
        const fill = PHASE_COLORS[phase] ?? "#999";
        return (
          <div
            key={phase}
            className="relative overflow-hidden bg-border/30"
            style={{ width: `${widthPct}%` }}
            title={`${PHASE_LABELS[phase] ?? phase}: ${progress}%`}
          >
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: fill }}
            />
          </div>
        );
      })}
    </div>
  );
}

function PhaseDots({ phases }: { phases: Project["phases"] }) {
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
      {phases.map(({ phase, progress }) => (
        <span key={phase} className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
            style={{ backgroundColor: PHASE_COLORS[phase] ?? "#999" }}
          />
          {PHASE_LABELS[phase] ?? phase}:{" "}
          <span className="font-semibold text-foreground">{progress}%</span>
        </span>
      ))}
    </div>
  );
}

function OrbitCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const rag = RAG_CONFIG[project.ragStatus];
  const borderColor = RAG_BORDER[project.ragStatus];
  const spi = project.plannedProgress > 0 ? project.overallProgress / project.plannedProgress : 1;
  const varianceDays = Math.round((spi - 1) * 180);
  const varianceLabel = varianceDays >= 0 ? `+${varianceDays}d` : `${varianceDays}d`;
  const varianceClass =
    varianceDays >= 0
      ? "bg-green-100 text-green-700"
      : varianceDays >= -7
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";

  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-r-xl rounded-l-none border border-border/60 bg-card hover:border-border transition-colors p-3.5 space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ borderLeft: `3px solid ${borderColor}` }}
      aria-label={`Open ${project.name}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <ProjectAvatar name={project.name} ragStatus={project.ragStatus} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <CategoryIcon category={project.category} />
            <p className="text-xs text-muted-foreground leading-tight truncate">{project.category}</p>
          </div>
          <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate group-hover:text-primary transition-colors">
            {project.name}
          </p>
          <p className="text-xs text-muted-foreground leading-tight truncate">{project.pm}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={cn("w-2 h-2 rounded-full", rag.color)} />
          <span className="text-[10px] text-muted-foreground hidden sm:block">{rag.label}</span>
        </div>
      </div>

      {/* Phase bar */}
      <div>
        <MultiPhaseBar phases={project.phases} />
        <PhaseDots phases={project.phases} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground">{project.overallProgress}%</span>
          <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${project.overallProgress}%` }} />
          </div>
        </div>
        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded", varianceClass)}>
          {varianceLabel}
        </span>
      </div>
    </button>
  );
}

function PhaseLegend() {
  const phases = [
    { key: "Survey",  label: "Khảo sát"  },
    { key: "R&D",     label: "R&D"        },
    { key: "Test",    label: "Kiểm thử"  },
    { key: "Release", label: "Phát hành" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 px-4 pb-3 border-t border-border/50">
      {phases.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PHASE_COLORS[key] }} />
          {label}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="w-2 h-2 rounded-full shrink-0 bg-border" />
        Còn lại
      </span>
    </div>
  );
}

// ─── Interface ────────────────────────────────────────────────────────────────

interface PortfolioTableProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onCreateProject?: (data: { name: string; category: "Software" | "Hardware" | "FPGA"; pm: string }) => void;
  canCreateProject?: boolean;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function PortfolioTable({
  projects,
  onProjectClick,
  onCreateProject,
  canCreateProject = true,
}: PortfolioTableProps) {
  const [activeView, setActiveView] = useState<ViewMode>(1);
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectName, setProjectName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Software" | "Hardware" | "FPGA" | null>(null);
  const [selectedPM, setSelectedPM] = useState<string | null>(null);

  function toggleFilter(key: string) {
    if (key === "all") { setActiveFilters(["all"]); return; }
    const next = activeFilters.filter((f) => f !== "all");
    if (next.includes(key)) {
      const removed = next.filter((f) => f !== key);
      setActiveFilters(removed.length === 0 ? ["all"] : removed);
    } else {
      setActiveFilters([...next, key]);
    }
  }

  const filteredProjects = activeFilters.includes("all")
    ? projects
    : projects.filter((p) => activeFilters.includes(p.category));

  function closeModal() {
    setShowNewProjectModal(false);
    setStep(1);
    setProjectName("");
    setSelectedCategory(null);
    setSelectedPM(null);
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/50 border-b border-border flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">Trạng thái danh mục</h2>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{filteredProjects.length} dự án</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* View switcher */}
          <div className="flex items-center rounded-md border border-border overflow-hidden" role="group" aria-label="View switcher">
            {VIEW_ICONS.map(({ id, Icon, tooltip }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                title={tooltip}
                aria-label={tooltip}
                aria-pressed={activeView === id}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  activeView === id
                    ? "bg-[#063986] text-white"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border shrink-0" aria-hidden="true" />

          {/* Filter chips */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Filter by category">
            {FILTER_CHIPS.map(({ key, label }) => {
              const isActive = activeFilters.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  aria-pressed={isActive}
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors",
                    isActive
                      ? "bg-[#063986] text-white border-[#063986]"
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {canCreateProject && <div className="h-6 w-px bg-border shrink-0" aria-hidden="true" />}

          {canCreateProject && (
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo dự án mới
            </button>
          )}
        </div>
      </div>

      {/* ── View Content ────────────────────────────────────────────────────── */}
      {activeView === 1 ? (
        <>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProjects.length === 0 ? (
              <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                Không có dự án nào phù hợp với bộ lọc.
              </p>
            ) : (
              filteredProjects.map((project) => (
                <OrbitCard
                  key={project.id}
                  project={project}
                  onClick={() => onProjectClick(project)}
                />
              ))
            )}
          </div>
          <PhaseLegend />
        </>
      ) : (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          Đang phát triển — sắp ra mắt
        </div>
      )}

      {/* ── New Project Modal ───────────────────────────────────────────────── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />
          <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Tạo dự án mới</h3>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={cn("h-1.5 w-8 rounded-full transition-colors", s <= step ? "bg-primary" : "bg-border")} />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">Tên dự án</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., NavComm v2.0, Sentinel Pro..."
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => { if (e.key === "Enter" && projectName.trim()) setStep(2); }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Chọn loại dự án:</p>
                {(["Software", "Hardware", "FPGA"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left",
                      selectedCategory === cat ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <CategoryIcon category={cat} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{cat}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {cat === "Software" && "Survey 10%, R&D 45%, Test 30%, Release 15%"}
                        {cat === "Hardware" && "Survey 15%, R&D 50%, Test 25%, Release 10%"}
                        {cat === "FPGA"     && "Survey 12%, R&D 52%, Test 28%, Release 8%"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Chỉ định Quản lý dự án:</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {AVAILABLE_PMS.map((pm) => (
                    <button
                      key={pm}
                      onClick={() => setSelectedPM(pm)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2.5 border rounded-lg transition-colors text-left text-xs",
                        selectedPM === pm ? "border-primary bg-primary/5 font-semibold" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {pm.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span>{pm}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => { if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3); else closeModal(); }}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                {step === 1 ? "Hủy" : "Quay lại"}
              </button>
              <button
                onClick={() => {
                  if (step === 1 && projectName.trim()) setStep(2);
                  else if (step === 2 && selectedCategory) setStep(3);
                  else if (step === 3 && selectedCategory && selectedPM) {
                    onCreateProject?.({ name: projectName.trim(), category: selectedCategory, pm: selectedPM });
                    closeModal();
                  }
                }}
                disabled={
                  (step === 1 && !projectName.trim()) ||
                  (step === 2 && !selectedCategory) ||
                  (step === 3 && !selectedPM)
                }
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {step === 3 ? "Tạo dự án" : "Tiếp theo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
