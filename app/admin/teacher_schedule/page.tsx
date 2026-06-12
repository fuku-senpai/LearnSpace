"use client";

import { useMemo, useState, type UIEvent } from "react";
import { useGetAllTeachersInfiniteQuery } from "@/app/hooks/teacher/useGetAllTeachersInfinite";
import { useGetTeacherScheduleQuery } from "@/app/hooks/teacher/useGetTeacherSchedule";
import type {
  TeacherScheduleItem,
  TeacherScheduleStatus,
} from "@/app/service/teacher.service";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  LayoutList,
  MapPin,
  Sparkles,
  Video,
} from "lucide-react";

const SCHEDULE_FETCH_SIZE = 50;
const TEACHER_PAGE_SIZE = 8;

const GRID_START_HOUR = 18;
const GRID_END_HOUR_NEXT_DAY = 3;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 28;

const getGridStartMinutes = () => GRID_START_HOUR * 60;
const getGridEndMinutes = () => (GRID_END_HOUR_NEXT_DAY + 24) * 60;
const getGridSpanMinutes = () => getGridEndMinutes() - getGridStartMinutes();
const getGridSlotCount = () => getGridSpanMinutes() / SLOT_MINUTES;

const weekDays = [
  { value: "MONDAY", label: "Thứ 2", short: "T2" },
  { value: "TUESDAY", label: "Thứ 3", short: "T3" },
  { value: "WEDNESDAY", label: "Thứ 4", short: "T4" },
  { value: "THURSDAY", label: "Thứ 5", short: "T5" },
  { value: "FRIDAY", label: "Thứ 6", short: "T6" },
  { value: "SATURDAY", label: "Thứ 7", short: "T7" },
  { value: "SUNDAY", label: "CN", short: "CN" },
];

type ViewMode = "calendar" | "list";

const getStudyModeLabel = (value?: string) => {
  switch ((value ?? "").toUpperCase()) {
    case "ONLINE":
      return "Online";
    case "OFFLINE":
      return "Offline";
    default:
      return value ?? "—";
  }
};

const getStudyModeBlockStyles = (
  studyMode?: string,
  isClosed?: boolean,
) => {
  if (isClosed) {
    return "border-l-slate-400 border-slate-200/80 bg-slate-100/90 text-slate-600";
  }

  if ((studyMode ?? "").toUpperCase() === "ONLINE") {
    return "border-l-sky-500 border-sky-300/80 bg-sky-100/95 text-sky-900 shadow-sky-100/50";
  }

  return "border-l-orange-500 border-orange-300/80 bg-orange-50/95 text-orange-900 shadow-orange-100/50";
};

const getStudyModeBadgeStyles = (studyMode?: string) => {
  if ((studyMode ?? "").toUpperCase() === "ONLINE") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
};

const getStatusStyles = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "CLOSED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

const getStatusLabel = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "CLOSED":
      return "Tạm dừng";
    default:
      return status ?? "—";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatTime = (value?: string) => {
  if (!value) return "—";
  return value.slice(0, 5);
};

const timeToGridMinutes = (value?: string) => {
  if (!value) return getGridStartMinutes();
  const [hours, minutes] = value.split(":").map(Number);
  let total = hours * 60 + (minutes || 0);

  if (hours < GRID_START_HOUR) {
    total += 24 * 60;
  }

  return total;
};

const isScheduleInGridRange = (schedule: TeacherScheduleItem) => {
  const gridStart = getGridStartMinutes();
  const gridEnd = getGridEndMinutes();
  const start = timeToGridMinutes(schedule.startTime);
  const end = timeToGridMinutes(schedule.endTime);

  return end > gridStart && start < gridEnd;
};

