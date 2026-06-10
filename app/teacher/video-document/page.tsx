"use client";

import { useMemo, useState, useRef } from "react";
import { FileText, MonitorPlay, PlayCircle, Video } from "lucide-react";
import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import { useGetSnapMaterials } from "@/app/hooks/materials/useGetSnapMaterials";
import { UploadCloud, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { usePresignVideo } from "@/app/hooks/videos/usePresignVideoMutation";
import { useCreateNewRecord } from "@/app/hooks/records/useCreateNewRecord";
import { useGetRecordsByLessonQuery } from "@/app/hooks/records/useGetRecords";
import { useGetVideoQuery } from "@/app/hooks/videos/useGetVideoQuery";
import { queryClient } from "@/app/lib/react-query";
import { RecordItem } from "@/app/service/record.service";
import { useCreateLessonResourceMutation } from "@/app/hooks/lessonResource/useCreateLessonResource";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import { useUploadFile } from "@/app/hooks/lessonResource/useUploadAuto";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeacherClassroom } from "@/app/service/teacher.service";

type TabKey = "videos" | "materials";

type Session = {
  id: string;
  title: string;
  hasVideo: boolean;
  materials: string[];
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
  session: { id: "", title: "", hasVideo: false, materials: [] },
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

// modules are derived from snap-materials API (materials -> sessions)

type UploadedMaterialFile = {
  name: string;
  url: string;
  size: number;
};

function LessonMaterialsPanel({
  snapLessonId,
  lessonTitle,
}: {
  snapLessonId: string;
  lessonTitle: string;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("FILE");
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMaterialFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: createLessonResource, isPending, error } =
    useCreateLessonResourceMutation();
  const { upload, isUploading } = useUploadFile("document");
  const { data: resources = [], isLoading: isLoadingResources } =
    useGetLessonResourcesQuery(snapLessonId);

  const canSubmit = useMemo(() => {
    if (isPending || isUploading || !snapLessonId) return false;

    const hasResource =
      type === "FILE" ? uploadedFiles.length > 0 : url.trim().length > 0;

    return title.trim().length > 0 && hasResource;
  }, [title, snapLessonId, type, uploadedFiles, url, isPending, isUploading]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadedUrl = await upload(file);
          return {
            name: file.name,
            url: uploadedUrl,
            size: file.size,
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...uploaded]);
    } catch (uploadError) {
      console.error(uploadError);
      toast.error("Upload file thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      const urls =
        type === "FILE"
          ? uploadedFiles.map((file) => file.url)
          : [url.trim()];

      await createLessonResource({
        title: title.trim(),
        note: note.trim(),
        type,
        urls,
        snapLessonId,
      });

      toast.success("Tạo tài liệu thành công");
      setTitle("");
      setNote("");
      setUrl("");
      setUploadedFiles([]);
    } catch (submitError) {
      console.error(submitError);
      toast.error("Tạo tài liệu thất bại");
    }
  };

  if (!snapLessonId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để xem tài liệu
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      <Card className="border-slate-200 shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Danh sách tài liệu
            </h3>
            <p className="mt-1 text-xs text-slate-500">Buổi: {lessonTitle}</p>
          </div>

          {isLoadingResources ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách tài liệu...
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
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
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Chưa có tài liệu cho buổi học này
            </div>
          )}
        </div>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Thêm tài liệu
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Upload file hoặc thêm link cho buổi học
            </p>
          </div>

          <Input
            placeholder="Tên tài liệu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FILE">FILE</SelectItem>
              <SelectItem value="LINK">LINK</SelectItem>
            </SelectContent>
          </Select>

          {type === "FILE" ? (
            <>
              <label
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  await handleUploadFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                className={`relative flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition ${
                  isDragging
                    ? "border-blue-400 bg-blue-50/40"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={async (e) => {
                    await handleUploadFiles(e.target.files);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
                <UploadCloud className="mb-2 h-7 w-7 text-slate-500" />
                <p className="text-sm font-medium text-slate-800">
                  Kéo thả file vào đây
                </p>
                <p className="text-xs text-slate-500">hoặc bấm để chọn file</p>
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                  </div>
                ) : null}
              </label>

              {uploadedFiles.length > 0 ? (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}

          <Textarea
            placeholder="Ghi chú"
            className="min-h-28"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error?.response?.data?.message ? (
            <p className="text-xs text-rose-600">
              {error.response.data.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canSubmit}
              className="cursor-pointer"
              onClick={handleSubmit}
            >
              {isUploading
                ? "Đang upload..."
                : isPending
                  ? "Đang lưu..."
                  : "Tạo tài liệu"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VideoDocumentManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("materials");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined,
  );
  const [isUploading, setIsUploading] = useState(false);
  const { data: teacherClassrooms } = useGetTeacherClassrooms();
  const classrooms: TeacherClassroom[] = teacherClassrooms ?? [];
  const effectiveCourseId =
    selectedCourseId ?? classrooms[0]?.classroomId ?? undefined;
  const {
    data: snapMaterials,
    isLoading,
    error,
  } = useGetSnapMaterials(effectiveCourseId);
  const { mutateAsync: getPresign } = usePresignVideo();
  const { mutateAsync: createRecord } = useCreateNewRecord();

  const modules: Module[] = useMemo(() => {
    if (!Array.isArray(snapMaterials)) return [];
    return snapMaterials.map((m) => ({
      id: m.materialId,
      title: m.title,
      sessions: (m.lessons || []).map((l) => ({
        id: l.lessonId,
        title: l.title,
        hasVideo: Array.isArray(l.lessonVideos) && l.lessonVideos.length > 0,
        materials: [],
      })),
    }));
  }, [snapMaterials]);

  const resolvedSessionId = useMemo(() => {
    const allSessions = modules.flatMap((courseModule) => courseModule.sessions);
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

  const {
    data: records = [],
    isFetching: isFetchingRecords,
  } = useGetRecordsByLessonQuery(resolvedSessionId || undefined);
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
  const handleUploadVideo = async () => {
    if (!selectedVideo) {
      toast.error("Vui lòng chọn video");
      return;
    }

    if (!activeSession.session.id) {
      toast.error("Vui lòng chọn buổi học");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, fileKey } = await getPresign({
        fileName: selectedVideo.name,
        fileType: selectedVideo.type,
      });

      await fetch(uploadUrl, {
        method: "PUT",
        body: selectedVideo,
        headers: {
          "Content-Type": selectedVideo.type,
        },
      });

      await createRecord({
        title: activeSession.session.title,
        fileKey,
        snapLessonId: activeSession.session.id,
      });

      toast.success("Upload video thành công");
      setSelectedVideo(null);
      queryClient.invalidateQueries({
        queryKey: ["video", "play", activeSession.session.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["snap-materials", effectiveCourseId],
      });
    } catch (error) {
      console.error(error);
      toast.error("Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };
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
          <SelectTrigger
            className="
            cursor-pointer
      h-10
      min-w-60
      rounded-xl
      border-slate-200
      bg-background
      px-4
      text-sm
      font-medium
      shadow-sm
    "
          >
            <SelectValue placeholder="Chọn lớp học" />
          </SelectTrigger>

          <SelectContent
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            className="4 
      rounded-xl
      border-slate-200
      shadow-lg
    "
          >
            {classrooms.map((classroom) => (
              <SelectItem
                className="cursor-pointer"
                key={classroom.classroomId}
                value={classroom.classroomId}
              >
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-3 text-sm text-slate-500 md:flex">
          <MonitorPlay className="h-4 w-4" />
          Teacher dashboard
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[311px_minmax(0,1fr)]">
        <section className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              Lỗi:{" "}
              {error instanceof Error ? error.message : "Không thể tải dữ liệu"}
            </div>
          )}
          {!isLoading && modules.length === 0 && !error && (
            <div className="text-sm text-slate-500">
              Chưa có dữ liệu. Vui lòng chọn lớp học.
            </div>
          )}
          <div className="relative space-y-0">
            {modules.map((courseModule, moduleIdx) => {
              const isLastModule = moduleIdx === modules.length - 1;
              const allSessionsHaveVideo =
                courseModule.sessions.length > 0 &&
                courseModule.sessions.every((session) => session.hasVideo);

              return (
                <div key={courseModule.id} className="relative pl-12 pb-6">
                  {!isLastModule && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 transition-colors duration-300 ${allSessionsHaveVideo
                          ? "bg-linear-to-b from-amber-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
                          : "bg-slate-200"
                        }`}
                    />
                  )}
                  <div
                    className={`absolute left-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-colors duration-300 ${allSessionsHaveVideo
                        ? "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
                        : "border-slate-200"
                      }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full transition-colors duration-300 ${allSessionsHaveVideo ? "bg-amber-500" : "bg-slate-300"
                        }`}
                    />
                  </div>

                  {/* Module title */}
                  <div className="pb-3">
                    <div className="text-sm font-semibold text-slate-700">
                      {courseModule.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      ({courseModule.sessions.length} buổi)
                    </div>
                  </div>

                  {/* Sessions for this module */}
                  <div className="space-y-1">
                    {courseModule.sessions.map((session) => {
                      const isActive = session.id === resolvedSessionId;
                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => selectSession(session.id)}
                          className={`flex cursor-pointer w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition ${isActive
                              ? "bg-blue-50 font-semibold text-blue-700 border-l-2 border-blue-600"
                              : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          <div className="relative flex items-center gap-2 flex-1">
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
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 ${activeTab === "videos" ? "text-slate-900" : "text-slate-500"
                }`}
            >
              <PlayCircle className="h-4 w-4" />
              Video Xem Lại
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 ${activeTab === "materials"
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
              <LessonMaterialsPanel
                snapLessonId={activeSession.session.id}
                lessonTitle={activeSession.session.title}
              />
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <div className="space-y-6 p-6">
                  {/* Header */}
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

                  <div className="border-t border-slate-100 pt-2">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Upload video mới
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Thêm video xem lại cho buổi học hiện tại
                    </p>
                  </div>

                  {/* Upload area */}
                  <label
                    htmlFor="video-upload"
                    className="
        group
        flex
        min-h-[220px]
        cursor-pointer
        flex-col
        items-center
        justify-center
        rounded-2xl
        border-2
        border-dashed
        border-slate-200
        bg-slate-50
        p-6
        transition-all
        hover:border-blue-300
        hover:bg-blue-50/40
      "
                  >
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          setSelectedVideo(file);
                        }
                      }}
                    />

                    <div
                      className="
          mb-4
          rounded-full
          bg-white
          p-4
          shadow-sm
          transition-transform
          group-hover:scale-105
        "
                    >
                      <UploadCloud className="h-8 w-8 text-slate-600" />
                    </div>

                    <h4 className="font-medium text-slate-800">
                      Chọn video để upload
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      MP4, MKV, MOV...
                    </p>

                    {selectedVideo && (
                      <div
                        className="
            mt-5
            flex
            items-center
            gap-3
            rounded-xl
            border
            bg-white
            px-4
            py-3
            shadow-sm
          "
                      >
                        <Film className="h-5 w-5 text-blue-600" />

                        <div className="flex flex-col text-left">
                          <span className="max-w-[280px] truncate text-sm font-medium text-slate-800">
                            {selectedVideo.name}
                          </span>

                          <span className="text-xs text-slate-500">
                            {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Action */}
                  <div className="flex justify-end">
                    <Button
                      disabled={!selectedVideo || isUploading}
                      onClick={handleUploadVideo}
                      className="h-10 cursor-pointer rounded-xl px-6"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Upload video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}