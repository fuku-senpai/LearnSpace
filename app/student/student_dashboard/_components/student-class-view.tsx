"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetLessonsQuery } from "@/app/hooks/lessons/useGetLessons";
import { useGetMaterialsQuery } from "@/app/hooks/materials/useGetMaterials";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import { useGetRecordsByLessonQuery } from "@/app/hooks/records/useGetRecords";
import { useEnrollClassroomMutation } from "@/app/hooks/classes/useEnrollClassroom";
import { type MyClass } from "@/app/service/classroom.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ExternalLink, LayoutGrid } from "lucide-react";

const dashboardTabs = [
  "Tài liệu và bài tập",
  "Video xem lại theo buổi",
  "Thông tin lịch học của lớp",
];

const dayLabels: Record<string, string> = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

const studyModeLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
};

type StudentClassViewProps = {
  courses: MyClass[];
  isLoading?: boolean;
  onCourseChange?: (course: MyClass | null) => void;
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatTimeWithAmPm = (value?: string) => {
  if (!value) return "-";
  const [hoursStr = "00", minutes = "00"] = value.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

const getResourceLabel = (url: string, index: number) => {
  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split("/").filter(Boolean).pop();

    if (fileName) {
      return decodeURIComponent(fileName);
    }
  } catch {
    // Fall back to a generic label when the URL cannot be parsed.
  }

  return `Tài liệu ${index + 1}`;
};

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "L";

const StudentClassView = ({
  courses,
  isLoading = false,
  onCourseChange,
}: StudentClassViewProps) => {
  const [activeTab, setActiveTab] = useState(dashboardTabs[0]);
  const [enrollCode, setEnrollCode] = useState("");
  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id ?? "");
  const [activeMaterialId, setActiveMaterialId] = useState("");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [activeRecordId, setActiveRecordId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { mutateAsync: enrollClassroom, isPending: isEnrolling } =
    useEnrollClassroomMutation();
  const activeCourse = useMemo(
    () =>
      courses.find((course) => course.id === activeCourseId) ??
      courses[0] ??
      null,
    [activeCourseId, courses],
  );
  const { data: materialsResponse, isLoading: isLoadingMaterials } =
    useGetMaterialsQuery(activeCourse?.id, { page: 0, size: 100 });

  const materials = materialsResponse?.content ?? [];
  const activeMaterial = useMemo(
    () =>
      materials.find((material) => material.id === activeMaterialId) ??
      materials[0] ??
      null,
    [activeMaterialId, materials],
  );
  const { data: lessons = [], isLoading: isLoadingLessons } =
    useGetLessonsQuery(activeMaterial?.id);
  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? null,
    [activeLessonId, lessons],
  );
  const { data: lessonResources = [], isLoading: isLoadingLessonResources } =
    useGetLessonResourcesQuery(activeLesson?.id ?? "");
  const { data: records = [], isLoading: isLoadingRecords } =
    useGetRecordsByLessonQuery(activeLesson?.id);
  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeRecordId) ?? records[0] ?? null,
    [activeRecordId, records],
  );

  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId("");
      return;
    }

    setActiveCourseId((current) =>
      courses.some((course) => course.id === current) ? current : courses[0].id,
    );
  }, [courses]);

  useEffect(() => {
    setActiveMaterialId("");
    setActiveLessonId("");
    setActiveRecordId("");
  }, [activeCourseId]);

  useEffect(() => {
    if (materials.length === 0) {
      setActiveMaterialId("");
      return;
    }

    setActiveMaterialId((current) =>
      materials.some((material) => material.id === current)
        ? current
        : materials[0].id,
    );
  }, [materials]);

  useEffect(() => {
    if (records.length === 0) {
      setActiveRecordId("");
      return;
    }

    setActiveRecordId((current) =>
      records.some((record) => record.id === current) ? current : records[0].id,
    );
  }, [records]);

  useEffect(() => {
    onCourseChange?.(activeCourse);
  }, [activeCourse, onCourseChange]);

  const handleEnroll = async () => {
    const normalizedCode = enrollCode.trim().toUpperCase();

    if (!normalizedCode) {
      setMessage("Vui lòng nhập mã lớp.");
      return;
    }

    try {
      const response = await enrollClassroom({ code: normalizedCode });
      setMessage(response.message || "Đã tham gia lớp thành công.");
      setEnrollCode("");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "Không thể tham gia lớp học.",
      );
    }
  };

  const handleSelectCourse = (course: MyClass) => {
    setActiveCourseId(course.id);
    onCourseChange?.(course);
  };

  const handleSelectMaterial = (materialId: string, nextTab = "Tài liệu và bài tập") => {
    setActiveMaterialId(materialId);
    setActiveLessonId("");
    if (activeTab !== nextTab) {
      setActiveTab(nextTab);
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId((current) => (current === lessonId ? "" : lessonId));
  };

  const handleSelectRecord = (recordId: string) => {
    setActiveRecordId(recordId);
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-semibold text-slate-900">
            Đang tải danh sách lớp học
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Vui lòng chờ trong giây lát.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="overflow-hidden border border-slate-200/70 bg-white shadow-sm rounded-3xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 14.5C18 17.538 15.314 20 12 20s-6-2.462-6-5.5c0-1.324.36-2.57.84-3.922L12 14z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Bạn chưa tham gia lớp học nào
            </h2>

            <p className="mt-2 max-w-md text-sm md:text-base text-slate-500 leading-relaxed">
              Nhập mã lớp để tham gia lớp học đầu tiên và bắt đầu hành trình học
              tập của bạn.
            </p>

            {/* Form */}
            <div className="mt-8 w-full max-w-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Nhập mã lớp (VD: 38BBFA02)"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-amber-500"
                  value={enrollCode}
                  onChange={(event) =>
                    setEnrollCode(event.target.value.toUpperCase())
                  }
                />

                <Button
                  className="h-12 rounded-2xl cursor-pointer bg-amber-600 px-6 text-white hover:bg-amber-700 sm:w-auto"
                  onClick={handleEnroll}
                  type="button"
                  disabled={isEnrolling}
                >
                  {isEnrolling ? "Đang tham gia..." : "Tham gia lớp"}
                </Button>
              </div>

              {message && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeCourse) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chưa chọn lớp học nào.
      </div>
    );
  }
  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Lớp học của bạn
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Danh sách lớp học đã đăng ký
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chọn một lớp học bên dưới để truy cập menu lớp, tài liệu và lịch
              học.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400">{courses.length} lớp học</div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          const initials = getInitials(
            course.name || course.teacherName || "Lớp",
          );
          const subtitle =
            course.teacherName || course.code || "Chưa có thông tin thêm";

          return (
            <button
              key={course.id}
              className={`group cursor-pointer overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                isActive
                  ? "border-slate-900 bg-white shadow-lg shadow-slate-900/10"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }`}
              onClick={() => handleSelectCourse(course)}
              type="button"
            >
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-600 text-[10px] font-semibold text-white ring-4 ring-slate-100">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {course.name}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {subtitle}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                      isActive
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-amber-600 group-hover:text-white"
                    }`}
                  >
                    {isActive ? "Đang chọn" : "Xem lớp"}
                  </div>
                </div>

                <div className="mt-2.5 rounded-2xl border border-slate-200 bg-slate-100 px-2.5 py-4">
                  <div className="mx-auto flex h-14 w-full max-w-55 items-center justify-center rounded-xl bg-linear-to-br from-slate-200 via-slate-100 to-white text-slate-400 shadow-inner">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-center text-[11px] text-slate-500">
                    {course.description || "No attachments"}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div
                    className={`text-[11px] font-semibold ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {isActive ? "Đang chọn" : "Assigned"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {course.totalStudent} học viên
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="border-slate-200/80 bg-white mt-4 shadow-sm">
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 ">
            <div>
              <div className="mb-4 flex flex-wrap gap-6 border-b border-slate-100 pb-3 text-sm">
                {dashboardTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`pb-3 transition ${
                      activeTab === tab
                        ? "border-b-2 cursor-pointer border-slate-300 font-semibold text-slate-900"
                        : "text-slate-700 cursor-pointer hover:text-slate-900"
                    }`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === "Tài liệu và bài tập" && (
                  <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {/* Enroll card - only visible within this tab */}
                      <div className="mb-3">
                        <Card className="border-slate-200 bg-white shadow-sm">
                          <CardContent className="p-3">
                            <div className="text-sm font-semibold text-slate-900 mb-2">
                              Enrol lớp bằng mã
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="VD: 38BBFA02"
                                className="h-9 border-slate-200 bg-white text-slate-900 placeholder:text-slate-300"
                                value={enrollCode}
                                onChange={(event) =>
                                  setEnrollCode(event.target.value)
                                }
                              />
                              <Button
                                className="h-9 cursor-pointer rounded-md bg-amber-600 text-white hover:bg-amber-700 px-3"
                                onClick={handleEnroll}
                                type="button"
                                disabled={isEnrolling}
                              >
                                {isEnrolling ? "..." : "Tham gia"}
                              </Button>
                            </div>
                            {message ? (
                              <div className="mt-2 text-sm text-slate-700">
                                {message}
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-semibold text-slate-900">
                          Chủ đề
                        </div>
                        <div className="text-xs text-slate-500">
                          Chọn chủ đề để xem danh sách buổi bên phải
                        </div>
                      </div>

                      {isLoadingMaterials ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                          Đang tải chủ đề...
                        </div>
                      ) : materials.length > 0 ? (
                        <div className="space-y-2">
                          {materials.map((material) => {
                            const isActive = material.id === activeMaterialId;
                            return (
                              <button
                                key={material.id}
                                type="button"
                                onClick={() =>
                                  handleSelectMaterial(material.id)
                                }
                                className={`w-full cursor-pointer  rounded-xl border px-4 py-3 text-left transition ${
                                  isActive
                                    ? "border-slate-200 bg-slate-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex  items-start justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {material.title}
                                    </div>
                                    {material.description ? (
                                      <div className="mt-1 text-xs text-slate-500">
                                        {material.description}
                                      </div>
                                    ) : null}
                                  </div>
                                  {typeof material.totalLessons === "number" ? (
                                    <div className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                      {material.totalLessons} buổi
                                    </div>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                          Chưa có chủ đề nào cho lớp này.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex  items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {activeMaterial?.title || "Chọn một chủ đề"}
                          </div>
                        </div>
                        {activeMaterial?.totalLessons ? (
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {activeMaterial.totalLessons} buổi
                          </div>
                        ) : null}
                      </div>

                      {isLoadingLessons ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Đang tải danh sách buổi...
                        </div>
                      ) : lessons.length > 0 ? (
                        <div className="space-y-2">
                          {lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`overflow-hidden rounded-xl border transition ${
                                lesson.id === activeLessonId
                                  ? "border-slate-200 bg-slate-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectLesson(lesson.id)}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/70"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                      lesson.id === activeLessonId
                                        ? "rotate-180"
                                        : "rotate-0"
                                    }`}
                                  />
                                  <div className="min-w-0 truncate font-medium text-slate-900">
                                    {lesson.title}
                                  </div>
                                </div>
                              </button>

                              {lesson.id === activeLessonId ? (
                                <div className="border-t border-slate-200 bg-white px-4 py-4">
                                  {isLoadingLessonResources ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                      Đang tải tài nguyên buổi học...
                                    </div>
                                  ) : lessonResources.length > 0 ? (
                                    <div className="space-y-2">
                                      {lessonResources.map((resource) => (
                                        <div
                                          key={resource.id}
                                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                        >
                                          <div className="flex items-start justify-between gap-3">
                                            <div>
                                              <div className="font-medium text-slate-900">
                                                {resource.title}
                                              </div>
                                              {resource.note ? (
                                                <div className="mt-1 text-xs text-slate-500">
                                                  {resource.note}
                                                </div>
                                              ) : null}
                                            </div>
                                          </div>

                                          {resource.urls.length > 0 ? (
                                            <div className="mt-3 space-y-2 text-xs text-slate-600">
                                              {resource.urls.map(
                                                (url, index) => (
                                                  <a
                                                    key={`${resource.id}-${index}`}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                                                  >
                                                    <div className="min-w-0">
                                                      <div className="truncate font-semibold text-slate-900">
                                                        {getResourceLabel(
                                                          url,
                                                          index,
                                                        )}
                                                      </div>
                                                      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                                        Tài liệu đính kèm
                                                      </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 transition group-hover:bg-slate-100">
                                                      Mở
                                                      <ExternalLink className="h-3 w-3" />
                                                    </div>
                                                  </a>
                                                ),
                                              )}
                                            </div>
                                          ) : null}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                      Chưa có tài nguyên cho buổi này.
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Chưa có buổi nào cho chủ đề này.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === "Thông tin lịch học của lớp" && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                          Thời khóa biểu
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          Lịch học được trình bày theo từng ngày trong tuần.
                        </div>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                        {formatDate(activeCourse?.startDate)} -{" "}
                        {formatDate(activeCourse?.endDate)}
                      </div>
                    </div>

                    <div className="overflow-x-auto pb-1">
                      <div
                        className="grid grid-cols-7 gap-3"
                        style={{ minWidth: "980px" }}
                      >
                        {[
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                          "SUNDAY",
                        ].map((day) => {
                          const schedules = (
                            activeCourse?.schedules || []
                          ).filter((s) => s.dayOfWeek === day);

                          return (
                            <div
                              key={day}
                              className="flex cursor-pointer min-h-44 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                            >
                              <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  {dayLabels[day] || day}
                                </div>
                              </div>

                              <div className="space-y-2">
                                {schedules.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-xs text-slate-400">
                                    Chưa có lịch
                                  </div>
                                ) : (
                                  schedules.map((schedule) => (
                                    <div
                                      key={schedule.id}
                                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="text-[12px] font-semibold text-slate-700">
                                            {formatTimeWithAmPm(
                                              schedule.startTime,
                                            )}{" "}
                                            -{" "}
                                            {formatTimeWithAmPm(
                                              schedule.endTime,
                                            )}
                                          </div>
                                          <div className="mt-1 text-xs text-slate-500">
                                            {studyModeLabels[
                                              schedule.studyMode
                                            ] || schedule.studyMode}
                                          </div>
                                        </div>
                                        <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300 shadow-sm" />
                                      </div>
                                      {schedule.location ? (
                                        <div className="mt-2 truncate text-[11px] text-slate-400">
                                          {schedule.location}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "Video xem lại theo buổi" && (
                  <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-slate-900">
                          Chủ đề
                        </div>
                        <div className="text-xs text-slate-500">
                          Chọn chủ đề để xem video theo từng buổi
                        </div>
                      </div>

                      {isLoadingMaterials ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                          Đang tải chủ đề...
                        </div>
                      ) : materials.length > 0 ? (
                        <div className="space-y-2">
                          {materials.map((material) => {
                            const isActive = material.id === activeMaterialId;

                            return (
                              <button
                                key={material.id}
                                type="button"
                                onClick={() =>
                                  handleSelectMaterial(
                                    material.id,
                                    "Video xem lại theo buổi",
                                  )
                                }
                                className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                                  isActive
                                    ? "border-slate-200 bg-slate-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {material.title}
                                    </div>
                                    {material.description ? (
                                      <div className="mt-1 text-xs text-slate-500">
                                        {material.description}
                                      </div>
                                    ) : null}
                                  </div>
                                  {typeof material.totalLessons === "number" ? (
                                    <div className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                                      {material.totalLessons} buổi
                                    </div>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                          Chưa có chủ đề nào cho lớp này.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {activeMaterial?.title || "Chọn một chủ đề"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Các video được nhóm theo buổi học của chủ đề.
                          </div>
                        </div>
                        {activeMaterial?.totalLessons ? (
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {activeMaterial.totalLessons} buổi
                          </div>
                        ) : null}
                      </div>

                      {isLoadingLessons ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Đang tải danh sách buổi...
                        </div>
                      ) : lessons.length > 0 ? (
                        <div className="space-y-2">
                          {lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`overflow-hidden rounded-xl border transition ${
                                lesson.id === activeLessonId
                                  ? "border-slate-200 bg-slate-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSelectLesson(lesson.id)}
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/70"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                                      lesson.id === activeLessonId
                                        ? "rotate-180"
                                        : "rotate-0"
                                    }`}
                                  />
                                  <div className="min-w-0 truncate font-medium text-slate-900">
                                    {lesson.title}
                                  </div>
                                </div>
                              </button>

                              {lesson.id === activeLessonId ? (
                                <div className="border-t border-slate-200 bg-white px-4 py-4">
                                  {isLoadingRecords ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                      Đang tải video buổi học...
                                    </div>
                                  ) : records.length > 0 ? (
                                    <div className="space-y-3">
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                              {activeRecord?.title || "Video buổi học"}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                              {activeRecord
                                                ? formatDate(activeRecord.createdAt)
                                                : ""}
                                            </div>
                                          </div>
                                         
                                        </div>

                                        {activeRecord ? (
                                          <video
                                            key={activeRecord.id}
                                            src={activeRecord.videoUrl}
                                            controls
                                            className="w-full rounded-xl bg-black"
                                          />
                                        ) : null}
                                      </div>

                                      <div className="space-y-2">
                                        {records.map((record) => {
                                          const isSelected = record.id === activeRecord?.id;

                                          return (
                                            <button
                                              key={record.id}
                                              type="button"
                                              onClick={() => handleSelectRecord(record.id)}
                                              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left shadow-sm transition ${
                                                isSelected
                                                  ? "border-slate-300 bg-white"
                                                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                              }`}
                                            >
                                              <div className="min-w-0">
                                                <div className="truncate font-semibold text-slate-900">
                                                  {record.title}
                                                </div>
                                                <div className="mt-0.5 text-[11px] text-slate-500">
                                                  {formatDate(record.createdAt)}
                                                </div>
                                              </div>
                                              <div className="shrink-0 cursor-pointer rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                {isSelected ? "Đang xem" : "Bấm để xem"}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                      Chưa có video cho buổi này.
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Chưa có buổi nào cho chủ đề này.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassView;
