"use client";

import { GitBranch } from "lucide-react";

import { cn } from "@/lib/utils";

type QuizVersionBadgeProps = {
  version?: number | null;
  size?: "sm" | "md";
  className?: string;
};

export function QuizVersionBadge({
  version,
  size = "sm",
  className,
}: QuizVersionBadgeProps) {
  const hasVersion = typeof version === "number" && version >= 1;

  return (
    <span
      title={
        hasVersion
          ? `Phiên bản ${version}`
          : "Chưa có thông tin phiên bản"
      }
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-lg border font-semibold",
        hasVersion
          ? "border-violet-200 bg-violet-50 text-violet-800"
          : "border-slate-200 bg-slate-50 text-slate-400",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className,
      )}
    >
      <GitBranch
        className={cn(
          "shrink-0",
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
          hasVersion ? "text-violet-600" : "text-slate-400",
        )}
      />
      <span className="truncate">
        {hasVersion ? `v${version}` : "—"}
      </span>
    </span>
  );
}
