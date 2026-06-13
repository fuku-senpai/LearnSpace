"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateLessonMutation } from "@/app/hooks/lessons/useCreateLesson";
import { useDeleteLessonMutation } from "@/app/hooks/lessons/useDeleteLesson";
import { useGetLessonsQuery } from "@/app/hooks/lessons/useGetLessons";
import { useUpdateLessonMutation } from "@/app/hooks/lessons/useUpdateLesson";
import type { LessonItem } from "@/app/service/lesson.service";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Layers, Pencil, Plus, Sparkles, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

const LessonManagementContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get("materialId") ?? "";
  const materialTitle = searchParams.get("materialTitle") ?? "";
  const classTitle = searchParams.get("classTitle") ?? "";
  const [title, setTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingOrder, setEditingOrder] = useState("1");
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const { mutateAsync, isPending, error } = useCreateLessonMutation();
  const {
    mutateAsync: updateLesson,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdateError,
  } = useUpdateLessonMutation();
  const {
    mutateAsync: deleteLesson,
    isPending: isDeleting,
    error: deleteError,
    reset: resetDeleteError,
  } = useDeleteLessonMutation();
  const { data: lessons, isLoading } = useGetLessonsQuery(
    materialId || undefined,
  );

  const handleGoToRecords = (lessonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "records");
    params.set("lessonId", lessonId);
    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };

  const handleSubmit = async () => {
    if (!materialId || !title.trim()) return;
    const orderValue = Number(lessonOrder);
    if (!Number.isFinite(orderValue) || orderValue <= 0) return;

    await mutateAsync({
      title: title.trim(),
      lessonOrder: orderValue,
      materialId,
    });

    setTitle("");
    setLessonOrder("1");
  };

  const handleEditLesson = (lesson: LessonItem) => {
    resetUpdateError();
    setEditingLesson(lesson);
    setEditingTitle(lesson.title);
    setEditingOrder(String(lesson.lessonOrder));
  };

  const handleConfirmEditLesson = async () => {
    if (!editingLesson || !materialId || !editingTitle.trim()) return;
    const orderValue = Number(editingOrder);
    if (!Number.isFinite(orderValue) || orderValue <= 0) return;

    try {
      const response = await updateLesson({
        lessonId: editingLesson.id,
        title: editingTitle.trim(),
        lessonOrder: orderValue,
        materialId,
      });
      toast.success(response.message || "Cập nhật buổi học thành công.");
      setEditingLesson(null);
    } catch {
      // Error shown inline via updateError
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    resetDeleteError();
    setDeletingLessonId(lessonId);
  };

  const handleConfirmDeleteLesson = async () => {
    if (!deletingLessonId || !materialId) return;

    try {
      const response = await deleteLesson({
        lessonId: deletingLessonId,
        materialId,
      });
      toast.success(response.message || "Xoá buổi học thành công.");
      setDeletingLessonId(null);
    } catch {
      // Error shown inline via deleteError
    }
  };

  const deletingLesson = lessons?.find(
    (lesson) => lesson.id === deletingLessonId,
  );

  const handleGoToLessonResources = (lessonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "lessonResources");
    params.set("snapLessonId", lessonId);
    const selectedLesson = lessons?.find((item) => item.id === lessonId);
    if (selectedLesson?.title) {
      params.set("lessonTitle", selectedLesson.title);
    }
    if (classTitle) {
      params.set("classTitle", classTitle);
    }
    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Nội dung học tập
          </span>
          <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-amber-400 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Quản lý buổi học
              </h2>
              <p className="max-w-2xl text-sm text-slate-500">
                Thêm và theo dõi buổi học theo chủ đề đã chọn.
              </p>
            </div>
            <div className="border-l border-slate-200 pl-6 text-sm">
              <p className="text-xs text-slate-400 uppercase">Chủ đề</p>
              <p className="font-semibold text-slate-900">
                {materialTitle || "Chưa chọn chủ đề"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-4">
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Danh sách buổi học
              </h3>
              <div className="h-px w-14 bg-gradient-to-r from-slate-300 to-transparent" />
              <p className="text-sm text-slate-500">
                {materialId
                  ? `Tổng: ${lessons?.length ?? 0} buổi`
                  : "Chọn chủ đề từ trang Chủ đề để xem buổi học."}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
              {!materialId ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Chưa có chủ đề được chọn.
                </div>
              ) : isLoading ? (
                <div className="px-6 py-10 text-sm text-slate-500">
                  Đang tải danh sách buổi học...
                </div>
              ) : lessons && lessons.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Buổi học
                      </TableHead>
                      <TableHead className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Thứ tự
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson: LessonItem) => (
                      <TableRow
                        key={lesson.id}
                        className="border-slate-100 transition-colors hover:bg-amber-50/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600">
                              <Layers className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-slate-900">
                              {lesson.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-slate-200 px-2 text-sm font-medium text-slate-700">
                            {lesson.lessonOrder}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditLesson(lesson)}
                              className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600"
                              title="Xoá"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Chưa có buổi học nào.
                </div>
              )}  
            </div>
          </section>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white xl:sticky xl:top-24 xl:self-start">
            <section className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tạo buổi học
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập tiêu đề và thứ tự hiển thị
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100" />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Tên buổi học
                  </label>
                  <Input
                    placeholder="Ví dụ: Bài 1 - Giới thiệu"
                    className="h-10 border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Thứ tự buổi học
                  </label>
                  <Input
                    type="number"
                    min={1}
                    className="h-10 border-slate-200/80 bg-white text-slate-900"
                    value={lessonOrder}
                    onChange={(event) => setLessonOrder(event.target.value)}
                  />
                </div>
                {error?.response?.data?.message ? (
                  <p className="text-xs text-rose-600">
                    {error.response.data.message}
                  </p>
                ) : null}
                <Button
                  className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={handleSubmit}
                  disabled={!materialId || !title.trim() || isPending}
                >
                  {isPending ? "Đang lưu..." : "Lưu buổi học"}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(editingLesson)}
        onOpenChange={(open) => {
          if (!open) setEditingLesson(null);
        }}
      >
        <DialogContent
          withOverlay
          className="max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
        >
          <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Pencil className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  Chỉnh sửa buổi học
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  Cập nhật tiêu đề và thứ tự hiển thị.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-2">
              <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Tên buổi học
              </label>
              <Input
                className="h-10 border-slate-200/80 bg-white text-slate-900"
                value={editingTitle}
                onChange={(event) => setEditingTitle(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Thứ tự buổi học
              </label>
              <Input
                type="number"
                min={1}
                className="h-10 border-slate-200/80 bg-white text-slate-900"
                value={editingOrder}
                onChange={(event) => setEditingOrder(event.target.value)}
              />
            </div>
            {updateError?.response?.data?.message ? (
              <p className="text-xs text-rose-600">
                {updateError.response.data.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
            <Button
              variant="outline"
              className="cursor-pointer rounded-xl border-slate-200"
              onClick={() => setEditingLesson(null)}
              type="button"
            >
              Huỷ
            </Button>
            <Button
              className="cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleConfirmEditLesson}
              disabled={
                !editingTitle.trim() || isUpdating || !editingLesson
              }
              type="button"
            >
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingLessonId)}
        onOpenChange={(open) => {
          if (!open) setDeletingLessonId(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá buổi học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xoá buổi học{" "}
              <span className="font-medium text-slate-900">
                {deletingLesson?.title}
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError?.response?.data?.message ? (
            <p className="text-xs text-rose-600">
              {deleteError.response.data.message}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-xl">
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer rounded-xl bg-rose-600 hover:bg-rose-700"
              disabled={isDeleting}
              onClick={handleConfirmDeleteLesson}
            >
              {isDeleting ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function LessonManagement() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Đang tải buổi học...
        </div>
      }
    >
      <LessonManagementContent />
    </Suspense>
  );
}
