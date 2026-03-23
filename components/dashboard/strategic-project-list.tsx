"use client";

import { Project, RAGStatus } from "@/lib/mock-data";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StrategicProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onScheduleMeeting: (project: Project) => void;
  selectedProjectId?: string | null;
}

export function StrategicProjectList({
  projects,
  onProjectClick,
  onScheduleMeeting,
  selectedProjectId,
}: StrategicProjectListProps) {
  console.log("[v0] StrategicProjectList rendering with", projects.length, "projects");
  
  const [expandedRAG, setExpandedRAG] = useState<Set<RAGStatus>>(
    new Set(["red", "amber"])
  );

  // Group by RAG status
  const grouped = {
    red: projects.filter((p) => p.ragStatus === "red"),
    amber: projects.filter((p) => p.ragStatus === "amber"),
    green: projects.filter((p) => p.ragStatus === "green"),
  };

  const RAG_CONFIG: Record<RAGStatus, { label: string; color: string }> = {
    red: { label: "Trễ hạn", color: "bg-red-500" },
    amber: { label: "Có rủi ro", color: "bg-amber-400" },
    green: { label: "Đúng hạn", color: "bg-green-500" },
  };

  const toggleGroup = (status: RAGStatus) => {
    const newSet = new Set(expandedRAG);
    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }
    setExpandedRAG(newSet);
  };

  const renderGroup = (status: RAGStatus) => {
    const items = grouped[status];
    if (items.length === 0) return null;

    const isExpanded = expandedRAG.has(status);
    const config = RAG_CONFIG[status];

    return (
      <div key={status} className="mb-0.5">
        {/* Group header */}
        <button
          onClick={() => toggleGroup(status)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span className={`inline-block w-2 h-2 rounded-full ${config.color}`} />
          <span>{config.label}</span>
          <span className="ml-auto text-muted-foreground">({items.length})</span>
        </button>

        {/* Items */}
        {isExpanded && (
          <div className="bg-muted/20">
            {items.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectClick(project)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs border-b border-border last:border-0 cursor-pointer hover:bg-muted transition-colors",
                  selectedProjectId === project.id && "bg-primary/5 border-primary/20"
                )}
              >
                {/* RAG dot */}
                <span className={`inline-block w-2 h-2 rounded-full ${config.color} shrink-0`} />

                {/* Project name & progress */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-semibold text-foreground truncate">
                    {project.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-muted-foreground">{project.pm}</span>
                    <span className="font-mono text-muted-foreground">
                      {project.overallProgress}% | {Math.round((project.overallProgress - project.plannedProgress) * 10) / 10}%
                    </span>
                  </div>
                </div>

                {/* Calendar button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleMeeting(project);
                  }}
                  className="p-1.5 rounded hover:bg-primary/10 transition-colors shrink-0 group"
                  title="Lên lịch họp"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="divide-y divide-border">
        {renderGroup("red")}
        {renderGroup("amber")}
        {renderGroup("green")}
      </div>
    </div>
  );
}
