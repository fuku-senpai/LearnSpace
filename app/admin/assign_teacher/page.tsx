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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { BadgeCheck, CalendarDays, Clock3, Filter, Trash2 } from "lucide-react";

const PAGE_SIZE = 8;

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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6 text-slate-900">
      <div className="mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Gán giáo viên vào lớp</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn giáo viên và lớp học từ danh sách có phân trang, cuộn xuống để
            tải thêm.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Teacher */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
                Giáo viên
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Chọn giáo viên phụ trách lớp học
              </p>
            </div>

            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="h-14 cursor-pointer rounded-2xl border-slate-200 bg-white px-4 shadow-sm transition-all hover:border-slate-300 focus:ring-2 focus:ring-slate-200">
                <SelectValue placeholder="Chọn giáo viên" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="rounded-2xl border border-slate-200 p-2 shadow-2xl"
              >
                <ScrollArea
                  className="h-72"
                  viewportClassName="overflow-y-auto"
                  onViewportScroll={handleTeacherScroll}
                >
                  {teacherItems.map((item) => (
                    <SelectItem
                      key={item.teacherId}
                      value={item.teacherId}
                      className="cursor-pointer rounded-xl p-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-800">
                            {item.fullName}
                          </span>

                          <div className="h-4 w-px bg-slate-300" />

                          <span className="truncate text-xs text-slate-500">
                            {item.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}

                  {isFetchingTeachers && (
                    <div className="py-4 text-center text-sm text-slate-500">
                      Đang tải thêm giáo viên...
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Class */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
                Lớp học
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Chọn lớp cần phân công
              </p>
            </div>

            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="h-14 rounded-2xl cursor-pointer border-slate-200 bg-white px-4 shadow-sm transition-all hover:border-slate-300 focus:ring-2 focus:ring-slate-200">
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="rounded-2xl border border-slate-200 p-2 shadow-2xl"
              >
                <ScrollArea
                  className="h-72"
                  viewportClassName="overflow-y-auto"
                  onViewportScroll={handleClassScroll}
                >
                  {classItems.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className="cursor-pointer rounded-xl p-3 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-800">
                            {item.name}
                          </span>

                          <div className="h-4 w-px bg-slate-300" />

                          <span className="truncate text-xs text-slate-500">
                            {item.code}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}

                  {isFetchingClasses && (
                    <div className="py-4 text-center text-sm text-slate-500">
                      Đang tải thêm lớp học...
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              Xác nhận phân công
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kiểm tra giáo viên và lớp học trước khi thực hiện
            </p>
          </div>

          {/* Content */}
          <div className="grid divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Teacher */}
            <div className="p-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Giáo viên
              </span>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {selectedTeacher?.fullName?.charAt(0) || "?"}
                </div>

                <div>
                  <h3 className="font-medium text-slate-900">
                    {selectedTeacher?.fullName || "Chưa chọn giáo viên"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {selectedTeacher?.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Class */}
            <div className="p-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Lớp học
              </span>

              <div className="mt-4">
                <h3 className="font-medium text-slate-900">
                  {selectedClass?.name || "Chưa chọn lớp học"}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>{selectedClass?.code || "—"}</span>

                  {selectedClass?.status && (
                    <>
                      <span>•</span>

                      <span className="capitalize">
                        {selectedClass.status.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              type="button"
              disabled={!selectedTeacherId || !selectedClassId || isAssigning}
              onClick={handleAssignTeacher}
              className="h-11 cursor-pointer rounded-xl px-5"
            >
              {isAssigning ? "Đang xử lý..." : "Gán giáo viên vào lớp"}
            </Button>
          </div>
        </div>

        {/* Classrooms list with filters (shadcn) */}
        <Card className="mt-6">
          <CardHeader className="flex items-center justify-between px-6">
            <CardTitle>Danh sách lớp và giáo viên</CardTitle>

            <Select
              value={hasTeacher === undefined ? "all" : String(hasTeacher)}
              onValueChange={(value) => {
                setHasTeacher(value === "all" ? undefined : value === "true");
                setClassroomsPage(0);
              }}
            >
              <SelectTrigger className="w-[220px] cursor-pointer rounded-xl border-slate-200 bg-white shadow-sm">
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
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lớp</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tổng học viên</TableHead>
                  <TableHead>Thời gian học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classroomsData?.content
                  .filter((it) =>
                    classroomsKeyword
                      ? `${it.classroomName} ${it.code}`
                          .toLowerCase()
                          .includes(classroomsKeyword.toLowerCase())
                      : true,
                  )
                  .map((c: ClassroomWithTeacher) => (
                    <TableRow key={c.classroomId}>
                      <TableCell>
                        <div className="font-medium">{c.classroomName}</div>
                        <div className="text-sm text-slate-500">
                          {c.description}
                        </div>
                      </TableCell>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.totalStudent}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-slate-100 p-2">
                            <CalendarDays className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">
                              {c.startDate}
                            </div>

                            <div className="text-xs text-slate-500">
                              đến {c.endDate}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            c.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.teacher ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {c.teacher.fullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.teacher.email}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">
                            Chưa có giáo viên
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.teacher && (
                          <AlertDialog
                            open={removeClassroomId === c.classroomId}
                            onOpenChange={(open) => {
                              if (!open) setRemoveClassroomId(null);
                            }}
                          >
                            <button
                              onClick={() => setRemoveClassroomId(c.classroomId)}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
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
                                    {c.teacher.fullName}
                                  </span>{" "}
                                  khỏi lớp{" "}
                                  <span className="font-medium text-slate-900">
                                    {c.classroomName}
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
                                  onClick={() => handleRemoveTeacher(c.classroomId)}
                                >
                                  {isRemoving ? "Đang gỡ..." : "Gỡ"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {(!classroomsData || classroomsData.content.length === 0) && (
              <div className="mt-4 text-sm text-slate-500">
                Không có kết quả
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <span>
                Trang {currentPage + 1} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                  onClick={() =>
                    handleClassroomsPageChange(Math.max(0, currentPage - 1))
                  }
                  disabled={currentPage <= 0}
                >
                  Trước
                </Button>
                <Button
                  className="h-9 rounded-lg cursor-pointer border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignTeacherToClass;
