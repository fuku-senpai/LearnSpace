"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FileText,
  Loader2,
  MonitorPlay,
  PlayCircle,
  Sparkles,
  UserPlus,
  Video,
} from "lucide-react";
import { useGetMyClassesQuery } from "@/app/hooks/classes/useGetMyClasses";
import { useGetSnapMaterials } from "@/app/hooks/materials/useGetSnapMaterials";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import { useGetRecordsByLessonQuery } from "@/app/hooks/records/useGetRecords";
import { useGetVideoQuery } from "@/app/hooks/videos/useGetVideoQuery";
import { useEnrollClassroomMutation } from "@/app/hooks/classes/useEnrollClassroom";
import { type MyClass } from "@/app/service/classroom.service";
import { RecordItem } from "@/app/service/record.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabKey = "videos" | "materials";

type Session = {
  id: string;
  title: string;
  hasVideo: boolean;
};

type Module = {
  id: string;
  title: string;
  sessions: Session[];
};

type ActiveSessionState = {
  module: Module;
  session: Session;
};

const emptyActiveSession: ActiveSessionState = {
  module: { id: "", title: "", sessions: [] },
  session: { id: "", title: "", hasVideo: false },
};

function findActiveSession(
  modules: Module[],
  sessionId: string,
): ActiveSessionState {
  for (const courseModule of modules) {
    const session = courseModule.sessions.find((item) => item.id === sessionId);
    if (session) {
      return { module: courseModule, session };
    }
  }

  if (modules.length > 0 && modules[0].sessions.length > 0) {
    return { module: modules[0], session: modules[0].sessions[0] };
  }

  return emptyActiveSession;
}