const getBlockStyle = (schedule: TeacherScheduleItem) => {
  const gridStart = getGridStartMinutes();
  const gridEnd = getGridEndMinutes();
  const start = Math.max(timeToGridMinutes(schedule.startTime), gridStart);
  const end = Math.min(timeToGridMinutes(schedule.endTime), gridEnd);
  const top = ((start - gridStart) / SLOT_MINUTES) * SLOT_HEIGHT;
  const height = Math.max(((end - start) / SLOT_MINUTES) * SLOT_HEIGHT, SLOT_HEIGHT);
  return { top, height };
};

const timeLabels = Array.from(
  { length: getGridSpanMinutes() / 60 + 1 },
  (_, index) => {
    const hour = (GRID_START_HOUR + index) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
  },
);

function ScheduleBlock({ schedule }: { schedule: TeacherScheduleItem }) {
  const { top, height } = getBlockStyle(schedule);
  const isOnline = schedule.studyMode === "ONLINE";
  const isClosed = schedule.classroomStatus === "CLOSED";

  return (
    <div
      className={`absolute inset-x-1.5 overflow-hidden rounded-md border border-l-[3px] px-2 py-1 text-[11px] leading-tight shadow-sm transition hover:z-10 hover:scale-[1.02] hover:shadow-md ${getStudyModeBlockStyles(schedule.studyMode, isClosed)}`}
      style={{ top, height }}
      title={`${schedule.classroomName} (${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)})`}
    >
      <p className="truncate font-semibold">{schedule.classroomName}</p>
      <p className="truncate text-[10px] opacity-80">
        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
      </p>
      <p
        className={`mt-0.5 inline-flex truncate rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${getStudyModeBadgeStyles(schedule.studyMode)}`}
      >
        {isOnline ? "Online" : "Offline"}
      </p>
    </div>
  );
}

function ScheduleListCard({ schedule }: { schedule: TeacherScheduleItem }) {
  const dayLabel =
    weekDays.find((day) => day.value === schedule.dayOfWeek)?.label ??
    schedule.dayOfWeek;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-amber-200 hover:bg-amber-50/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{schedule.classroomName}</p>
          <p className="text-xs text-slate-500">{schedule.classroomCode}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(schedule.classroomStatus)}`}
        >
          {getStatusLabel(schedule.classroomStatus)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
          {dayLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStudyModeBadgeStyles(schedule.studyMode)}`}
        >
          {getStudyModeLabel(schedule.studyMode)}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {formatDate(schedule.startDate)} → {formatDate(schedule.endDate)}
      </p>

      {schedule.studyMode === "ONLINE" && schedule.meetingUrl ? (
        <a
          href={schedule.meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
        >
          <Video className="h-3.5 w-3.5" />
          Link học
        </a>
      ) : schedule.location ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {schedule.location}
        </p>
      ) : null}
    </div>
  );
}

