"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  GraduationCap,
  CalendarDays,
  Clock3,
  Users,
  Monitor,
  MapPin,
  Video,
  MoreHorizontal,
  Search,
  Plus,
  Sparkles,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCreateClassroomMutation } from "@/app/hooks/classes/useCreateClass";
import { useUpdateClassroomMutation } from "@/app/hooks/classes/useUpdateClassroom";
import { useCreateClassScheduleMutation } from "@/app/hooks/schedules/useCreateClassSchedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses";
import { useGetClassSchedulesQuery } from "@/app/hooks/schedules/useGetClassSchedules";
import { useUpdateClassScheduleMutation } from "@/app/hooks/schedules/useUpdateClassSchedule";
import { useDeleteClassScheduleMutation } from "@/app/hooks/schedules/useDeleteClassSchedule";
import type {
  Class,
  GetAllClassesFilter,
} from "@/app/service/classroom.service";
import type { ClassScheduleItem } from "@/app/service/classSchedule.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDeleteClassroomMutation } from "@/app/hooks/classes/useDeleteClassroom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dayOptions = [
  { label: "Thứ 2", value: "MONDAY" },
  { label: "Thứ 3", value: "TUESDAY" },
  { label: "Thứ 4", value: "WEDNESDAY" },
  { label: "Thứ 5", value: "THURSDAY" },
  { label: "Thứ 6", value: "FRIDAY" },
  { label: "Thứ 7", value: "SATURDAY" },
  { label: "Chủ nhật", value: "SUNDAY" },
];

const studyModeOptions = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
];

const statusOptions = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Tạm dừng", value: "CLOSED" },
];

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

const getStatusStyles = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "CLOSED":
    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "PENDING":
      return "border-amber-200/80 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

const getStatusLabel = (status?: string) => {
  const normalized = (status ?? "").toUpperCase();
  return (
    statusOptions.find((option) => option.value === normalized)?.label ??
    status ??
    "—"
  );
};

const getDayLabel = (value?: string) =>
  dayOptions.find((option) => option.value === value)?.label ?? value ?? "—";

const getStudyModeLabel = (value?: string) =>
  studyModeOptions.find((option) => option.value === value)?.label ??
  value ??
  "—";

const getErrorMessage = (error?: unknown) => {
  if (!error || typeof error !== "object") return undefined;
  if ("response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const messageValue = (data as { message?: unknown }).message;
      if (typeof messageValue === "string") {
        return messageValue;
      }
      if (messageValue && typeof messageValue === "object") {
        const nested = messageValue as { message?: unknown };
        if (typeof nested.message === "string") {
          return nested.message;
        }
      }
      return JSON.stringify(data);
    }
  }
  if (
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return undefined;
};

type ClassScheduleFormValues = {
  classroomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studyMode: string;
  location: string;
  meetingUrl: string;
};

