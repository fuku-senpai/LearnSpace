"use client";

import type { ReactNode } from "react";
import {
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileText,
  Globe,
  Link2,
  Loader2,
  Pin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LessonResourceItem } from "@/app/service/lessonResource.service";
import { cn } from "@/lib/utils";

type LessonMaterialsListProps = {
  lessonTitle?: string;
  resources?: LessonResourceItem[];
  isLoading?: boolean;
  snapLessonId?: string;
};

const noteThemes = [
  {
    paper: "bg-[#fef9c3]",
    shadow: "shadow-[5px_5px_0_#92400e]",
    hoverShadow: "hover:shadow-[7px_7px_0_#92400e]",
    accent: "text-amber-900",
    pin: "bg-red-500",
    watermark: "text-amber-900/10",
    chip: "bg-amber-100 text-amber-950 ring-amber-300/80",
    btn: "bg-amber-900 text-amber-50 hover:bg-amber-800",
  },
  {
    paper: "bg-[#fce7f3]",
    shadow: "shadow-[5px_5px_0_#9d174d]",
    hoverShadow: "hover:shadow-[7px_7px_0_#9d174d]",
    accent: "text-rose-900",
    pin: "bg-rose-500",
    watermark: "text-rose-900/10",
    chip: "bg-rose-100 text-rose-950 ring-rose-300/80",
    btn: "bg-rose-900 text-rose-50 hover:bg-rose-800",
  },
  {
    paper: "bg-[#d1fae5]",
    shadow: "shadow-[5px_5px_0_#065f46]",
    hoverShadow: "hover:shadow-[7px_7px_0_#065f46]",
    accent: "text-emerald-900",
    pin: "bg-emerald-600",
    watermark: "text-emerald-900/10",
    chip: "bg-emerald-100 text-emerald-950 ring-emerald-300/80",
    btn: "bg-emerald-900 text-emerald-50 hover:bg-emerald-800",
  },
  {
    paper: "bg-[#dbeafe]",
    shadow: "shadow-[5px_5px_0_#1e3a8a]",
    hoverShadow: "hover:shadow-[7px_7px_0_#1e3a8a]",
    accent: "text-blue-900",
    pin: "bg-blue-600",
    watermark: "text-blue-900/10",
    chip: "bg-blue-100 text-blue-950 ring-blue-300/80",
    btn: "bg-blue-900 text-blue-50 hover:bg-blue-800",
  },
] as const;

const linkTheme = {
  paper: "bg-[#ede9fe]",
  shadow: "shadow-[5px_5px_0_#5b21b6]",
  hoverShadow: "hover:shadow-[7px_7px_0_#5b21b6]",
  accent: "text-violet-900",
  pin: "bg-violet-600",
  watermark: "text-violet-900/10",
  chip: "bg-violet-100 text-violet-950 ring-violet-300/80",
  btn: "bg-violet-900 text-violet-50 hover:bg-violet-800",
} as const;

type NoteTheme = (typeof noteThemes)[number] | typeof linkTheme;

const noteRotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-3"];

function getNoteTheme(type: string, index: number): NoteTheme {
  if (type === "LINK") return linkTheme;
  return noteThemes[index % noteThemes.length];
}

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  } catch {
    const fallback = url.split("/").filter(Boolean).pop();
    if (fallback) return decodeURIComponent(fallback.split("?")[0] ?? fallback);
  }
  return "Tệp đính kèm";
}

function getUrlVisual(url: string, type: string): { icon: LucideIcon; label: string } {
  if (type === "LINK") {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      return { icon: Globe, label: hostname || url };
    } catch {
      return { icon: Link2, label: url };
    }
  }

  const fileName = getFileNameFromUrl(url);
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return { icon: FileSpreadsheet, label: fileName };
  }
  if (["pdf", "doc", "docx", "ppt", "pptx", "txt"].includes(extension)) {
    return { icon: FileText, label: fileName };
  }
  return { icon: File, label: fileName };
}