function LessonMaterialsList({
  snapLessonId,
  lessonTitle,
}: {
  snapLessonId: string;
  lessonTitle: string;
}) {
  const { data: resources = [], isLoading } =
    useGetLessonResourcesQuery(snapLessonId);

  if (!snapLessonId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
        Chọn buổi học để xem tài liệu
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-6 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải tài liệu...
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
        Chưa có tài liệu cho buổi học này
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        Buổi: {lessonTitle}
      </p>
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80">
        {resources.map((resource) => (
          <div key={resource.id} className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-violet-600">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{resource.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {resource.note || "Không có ghi chú"}
                </p>
                <span className="mt-2 inline-flex rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {resource.type}
                </span>
              </div>
            </div>

            {resource.urls?.length > 0 ? (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {resource.urls.map((resourceUrl, index) => (
                  <a
                    key={index}
                    href={resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm transition hover:border-violet-200 hover:bg-violet-50/50"
                  >
                    <span className="truncate text-slate-700">
                      {resource.type === "LINK"
                        ? resourceUrl
                        : `File ${index + 1}`}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-violet-600">
                      Mở
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const StudentClassView = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("materials");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined,
  );
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  const { data: myClasses = [], isLoading: isLoadingClasses } =
    useGetMyClassesQuery();
  const { mutateAsync: enrollClassroom, isPending: isEnrolling } =
    useEnrollClassroomMutation();

  const effectiveCourseId =
    selectedCourseId ?? myClasses[0]?.id ?? undefined;

  const {
    data: snapMaterials,
    isLoading: isLoadingMaterials,
    error: materialsError,
  } = useGetSnapMaterials(effectiveCourseId);

  const modules: Module[] = useMemo(() => {
    if (!Array.isArray(snapMaterials)) return [];
    return snapMaterials.map((material) => ({
      id: material.materialId,
      title: material.title,
      sessions: (material.lessons || []).map((lesson) => ({
        id: lesson.lessonId,
        title: lesson.title,
        hasVideo:
          Array.isArray(lesson.lessonVideos) && lesson.lessonVideos.length > 0,
      })),
    }));
  }, [snapMaterials]);

  const resolvedSessionId = useMemo(() => {
    const allSessions = modules.flatMap(
      (courseModule) => courseModule.sessions,
    );
    if (
      activeSessionId &&
      allSessions.some((session) => session.id === activeSessionId)
    ) {
      return activeSessionId;
    }
    return modules[0]?.sessions[0]?.id ?? "";
  }, [activeSessionId, modules]);

  const activeSession = useMemo(
    () => findActiveSession(modules, resolvedSessionId),
    [modules, resolvedSessionId],
  );

  const { data: records = [], isFetching: isFetchingRecords } =
    useGetRecordsByLessonQuery(resolvedSessionId || undefined);
  const recordItems = records as RecordItem[];

  const shouldFetchPlayUrl =
    activeTab === "videos" &&
    Boolean(resolvedSessionId) &&
    activeSession.session.hasVideo;

  const {
    data: playVideo,
    isLoading: isLoadingPlayUrl,
    isFetching: isFetchingPlayUrl,
  } = useGetVideoQuery(shouldFetchPlayUrl ? resolvedSessionId : undefined);

  const { data: lessonResources = [] } = useGetLessonResourcesQuery(
    resolvedSessionId || undefined,
  );

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveTab("materials");
  };

  const handleEnroll = async () => {
    const normalizedCode = enrollCode.trim().toUpperCase();
    if (!normalizedCode) {
      setEnrollMessage("Vui lòng nhập mã lớp.");
      return;
    }

    try {
      const response = await enrollClassroom({ code: normalizedCode });
      setEnrollMessage(response.message || "Tham gia lớp học thành công.");
      setEnrollCode("");
    } catch {
      setEnrollMessage("Không thể tham gia lớp học. Vui lòng kiểm tra mã lớp.");
    }
  };

  if (isLoadingClasses) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải lớp học...
      </div>
    );
  }

  if (myClasses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Chưa có lớp học
              </h2>
              <p className="text-sm text-slate-500">
                Nhập mã lớp để tham gia và xem tài liệu, video bài giảng.
              </p>
            </div>
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Mã lớp học
            </label>
            <Input
              placeholder="Ví dụ: ABC123"
              className="h-10 border-slate-200/80 uppercase"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
            />
            {enrollMessage ? (
              <p className="text-sm text-slate-600">{enrollMessage}</p>
            ) : null}
            <Button
              className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={isEnrolling}
              onClick={handleEnroll}
            >
              {isEnrolling ? "Đang tham gia..." : "Tham gia lớp"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white px-5 py-3">
        <Select
          value={effectiveCourseId ?? ""}
          onValueChange={(val) => {
            setSelectedCourseId(val);
            setActiveSessionId("");
          }}
        >
          <SelectTrigger className="h-10 min-w-60 cursor-pointer rounded-xl border-slate-200/80 bg-white px-4 text-sm font-medium shadow-sm">
            <SelectValue placeholder="Chọn lớp học" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            className="rounded-xl border-slate-200 shadow-lg"
          >
            {myClasses.map((classroom: MyClass) => (
              <SelectItem
                key={classroom.id}
                value={classroom.id}
                className="cursor-pointer"
              >
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 md:flex">
          <MonitorPlay className="h-3.5 w-3.5 text-violet-500" />
          Nội dung buổi học
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto border-r border-slate-200/80 bg-slate-50/40 px-4 py-4">
          {isLoadingMaterials ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu...
            </div>
          ) : null}
          {materialsError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Lỗi:{" "}
              {materialsError instanceof Error
                ? materialsError.message
                : "Không thể tải dữ liệu"}
            </div>
          ) : null}
          {!isLoadingMaterials && modules.length === 0 && !materialsError ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Chưa có nội dung cho lớp học này.
            </div>
          ) : null}

          <div className="relative space-y-0">
            {modules.map((courseModule, moduleIdx) => {
              const isLastModule = moduleIdx === modules.length - 1;
              const allSessionsHaveVideo =
                courseModule.sessions.length > 0 &&
                courseModule.sessions.every((session) => session.hasVideo);

              return (
                <div key={courseModule.id} className="relative pl-12 pb-6">
                  {!isLastModule ? (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-px transition-colors duration-300 ${
                        allSessionsHaveVideo
                          ? "bg-gradient-to-b from-violet-400 to-violet-300"
                          : "bg-slate-200"
                      }`}
                    />
                  ) : null}

                  <div
                    className={`absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-colors duration-300 ${
                      allSessionsHaveVideo
                        ? "border-violet-400"
                        : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                        allSessionsHaveVideo ? "bg-violet-500" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="pb-3">
                    <div className="text-sm font-semibold text-slate-800">
                      {courseModule.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {courseModule.sessions.length} buổi
                    </div>
                  </div>

                  <div className="space-y-1">
                    {courseModule.sessions.map((session) => {
                      const isActive = session.id === resolvedSessionId;

                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => selectSession(session.id)}
                          className={`flex w-full cursor-pointer items-center rounded-xl px-2.5 py-2 text-left text-sm transition ${
                            isActive
                              ? "bg-white font-semibold text-violet-700 shadow-sm ring-1 ring-violet-200"
                              : "text-slate-600 hover:bg-white/80"
                          }`}
                        >
                          <div className="relative flex flex-1 items-center gap-2">
                            <div
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                isActive ? "bg-violet-500" : "bg-slate-300"
                              }`}
                            />
                            <span className="flex-1 truncate">
                              {session.title}
                            </span>
                            {session.hasVideo ? (
                              <Video className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <main className="min-h-0 min-w-0 overflow-y-auto bg-white">
          <div className="flex items-center gap-1 border-b border-slate-200/80 px-4 py-2">
            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === "videos"
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              Video xem lại
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === "materials"
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              Tài liệu ({lessonResources.length})
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "materials" ? (
              <LessonMaterialsList
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
              />
            ) : (
              <div className="space-y-5">
                <div className="space-y-1 border-b border-slate-200 pb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-violet-600 uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Video bài giảng
                  </span>
                  <div className="h-px w-14 bg-gradient-to-r from-violet-400 to-transparent" />
                  <p className="text-sm text-slate-500">
                    Buổi học:{" "}
                    <span className="font-medium text-slate-900">
                      {activeSession.session.title || "Chưa chọn"}
                    </span>
                  </p>
                </div>

                {!activeSession.session.id ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
                    Chọn buổi học để xem video
                  </div>
                ) : !activeSession.session.hasVideo ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center text-sm text-slate-500">
                    Chưa có video cho buổi học này
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-black shadow-sm">
                      <div className="aspect-video">
                        {isLoadingPlayUrl || isFetchingPlayUrl ? (
                          <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-300">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải video...
                          </div>
                        ) : playVideo?.url ? (
                          <video
                            key={playVideo.url}
                            src={playVideo.url}
                            controls
                            preload="metadata"
                            playsInline
                            className="h-full w-full"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-300">
                            Không thể tải URL phát video
                          </div>
                        )}
                      </div>
                    </div>

                    {recordItems.length > 0 ? (
                      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80">
                        {recordItems.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between gap-4 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {record.title}
                              </p>
                              {record.createdAt ? (
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {new Date(record.createdAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </p>
                              ) : null}
                            </div>
                            <Video className="h-4 w-4 shrink-0 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {isFetchingRecords ? (
                      <p className="text-center text-xs text-slate-400">
                        Đang cập nhật danh sách...
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentClassView;
