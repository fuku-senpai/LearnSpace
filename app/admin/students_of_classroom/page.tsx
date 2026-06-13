"use client";

import { useEffect, useMemo, useState, type UIEvent } from "react";
import { useGetClassesInfiniteQuery } from "@/app/hooks/classes/useGetClassesInfinite";
import { useGetStudentsByClassroomQuery } from "@/app/hooks/students/useGetStudentsByClassroom";
import {
  useBlockStudentMutation,
  useUnblockStudentMutation,
} from "@/app/hooks/students/useUpdateStudentAccountStatus";
import {
  getStudentAccountStatus,
  type ClassroomStudent,
} from "@/app/service/student.service";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  GraduationCap,
  Lock,
  LockOpen,
  Search,
  Users,
} from "lucide-react";

const CLASS_PAGE_SIZE = 8;
const STUDENT_PAGE_SIZE = 10;

const getAccountStatusLabel = (student: ClassroomStudent) =>
  getStudentAccountStatus(student) === "BLOCKED" ? "Đã khóa" : "Hoạt động";

const getClassStatusLabel = (status?: string) => {
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

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "HV";

const StudentOfClassroom = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentPage, setStudentPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [pendingStudent, setPendingStudent] = useState<ClassroomStudent | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<
    "block" | "unblock" | null
  >(null);

  const {
    data: classesInfinite,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isClassesLoading,
    isFetching: isFetchingClasses,
  } = useGetClassesInfiniteQuery({ size: CLASS_PAGE_SIZE });

  const studentsFilter = useMemo(
    () =>
      selectedClassId
        ? {
            classroomId: selectedClassId,
            page: studentPage,
            size: STUDENT_PAGE_SIZE,
            keyword: debouncedKeyword || undefined,
          }
        : undefined,
    [selectedClassId, studentPage, debouncedKeyword],
  );

  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
    error: studentsError,
  } = useGetStudentsByClassroomQuery(studentsFilter);

  const { mutate: blockStudent, isPending: isBlocking } =
    useBlockStudentMutation();
  const { mutate: unblockStudent, isPending: isUnblocking } =
    useUnblockStudentMutation();

  const classOptions = useMemo(
    () => classesInfinite?.pages.flatMap((page) => page.items) ?? [],
    [classesInfinite],
  );

  const students = useMemo(
    () => studentsData?.students ?? [],
    [studentsData?.students],
  );
  const selectedClass = classOptions.find(
    (item) => item.id === selectedClassId,
  );
  const isAccountUpdating = isBlocking || isUnblocking;
  const totalStudents = studentsData?.totalElements ?? 0;
  const totalPages = studentsData?.totalPages ?? 1;
  const currentPage = studentsData?.page ?? studentPage;
  const isLastStudentPage = currentPage >= totalPages - 1;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keywordInput.trim());
      setStudentPage(0);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const activeCount = useMemo(
    () =>
      students.filter((item) => getStudentAccountStatus(item) === "ACTIVE")
        .length,
    [students],
  );

  const blockedCount = useMemo(
    () =>
      students.filter((item) => getStudentAccountStatus(item) === "BLOCKED")
        .length,
    [students],
  );

  const handleStudentPageChange = (nextPage: number) => {
    setStudentPage(nextPage);
  };

  const handleClassScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 16;

    if (!isBottom || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  const openConfirmDialog = (
    student: ClassroomStudent,
    action: "block" | "unblock",
  ) => {
    setPendingStudent(student);
    setPendingAction(action);
  };

  const closeConfirmDialog = () => {
    if (isAccountUpdating) return;
    setPendingStudent(null);
    setPendingAction(null);
  };

  const handleConfirmAccountAction = () => {
    if (!pendingStudent?.accountId || !pendingAction || !selectedClassId) return;

    const variables = {
      accountId: pendingStudent.accountId,
      classroomId: selectedClassId,
    };

    const onSettled = () => {
      setPendingStudent(null);
      setPendingAction(null);
    };

    if (pendingAction === "block") {
      blockStudent(variables, { onSettled });
      return;
    }

    unblockStudent(variables, { onSettled });
  };

  const renderStudentRows = () => {
    if (!selectedClassId) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <GraduationCap
                className="mb-3 h-8 w-8 text-zinc-300"
                strokeWidth={1.5}
              />
              <p className="text-sm text-zinc-600">
                Chọn lớp học ở panel bên phải
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (isStudentsLoading) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            className="py-16 text-center text-sm text-zinc-500"
          >
            Đang tải danh sách học viên...
          </TableCell>
        </TableRow>
      );
    }

    if (studentsError) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="py-16">
            <div className="mx-auto max-w-md border border-zinc-200 px-5 py-4 text-center text-sm text-zinc-600">
              Không thể tải danh sách học viên. Vui lòng thử lại.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (students.length === 0) {
      const hasSearch = Boolean(debouncedKeyword);

      return (
        <TableRow>
          <TableCell colSpan={5} className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="mb-3 h-8 w-8 text-zinc-300" strokeWidth={1.5} />
              <p className="text-sm text-zinc-600">
                {hasSearch
                  ? "Không tìm thấy học viên phù hợp"
                  : "Lớp này chưa có học viên"}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return students.map((student) => {
      const isBlocked = getStudentAccountStatus(student) === "BLOCKED";

      return (
        <TableRow
          key={student.studentId}
          className="border-zinc-100 transition-colors hover:bg-zinc-50/80"
        >
          <TableCell className="min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-600">
                {getInitials(student.fullName)}
              </div>
              <p className="truncate font-medium text-zinc-900">
                {student.fullName}
              </p>
            </div>
          </TableCell>
          <TableCell className="text-sm text-zinc-500">
            {student.email}
          </TableCell>
          <TableCell>
            <span className="text-xs tracking-wide text-zinc-500 uppercase">
              {student.role || "STUDENT"}
            </span>
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBlocked ? "bg-zinc-300" : "bg-zinc-900"
                }`}
              />
              {getAccountStatusLabel(student)}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer rounded-none border-b border-transparent px-2 text-zinc-500 hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900"
              disabled={isAccountUpdating || !student.accountId}
              onClick={() =>
                openConfirmDialog(student, isBlocked ? "unblock" : "block")
              }
            >
              {isBlocked ? (
                <>
                  <LockOpen className="h-3.5 w-3.5" />
                  Mở khóa
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Khóa
                </>
              )}
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-10 border-b border-zinc-200 pb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase">
          Students
        </p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Học viên theo lớp
            </h2>
            <p className="mt-1 max-w-lg text-sm text-zinc-500">
              Theo dõi và quản lý tài khoản học viên trong từng lớp.
            </p>
          </div>
          <div className="flex divide-x divide-zinc-200 border border-zinc-200">
            {[
              { label: "Tổng", value: selectedClassId ? totalStudents : "—" },
              { label: "Hoạt động", value: selectedClassId ? activeCount : "—" },
              { label: "Đã khóa", value: selectedClassId ? blockedCount : "—" },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-3">
                <p className="text-[10px] tracking-wider text-zinc-400 uppercase">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-xl text-zinc-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {selectedClass ? (
                <p className="text-sm text-zinc-500">
                  <span className="font-medium text-zinc-900">
                    {selectedClass.name}
                  </span>
                  {" · "}
                  {totalStudents} học viên
                </p>
              ) : (
                <p className="text-sm text-zinc-500">
                  Chọn lớp để xem danh sách học viên.
                </p>
              )}
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Tìm tên hoặc email"
                className="h-10 rounded-none border-0 border-b border-zinc-200 bg-transparent pl-6 shadow-none focus-visible:border-zinc-900 focus-visible:ring-0"
                disabled={!selectedClassId}
              />
            </div>
          </div>

          <div className="border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50/50">
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Học viên
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Vai trò
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderStudentRows()}</TableBody>
            </Table>
            {isStudentsFetching && !isStudentsLoading ? (
              <div className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-400">
                Đang cập nhật...
              </div>
            ) : null}
          </div>

          {selectedClassId && totalStudents > 0 ? (
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <p>
                {currentPage + 1} / {Math.max(totalPages, 1)}
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer rounded-none px-3 text-zinc-600 hover:text-zinc-900"
                  onClick={() =>
                    handleStudentPageChange(Math.max(0, currentPage - 1))
                  }
                  disabled={currentPage <= 0 || isStudentsFetching}
                >
                  ← Trước
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer rounded-none px-3 text-zinc-600 hover:text-zinc-900"
                  onClick={() =>
                    handleStudentPageChange(
                      Math.min(totalPages - 1, currentPage + 1),
                    )
                  }
                  disabled={isLastStudentPage || isStudentsFetching}
                >
                  Sau →
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="border-l-2 border-zinc-900 pl-6">
            <div className="mb-6 flex items-center gap-2">
              <GraduationCap
                className="h-4 w-4 text-zinc-400"
                strokeWidth={1.5}
              />
              <h3 className="text-sm font-medium text-zinc-900">Chọn lớp</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Lớp học</label>
                <Select
                  value={selectedClassId}
                  onValueChange={(value) => {
                    setSelectedClassId(value);
                    setKeywordInput("");
                    setDebouncedKeyword("");
                    setStudentPage(0);
                  }}
                >
                  <SelectTrigger className="h-10 cursor-pointer rounded-none border-zinc-200 bg-transparent shadow-none">
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="w-full rounded-none p-0"
                  >
                    <ScrollArea
                      className="h-[220px]"
                      viewportClassName="h-[220px] overflow-y-auto"
                      onViewportScroll={handleClassScroll}
                    >
                      {classOptions.map((item) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={item.id}
                          value={item.id}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-zinc-800">
                              {item.name}
                            </span>
                            <span className="h-3 w-px shrink-0 bg-zinc-200" />
                            <span className="shrink-0 text-xs text-zinc-400">
                              {item.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {isClassesLoading ||
                      isFetchingClasses ||
                      isFetchingNextPage ? (
                        <div className="px-3 py-2 text-xs text-zinc-400">
                          Đang tải thêm...
                        </div>
                      ) : null}
                      {!isClassesLoading && !hasNextPage ? (
                        <div className="px-3 py-2 text-xs text-zinc-300">
                          Đã tải hết lớp.
                        </div>
                      ) : null}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedClass ? (
                <div className="space-y-2 border border-zinc-200 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {selectedClass.name}
                    </p>
                    <span className="shrink-0 text-[10px] tracking-wide text-zinc-400 uppercase">
                      {getClassStatusLabel(selectedClass.status)}
                    </span>
                  </div>
                  {selectedClass.code ? (
                    <p className="font-mono text-xs text-zinc-400">
                      {selectedClass.code}
                    </p>
                  ) : null}
                  {selectedClass.description ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                      {selectedClass.description}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="border border-dashed border-zinc-200 px-4 py-5 text-center">
                  <p className="text-xs text-zinc-400">
                    Thông tin lớp hiển thị tại đây.
                  </p>
                </div>
              )}

              <p className="text-xs leading-relaxed text-zinc-400">
                Khóa tài khoản ngăn học viên đăng nhập cho đến khi mở khóa.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AlertDialog
        open={Boolean(pendingStudent && pendingAction)}
        onOpenChange={(open) => {
          if (!open) closeConfirmDialog();
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-none border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium text-zinc-900">
              {pendingAction === "block"
                ? "Khóa tài khoản học viên?"
                : "Mở khóa tài khoản học viên?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-500">
              {pendingAction === "block"
                ? `${pendingStudent?.fullName} sẽ không thể đăng nhập.`
                : `${pendingStudent?.fullName} sẽ được đăng nhập lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-none"
              disabled={isAccountUpdating}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer rounded-none bg-zinc-900 hover:bg-zinc-800"
              disabled={isAccountUpdating || !pendingStudent?.accountId}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmAccountAction();
              }}
            >
              {isAccountUpdating ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentOfClassroom;
