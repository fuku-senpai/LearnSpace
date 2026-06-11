"use client";

import { useEffect, useState, type UIEvent } from "react";
import { toast } from "sonner";

import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses";
import { useGetAllTeacherQuery } from "@/app/hooks/teacher/useGetAllTeacher";
import { useAssignTeacherToClass } from "@/app/hooks/classes/useAssignTeacherToClass";
import { useRemoveTeacherFromClass } from "@/app/hooks/classes/useRemoveTeacherFromClass";
import { useGetClassroomsWithTeacher } from "@/app/hooks/classes/useGetClassroomsWithTeacher";
import type { ClassroomWithTeacher } from "@/app/service/classroom.service";
import type {
  Class,
  GetAllClassesFilter,
} from "@/app/service/classroom.service";
import type {
  GetAllTeachersFilter,
  TeacherItem,
} from "@/app/service/teacher.service";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Filter,
  GraduationCap,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";

const PAGE_SIZE = 8;

const getStatusStyles = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "CLOSED":
    case "INACTIVE":
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
    case "INACTIVE":
      return "Không hoạt động";
    default:
      return status ?? "—";
  }
};

const mergeUniqueTeachers = (prev: TeacherItem[], next: TeacherItem[]) => {
  const seen = new Set(prev.map((item) => item.teacherId));
  return [...prev, ...next.filter((item) => !seen.has(item.teacherId))];
};

const mergeUniqueClasses = (prev: Class[], next: Class[]) => {
  const seen = new Set(prev.map((item) => item.id));
  return [...prev, ...next.filter((item) => !seen.has(item.id))];
};