function CorkBoardShell({
  lessonTitle,
  count,
  children,
}: {
  lessonTitle?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#0c1e3a] shadow-[8px_8px_0_#0c1e3a]">
      <div className="flex min-h-[420px] flex-col lg:flex-row">
        <aside className="relative shrink-0 overflow-hidden bg-[#0c1e3a] px-5 py-6 text-white lg:w-44 lg:px-4 lg:py-8">
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -top-4 -left-4 h-20 w-20 rounded-full bg-violet-400/20 blur-2xl" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-cyan-200 uppercase">
              <Pin className="h-3 w-3" />
              Archive
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-blue-200/70 uppercase">
                Tài liệu
              </p>
              <h3 className="mt-1 text-lg leading-tight font-black tracking-tight">
                Bảng ghim
              </h3>
            </div>
            {lessonTitle ? (
              <p className="text-sm leading-snug text-blue-100/80">{lessonTitle}</p>
            ) : null}
            {typeof count === "number" ? (
              <div className="inline-flex rotate-[-4deg] items-center border-2 border-dashed border-amber-300/50 bg-amber-400/15 px-3 py-1.5 font-mono text-xs font-bold text-amber-100">
                {count} mục đã ghim
              </div>
            ) : null}
          </div>
        </aside>

        <div
          className="relative flex-1 px-4 py-6 sm:px-6 sm:py-8"
          style={{
            backgroundColor: "#e8dcc8",
            backgroundImage:
              "radial-gradient(circle, rgba(120,90,60,0.18) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-[#a89070]/40" />
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyBoard({ title, description }: { title: string; description: string }) {
  return (
    <CorkBoardShell>
      <div className="relative flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
        <div className="absolute top-8 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 ring-2 ring-red-700/30" />
        <div className="mt-6 w-full max-w-xs rotate-[-2deg] border-2 border-dashed border-[#a89070] bg-[#fef9c3]/60 px-6 py-10 shadow-[4px_4px_0_#92400e]">
          <p className="font-semibold text-amber-950">{title}</p>
          <p className="mt-2 text-sm text-amber-900/70">{description}</p>
        </div>
      </div>
    </CorkBoardShell>
  );
}

function LoadingBoard() {
  return (
    <CorkBoardShell>
      <div className="relative flex min-h-[280px] items-center justify-center gap-3 text-sm font-medium text-[#5c4a32]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Đang mở bảng ghim...
      </div>
    </CorkBoardShell>
  );
}

function StickyNote({
  resource,
  index,
}: {
  resource: LessonResourceItem;
  index: number;
}) {
  const theme = getNoteTheme(resource.type, index);
  const rotation = noteRotations[index % noteRotations.length];
  const isLink = resource.type === "LINK";

  return (
    <article
      className={cn(
        "group relative w-full max-w-md transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:rotate-0",
        rotation,
        theme.paper,
        theme.shadow,
        theme.hoverShadow,
      )}
    >
      <div className="absolute -top-2 left-1/2 h-5 w-14 -translate-x-1/2 rounded-sm bg-white/45 shadow-sm ring-1 ring-black/5" />
      <div
        className={cn(
          "absolute -top-3 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-2 ring-black/10",
          theme.pin,
        )}
      />

      <div className="relative overflow-hidden p-4 pt-5 sm:p-5 sm:pt-6">
        <span
          className={cn(
            "pointer-events-none absolute -right-2 -bottom-4 select-none text-7xl font-black",
            theme.watermark,
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ring-1",
              theme.chip,
            )}
          >
            {isLink ? "🔗 Link" : "📎 File"}
          </span>
          <h4 className={cn("mt-2 text-base leading-snug font-black", theme.accent)}>
            {resource.title}
          </h4>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-black/55">
            {resource.note?.trim() || "Không có ghi chú — nhưng vẫn đáng xem."}
          </p>
        </div>

        {resource.urls?.length > 0 ? (
          <div className="relative mt-4 space-y-2">
            {resource.urls.map((resourceUrl, urlIndex) => {
              const urlVisual = getUrlVisual(resourceUrl, resource.type);
              const UrlIcon = urlVisual.icon;

              return (
                <a
                  key={`${resource.id}-${urlIndex}`}
                  href={resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group/link flex items-center gap-2 rounded-lg border border-black/10 bg-white/55 px-3 py-2.5 backdrop-blur-sm transition hover:bg-white/80"
                >
                  <UrlIcon className={cn("h-4 w-4 shrink-0", theme.accent)} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-black/75">
                    {urlVisual.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold",
                      theme.btn,
                    )}
                  >
                    {isLink ? (
                      <>
                        GO
                        <ExternalLink className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        GET
                        <Download className="h-3 w-3" />
                      </>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function LessonMaterialsList({
  lessonTitle,
  resources = [],
  isLoading = false,
  snapLessonId,
}: LessonMaterialsListProps) {
  if (!snapLessonId) {
    return (
      <EmptyBoard
        title="Chưa chọn buổi học"
        description="Chọn buổi ở sidebar — tài liệu sẽ được ghim lên bảng."
      />
    );
  }

  if (isLoading) {
    return <LoadingBoard />;
  }

  if (resources.length === 0) {
    return (
      <EmptyBoard
        title="Bảng đang trống"
        description="Giáo viên chưa ghim tài liệu nào cho buổi học này."
      />
    );
  }

  return (
    <CorkBoardShell lessonTitle={lessonTitle} count={resources.length}>
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-8">
        {resources.map((resource, index) => (
          <div
            key={resource.id}
            className={cn(
              "flex",
              index % 2 === 0 ? "justify-start md:mt-0" : "justify-end md:mt-8",
            )}
          >
            <StickyNote resource={resource} index={index} />
          </div>
        ))}
      </div>
    </CorkBoardShell>
  );
}
