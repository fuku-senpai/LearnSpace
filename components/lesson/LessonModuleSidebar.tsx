"use client";

import { BookOpen, Loader2 } from "lucide-react";
import { HiMiniDocumentChartBar, HiVideoCamera } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export type LessonSidebarSession = {
  id: string;
  title: string;
  lessonOrder?: number;
  hasMaterials: boolean;
  hasPreviewVideo: boolean;
  hasReplayVideo: boolean;
};

export type LessonSidebarModule = {
  id: string;
  title: string;
  sessions: LessonSidebarSession[];
};

type LessonModuleSidebarProps = {
  modules: LessonSidebarModule[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
};

function SessionContentIcons({ session }: { session: LessonSidebarSession }) {
  if (
    !session.hasMaterials &&
    !session.hasPreviewVideo &&
    !session.hasReplayVideo
  ) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {session.hasMaterials ? (
        <HiMiniDocumentChartBar
          className="h-4 w-4 text-blue-800"
          aria-label="Có tài liệu"
        />
      ) : null}
      {session.hasPreviewVideo ? (
        <HiVideoCamera
          className="h-4 w-4 text-amber-600"
          aria-label="Có video xem trước"
        />
      ) : null}
      {session.hasReplayVideo ? (
        <HiVideoCamera
          className="h-5 w-5 text-red-600"
          aria-label="Có video xem lại"
        />
      ) : null}
    </div>
  );
}

export function LessonModuleSidebar({
  modules,
  activeSessionId,
  onSelectSession,
  isLoading = false,
  errorMessage,
  emptyMessage = "Chưa có dữ liệu.",
}: LessonModuleSidebarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải dữ liệu...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
        {errorMessage}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center gap-2 px-1">
        <BookOpen className="h-4 w-4 text-blue-800" />
        <p className="text-xs font-semibold tracking-wide text-blue-900 uppercase">
          Chương trình học
        </p>
      </div>

      <div className="relative">
        <div className="absolute top-3 bottom-3 left-[15px] w-px bg-blue-300/80" />

        <div className="space-y-5">
          {modules.map((courseModule, moduleIndex) => (
            <div key={courseModule.id} className="relative pl-10">
              <div className="absolute top-1 left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-800 bg-white shadow-sm">
                <span className="text-[10px] font-bold text-blue-900">
                  {moduleIndex + 1}
                </span>
              </div>

              <div className="pb-2 pt-0.5">
                <p className="text-sm font-semibold leading-snug text-slate-900">
                  {courseModule.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {courseModule.sessions.length} buổi học
                </p>
              </div>

              <div className="relative space-y-0.5 pl-1">
                {courseModule.sessions.map((session, sessionIndex) => {
                  const isActive = session.id === activeSessionId;
                  const orderLabel = session.lessonOrder ?? sessionIndex + 1;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        "group relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 pl-3 text-left transition",
                        isActive
                          ? "bg-blue-50 text-blue-950"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <span className="absolute top-1/2 -left-3 h-px w-3 -translate-y-1/2 bg-blue-300/80" />

                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold",
                          isActive
                            ? "bg-blue-900 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                        )}
                      >
                        {orderLabel}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          isActive ? "font-semibold" : "font-medium",
                        )}
                      >
                        {session.title}
                      </span>
                      <SessionContentIcons session={session} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
