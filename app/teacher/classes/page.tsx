"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  BookOpen,
  Trash2,
  GraduationCap,
  CalendarDays,
  Clock3,
  Users,
  Monitor,
  MapPin,
  Video,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCreateClassroomMutation } from "@/app/hooks/classes/useCreateClass";
import { useUpdateClassroomMutation } from "@/app/hooks/classes/useUpdateClassroom";
import { useCreateClassScheduleMutation } from "@/app/hooks/schedules/useCreateClassSchedule";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type {
  Class,
  GetAllClassesFilter,
} from "@/app/service/classroom.service";
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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

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

    console.log("Load more")
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
      `/teacher/dashboard_layout?menu=materials&classId=${encodeURIComponent(classId)}`,
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
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
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
        <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left content */}
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                Hệ thống quản lý lớp học
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Quản lý lớp học
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Tạo mới, cập nhật và quản lý thông tin lớp học, lịch học và
                  trạng thái vận hành của từng lớp.
                </p>
              </div>

              {/* Stats nhỏ */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-500">
                <span>
                  Tổng lớp đang hoạt động:{" "}
                  <span className="font-semibold text-slate-900">
                    {classes.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Danh sách lớp học</CardTitle>
              <CardDescription>
                Theo dõi thông tin lớp học và ghi chú mô tả.
              </CardDescription>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Tìm theo tên lớp..."
                  className="h-10 w-64 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Input
                  placeholder="Tìm theo mã lớp..."
                  className="h-10 w-48 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={codeSearch}
                  onChange={(event) => setCodeSearch(event.target.value)}
                />
                <Button
                  className="h-10 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleFilter}
                >
                  Lọc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên lớp học</TableHead>
                    <TableHead>Thời gian học</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Số học sinh</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
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
                      <TableRow key={item.id ?? item.name}>
                        <TableCell className="min-w-[260px]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                              <GraduationCap className="h-5 w-5 text-slate-700" />
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>

                              <div className="flex items-center gap-2">
                                {item.code && (
                                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {item.code}
                                  </span>
                                )}
                              </div>
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
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(item.status)}`}
                          >
                            <div className="h-2 w-2 rounded-full bg-current" />
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="font-semibold text-slate-800">
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

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGoToMaterials(item.id)}
                              className="rounded-xl cursor-pointer hover:bg-blue-50"
                            >
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </Button>

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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                    onClick={() =>
                      handlePageChange(Math.max(0, currentPage - 1))
                    }
                    disabled={currentPage <= 0}
                  >
                    Trước
                  </Button>
                  <Button
                    className="h-9 rounded-lg cursor-pointer border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
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
            </CardContent>
            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Lịch học theo lớp</CardTitle>
                <CardDescription>
                  Danh sách schedule của lớp đang chọn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedClassroomId ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chọn lớp học ở form trên để xem lịch học.
                  </div>
                ) : isSchedulesLoading || isSchedulesFetching ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                    Đang tải danh sách lịch học...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có lịch học cho lớp này.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày học</TableHead>
                        <TableHead>Giờ</TableHead>
                        <TableHead>Hình thức</TableHead>
                        <TableHead>Địa điểm / Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          className="border-slate-100 transition-colors hover:bg-slate-50"
                        >
                          {/* Day */}
                          <TableCell className="font-medium text-slate-900">
                            {schedule.dayOfWeek}
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

                          {/* Study mode */}
                          <TableCell>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                              <Monitor className="h-4 w-4 text-slate-500" />
                              {schedule.studyMode}
                            </div>
                          </TableCell>

                          {/* Location / Meeting */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>
                                  {schedule.location || "No location provided"}
                                </span>
                              </div>

                              {schedule.meetingUrl && (
                                <a
                                  href={schedule.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition hover:text-slate-700"
                                >
                                  <Video className="h-4 w-4" />
                                  Join meeting
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tạo lớp học</CardTitle>
                <CardDescription>
                  Nhập thông tin tên và mô tả lớp học.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleCreate}
                  disabled={isPending || !name.trim() || !startDate || !endDate}
                >
                  {isPending ? "Đang lưu..." : "Lưu lớp học"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tạo lịch học cho lớp</CardTitle>
                <CardDescription>
                  Nhập lịch học theo lớp, bao gồm ngày, giờ, hình thức và liên
                  kết học.
                </CardDescription>
                {selectedClass ? (
                  <p className="text-xs font-medium text-slate-500">
                    Đang xem lịch của: {selectedClass.name}
                    {selectedClass.code ? ` (${selectedClass.code})` : ""}
                  </p>
                ) : null}
              </CardHeader>
              <form onSubmit={handleScheduleSubmit(onSubmitSchedule)}>
                <CardContent className="space-y-4">
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
                          <SelectContent position="popper" className="w-full p-0">
                            <ScrollArea
                              className="h-[180px]"
                              viewportClassName="h-[180px] overflow-y-auto"
                              onViewportScroll={(event) => {
                                console.log("Event:", event);
                                const target = event.currentTarget;
                                const isBottom =
                                  target.scrollTop + target.clientHeight >=
                                  target.scrollHeight - 20;

                                console.log({
                                  scrollTop: target.scrollTop,
                                  clientHeight: target.clientHeight,
                                  scrollHeight: target.scrollHeight,
                                  isBottom,
                                  page: classLookupFilter.page,
                                  isFetchingClasses,
                                  hasMoreClasses,
                                });

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
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="h-10 cursor-pointer w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    disabled={isSchedulePending || isScheduleSubmitting}
                  >
                    {isSchedulePending
                      ? "Đang lưu lịch..."
                      : "Lưu classSchedule"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassesManagement;
