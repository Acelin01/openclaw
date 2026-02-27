import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@uxin/ui";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, Users, CheckCircle2, Clock } from "lucide-react";
import React from "react";
import { Iteration } from "../types";
import { IterationStatusBadge } from "./IterationStatusBadge";

interface IterationCardProps {
  iteration: Iteration;
  onClick?: (id: string) => void;
}

export const IterationCard: React.FC<IterationCardProps> = ({ iteration, onClick }) => {
  const progress = iteration._count
    ? Math.round(
        (iteration._count.tasks / (iteration._count.requirements + iteration._count.tasks || 1)) *
          100,
      )
    : 0;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(iteration.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate mr-2">{iteration.name}</CardTitle>
          <IterationStatusBadge status={iteration.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {format(new Date(iteration.startDate), "MM月dd日", { locale: zhCN })} -{" "}
            {format(new Date(iteration.endDate), "MM月dd日", { locale: zhCN })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-gray-600">需求: {iteration._count?.requirements || 0}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-gray-600">任务: {iteration._count?.tasks || 0}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>整体进度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1" />
          <span>负责人: {iteration.owner?.name || "未分配"}</span>
        </div>
        <span>更新于 {format(new Date(iteration.updatedAt), "MM-dd")}</span>
      </CardFooter>
    </Card>
  );
};
