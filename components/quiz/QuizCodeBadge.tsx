"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type QuizCodeBadgeProps = {
  code?: string | null;
  size?: "sm" | "md";
  showHint?: boolean;
  className?: string;
};

export function QuizCodeBadge({
  code,
  size = "sm",
  showHint = false,
  className,
}: QuizCodeBadgeProps) {
  const trimmed = code?.trim() ?? "";
  const hasCode = Boolean(trimmed);

  const handleCopy = async () => {
    if (!hasCode) return;

    try {
      await navigator.clipboard.writeText(trimmed);
      toast.success("Đã sao chép mã đề");
    } catch {
      toast.error("Không thể sao chép mã");
    }
  };

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!hasCode}
        title={
          hasCode
            ? "Nhấn để sao chép mã cho học sinh"
            : "Chưa có mã đề"
        }
        className={cn(
          "group/code inline-flex max-w-full items-center gap-1.5 rounded-lg border font-mono font-bold tracking-wider transition",
          hasCode
            ? "cursor-pointer border-amber-300 bg-amber-50 text-amber-900 shadow-[0_0_0_1px_rgba(251,191,36,0.25)] hover:border-amber-400 hover:bg-amber-100"
            : "cursor-default border-slate-200 bg-slate-50 text-slate-400",
          size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        )}
      >
        <span className="truncate uppercase">{hasCode ? trimmed : "—"}</span>
        {hasCode ? (
          <Copy className="h-3.5 w-3.5 shrink-0 opacity-60 transition group-hover/code:opacity-100" />
        ) : null}
      </button>
      {showHint ? (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
          Học sinh nhập mã này để làm bài
        </p>
      ) : null}
    </div>
  );
}