const TeacherSchedule = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TeacherScheduleStatus | "all"
  >("all");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [weekOffset, setWeekOffset] = useState(0);

  const {
    data: teachersData,
    isFetching: isFetchingTeachers,
    hasNextPage: teacherHasMore,
    fetchNextPage,
  } = useGetAllTeachersInfiniteQuery({ size: TEACHER_PAGE_SIZE });

  const teacherItems = useMemo(() => {
    const items = teachersData?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();

    return items.filter((item) => {
      if (seen.has(item.teacherId)) return false;
      seen.add(item.teacherId);
      return true;
    });
  }, [teachersData]);

  const { data: scheduleResponse, isFetching: isFetchingSchedule } =
    useGetTeacherScheduleQuery({
      teacherId: selectedTeacherId,
      page: 0,
      size: SCHEDULE_FETCH_SIZE,
      status: statusFilter === "all" ? undefined : statusFilter,
    });

  const selectedTeacher = teacherItems.find(
    (item) => item.teacherId === selectedTeacherId,
  );

  const schedules = useMemo(
    () => scheduleResponse?.schedules ?? [],
    [scheduleResponse?.schedules],
  );

  const schedulesByDay = useMemo(() => {
    const map = new Map<string, TeacherScheduleItem[]>();
    for (const day of weekDays) {
      map.set(day.value, []);
    }
    for (const schedule of schedules) {
      const list = map.get(schedule.dayOfWeek) ?? [];
      list.push(schedule);
      map.set(schedule.dayOfWeek, list);
    }
    for (const day of weekDays) {
      const list = map.get(day.value) ?? [];
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(day.value, list);
    }
    return map;
  }, [schedules]);

  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${formatter.format(monday)} – ${formatter.format(sunday)}`;
  }, [weekOffset]);

  const gridHeight = getGridSlotCount() * SLOT_HEIGHT;
  const slotCount = getGridSlotCount();

  const todayDayValue = useMemo(() => {
    const map: Record<number, string> = {
      0: "SUNDAY",
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
    };
    return map[new Date().getDay()];
  }, []);

  const handleTeacherScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isBottom && !isFetchingTeachers && teacherHasMore) {
      fetchNextPage();
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setWeekOffset(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as TeacherScheduleStatus | "all");
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Quản lý lịch dạy
          </span>
          <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-amber-400 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Lịch dạy giáo viên
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Xem lịch dạy buổi tối (18:00 – 03:00) theo tuần hoặc danh sách
                chi tiết.
              </p>
            </div>
            <div className="border-l border-slate-200 pl-6 text-sm">
              <p className="text-xs text-slate-400 uppercase">Tổng buổi</p>
              <p className="font-semibold text-slate-900">
                {selectedTeacherId
                  ? (scheduleResponse?.totalElements ?? 0)
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {viewMode === "calendar" ? "Lịch tuần" : "Danh sách lịch dạy"}
                </h3>
                <div className="mt-2 h-px w-14 bg-gradient-to-r from-slate-300 to-transparent" />
                {selectedTeacher ? (
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedTeacher.fullName} · {weekRangeLabel}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Chọn giáo viên để xem lịch dạy.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-slate-200/80 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "calendar"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Lịch tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "list"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    Danh sách
                  </button>
                </div>

                {viewMode === "calendar" ? (
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-lg"
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium"
                      onClick={() => setWeekOffset(0)}
                    >
                      Hôm nay
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer rounded-lg"
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9 w-[200px] cursor-pointer rounded-xl border-slate-200/80 bg-white text-sm">
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">
                      <div className="flex cursor-pointer items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <span>Tất cả</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                    <SelectItem value="CLOSED">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-emerald-50/30 shadow-sm">
              {!selectedTeacherId ? (
                <div className="px-6 py-16 text-center text-sm text-emerald-800/70">
                  Vui lòng chọn giáo viên ở panel bên phải.
                </div>
              ) : isFetchingSchedule && schedules.length === 0 ? (
                <div className="px-6 py-16 text-sm text-emerald-800/70">
                  Đang tải lịch dạy...
                </div>
              ) : schedules.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-emerald-800/70">
                  Không có lịch dạy phù hợp.
                </div>
              ) : viewMode === "calendar" ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[820px]">
                    <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-emerald-200/80 bg-gradient-to-r from-emerald-100/80 via-green-50 to-emerald-100/80">
                      <div className="border-r border-emerald-200/60 p-2" />
                      {weekDays.map((day) => {
                        const isToday =
                          weekOffset === 0 && day.value === todayDayValue;

                        return (
                          <div
                            key={day.value}
                            className={`border-r border-emerald-200/60 px-2 py-3 text-center last:border-r-0 ${
                              isToday ? "bg-emerald-200/50" : ""
                            }`}
                          >
                            <p
                              className={`text-xs font-bold ${
                                isToday ? "text-emerald-800" : "text-emerald-900"
                              }`}
                            >
                              {day.short}
                            </p>
                            <p className="text-[10px] text-emerald-700/70">
                              {day.label}
                            </p>
                            {isToday ? (
                              <span className="mt-1 inline-block rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                Hôm nay
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
                      <div
                        className="relative border-r border-emerald-200/60 bg-emerald-50/80"
                        style={{ height: gridHeight }}
                      >
                        {timeLabels.map((label, index) => (
                          <div
                            key={label}
                            className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-emerald-700/60"
                            style={{ top: index * 2 * SLOT_HEIGHT }}
                          >
                            {label}
                          </div>
                        ))}
                      </div>

                      {weekDays.map((day, dayIndex) => {
                        const daySchedules =
                          schedulesByDay.get(day.value) ?? [];
                        const isToday =
                          weekOffset === 0 && day.value === todayDayValue;

                        return (
                          <div
                            key={day.value}
                            className={`relative border-r border-emerald-200/60 last:border-r-0 ${
                              isToday ? "ring-1 ring-inset ring-emerald-300/60" : ""
                            }`}
                            style={{ height: gridHeight }}
                          >
                            {Array.from({ length: slotCount }).map((_, index) => {
                              const isCaroLight =
                                (dayIndex + index) % 2 === 0;
                              const isMidnightRow =
                                index === ((24 - GRID_START_HOUR) * 60) / SLOT_MINUTES;

                              return (
                                <div
                                  key={index}
                                  className={`absolute inset-x-0 border-t ${
                                    isMidnightRow
                                      ? "border-t-2 border-emerald-400/60"
                                      : "border-emerald-200/35"
                                  } ${
                                    isCaroLight
                                      ? "bg-emerald-50/90"
                                      : "bg-green-100/45"
                                  }`}
                                  style={{
                                    top: index * SLOT_HEIGHT,
                                    height: SLOT_HEIGHT,
                                  }}
                                />
                              );
                            })}

                            {daySchedules
                              .filter(isScheduleInGridRange)
                              .map((schedule, index) => (
                                <ScheduleBlock
                                  key={`${schedule.classroomId}-${schedule.startTime}-${index}`}
                                  schedule={schedule}
                                />
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {schedules.map((schedule, index) => (
                    <ScheduleListCard
                      key={`${schedule.classroomId}-${schedule.dayOfWeek}-${schedule.startTime}-${index}`}
                      schedule={schedule}
                    />
                  ))}
                </div>
              )}
            </div>

            {viewMode === "calendar" && schedules.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-2.5 text-xs text-emerald-800/80">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-orange-300 border-l-[3px] border-l-orange-500 bg-orange-50" />
                  Offline
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-sky-300 border-l-[3px] border-l-sky-500 bg-sky-100" />
                  Online
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded border border-slate-200 border-l-[3px] border-l-slate-400 bg-slate-100" />
                  Tạm dừng
                </span>
              </div>
            ) : null}
          </section>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white xl:sticky xl:top-24 xl:self-start">
            <section className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Chọn giáo viên
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cuộn danh sách để tải thêm
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100" />

              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Giáo viên
                </label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={handleTeacherChange}
                >
                  <SelectTrigger className="h-11 cursor-pointer rounded-xl border-slate-200/80 bg-white">
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="rounded-xl border border-slate-200 p-1"
                  >
                    <ScrollArea
                      className="h-56"
                      viewportClassName="overflow-y-auto"
                      onViewportScroll={handleTeacherScroll}
                    >
                      {teacherItems.map((item) => (
                        <SelectItem
                          key={item.teacherId}
                          value={item.teacherId}
                          className="cursor-pointer rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">
                              {item.fullName}
                            </span>
                            <span className="h-3 w-px bg-slate-300" />
                            <span className="truncate text-xs text-slate-500">
                              {item.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {isFetchingTeachers ? (
                        <div className="py-3 text-center text-xs text-slate-500">
                          Đang tải thêm...
                        </div>
                      ) : null}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedTeacher ? (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
                  <p className="font-medium text-slate-900">
                    {selectedTeacher.fullName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedTeacher.email}
                  </p>
                  {selectedTeacher.specialization ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Chuyên môn: {selectedTeacher.specialization}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;
