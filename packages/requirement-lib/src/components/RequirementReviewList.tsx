import { Star } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { RequirementReview } from "../types";

interface RequirementReviewListProps {
  reviews: RequirementReview[];
  className?: string;
}

export const RequirementReviewList: React.FC<RequirementReviewListProps> = ({
  reviews,
  className,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-10 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800",
          className,
        )}
      >
        <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-medium">暂无评价</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                {review.user?.name?.[0] || "U"}
              </div>
              <div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                  {review.user?.name || "未知用户"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-zinc-200 dark:text-zinc-700",
                  )}
                />
              ))}
              <span className="text-xs font-bold ml-1.5 text-zinc-600 dark:text-zinc-400">
                {review.rating}
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-1">
              {review.comment || "未提供详细评价"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
