import { Button } from "@uxin/ui";
import { Flag, CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";
import React from "react";
import { ProjectMilestone, MilestoneStatus } from "../types";
import { cn } from "./shared-ui";

interface MilestoneListProps {
  milestones: ProjectMilestone[];
  onMilestoneClick?: (milestone: ProjectMilestone) => void;
  onCreateMilestone?: () => void;
  className?: string;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  onMilestoneClick,
  onCreateMilestone,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">项目里程碑</h3>
          <p className="text-xs text-zinc-500 mt-0.5">关键节点与阶段性目标达成情况</p>
        </div>
        <Button
          onClick={onCreateMilestone}
          className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
        >
          + 添加里程碑
        </Button>
      </div>

      <div className="p-6">
        {milestones.length > 0 ? (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-zinc-100 before:to-zinc-100">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="relative flex items-start group cursor-pointer"
                onClick={() => onMilestoneClick?.(milestone)}
              >
                <div
                  className={cn(
                    "absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all z-10",
                    milestone.status === MilestoneStatus.COMPLETED
                      ? "bg-emerald-500 text-white"
                      : milestone.status === MilestoneStatus.PENDING
                        ? "bg-white border-emerald-500 text-emerald-500"
                        : "bg-white border-rose-200 text-rose-300",
                  )}
                >
                  {milestone.status === MilestoneStatus.COMPLETED ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : milestone.status === MilestoneStatus.PENDING ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                <div className="ml-14 flex-1">
                  <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-emerald-500/5 group-hover:border-emerald-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        {milestone.title}
                        {milestone.status === MilestoneStatus.PENDING && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            进行中
                          </span>
                        )}
                        {milestone.status === MilestoneStatus.DELAYED && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            延期
                          </span>
                        )}
                      </h4>
                      <span className="text-xs font-bold text-zinc-400">
                        {milestone.dueDate
                          ? new Date(milestone.dueDate).toLocaleDateString("zh-CN")
                          : "未设置截止日期"}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                        {milestone.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-1000",
                            milestone.status === MilestoneStatus.COMPLETED
                              ? "bg-emerald-500"
                              : "bg-emerald-400",
                          )}
                          style={{
                            width: milestone.status === MilestoneStatus.COMPLETED ? "100%" : "50%",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-600">
                        {milestone.status === MilestoneStatus.COMPLETED ? "100%" : "50%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Flag className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">暂未设置里程碑</p>
          </div>
        )}
      </div>
    </div>
  );
};
