import React from "react";
import { ProjectRequirement, ProjectTeamMember, ProjectTask } from "../types";
import { RequirementDetailView } from "./RequirementDetailView";

interface RequirementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: ProjectRequirement | null;
  onUpdate?: (id: string, updates: Partial<ProjectRequirement>) => Promise<void>;
  members?: ProjectTeamMember[];
  tasks?: ProjectTask[];
  defects?: any[];
  risks?: any[];
  onTaskClick?: (task: any) => void;
  onDefectClick?: (defect: any) => void;
  onRiskClick?: (risk: any) => void;
}

export const RequirementDetailModal: React.FC<RequirementDetailModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onUpdate,
  members = [],
  tasks = [],
  defects = [],
  risks = [],
  onTaskClick,
  onDefectClick,
  onRiskClick,
}) => {
  if (!isOpen || !requirement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <RequirementDetailView
          requirement={requirement}
          onClose={onClose}
          onUpdate={onUpdate}
          members={members}
          tasks={tasks}
          defects={defects}
          risks={risks}
          onTaskClick={onTaskClick}
          onDefectClick={onDefectClick}
          onRiskClick={onRiskClick}
        />
      </div>
    </div>
  );
};
