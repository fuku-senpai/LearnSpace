"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Loader2,
  MonitorPlay,
  PlayCircle,
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
import { Card } from "@/components/ui/card";
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
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để xem tài liệu
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border bg-slate-50 p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải tài liệu...
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chưa có tài liệu cho buổi học này
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Buổi: {lessonTitle}</p>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {resource.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {resource.note || "Không có ghi chú"}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {resource.type}
              </span>
            </div>
          </div>

          {resource.urls?.length > 0 ? (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {resource.urls.map((resourceUrl, index) => (
                <a
                  key={index}
                  href={resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50"
                >
                  <span className="truncate text-slate-700">
                    {resource.type === "LINK"
                      ? resourceUrl
                      : `File ${index + 1}`}
                  </span>
                  <span className="text-slate-500">Mở →</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ))}
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
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải lớp học...
      </div>
    );
  }

  if (myClasses.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <Card className="mx-auto w-full max-w-md border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Chưa có lớp học
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Nhập mã lớp để tham gia và xem tài liệu, video bài giảng.
          </p>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Mã lớp học"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
            />
            {enrollMessage ? (
              <p className="text-sm text-slate-600">{enrollMessage}</p>
            ) : null}
            <Button
              className="w-full cursor-pointer"
              disabled={isEnrolling}
              onClick={handleEnroll}
            >
              {isEnrolling ? "Đang tham gia..." : "Tham gia lớp"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-2">
        <Select
          value={effectiveCourseId ?? ""}
          onValueChange={(val) => {
            setSelectedCourseId(val);
            setActiveSessionId("");
          }}
        >
          <SelectTrigger className="h-10 min-w-60 cursor-pointer rounded-xl border-slate-200 bg-background px-4 text-sm font-medium shadow-sm">
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
        <div className="hidden items-center gap-3 text-sm text-slate-500 md:flex">
          <MonitorPlay className="h-4 w-4" />
          Student dashboard
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[311px_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-4">
          {isLoadingMaterials ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : null}
          {materialsError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              Lỗi:{" "}
              {materialsError instanceof Error
                ? materialsError.message
                : "Không thể tải dữ liệu"}
            </div>
          ) : null}
          {!isLoadingMaterials && modules.length === 0 && !materialsError ? (
            <div className="text-sm text-slate-500">
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
                      className={`absolute left-4 top-8 bottom-0 w-0.5 transition-colors duration-300 ${
                        allSessionsHaveVideo
                          ? "bg-linear-to-b from-amber-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                          : "bg-slate-200"
                      }`}
                    />
                  ) : null}

                  <div
                    className={`absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-colors duration-300 ${
                      allSessionsHaveVideo
                        ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
                        : "border-slate-200"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                        allSessionsHaveVideo ? "bg-amber-500" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="pb-3">
                    <div className="text-sm font-semibold text-slate-700">
                      {courseModule.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      ({courseModule.sessions.length} buổi)
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
                          className={`flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left text-sm transition ${
                            isActive
                              ? "border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative flex flex-1 items-center gap-2">
                            {isActive ? (
                              <div className="h-2 w-2 rounded-full bg-blue-600" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            )}
                            <span className="flex-1">{session.title}</span>
                            {session.hasVideo ? (
                              <Video
                                className="h-4 w-4 text-red-600"
                                strokeWidth={3}
                              />
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

        <main className="min-w-0 bg-white">
          <div className="flex items-center justify-end gap-4 border-b border-slate-200 px-4 py-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 ${
                activeTab === "videos" ? "text-slate-900" : "text-slate-500"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              Video Xem Lại
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 ${
                activeTab === "materials"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500"
              }`}
            >
              <FileText className="h-4 w-4" />
              Tài Liệu Buổi Học ({lessonResources.length})
            </button>
          </div>

          <div className="p-4">
            {activeTab === "materials" ? (
              <LessonMaterialsList
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
              />
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Video xem lại
                    </h3>
                    <p className="text-sm text-slate-500">
                      Buổi học:{" "}
                      <span className="font-medium">
                        {activeSession.session.title}
                      </span>
                    </p>
                  </div>

                  {!activeSession.session.id ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Chọn buổi học để xem video
                    </div>
                  ) : !activeSession.session.hasVideo ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Chưa có video cho buổi học này
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="aspect-video bg-black">
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

                      {recordItems.map((record) => (
                        <div
                          key={record.id}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-900">
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
                      ))}

                      {isFetchingRecords ? (
                        <p className="text-center text-xs text-slate-400">
                          Đang cập nhật danh sách...
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentClassView;