const ClassesManagement = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionPreview, setDescriptionPreview] = useState("");
  const { mutateAsync: deleteClassroom, isPending: isDeleting } =
    useDeleteClassroomMutation();
  const [classLookupFilter, setClassLookupFilter] =
    useState<GetAllClassesFilter>({
      page: 0,
      size: 8,
      name: "",
      code: "",
    });
  const [scheduleClasses, setScheduleClasses] = useState<Class[]>([]);
  const [hasMoreClasses, setHasMoreClasses] = useState(true);
  const [filter, setFilter] = useState<GetAllClassesFilter>({
    page: 0,
    size: 5,
    name: "",
    code: "",
  });
  const { data, isLoading, refetch } = useGetClassesQuery(filter);
  const { data: allClassesResponse, isFetching: isFetchingClasses } =
    useGetClassesQuery(classLookupFilter);
  const {
    mutateAsync,
    isPending,
    error: createError,
  } = useCreateClassroomMutation();
  const {
    mutateAsync: updateClassroom,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateClassroomMutation();
  const {
    mutateAsync: createSchedule,
    isPending: isSchedulePending,
    error: scheduleError,
  } = useCreateClassScheduleMutation();
  const {
    mutateAsync: updateSchedule,
    isPending: isUpdatingSchedule,
    error: updateScheduleError,
  } = useUpdateClassScheduleMutation();
  const { mutateAsync: deleteSchedule, isPending: isDeletingSchedule } =
    useDeleteClassScheduleMutation();
  const {
    control,
    register,
    handleSubmit: handleScheduleSubmit,
    reset: resetSchedule,
    formState: { isSubmitting: isScheduleSubmitting },
  } = useForm<ClassScheduleFormValues>({
    defaultValues: {
      classroomId: "",
      dayOfWeek: "MONDAY",
      startTime: "08:00:00",
      endTime: "11:30:00",
      studyMode: "ONLINE",
      location: "",
      meetingUrl: "",
    },
  });
  const selectedClassroomId = useWatch({ control, name: "classroomId" });

  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ClassScheduleItem | null>(null);
  const [isDeleteScheduleOpen, setIsDeleteScheduleOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<ClassScheduleItem | null>(null);
  const [editScheduleDayOfWeek, setEditScheduleDayOfWeek] =
    useState("MONDAY");
  const [editScheduleStartTime, setEditScheduleStartTime] = useState("");
  const [editScheduleEndTime, setEditScheduleEndTime] = useState("");
  const [editScheduleStudyMode, setEditScheduleStudyMode] =
    useState("ONLINE");
  const [editScheduleLocation, setEditScheduleLocation] = useState("");
  const [editScheduleMeetingUrl, setEditScheduleMeetingUrl] = useState("");

  const classes = data?.items ?? [];
  useEffect(() => {
    if (!allClassesResponse) return;

    setScheduleClasses((prev) => {
      const incoming = allClassesResponse.items ?? [];

      if (classLookupFilter.page === 0) {
        return incoming;
      }

      const getKey = (item: Class) => item.id || item.code || item.name || "";
      const existingKeys = new Set(prev.map(getKey).filter(Boolean));
      const nextItems = incoming.filter((item) => {
        const key = getKey(item);
        if (!key) return true;
        return !existingKeys.has(key);
      });

      return [...prev, ...nextItems];
    });

    const responsePage =
      allClassesResponse.number ??
      allClassesResponse.pageable?.pageNumber ??
      classLookupFilter.page ??
      0;
    const responseTotalPages = allClassesResponse.totalPages ?? 0;
    const responseHasMore =
      responseTotalPages > 0
        ? responsePage + 1 < responseTotalPages
        : !allClassesResponse.last;

    setHasMoreClasses(responseHasMore);

    setLoadingMore(false);
  }, [allClassesResponse, classLookupFilter.page]);
  const selectedClass = scheduleClasses.find(
    (item) => item.id === selectedClassroomId,
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreClasses = () => {
    if (isFetchingClasses || loadingMore || !hasMoreClasses) return;

    setLoadingMore(true);

    setClassLookupFilter((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };
  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    isFetching: isSchedulesFetching,
  } = useGetClassSchedulesQuery(selectedClassroomId || undefined);
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.number ?? filter.page;
  const handleCreate = async () => {
    if (!name.trim() || !startDate || !endDate) return;
    await mutateAsync({
      name: name.trim(),
      description: description.trim() || "",
      startDate,
      endDate,
    });

    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    await refetch();
  };

  const handleOpenEdit = (item: Class) => {
    setEditingClass(item);
    setEditName(item.name ?? "");
    setEditDescription(item.description ?? "");
    setEditStartDate(item.startDate ?? "");
    setEditEndDate(item.endDate ?? "");
    setEditStatus(item.status ?? "ACTIVE");
    setIsEditOpen(true);
  };

  const handleOpenDescription = (text?: string) => {
    const value = text?.trim() || "Không có mô tả";
    setDescriptionPreview(value);
    setIsDescriptionOpen(true);
  };

  const handleEditSchedule = (schedule: ClassScheduleItem) => {
    setEditingSchedule(schedule);
    setEditScheduleDayOfWeek(schedule.dayOfWeek || "MONDAY");
    setEditScheduleStartTime(schedule.startTime || "");
    setEditScheduleEndTime(schedule.endTime || "");
    setEditScheduleStudyMode(schedule.studyMode || "ONLINE");
    setEditScheduleLocation(schedule.location || "");
    setEditScheduleMeetingUrl(schedule.meetingUrl || "");
    setIsEditScheduleOpen(true);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule?.id || !selectedClassroomId) return;

    await updateSchedule({
      classroomId: selectedClassroomId,
      scheduleId: editingSchedule.id,
      dayOfWeek: editScheduleDayOfWeek,
      startTime: editScheduleStartTime,
      endTime: editScheduleEndTime,
      studyMode: editScheduleStudyMode,
      location: editScheduleLocation.trim() || undefined,
      meetingUrl: editScheduleMeetingUrl.trim() || undefined,
    });

    setIsEditScheduleOpen(false);
    setEditingSchedule(null);
  };

  const handleOpenDeleteSchedule = (schedule: ClassScheduleItem) => {
    setScheduleToDelete(schedule);
    setIsDeleteScheduleOpen(true);
  };

  const handleConfirmDeleteSchedule = async () => {
    if (!scheduleToDelete?.id) return;
    await handleDeleteSchedule(scheduleToDelete.id);
    setIsDeleteScheduleOpen(false);
    setScheduleToDelete(null);
  };

  const handleUpdate = async () => {
    if (!editingClass?.id || !editName.trim() || !editStartDate || !editEndDate)
      return;
    await updateClassroom({
      classroomId: editingClass.id,
      payload: {
        name: editName.trim(),
        description: editDescription.trim() || "",
        status: editStatus,
        startDate: editStartDate,
        endDate: editEndDate,
      },
    });
    setIsEditOpen(false);
    setEditingClass(null);
    await refetch();
  };
  const handleFilter = () => {
    setFilter((prev) => ({
      ...prev,
      page: 0,
      name: search.trim(),
      code: codeSearch.trim(),
    }));
  };

  const handlePageChange = (nextPage: number) => {
    setFilter((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const onSubmitSchedule = async (values: ClassScheduleFormValues) => {
    await createSchedule({
      classroomId: values.classroomId,
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
      studyMode: values.studyMode,
      location: values.location.trim() || undefined,
      meetingUrl: values.meetingUrl.trim() || undefined,
    });

    // resetSchedule({
    //   classroomId: "",
    //   dayOfWeek: "MONDAY",
    //   startTime: "08:00:00",
    //   endTime: "11:30:00",
    //   studyMode: "ONLINE",
    //   location: "",
    //   meetingUrl: "",
    // })
  };

  const handleGoToMaterials = (classId?: string) => {
    if (!classId) return;
    router.push(
      `/admin/dashboard_layout?menu=materials&classId=${encodeURIComponent(classId)}`,
    );
  };
  const handleDeleteClassroom = async (classroomId: string) => {
    if (!classroomId) return;
    try {
      await deleteClassroom({ classroomId });
      await refetch();
      toast.success("Xóa lớp học thành công.");
    } catch (error) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Xóa lớp học thất bại. Vui lòng thử lại.");
    }
  };
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!scheduleId || !selectedClassroomId) return;
    try {
      await deleteSchedule({ classroomId: selectedClassroomId, scheduleId });
      toast.success("Xóa lịch học thành công.");
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message || "Xóa lịch học thất bại. Vui lòng thử lại.");
    }
  };
  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cập nhật lớp học</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin lớp học, trạng thái và thời gian.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tên lớp học
                </label>
                <Input
                  className="h-10 border-slate-200/70 bg-white text-slate-900"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Nhập tên lớp học"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Mô tả
                </label>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="Mô tả lớp học"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Ngày bắt đầu
                  </label>
                  <Input
                    type="date"
                    className="h-10 border-slate-200/70 bg-white text-slate-900"
                    value={editStartDate}
                    onChange={(event) => setEditStartDate(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Ngày kết thúc
                  </label>
                  <Input
                    type="date"
                    className="h-10 border-slate-200/70 bg-white text-slate-900"
                    value={editEndDate}
                    onChange={(event) => setEditEndDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Trạng thái
                </label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="h-10 cursor-pointer border-slate-200/70 bg-white text-slate-900">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {getErrorMessage(updateError) ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {getErrorMessage(updateError)}
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="rounded-lg cursor-pointer border-slate-200 text-slate-700"
                onClick={() => setIsEditOpen(false)}
                type="button"
              >
                Huỷ
              </Button>
              <Button
                className="rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Mô tả lớp học</DialogTitle>
              <DialogDescription>
                Nội dung mô tả đầy đủ của lớp học.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {descriptionPreview}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-lg  cursor-pointer border-slate-200 text-slate-700"
                onClick={() => setIsDescriptionOpen(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isEditScheduleOpen}
          onOpenChange={(open) => {
            setIsEditScheduleOpen(open);
            if (!open) setEditingSchedule(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cập nhật lịch học</DialogTitle>
              <DialogDescription>
                Chỉnh sửa ngày học, giờ học, hình thức và địa điểm.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Ngày học
                </label>
                <select
                  className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                  value={editScheduleDayOfWeek}
                  onChange={(event) =>
                    setEditScheduleDayOfWeek(event.target.value)
                  }
                >
                  {dayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Giờ bắt đầu
                  </label>
                  <Input
                    type="time"
                    step={1}
                    className="h-10 border-slate-200/70 bg-white text-slate-900"
                    value={editScheduleStartTime}
                    onChange={(event) =>
                      setEditScheduleStartTime(event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Giờ kết thúc
                  </label>
                  <Input
                    type="time"
                    step={1}
                    className="h-10 border-slate-200/70 bg-white text-slate-900"
                    value={editScheduleEndTime}
                    onChange={(event) =>
                      setEditScheduleEndTime(event.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Hình thức học
                </label>
                <select
                  className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                  value={editScheduleStudyMode}
                  onChange={(event) =>
                    setEditScheduleStudyMode(event.target.value)
                  }
                >
                  {studyModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Địa điểm
                </label>
                <Input
                  placeholder="Phòng học 201 hoặc để trống nếu online"
                  className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={editScheduleLocation}
                  onChange={(event) =>
                    setEditScheduleLocation(event.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Link học online
                </label>
                <Input
                  placeholder="https://meet.google.com/..."
                  className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={editScheduleMeetingUrl}
                  onChange={(event) =>
                    setEditScheduleMeetingUrl(event.target.value)
                  }
                />
              </div>
              {getErrorMessage(updateScheduleError) ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {getErrorMessage(updateScheduleError)}
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="rounded-lg cursor-pointer border-slate-200 text-slate-700"
                onClick={() => setIsEditScheduleOpen(false)}
                type="button"
              >
                Huỷ
              </Button>
              <Button
                className="rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleUpdateSchedule}
                disabled={isUpdatingSchedule}
              >
                {isUpdatingSchedule ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={isDeleteScheduleOpen}
          onOpenChange={(open) => {
            setIsDeleteScheduleOpen(open);
            if (!open) setScheduleToDelete(null);
          }}
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xoá lịch học</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xoá lịch học này? Hành động này không thể hoàn
                tác.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer rounded-xl">
                Huỷ
              </AlertDialogCancel>

              <AlertDialogAction
                className="cursor-pointer rounded-xl bg-red-500 hover:bg-red-600"
                disabled={isDeletingSchedule}
                onClick={handleConfirmDeleteSchedule}
              >
                {isDeletingSchedule ? "Đang xoá..." : "Xoá"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Quản lý lớp
          </span>
          <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-amber-400 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Danh sách lớp học
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Tạo mới, cập nhật thông tin lớp và quản lý lịch học theo từng
                lớp.
              </p>
            </div>
            <div className="flex items-center gap-6 border-l border-slate-200 pl-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase">Trang hiện tại</p>
                <p className="font-semibold text-slate-900">
                  {classes.length} lớp
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Tổng hệ thống</p>
                <p className="font-semibold text-slate-900">
                  {data?.totalElements ?? 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Tìm theo tên lớp..."
                    className="h-10 border-slate-200/80 bg-white pl-9 text-slate-900 placeholder:text-slate-400"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Input
                  placeholder="Mã lớp..."
                  className="h-10 w-40 border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400"
                  value={codeSearch}
                  onChange={(event) => setCodeSearch(event.target.value)}
                />
                <Button
                  className="h-10 cursor-pointer rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                  onClick={handleFilter}
                >
                  Lọc
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Lớp học
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thời gian
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Mô tả
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Học sinh
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-slate-500"
                      >
                        Đang tải danh sách lớp học...
                      </TableCell>
                    </TableRow>
                  ) : classes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-sm text-slate-500"
                      >
                        Chưa có lớp học nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    classes.map((item) => (
                      <TableRow
                        key={item.id ?? item.name}
                        className="border-slate-100 transition-colors hover:bg-amber-50/30"
                      >
                        <TableCell className="min-w-[220px]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                              <GraduationCap className="h-4 w-4" />
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>

                              {item.code ? (
                                <span className="inline-flex text-[11px] font-medium text-slate-500">
                                  #{item.code}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <CalendarDays className="h-4 w-4 text-emerald-600" />
                              <span>Bắt đầu:</span>
                              <span className="font-medium text-slate-900">
                                {formatDate(item.startDate)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock3 className="h-4 w-4 text-violet-600" />
                              <span>Kết thúc:</span>
                              <span className="font-medium text-slate-900">
                                {formatDate(item.endDate)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <button
                            type="button"
                            className="truncate cursor-pointer text-left text-sm text-slate-600 hover:text-slate-900 w-full"
                            onClick={() =>
                              handleOpenDescription(item.description)
                            }
                          >
                            {item.description || "Không có mô tả"}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyles(item.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {getStatusLabel(item.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold">
                              {item.totalStudent ?? 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-xl cursor-pointer hover:bg-slate-100"
                            >
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Button>
{/* 
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGoToMaterials(item.id)}
                              className="rounded-xl cursor-pointer hover:bg-blue-50"
                            >
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </Button> */}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl cursor-pointer hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xoá lớp học
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xoá lớp{" "}
                                    <span className="font-semibold text-slate-900">
                                      {item.name}
                                    </span>
                                    ? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel className="cursor-pointer rounded-xl">
                                    Huỷ
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    className="cursor-pointer rounded-xl bg-red-500 hover:bg-red-600"
                                    disabled={isPending}
                                    onClick={() => {
                                      handleDeleteClassroom(item.id);
                                    }}
                                  >
                                    {isPending ? "Đang xoá..." : "Xoá"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 pt-4 text-sm text-slate-500">
                <span>
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-9 cursor-pointer rounded-xl border-slate-200 px-4"
                    onClick={() =>
                      handlePageChange(Math.max(0, currentPage - 1))
                    }
                    disabled={currentPage <= 0}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 cursor-pointer rounded-xl border-slate-200 px-4"
                    onClick={() =>
                      handlePageChange(
                        Math.min(totalPages - 1, currentPage + 1),
                      )
                    }
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  Lịch học theo lớp
                </h3>
                <div className="h-px w-16 bg-gradient-to-r from-slate-300 to-transparent" />
                <p className="text-sm text-slate-500">
                  {selectedClass
                    ? `Đang xem: ${selectedClass.name}${selectedClass.code ? ` (${selectedClass.code})` : ""}`
                    : "Chọn lớp ở form bên phải để xem lịch học."}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                {!selectedClassroomId ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    Chọn lớp học ở panel bên phải để xem lịch.
                  </div>
                ) : isSchedulesLoading || isSchedulesFetching ? (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    Đang tải danh sách lịch học...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-slate-500">
                    Chưa có lịch học cho lớp này.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Ngày
                        </TableHead>
                        <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Giờ
                        </TableHead>
                        <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Hình thức
                        </TableHead>
                        <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Địa điểm / Link
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <TableCell className="font-medium text-slate-900">
                            {getDayLabel(schedule.dayOfWeek)}
                          </TableCell>

                          {/* Time */}
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                              <Monitor className="h-4 w-4 text-slate-400" />
                              {getStudyModeLabel(schedule.studyMode)}
                            </div>
                          </TableCell>

                          {/* Location / Meeting */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>
                                  {schedule.location || "Chưa có địa điểm"}
                                </span>
                              </div>

                              {schedule.meetingUrl && (
                                <a
                                  href={schedule.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700"
                                >
                                  <Video className="h-4 w-4" />
                                  Tham gia lớp online
                                </a>
                              )}
                            </div>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 cursor-pointer rounded-lg border border-slate-200 hover:bg-slate-100"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="w-44 rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleEditSchedule(schedule)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                  Sửa lịch học
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    handleOpenDeleteSchedule(schedule);
                                  }}
                                  disabled={isDeletingSchedule}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xoá lịch học
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </section>
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white xl:sticky xl:top-24 xl:self-start">
            <section className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tạo lớp học
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thêm lớp mới vào hệ thống
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Tên lớp học
                  </label>
                  <Input
                    placeholder="Ví dụ: 12A1 - Khối Tự nhiên"
                    className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Mô tả lớp học
                  </label>
                  <textarea
                    className="min-h-30 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                    placeholder="Mô tả mục tiêu, đặc điểm, chương trình lớp học..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày bắt đầu
                    </label>
                    <Input
                      type="date"
                      className="h-10 border-slate-200/70 bg-white text-slate-900"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày kết thúc
                    </label>
                    <Input
                      type="date"
                      className="h-10 border-slate-200/70 bg-white text-slate-900"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>
                {getErrorMessage(createError) ? (
                  <p className="text-xs text-rose-600">
                    {getErrorMessage(createError)}
                  </p>
                ) : null}
                <Button
                  className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleCreate}
                  disabled={isPending || !name.trim() || !startDate || !endDate}
                >
                  {isPending ? "Đang lưu..." : "Lưu lớp học"}
                </Button>
              </div>
            </section>

            <section className="p-5">
              <div className="mb-4 space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Tạo lịch học
                </h3>
                <div className="h-px w-12 bg-gradient-to-r from-amber-400/60 to-transparent" />
                <p className="text-xs text-slate-500">
                  Thiết lập ngày, giờ và hình thức học
                </p>
              </div>
              <form onSubmit={handleScheduleSubmit(onSubmitSchedule)}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Lớp học
                    </label>
                    <Controller
                      control={control}
                      name="classroomId"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (!open) return;

                            // reset về page đầu nếu cần
                            if (scheduleClasses.length === 0) {
                              setClassLookupFilter((prev) => ({
                                ...prev,
                                page: 0,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className="h-10 cursor-pointer border-slate-200/70 bg-white text-slate-900">
                            <SelectValue placeholder="Chọn lớp học" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="w-full p-0"
                          >
                            <ScrollArea
                              className="h-[180px]"
                              viewportClassName="h-[180px] overflow-y-auto"
                              onViewportScroll={(event) => {
                                const target = event.currentTarget;
                                const isBottom =
                                  target.scrollTop + target.clientHeight >=
                                  target.scrollHeight - 20;

                                if (
                                  isBottom &&
                                  !isFetchingClasses &&
                                  hasMoreClasses
                                ) {
                                  loadMoreClasses();
                                }
                              }}
                            >
                              {scheduleClasses.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id}
                                  className="cursor-pointer"
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Ngày học
                    </label>
                    <Controller
                      control={control}
                      name="dayOfWeek"
                      render={({ field }) => (
                        <select
                          className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {dayOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Giờ bắt đầu
                      </label>
                      <Input
                        type="time"
                        step={1}
                        className="h-10 border-slate-200/70 bg-white text-slate-900"
                        {...register("startTime")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-600">
                        Giờ kết thúc
                      </label>
                      <Input
                        type="time"
                        step={1}
                        className="h-10 border-slate-200/70 bg-white text-slate-900"
                        {...register("endTime")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Hình thức học
                    </label>
                    <Controller
                      control={control}
                      name="studyMode"
                      render={({ field }) => (
                        <select
                          className="h-10 rounded-lg border border-slate-200/70 bg-white px-3 text-sm text-slate-900 outline-none"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {studyModeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Địa điểm
                    </label>
                    <Input
                      placeholder="Phòng học 201 hoặc để trống nếu online"
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                      {...register("location")}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Link học online
                    </label>
                    <Input
                      placeholder="https://meet.google.com/..."
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                      {...register("meetingUrl")}
                    />
                  </div>

                  {getErrorMessage(scheduleError) ? (
                    <p className="text-xs text-rose-600">
                      {getErrorMessage(scheduleError)}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={isSchedulePending || isScheduleSubmitting}
                  >
                    {isSchedulePending ? "Đang tạo lịch..." : "Tạo lịch học"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManagement;