const AssignTeacherToClass = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const [teacherPage, setTeacherPage] = useState(0);
  const [teacherItems, setTeacherItems] = useState<TeacherItem[]>([]);
  const [teacherHasMore, setTeacherHasMore] = useState(true);

  const [classPage, setClassPage] = useState(0);
  const [classItems, setClassItems] = useState<Class[]>([]);
  const [classHasMore, setClassHasMore] = useState(true);

  const { mutate: assignTeacher, isPending: isAssigning } =
    useAssignTeacherToClass();
  const { mutate: removeTeacher, isPending: isRemoving } =
    useRemoveTeacherFromClass();
  const [removeClassroomId, setRemoveClassroomId] = useState<string | null>(null);

  const teacherFilter: GetAllTeachersFilter = {
    page: teacherPage,
    size: PAGE_SIZE,
    keyword: "",
  };
  const classFilter: GetAllClassesFilter = {
    page: classPage,
    size: PAGE_SIZE,
    code: "",
    name: "",
  };

  const { data: teacherResponse, isFetching: isFetchingTeachers } =
    useGetAllTeacherQuery(teacherFilter);
  const { data: classResponse, isFetching: isFetchingClasses } =
    useGetClassesQuery(classFilter);

  // Classrooms with teacher list
  const [classroomsPage, setClassroomsPage] = useState(0);
  const [classroomsKeyword, setClassroomsKeyword] = useState("");
  const [hasTeacher, setHasTeacher] = useState<boolean | undefined>(undefined);

  const { data: classroomsData, isFetching: isFetchingClassrooms } =
    useGetClassroomsWithTeacher({
      page: classroomsPage,
      size: PAGE_SIZE,
      hasTeacher,
    });

  const currentPage = classroomsData?.page?.number ?? 0;
  const totalPages = classroomsData?.page?.totalPages ?? 0;

  const handleClassroomsPageChange = (page: number) => {
    setClassroomsPage(page);
  };

  useEffect(() => {
    if (!teacherResponse) return;

    setTeacherItems((prev) =>
      teacherPage === 0
        ? teacherResponse.items
        : mergeUniqueTeachers(prev, teacherResponse.items),
    );
    setTeacherHasMore(teacherPage + 1 < teacherResponse.totalPages);
  }, [teacherPage, teacherResponse]);

  useEffect(() => {
    if (!classResponse) return;

    setClassItems((prev) =>
      classPage === 0
        ? classResponse.items
        : mergeUniqueClasses(prev, classResponse.items),
    );
    setClassHasMore(classPage + 1 < classResponse.totalPages);
  }, [classPage, classResponse]);

  const selectedTeacher = teacherItems.find(
    (item) => item.teacherId === selectedTeacherId,
  );
  const selectedClass = classItems.find((item) => item.id === selectedClassId);

  const handleRemoveTeacher = (classroomId: string) => {
    removeTeacher(classroomId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Gỡ giáo viên thành công");
        setRemoveClassroomId(null);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Gỡ giáo viên thất bại";
        toast.error(errorMessage);
      },
    });
  };

  const handleTeacherScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isBottom && !isFetchingTeachers && teacherHasMore) {
      setTeacherPage((prev) => prev + 1);
    }
  };

  const handleClassScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isBottom && !isFetchingClasses && classHasMore) {
      setClassPage((prev) => prev + 1);
    }
  };

  const handleAssignTeacher = () => {
    if (!selectedTeacherId || !selectedClassId) {
      toast.error("Vui lòng chọn giáo viên và lớp học");
      return;
    }

    assignTeacher(
      {
        classroomId: selectedClassId,
        payload: { teacherId: selectedTeacherId },
      },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Gán giáo viên vào lớp thành công");
          setSelectedTeacherId("");
          setSelectedClassId("");
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Gán giáo viên thất bại";
          toast.error(errorMessage);
        },
      },
    );
  };

  const filteredClassrooms =
    classroomsData?.content.filter((item) =>
      classroomsKeyword
        ? `${item.classroomName} ${item.code}`
            .toLowerCase()
            .includes(classroomsKeyword.toLowerCase())
        : true,
    ) ?? [];

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Phân công giảng dạy
          </span>
          <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-amber-400 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Gán giáo viên vào lớp
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Chọn giáo viên và lớp học, xác nhận phân công rồi theo dõi danh
                sách lớp đã gán.
              </p>
            </div>
            <div className="flex items-center gap-6 border-l border-slate-200 pl-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase">Đã gán</p>
                <p className="font-semibold text-slate-900">
                  {classroomsData?.content.filter((item) => item.teacher).length ??
                    0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Tổng hiển thị</p>
                <p className="font-semibold text-slate-900">
                  {filteredClassrooms.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Danh sách lớp và giáo viên
                </h3>
                <div className="mt-2 h-px w-14 bg-gradient-to-r from-slate-300 to-transparent" />
              </div>

              <Select
                value={hasTeacher === undefined ? "all" : String(hasTeacher)}
                onValueChange={(value) => {
                  setHasTeacher(value === "all" ? undefined : value === "true");
                  setClassroomsPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-[220px] cursor-pointer rounded-xl border-slate-200/80 bg-white">
                  <SelectValue placeholder="Lọc giáo viên" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  <SelectItem value="all">
                    <div className="flex cursor-pointer items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <span>Tất cả</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="true">
                    <div className="flex cursor-pointer items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-500" />
                      <span>Có giáo viên</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex cursor-pointer items-center gap-2">
                      <Clock3 className="h-4 w-4 text-amber-500" />
                      <span>Chưa có giáo viên</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Lớp học
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Học viên
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thời gian
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Giáo viên
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingClassrooms && filteredClassrooms.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        Đang tải danh sách...
                      </TableCell>
                    </TableRow>
                  ) : filteredClassrooms.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        Không có kết quả phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClassrooms.map((classroom: ClassroomWithTeacher) => (
                      <TableRow
                        key={classroom.classroomId}
                        className="border-slate-100 transition-colors hover:bg-amber-50/30"
                      >
                        <TableCell className="min-w-[200px]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {classroom.classroomName}
                              </p>
                              <p className="text-xs text-slate-500">
                                #{classroom.code}
                              </p>
                              {classroom.description ? (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                  {classroom.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {classroom.totalStudent}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                            <div>
                              <p>{classroom.startDate}</p>
                              <p className="text-xs text-slate-500">
                                đến {classroom.endDate}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyles(classroom.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {getStatusLabel(classroom.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {classroom.teacher ? (
                            <div className="text-sm">
                              <p className="font-medium text-slate-900">
                                {classroom.teacher.fullName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {classroom.teacher.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Chưa có giáo viên
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {classroom.teacher ? (
                            <AlertDialog
                              open={removeClassroomId === classroom.classroomId}
                              onOpenChange={(open) => {
                                if (!open) setRemoveClassroomId(null);
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveClassroomId(classroom.classroomId)
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Gỡ
                              </button>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận gỡ giáo viên
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn chắc chắn muốn gỡ giáo viên{" "}
                                    <span className="font-medium text-slate-900">
                                      {classroom.teacher?.fullName}
                                    </span>{" "}
                                    khỏi lớp{" "}
                                    <span className="font-medium text-slate-900">
                                      {classroom.classroomName}
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
                                    disabled={isRemoving}
                                    onClick={() =>
                                      handleRemoveTeacher(classroom.classroomId)
                                    }
                                  >
                                    {isRemoving ? "Đang gỡ..." : "Gỡ"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <span>
                Trang {currentPage + 1} / {Math.max(totalPages, 1)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9 cursor-pointer rounded-xl border-slate-200 px-4"
                  onClick={() =>
                    handleClassroomsPageChange(Math.max(0, currentPage - 1))
                  }
                  disabled={currentPage <= 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  className="h-9 cursor-pointer rounded-xl border-slate-200 px-4"
                  onClick={() =>
                    handleClassroomsPageChange(
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

          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white xl:sticky xl:top-24 xl:self-start">
            <section className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Phân công mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cuộn danh sách để tải thêm
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Giáo viên
                </label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
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

              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Lớp học
                </label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger className="h-11 cursor-pointer rounded-xl border-slate-200/80 bg-white">
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="rounded-xl border border-slate-200 p-1"
                  >
                    <ScrollArea
                      className="h-56"
                      viewportClassName="overflow-y-auto"
                      onViewportScroll={handleClassScroll}
                    >
                      {classItems.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          className="cursor-pointer rounded-lg"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">
                                {item.name}
                              </span>
                              <span className="h-3 w-px bg-slate-300" />
                              <span className="text-xs text-slate-500">
                                {item.code}
                              </span>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusStyles(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {isFetchingClasses ? (
                        <div className="py-3 text-center text-xs text-slate-500">
                          Đang tải thêm...
                        </div>
                      ) : null}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-4 p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Xác nhận phân công
                </h3>
                <div className="h-px w-12 bg-gradient-to-r from-amber-400/60 to-transparent" />
              </div>

              <div className="space-y-4 border-l-2 border-amber-400/40 pl-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                    Giáo viên
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {selectedTeacher?.fullName || "Chưa chọn"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedTeacher?.email || "—"}
                  </p>
                </div>
                <div className="h-px w-full bg-slate-100" />
                <div>
                  <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                    Lớp học
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {selectedClass?.name || "Chưa chọn"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedClass?.code
                      ? `#${selectedClass.code}`
                      : "—"}
                    {selectedClass?.status
                      ? ` · ${getStatusLabel(selectedClass.status)}`
                      : ""}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                disabled={!selectedTeacherId || !selectedClassId || isAssigning}
                onClick={handleAssignTeacher}
                className="h-11 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {isAssigning ? "Đang xử lý..." : "Gán giáo viên vào lớp"}
              </Button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTeacherToClass;
