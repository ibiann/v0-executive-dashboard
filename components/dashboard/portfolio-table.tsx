"use client";

import { useState } from "react";
import { Project, RAGStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus, Cpu, Zap, Package } from "lucide-react";

const RAG_CONFIG: Record<RAGStatus, { color: string; label: string }> = {
  green: { color: "bg-green-500", label: "On Track" },
  amber: { color: "bg-amber-400", label: "At Risk" },
  red: { color: "bg-red-500", label: "Delayed" },
};

function CategoryIcon({ category }: { category: "Software" | "Hardware" | "FPGA" }) {
  const iconProps = { className: "w-4 h-4 text-muted-foreground" };
  switch (category) {
    case "Software":
      return <Package {...iconProps} title="Software" />;
    case "Hardware":
      return <Zap {...iconProps} title="Hardware" />;
    case "FPGA":
      return <Cpu {...iconProps} title="FPGA" />;
  }
}

function PhaseProgressBar({ phases }: { phases: Project["phases"] }) {
  return (
    <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5" role="progressbar" aria-label="Phase progress">
      {phases.map(({ phase, progress, color }) => (
        <div key={phase} className="flex-1 rounded-sm overflow-hidden bg-border/40 relative" title={`${phase}: ${progress}%`}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      ))}
    </div>
  );
}

function PhaseLegend({ phases }: { phases: Project["phases"] }) {
  return (
    <div className="flex gap-3 flex-wrap mt-1">
      {phases.map(({ phase, progress, color }) => (
        <span key={phase} className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ backgroundColor: color }} />
          {phase}: <strong className="text-foreground">{progress}%</strong>
        </span>
      ))}
    </div>
  );
}

interface PortfolioTableProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onCreateProject?: (data: { name: string; category: "Software" | "Hardware" | "FPGA"; pm: string }) => void;
}

const AVAILABLE_PMS = [
  "Alice Morgan",
  "Bob Chen",
  "Carol Davies",
  "Dan Osei",
  "Eve Nkosi",
  "Fatima Hassan",
  "George Ikoro",
  "Helen Li",
];

export function PortfolioTable({ projects, onProjectClick, onCreateProject }: PortfolioTableProps) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectName, setProjectName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Software" | "Hardware" | "FPGA" | null>(null);
  const [selectedPM, setSelectedPM] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Portfolio Status</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{projects.length} projects</span>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project / PM</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">RAG</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-64">Phase Progress</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Progress</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">SPI</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, i) => {
              const rag = RAG_CONFIG[project.ragStatus];
              const spi =
                project.plannedProgress > 0
                  ? (project.overallProgress / project.plannedProgress).toFixed(2)
                  : "N/A";
              const spiNum = parseFloat(spi);
              return (
                <tr
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className={cn(
                    "border-b border-border/50 hover:bg-primary/5 cursor-pointer transition-colors group",
                    i % 2 === 0 ? "bg-card" : "bg-muted/10"
                  )}
                >
                  {/* Project / PM with category icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={project.category} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{project.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.pm}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </td>

                  {/* RAG */}
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={cn("w-2.5 h-2.5 rounded-full shrink-0", rag.color)}
                        aria-label={rag.label}
                      />
                      <span className="text-xs text-muted-foreground hidden lg:block">{rag.label}</span>
                    </div>
                  </td>

                  {/* Phase progress */}
                  <td className="px-4 py-3">
                    <PhaseProgressBar phases={project.phases} />
                    <PhaseLegend phases={project.phases} />
                  </td>

                  {/* Overall progress */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-foreground">{project.overallProgress}%</span>
                    <div className="mt-1 h-1 rounded-full bg-border w-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${project.overallProgress}%` }}
                      />
                    </div>
                  </td>

                  {/* SPI */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded",
                        spiNum >= 1
                          ? "bg-green-100 text-green-700"
                          : spiNum >= 0.85
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {spi}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Advanced Multi-Step Project Creation Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowNewProjectModal(false);
            setStep(1);
            setProjectName("");
            setSelectedCategory(null);
            setSelectedPM(null);
          }} aria-hidden="true" />
          <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Create New Project</h3>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-colors",
                      s <= step ? "bg-primary" : "bg-border"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Project Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., NavComm v2.0, Sentinel Pro..."
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && projectName.trim()) {
                        setStep(2);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Category Selection */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Select project category:</p>
                {["Software", "Hardware", "FPGA"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as "Software" | "Hardware" | "FPGA")}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left",
                      selectedCategory === cat
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <CategoryIcon category={cat as "Software" | "Hardware" | "FPGA"} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{cat}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {cat === "Software" && "Default weights: Survey 10%, R&D 45%, Test 30%, Release 15%"}
                        {cat === "Hardware" && "Default weights: Survey 15%, R&D 50%, Test 25%, Release 10%"}
                        {cat === "FPGA" && "Default weights: Survey 12%, R&D 52%, Test 28%, Release 8%"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: PM Selection */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Assign Project Manager:</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {AVAILABLE_PMS.map((pm) => (
                    <button
                      key={pm}
                      onClick={() => setSelectedPM(pm)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2.5 border rounded-lg transition-colors text-left text-xs",
                        selectedPM === pm
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-border hover:bg-muted/50"
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

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => {
                  if (step > 1) {
                    setStep((s) => (s - 1) as 1 | 2 | 3);
                  } else {
                    setShowNewProjectModal(false);
                    setStep(1);
                    setProjectName("");
                    setSelectedCategory(null);
                    setSelectedPM(null);
                  }
                }}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <button
                onClick={() => {
                  if (step === 1 && projectName.trim()) {
                    setStep(2);
                  } else if (step === 2 && selectedCategory) {
                    setStep(3);
                  } else if (step === 3 && selectedCategory && selectedPM) {
                    onCreateProject?.({
                      name: projectName.trim(),
                      category: selectedCategory,
                      pm: selectedPM,
                    });
                    setShowNewProjectModal(false);
                    setStep(1);
                    setProjectName("");
                    setSelectedCategory(null);
                    setSelectedPM(null);
                  }
                }}
                disabled={
                  (step === 1 && !projectName.trim()) ||
                  (step === 2 && !selectedCategory) ||
                  (step === 3 && !selectedPM)
                }
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {step === 3 ? "Create Project" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
